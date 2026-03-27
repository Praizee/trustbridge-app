<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

$auth = new AuthMiddleware();
$user = $auth->authenticate();

if ($user['role'] !== 'admin') {
    echo json_encode([
        "status" => 403,
        "message" => "Admin access only"
    ]);
    exit;
}

$db = new Database();
$pdo = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);

$campaign_id = $data['campaign_id'] ?? null;

if (!$campaign_id) {
    echo json_encode([
        "status" => 400,
        "message" => "Campaign ID required"
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id FROM campaigns 
    WHERE id = ? AND deleted_at IS NULL
");
$stmt->execute([$campaign_id]);
$campaign = $stmt->fetch();

if (!$campaign) {
    echo json_encode([
        "status" => 404,
        "message" => "Campaign not found"
    ]);
    exit;
}


$stmt = $pdo->prepare("
    UPDATE campaigns 
    SET deleted_at = NOW() 
    WHERE id = ?
");

$stmt->execute([$campaign_id]);

echo json_encode([
    "status" => 200,
    "message" => "Campaign deleted by admin"
]);