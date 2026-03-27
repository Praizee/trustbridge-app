<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/helpers.php';
require_once __DIR__ . '/../../utils/jwt.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../models/User.php';

$database = new Database();
$db = $database->connect();

$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    jsonResponse(401, "Authorization token missing");
}

$authHeader = $headers['Authorization'];

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    jsonResponse(401, "Invalid authorization format");
}

$token = $matches[1];

try {

    $payload = verifyJwt($token);

    $userModel = new User($db);

    $user = $userModel->findById($payload['user_id']);

    if (!$user) {
        jsonResponse(404, "User not found");
    }

    jsonResponse(200, "User retrieved", $user);

} catch (Exception $e) {

    jsonResponse(401, $e->getMessage());

}
