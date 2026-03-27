<?php

require_once __DIR__ . '/../../../utils/cors.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

header("Content-Type: application/json");


$authUser = AuthMiddleware::authorize(['admin']);

$db = (new Database())->connect();

try {

    $stmt = $db->query("
        SELECT w.*, c.title AS campaign_title, h.name AS hospital_name
        FROM withdrawals w
        JOIN campaigns c ON w.campaign_id = c.id
        JOIN hospitals h ON w.hospital_id = h.id
        WHERE w.status = 'pending'
        ORDER BY w.created_at DESC
    ");

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(200, "Pending withdrawals fetched", $data);

} catch (Throwable $e) {
    jsonResponse(500, "Failed to fetch", $e->getMessage());
}