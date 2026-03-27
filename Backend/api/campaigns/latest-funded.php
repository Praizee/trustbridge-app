<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../config/database.php';

header("Content-Type: application/json");

$db = new Database();
$pdo = $db->connect();

try {

  $stmt = $pdo->prepare("
    SELECT 
        c.id,
        c.title,
        c.target_amount,
        c.raised_amount,
        c.thumbnail_image as cover_image,
        d.amount as last_donation_amount,
        d.created_at as donated_at
    FROM donations d
    INNER JOIN campaigns c ON c.id = d.campaign_id
    WHERE d.status = 'successful'
    ORDER BY d.created_at DESC
    LIMIT 1
");

    $stmt->execute();

    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$result) {
        echo json_encode([
            "status" => 200,
            "message" => "No funded campaigns yet",
            "data" => null
        ]);
        exit;
    }

    echo json_encode([
        "status" => 200,
        "message" => "Latest funded campaign fetched",
        "data" => $result
    ]);

} catch (Exception $e) {
    echo json_encode([
        "status" => 500,
        "message" => "Server error",
        "error" => $e->getMessage()
    ]);
}