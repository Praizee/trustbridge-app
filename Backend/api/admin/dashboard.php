<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

$authUser = AuthMiddleware::authorize(['admin', 'super-admin']);

$db = (new Database())->connect();

/*
|--------------------------------------------------------------------------
| USERS STATS
|--------------------------------------------------------------------------
*/
$totalUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();

$activeUsers = $db->query("SELECT COUNT(*) FROM users WHERE status = 'active'")
    ->fetchColumn();

$suspendedUsers = $db->query("SELECT COUNT(*) FROM users WHERE status = 'suspended'")
    ->fetchColumn();

/*
|--------------------------------------------------------------------------
| HOSPITALS STATS
|--------------------------------------------------------------------------
*/
$totalHospitals = $db->query("SELECT COUNT(*) FROM hospitals")->fetchColumn();

$verifiedHospitals = $db->query("SELECT COUNT(*) FROM hospitals WHERE verified = 1")
    ->fetchColumn();

/*
|--------------------------------------------------------------------------
| CAMPAIGNS STATS
|--------------------------------------------------------------------------
*/
$totalCampaigns = $db->query("SELECT COUNT(*) FROM campaigns")->fetchColumn();

/*
|--------------------------------------------------------------------------
| DONATIONS STATS
|--------------------------------------------------------------------------
*/
$totalDonations = $db->query("SELECT COUNT(*) FROM donations")->fetchColumn();

$totalAmountRaised = $db->query("
    SELECT COALESCE(SUM(amount), 0) 
    FROM donations 
    WHERE status = 'successful'
")->fetchColumn();

/*
|--------------------------------------------------------------------------
| RESPONSE
|--------------------------------------------------------------------------
*/

jsonResponse(200, "Dashboard stats fetched successfully", [
    "users" => [
        "total" => (int)$totalUsers,
        "active" => (int)$activeUsers,
        "suspended" => (int)$suspendedUsers
    ],
    "hospitals" => [
        "total" => (int)$totalHospitals,
        "verified" => (int)$verifiedHospitals
    ],
    "campaigns" => [
        "total" => (int)$totalCampaigns
    ],
    "donations" => [
        "total_transactions" => (int)$totalDonations,
        "total_amount" => (float)$totalAmountRaised
    ]
]);