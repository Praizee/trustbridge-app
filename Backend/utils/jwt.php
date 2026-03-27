<?php

function base64UrlEncode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode(string $data): string
{
    $padding = 4 - (strlen($data) % 4);
    if ($padding < 4) {
        $data .= str_repeat('=', $padding);
    }

    return base64_decode(strtr($data, '-_', '+/'));
}

function createJwt(array $payload): string
{
    $config = require __DIR__ . '/../config/app.php';

    $header = [
        'alg' => 'HS256',
        'typ' => 'JWT'
    ];

    $now = time();
    $exp = $now + (($config['jwt_exp_minutes'] ?? 120) * 60);

    $registeredClaims = [
        'iss' => $config['jwt_issuer'],
        'aud' => $config['jwt_audience'],
        'iat' => $now,
        'nbf' => $now,
        'exp' => $exp,
    ];

    $payload = array_merge($registeredClaims, $payload);

    $headerEncoded = base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
    $payloadEncoded = base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));

    $signature = hash_hmac(
        'sha256',
        $headerEncoded . '.' . $payloadEncoded,
        $config['jwt_secret'],
        true
    );

    $signatureEncoded = base64UrlEncode($signature);

    return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
}

function verifyJwt(string $jwt): array
{
    $config = require __DIR__ . '/../config/app.php';

    $parts = explode('.', $jwt);

    if (count($parts) !== 3) {
        throw new Exception('Invalid token format');
    }

    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

    $expectedSignature = base64UrlEncode(
        hash_hmac(
            'sha256',
            $headerEncoded . '.' . $payloadEncoded,
            $config['jwt_secret'],
            true
        )
    );

    if (!hash_equals($expectedSignature, $signatureEncoded)) {
        throw new Exception('Invalid token signature');
    }

    $payload = json_decode(base64UrlDecode($payloadEncoded), true);

    if (!is_array($payload)) {
        throw new Exception('Invalid token payload');
    }

    $now = time();

    if (($payload['nbf'] ?? 0) > $now) {
        throw new Exception('Token not active yet');
    }

    if (($payload['exp'] ?? 0) < $now) {
        throw new Exception('Token has expired');
    }

    if (($payload['iss'] ?? '') !== $config['jwt_issuer']) {
        throw new Exception('Invalid token issuer');
    }

    if (($payload['aud'] ?? '') !== $config['jwt_audience']) {
        throw new Exception('Invalid token audience');
    }

    return $payload;
}