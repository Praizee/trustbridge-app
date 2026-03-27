<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/Donation.php';

// Parse input
$data = json_decode(file_get_contents("php://input"), true);

$amount = $data['amount'] ?? null;
$campaign_id = $data['campaign_id'] ?? null;
$email = $data['email'] ?? null;
$name = $data['name'] ?? "Anonymous";

// Validate
if (!$amount || !$campaign_id || !$email) {
    http_response_code(400);
    echo json_encode([
        "error" => "Missing required fields"
    ]);
    exit;
}

// Generate reference
$reference = "DON_" . time() . rand(1000, 9999);

// DB
$db = (new Database())->connect();
$donation = new Donation($db);

// Create donation
$created = $donation->create([
    'campaign_id' => $campaign_id,
    'amount' => $amount,
    'payment_reference' => $reference,
    'donor_email' => $email,
    'donor_name' => $name,
    'payment_link' => null
]);

if (!$created) {
    http_response_code(500);
    echo json_encode([
        "error" => "Could not initialize donation"
    ]);
    exit;
}

// ✅ IMPORTANT: FLAT RESPONSE (NO data wrapper)
echo json_encode([
    "reference" => $reference,
    "amount" => $amount,
    "email" => $email
], JSON_UNESCAPED_SLASHES);