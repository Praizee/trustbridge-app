<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/User.php';
require_once __DIR__ . '/../../../utils/helpers.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';


$db = (new Database())->connect();
$userModel = new User($db);

$authUser = AuthMiddleware::authorize(['admin', 'super-admin', 'super_admin']);

$data = json_decode(file_get_contents("php://input"), true);

requireFields($data, ['user_id']);

$deleted = $userModel->delete($data['user_id']);

if ($deleted) {
    jsonResponse(200, "User deleted");
}

jsonResponse(500, "Failed to delete user");