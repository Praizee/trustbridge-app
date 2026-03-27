<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/User.php';
require_once __DIR__ . '/../../../utils/helpers.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

$authUser = AuthMiddleware::authorize(['admin', 'super-admin', 'super_admin']);

$db = (new Database())->connect();
$userModel = new User($db);

$data = json_decode(file_get_contents("php://input"), true);

requireFields($data, ['user_id']);

$updated = $userModel->updateStatus($data['user_id'], 'suspended');

if ($updated) {
    jsonResponse(200, "User suspended");
}

jsonResponse(500, "Failed to suspend user");