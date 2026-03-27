<?php

function generatePaymentReference(): string
{
    return 'TB_' . time() . '_' . random_int(1000, 9999);
}

function convertToMinor($amount): int
{
    return (int) round(((float)$amount) * 100);
}

function getPaymentConfig(): array
{
    $config = require __DIR__ . '/../config/payment.php';

    $checkoutUrl = $config['mode'] === 'LIVE'
        ? $config['checkout_url_live']
        : $config['checkout_url_test'];

    $passportUrl = $config['mode'] === 'LIVE'
        ? $config['passport_url_live']
        : $config['passport_url_test'];

    $requeryBase = $config['mode'] === 'LIVE'
        ? $config['requery_base_live']
        : $config['requery_base_test'];

    return [
        'mode' => $config['mode'],
        'merchant_code' => $config['merchant_code'],
        'pay_item_id' => $config['pay_item_id'],
        'client_id' => $config['client_id'],
        'secret_key' => $config['secret_key'],
        'currency' => $config['currency'],
        'checkout_url' => $checkoutUrl,
        'passport_url' => $passportUrl,
        'requery_base' => $requeryBase,
        'site_redirect_url' => $config['site_redirect_url'],
    ];
}

function getPassportToken(): string
{
    $config = getPaymentConfig();

    $basic = base64_encode($config['client_id'] . ':' . $config['secret_key']);

    $ch = curl_init($config['passport_url']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query([
            'grant_type' => 'client_credentials',
            'scope' => 'profile'
        ]),
        CURLOPT_HTTPHEADER => [
            'Authorization: Basic ' . $basic,
            'Content-Type: application/x-www-form-urlencoded'
        ],
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception('Failed to get access token: ' . $error);
    }

    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $decoded = json_decode($response, true);

    if ($statusCode < 200 || $statusCode >= 300 || !isset($decoded['access_token'])) {
        throw new Exception('Failed to get access token');
    }

    return $decoded['access_token'];
}

function requeryTransaction(string $reference, int $amountMinor): array
{
    $config = getPaymentConfig();
    $token = getPassportToken();

    $url = $config['requery_base']
        . '/collections/api/v1/gettransaction.json'
        . '?merchantcode=' . urlencode($config['merchant_code'])
        . '&transactionreference=' . urlencode($reference)
        . '&amount=' . urlencode($amountMinor);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPGET => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json'
        ],
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception('Failed to requery transaction: ' . $error);
    }

    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $decoded = json_decode($response, true);

    if ($statusCode < 200 || $statusCode >= 300 || !is_array($decoded)) {
        throw new Exception('Transaction requery failed');
    }

    return $decoded;
}