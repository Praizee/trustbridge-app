<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/User.php';
require_once __DIR__ . '/../../../utils/helpers.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';



$db = (new Database())->connect();
$userModel = new User($db);

$authUser = AuthMiddleware::authorize(['admin', 'super-admin', 'super_admin']);

if (!isset($_GET['id'])) {
    jsonResponse(422, "User ID is required");
}

$user = $userModel->findById((int)$_GET['id']);

if (!$user) {
    jsonResponse(404, "User not found");
}

jsonResponse(200, "User retrieved", $user);