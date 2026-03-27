<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';

// GET campaign_id
$campaignId = isset($_GET['campaign_id']) ? (int) $_GET['campaign_id'] : 0;

if ($campaignId <= 0) {
    jsonResponse(400, "campaign_id is required");
}

// DB
$db = (new Database())->connect();

$stmt = $db->prepare("
    SELECT 
        donor_name,
        amount,
        created_at
    FROM donations
    WHERE campaign_id = :campaign_id
    AND status = 'successful'
    ORDER BY created_at DESC
");

$stmt->execute([
    ':campaign_id' => $campaignId
]);

$donations = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse(200, "Donations fetched successfully", $donations);