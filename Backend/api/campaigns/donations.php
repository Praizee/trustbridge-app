<?php

require_once __DIR__ . '/../../utils/cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/DonationController.php';

$database = new Database();
$db = $database->connect();

$controller = new DonationController($db);
$controller->getCampaignDonations();