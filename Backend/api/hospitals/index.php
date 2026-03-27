<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../controllers/HospitalController.php';

$database = new Database();
$db = $database->connect();

$controller = new HospitalController($db);

$controller->list();
