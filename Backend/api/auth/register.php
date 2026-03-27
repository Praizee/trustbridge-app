<?php

ini_set('display_errors',1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/helpers.php';   // LOAD HELPERS FIRST
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/AuthController.php';

$database = new Database();
$db = $database->connect();

$controller = new AuthController($db);

$data = getJsonInput();

$controller->register($data);
