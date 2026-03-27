<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


header("Content-Type: application/json");


require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';


$user = AuthMiddleware::authenticate();


$data = json_decode(file_get_contents("php://input"), true);

$campaign_id = $data['campaign_id'] ?? null;
$amount = $data['amount'] ?? null;

if (!$campaign_id || !$amount) {
    echo json_encode([
        "status" => 400,
        "message" => "campaign_id and amount are required"
    ]);
    exit;
}

try {
    $db = (new Database())->connect();


    $stmt = $db->prepare("SELECT hospital_id FROM campaigns WHERE id = ?");
    $stmt->execute([$campaign_id]);
    $campaign = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campaign) {
        echo json_encode([
            "status" => 404,
            "message" => "Campaign not found"
        ]);
        exit;
    }

    $hospital_id = $campaign['hospital_id'];

 
    $check = $db->prepare("
        SELECT id FROM withdrawals 
        WHERE campaign_id = ? AND status = 'pending'
    ");
    $check->execute([$campaign_id]);

    if ($check->fetch()) {
        echo json_encode([
            "status" => 400,
            "message" => "Withdrawal already requested and pending"
        ]);
        exit;
    }

 
    $stmt = $db->prepare("
        INSERT INTO withdrawals (hospital_id, campaign_id, amount, status, created_at)
        VALUES (?, ?, ?, 'pending', NOW())
    ");

    $stmt->execute([$hospital_id, $campaign_id, $amount]);

    echo json_encode([
        "status" => 200,
        "message" => "Withdrawal request submitted successfully"
    ]);

} catch (Throwable $e) {
    echo json_encode([
        "status" => 500,
        "message" => $e->getMessage(),
        "line" => $e->getLine()
    ]);
}