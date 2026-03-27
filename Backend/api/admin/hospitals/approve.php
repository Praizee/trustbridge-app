<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../../utils/cors.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../utils/helpers.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../../../controllers/HospitalController.php';

header("Content-Type: application/json");

// Use the same working auth middleware as admin stats
$authUser = AuthMiddleware::authorize(['admin', 'super-admin']);

$database = new Database();
$db = $database->connect();

$data = getJsonInput();

if (!$data || !is_array($data)) {
    jsonResponse(400, "Invalid JSON payload");
}

$requestId = isset($data['request_id']) ? (int)$data['request_id'] : 0;
$hospitalName = trim($data['hospital_name'] ?? '');
$hospitalAddress = trim($data['hospital_address'] ?? '');
$bankAccount = trim($data['bank_account'] ?? '');
$bankCode = trim($data['bank_code'] ?? '');

if ($requestId <= 0) {
    jsonResponse(422, "request_id is required");
}

if ($hospitalName === '') {
    jsonResponse(422, "hospital_name is required");
}

if ($hospitalAddress === '') {
    jsonResponse(422, "hospital_address is required");
}

if ($bankAccount === '') {
    jsonResponse(422, "bank_account is required");
}

if ($bankCode === '') {
    jsonResponse(422, "bank_code is required");
}

try {
    $controller = new HospitalController($db);
    $controller->approve([
        'request_id' => $requestId,
        'hospital_name' => $hospitalName,
        'hospital_address' => $hospitalAddress,
        'bank_account' => $bankAccount,
        'bank_code' => $bankCode,
        'approved_by' => $authUser['id'] ?? null,
    ]);
} catch (Throwable $e) {
    jsonResponse(500, "Hospital approval failed", [
        'error' => $e->getMessage()
    ]);
}