<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/CampaignController.php';

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    jsonResponse(422, 'Valid campaign id is required');
}

$database = new Database();
$db = $database->connect();

$controller = new CampaignController($db);
$controller->show((int)$_GET['id']);
