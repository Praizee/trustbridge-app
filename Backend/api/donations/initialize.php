<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Donation.php';

$config = require __DIR__ . '/../../config/payment.php';


$db = new Database();
$pdo = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["error" => "Invalid JSON"]);
    exit;
}

$amount = $data['amount'] ?? null;
$campaign_id = $data['campaign_id'] ?? null;
$email = $data['email'] ?? null;
$name = $data['name'] ?? "Anonymous";

if (!$amount || !$campaign_id || !$email) {
    echo json_encode(["error" => "Missing required fields"]);
    exit;
}


$reference = "DON_" . time() . rand(1000,9999);

$donation = new Donation($pdo);

try {
    $donation->create([
        'user_id' => null,
        'campaign_id' => $campaign_id,
        'amount' => $amount,
        'reference' => $reference,
        'donor_email' => $email,
        'donor_name' => $name
    ]);
} catch (Exception $e) {
    echo json_encode(["db_error" => $e->getMessage()]);
    exit;
}


$payload = [
    "merchantCode" => $config['merchant_code'],
    "payableCode" => $config['pay_item_id'],
    "amount" => $amount * 100, // kobo
    "redirectUrl" => $config['redirect_url'],
    "customerId" => $email,
    "currencyCode" => $config['currency'],
    "customerEmail" => $email
];


$ch = curl_init($config['base_url'] . "/collections/api/v1/pay-bill");

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);

if (!$response) {
    echo json_encode(["curl_error" => curl_error($ch)]);
    exit;
}

$result = json_decode($response, true);

if (!isset($result['paymentUrl'])) {
    echo json_encode([
        "gateway_error" => $result
    ]);
    exit;
}

echo json_encode([
    "status" => 200,
    "message" => "Donation initialized",
    "data" => [
        "payment_url" => $result['paymentUrl'],
        "reference" => $reference
    ]
]);