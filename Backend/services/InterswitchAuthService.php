<?php

class InterswitchAuthService
{
    private $conn;

    private string $tokenUrl = "https://passport-v2.k8.isw.la/passport/oauth/token";
    private string $clientId = "";
    private string $clientSecret = "";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    private function base64Credentials(): string
{
    return base64_encode($this->clientId . ':' . $this->clientSecret);
}

    private function requestNewToken(): array
    {
        $ch = curl_init($this->tokenUrl);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query([
                'grant_type' => 'client_credentials'
            ]),
            CURLOPT_HTTPHEADER => [
                'Authorization: Basic ' . $this->base64Credentials(),
                'Content-Type: application/x-www-form-urlencoded'
            ]
        ]);

        $response = curl_exec($ch);

        if ($response === false) {
            throw new Exception("Token request failed: " . curl_error($ch));
        }

        curl_close($ch);

        $data = json_decode($response, true);

        if (!isset($data['access_token'])) {
            throw new Exception("Invalid token response: " . $response);
        }

        return $data;
    }

    private function saveToken($token, $expiresIn)
    {
        $expiresAt = date('Y-m-d H:i:s', time() + $expiresIn - 60); // refresh 1min early

        // clear old
        $this->conn->exec("DELETE FROM interswitch_tokens");

        $stmt = $this->conn->prepare("
            INSERT INTO interswitch_tokens (access_token, expires_at)
            VALUES (:token, :expires_at)
        ");

        $stmt->execute([
            ':token' => $token,
            ':expires_at' => $expiresAt
        ]);
    }

    private function getStoredToken()
    {
        $stmt = $this->conn->prepare("
            SELECT * FROM interswitch_tokens
            LIMIT 1
        ");
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getValidToken(): string
    {
        $stored = $this->getStoredToken();

        // ✅ If exists and not expired
        if ($stored && strtotime($stored['expires_at']) > time()) {
            return $stored['access_token'];
        }

        // 🔄 Else generate new
        $newToken = $this->requestNewToken();

        $this->saveToken(
            $newToken['access_token'],
            $newToken['expires_in']
        );

        return $newToken['access_token'];
    }
}