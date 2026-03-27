<?php

require_once __DIR__ . '/../../utils/cors.php';

$config = require __DIR__ . '/../../config/payment.php';

$frontendCallback = $config['frontend_callback_url'];

// Get reference from Interswitch
$reference = trim($_POST['txnref'] ?? $_POST['txn_ref'] ?? $_GET['txnref'] ?? $_GET['txn_ref'] ?? '');
$responseCode = trim($_POST['resp'] ?? $_GET['resp'] ?? '');

if ($reference === '') {
    header("Location: $frontendCallback?verified=0");
    exit;
}

// If Interswitch already says failed
if ($responseCode !== '' && $responseCode !== '00') {
    header("Location: $frontendCallback?verified=0&txn_ref=" . urlencode($reference));
    exit;
}

// Call verify.php
$verifyUrl = "https://trust.ezirimkingdom.com.ng/api/donations/verify.php?reference=" . urlencode($reference);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $verifyUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    curl_close($ch);
    header("Location: $frontendCallback?verified=0&txn_ref=" . urlencode($reference));
    exit;
}

curl_close($ch);

$result = json_decode($response, true);

// ✅ IMPORTANT: match your jsonResponse format
if (isset($result['status']) && (int)$result['status'] === 200) {

    $payload = $result['data'] ?? [];

    $txnRef = urlencode($payload['txn_ref'] ?? $reference);
    $amount = urlencode((string)($payload['amount'] ?? ''));
    $campaignId = urlencode((string)($payload['campaign_id'] ?? ''));

    header("Location: $frontendCallback?verified=1&txn_ref=$txnRef&amount=$amount&campaign_id=$campaignId");
    exit;
}

// ❌ Failed
header("Location: $frontendCallback?verified=0&txn_ref=" . urlencode($reference));
exit;