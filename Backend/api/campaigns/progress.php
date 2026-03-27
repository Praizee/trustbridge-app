<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/CampaignController.php';

$database = new Database();
$db = $database->connect();

$controller = new CampaignController($db);
$controller->progress(); 