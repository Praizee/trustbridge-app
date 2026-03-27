<?php

require_once __DIR__ . '/../../../utils/cors.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

$config = require __DIR__ . '/../../../config/payment.php';

header("Content-Type: application/json");


$authUser = AuthMiddleware::authorize(['admin']);

$db = (new Database())->connect();

$data = json_decode(file_get_contents("php://input"), true);

$withdrawalId = $data['withdrawal_id'] ?? 0;

if (!$withdrawalId) {
    jsonResponse(422, "withdrawal_id is required");
}

try {

   
    $stmt = $db->prepare("
        SELECT w.*, h.bank_account, h.bank_code, h.name
        FROM withdrawals w
        JOIN hospitals h ON w.hospital_id = h.id
        WHERE w.id = ?
    ");
    $stmt->execute([$withdrawalId]);
    $withdrawal = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$withdrawal) {
        jsonResponse(404, "Withdrawal not found");
    }

    if ($withdrawal['status'] !== 'pending') {
        jsonResponse(409, "Already processed");
    }

    if (!$withdrawal['bank_account'] || !$withdrawal['bank_code']) {
        jsonResponse(422, "Hospital bank details incomplete");
    }

 
    $payload = [
        "amount" => (int)($withdrawal['amount'] * 100), // kobo
        "accountNumber" => $withdrawal['bank_account'],
        "bankCode" => $withdrawal['bank_code'],
        "narration" => "TrustBridge Withdrawal",
        "reference" => "WDR_" . time()
    ];

    $ch = curl_init($config['payout_url']);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            "Content-Type: application/json",
            "Authorization: Bearer " . $config['secret_key']
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    curl_close($ch);

    $result = json_decode($response, true);

   
    if ($httpCode !== 200) {
        jsonResponse(500, "Payout failed", $result);
    }

    
    $stmt = $db->prepare("
        UPDATE withdrawals 
        SET status = 'paid', updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$withdrawalId]);

    jsonResponse(200, "Withdrawal approved & paid");

} catch (Throwable $e) {
    jsonResponse(500, "Approval failed", $e->getMessage());
}