<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';

// Get request body
$data = json_decode(file_get_contents("php://input"), true);

$token = trim($data['token'] ?? '');
$password = trim($data['password'] ?? '');

if (!$token || !$password) {
    jsonResponse(400, "Token and password are required");
}

// Validate password strength (optional but recommended)
if (strlen($password) < 8) {
    jsonResponse(400, "Password must be at least 8 characters");
}

// DB connection
$db = (new Database())->connect();

// Find user with token
$stmt = $db->prepare("
    SELECT id, reset_token_expiry 
    FROM users 
    WHERE reset_token = ?
    LIMIT 1
");
$stmt->execute([$token]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    jsonResponse(400, "Invalid or expired token");
}

// Check expiry
if (strtotime($user['reset_token_expiry']) < time()) {
    jsonResponse(400, "Token has expired");
}

// Hash new password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Update password + clear token
$update = $db->prepare("
    UPDATE users 
    SET password = ?, reset_token = NULL, reset_token_expiry = NULL 
    WHERE id = ?
");

$updated = $update->execute([
    $hashedPassword,
    $user['id']
]);

if (!$updated) {
    jsonResponse(500, "Could not reset password");
}

// Success
jsonResponse(200, "Password reset successful");