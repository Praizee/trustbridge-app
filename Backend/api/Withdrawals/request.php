<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

header("Content-Type: application/json");

$authUser = AuthMiddleware::authorize(['hospital']);

$db = (new Database())->connect();


$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !is_array($data)) {
    jsonResponse(400, "Invalid JSON payload");
}


$campaignId = isset($data['campaign_id']) ? (int)$data['campaign_id'] : 0;
$amount = isset($data['amount']) ? (float)$data['amount'] : 0;


if ($campaignId <= 0) {
    jsonResponse(422, "campaign_id is required");
}

if ($amount <= 0) {
    jsonResponse(422, "Amount must be greater than 0");
}

try {
   
    $stmt = $db->prepare("SELECT * FROM hospitals WHERE user_id = ?");
    $stmt->execute([$authUser['user_id']]);
    $hospital = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$hospital || (int)$hospital['verified'] !== 1) {
        jsonResponse(403, "Hospital not verified");
    }

    $stmt = $db->prepare("SELECT * FROM campaigns WHERE id = ?");
    $stmt->execute([$campaignId]);
    $campaign = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campaign) {
        jsonResponse(404, "Campaign not found");
    }

    if ((int)$campaign['hospital_id'] !== (int)$hospital['id']) {
        jsonResponse(403, "Unauthorized for this campaign");
    }

    if ((float)$campaign['raised_amount'] < (float)$campaign['target_amount']) {
        jsonResponse(422, "Campaign is not fully funded");
    }

   
    $stmt = $db->prepare("SELECT id FROM withdrawals WHERE campaign_id = ?");
    $stmt->execute([$campaignId]);

    if ($stmt->fetch()) {
        jsonResponse(409, "Withdrawal already requested");
    }


    $stmt = $db->prepare("
        INSERT INTO withdrawals (campaign_id, hospital_id, amount, status, created_at)
        VALUES (?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([
        $campaignId,
        $hospital['id'],
        $amount
    ]);

    jsonResponse(200, "Withdrawal request submitted successfully");

} catch (Throwable $e) {
    jsonResponse(500, "Withdrawal failed", [
        "error" => $e->getMessage()
    ]);
}