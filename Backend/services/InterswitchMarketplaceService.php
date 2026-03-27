<?php

require_once __DIR__ . '/InterswitchAuthService.php';

class InterswitchMarketplaceService
{
    private $authService;
    private string $baseUrl = 'https://api-marketplace-routing.k8.isw.la/marketplace-routing/api/v1';

    public function __construct($db)
    {
        $this->authService = new InterswitchAuthService($db);
    }

    private function sendGet(string $endpoint, string $contentType = 'application/json'): array
    {
        $token = $this->authService->getValidToken();

        $ch = curl_init($this->baseUrl . $endpoint);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $token,
                'Content-Type: ' . $contentType
            ]
        ]);

        $response = curl_exec($ch);

        if ($response === false) {
            return [
                'success' => false,
                'message' => curl_error($ch)
            ];
        }

        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return [
            'success' => $statusCode >= 200 && $statusCode < 300,
            'status_code' => $statusCode,
            'data' => json_decode($response, true)
        ];
    }

    public function verifyTin(string $tin): array
    {
        return $this->sendGet(
            '/verify/identity/tin?tin=' . urlencode($tin),
            'application/x-www-form-urlencoded'
        );
    }

    public function verifyCac(string $companyName): array
    {
        return $this->sendGet(
            '/verify/identity/cac-lookup?companyName=' . urlencode($companyName),
            'application/json'
        );
    }
}