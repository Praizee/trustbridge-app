<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../utils/jwt.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../controllers/CampaignController.php';
require_once __DIR__ . '/../../models/Hospital.php';

$database = new Database();
$db = $database->connect();

$authUser = AuthMiddleware::authenticate();

$controller = new CampaignController($db);
$controller->create($authUser);
