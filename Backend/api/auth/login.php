<?php

require_once __DIR__ . '/../../utils/cors.php';

header("Content-Type: application/json");

require_once __DIR__ . '/../../utils/helpers.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/AuthController.php';

$database = new Database();
$db = $database->connect();

$controller = new AuthController($db);

$data = getJsonInput();

$controller->login($data);