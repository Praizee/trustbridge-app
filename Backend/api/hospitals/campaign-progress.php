<?php

require_once __DIR__ . '/../../utils/cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/HospitalController.php';

$authUser = AuthMiddleware::authorize(['hospital']);

$database = new Database();
$db = $database->connect();

$controller = new HospitalController($db);
$controller->campaignProgress($authUser);