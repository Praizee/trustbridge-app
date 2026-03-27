<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Donation.php';

$config = require __DIR__ . '/../../config/payment.php';

$reference = trim($_GET['reference'] ?? '');

if ($reference === '') {
    jsonResponse(400, 'Reference is required');
}

$db = (new Database())->connect();
$donationModel = new Donation($db);

$donation = $donationModel->findByReference($reference);

if (!$donation) {
    jsonResponse(404, 'Donation not found');
}

// amount stored in DB is in naira, but Interswitch verify expects kobo
$amountKobo = (int) round(((float) $donation['amount']) * 100);

$requeryUrl = $config['base_url'] . $config['verify_endpoint'] . '?' . http_build_query([
    'merchantcode' => $config['merchant_code'],
    'transactionreference' => $reference,
    'amount' => $amountKobo,
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $requeryUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
    ],
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    jsonResponse(500, 'Failed to reach payment gateway', ['error' => $error]);
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$gateway = json_decode($response, true);

if (!is_array($gateway)) {
    jsonResponse(500, 'Invalid gateway response', [
        'http_code' => $httpCode,
        'raw_response' => $response
    ]);
}

$responseCode = $gateway['ResponseCode'] ?? '';
$returnedAmount = (int) ($gateway['Amount'] ?? 0);

// Amount mismatch = do not give value
if ($responseCode !== '00' || $returnedAmount !== $amountKobo) {
    if (($donation['status'] ?? '') === 'pending') {
        $donationModel->markFailed((int) $donation['id']);
    }

    jsonResponse(400, 'Payment not successful', [
        'gateway' => $gateway,
        'expected_amount' => $amountKobo,
        'returned_amount' => $returnedAmount
    ]);
}

// Already processed before? Do not increment again.
if (($donation['status'] ?? '') === 'successful') {
    jsonResponse(200, 'Payment already verified', [
        'txn_ref' => $reference,
        'amount' => (float) $donation['amount'],
        'campaign_id' => (int) $donation['campaign_id'],
        'gateway' => $gateway
    ]);
}

$db->beginTransaction();

try {
    $donationModel->markSuccessful((int) $donation['id']);

    $stmt = $db->prepare("
        UPDATE campaigns
        SET raised_amount = raised_amount + :amount
        WHERE id = :campaign_id
    ");
    $stmt->execute([
        ':amount' => (float) $donation['amount'],
        ':campaign_id' => (int) $donation['campaign_id']
    ]);

    $db->commit();

    jsonResponse(200, 'Payment verified successfully', [
        'txn_ref' => $reference,
        'amount' => (float) $donation['amount'],
        'campaign_id' => (int) $donation['campaign_id'],
        'gateway' => $gateway
    ]);
} catch (Throwable $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }

    jsonResponse(500, 'Could not update donation status', [
        'error' => $e->getMessage()
    ]);
}