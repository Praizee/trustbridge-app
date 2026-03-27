<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

/*
|--------------------------------------------------------------------------
| AUTH (USE YOUR WORKING SYSTEM)
|--------------------------------------------------------------------------
*/

// allow hospital users (adjust roles if needed)
$authUser = AuthMiddleware::authorize(['hospital', 'admin', 'super-admin']);

// you now already have the user here
$user_id = $authUser['id'] ?? null;

if (!$user_id) {
    jsonResponse(401, "Unauthorized - Invalid token");
}

/*
|--------------------------------------------------------------------------
| DB CONNECTION
|--------------------------------------------------------------------------
*/
$db = (new Database())->connect();

/*
|--------------------------------------------------------------------------
| GET HOSPITAL
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT id, verified 
    FROM hospitals 
    WHERE user_id = ?
    LIMIT 1
");
$stmt->execute([$user_id]);

$hospital = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$hospital) {
    jsonResponse(200, "No hospital found", [
        "campaigns" => 0,
        "fully_funded" => 0,
        "total_raised" => 0,
        "verified" => false
    ]);
}

$hospital_id = $hospital['id'];

/*
|--------------------------------------------------------------------------
| TOTAL CAMPAIGNS
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT COUNT(*) 
    FROM campaigns 
    WHERE hospital_id = ?
");
$stmt->execute([$hospital_id]);
$totalCampaigns = $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| FULLY FUNDED CAMPAIGNS
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT COUNT(*) 
    FROM campaigns 
    WHERE hospital_id = ?
    AND raised_amount >= target_amount
");
$stmt->execute([$hospital_id]);
$fullyFunded = $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| TOTAL RAISED (ONLY SUCCESSFUL DONATIONS)
|--------------------------------------------------------------------------
*/
$stmt = $db->prepare("
    SELECT COALESCE(SUM(d.amount), 0)
    FROM donations d
    INNER JOIN campaigns c ON c.id = d.campaign_id
    WHERE c.hospital_id = ?
    AND d.status = 'successful'
");
$stmt->execute([$hospital_id]);
$totalRaised = $stmt->fetchColumn();

/*
|--------------------------------------------------------------------------
| VERIFIED STATUS
|--------------------------------------------------------------------------
*/
$isVerified = (bool)$hospital['verified'];

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

jsonResponse(200, "Hospital stats fetched successfully", [
    "campaigns" => (int)$totalCampaigns,
    "fully_funded" => (int)$fullyFunded,
    "total_raised" => (float)$totalRaised,
    "verified" => $isVerified
]);