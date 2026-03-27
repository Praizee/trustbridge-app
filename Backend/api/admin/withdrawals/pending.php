<?php

require_once __DIR__ . '/../../../utils/cors.php';
header("Content-Type: application/json");

require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../controllers/WithdrawalController.php';

$authUser = AuthMiddleware::authorize(['admin', 'super-admin', 'super_admin']);

$database = new Database();
$db = $database->connect();

$controller = new WithdrawalController($db);
$controller->pending($authUser);