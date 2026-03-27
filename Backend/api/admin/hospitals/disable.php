<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/Hospital.php';
require_once __DIR__ . '/../../../utils/helpers.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

$authUser = AuthMiddleware::authorize(['admin', 'super-admin']);

$db = (new Database())->connect();
$hospitalModel = new Hospital($db);

$data = json_decode(file_get_contents("php://input"), true);

requireFields($data, ['hospital_id']);

$updated = $hospitalModel->updateStatus($data['hospital_id'], 'disabled');

if ($updated) {
    jsonResponse(200, "Hospital disabled successfully");
}

jsonResponse(500, "Failed to disable hospital");