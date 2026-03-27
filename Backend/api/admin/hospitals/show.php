<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/Hospital.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

$authUser = AuthMiddleware::authorize(['admin', 'super-admin']);

$db = (new Database())->connect();
$hospitalModel = new Hospital($db);

$id = $_GET['id'] ?? null;

if (!$id) {
    jsonResponse(400, "Hospital ID is required");
}

$hospital = $hospitalModel->findById($id);

if (!$hospital) {
    jsonResponse(404, "Hospital not found");
}

jsonResponse(200, "Hospital fetched successfully", $hospital);