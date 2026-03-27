<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/HospitalController.php';

$authUser = AuthMiddleware::authorize(['hospital']);

$database = new Database();
$db = $database->connect();

$controller = new HospitalController($db);

$data = json_decode(file_get_contents("php://input"), true);
$controller->verifyOwnHospital($authUser, $data);