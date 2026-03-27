<?php

require_once '../../config/database.php';
require_once '../../utils/cors.php';
require_once '../../utils/response.php';

$db = (new Database())->connect();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, "Method not allowed");
}

$hospital_name = $_POST['hospital_name'] ?? null;
$hospital_address = $_POST['hospital_address'] ?? null;
$contact_email = $_POST['contact_email'] ?? null;

if (!$hospital_name || !$hospital_address || !$contact_email) {
    jsonResponse(400, "Missing required fields");
}

if (!isset($_FILES['license_document'])) {
    jsonResponse(400, "License document is required");
}

$file = $_FILES['license_document'];

$allowed_types = ['application/pdf','image/png','image/jpeg'];
$max_size = 5 * 1024 * 1024;

if (!in_array($file['type'], $allowed_types)) {
    jsonResponse(400, "Invalid file type");
}

if ($file['size'] > $max_size) {
    jsonResponse(400, "File too large");
}

$upload_dir = '../../uploads/hospitals/';

if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$filename = uniqid('hospital_') . '_' . basename($file['name']);
$upload_path = $upload_dir . $filename;

if (!move_uploaded_file($file['tmp_name'], $upload_path)) {
    jsonResponse(500, "File upload failed");
}

$license_path = 'uploads/hospitals/' . $filename;

$stmt = $db->prepare("
INSERT INTO hospital_verification_requests
(hospital_name, hospital_address, contact_email, license_path, status, created_at)
VALUES (?, ?, ?, ?, 'pending', NOW())
");

$stmt->execute([
    $hospital_name,
    $hospital_address,
    $contact_email,
    $license_path
]);

jsonResponse(201, "Verification request submitted", [
    "license_path" => $license_path
]);
