<?php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../lib/sendMail.php';

$db = new Database();
$pdo = $db->connect();

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? null;

if (!$email) {
    echo json_encode([
        "status" => 400,
        "message" => "Email is required"
    ]);
    exit;
}

// check user
$stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode([
        "status" => 404,
        "message" => "User not found"
    ]);
    exit;
}

// generate token
$token = bin2hex(random_bytes(32));
$expiry = date("Y-m-d H:i:s", strtotime("+1 hour"));

// save
$stmt = $pdo->prepare("
    UPDATE users 
    SET reset_token = ?, reset_token_expiry = ? 
    WHERE email = ?
");

$stmt->execute([$token, $expiry, $email]);

// frontend reset page
$reset_link = "https://trustbridgeapp.netlify.app/reset-password?token=$token";

// send email
$sent = sendResetEmail($email, $user['name'], $reset_link);

if (!$sent) {
    echo json_encode([
        "status" => 500,
        "message" => "Failed to send email"
    ]);
    exit;
}

echo json_encode([
    "status" => 200,
    "message" => "Reset link sent to email"
]);