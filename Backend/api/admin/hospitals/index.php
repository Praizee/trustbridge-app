<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/Hospital.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';

$authUser = AuthMiddleware::authorize(['admin', 'super-admin']);

$db = (new Database())->connect();
$hospitalModel = new Hospital($db);

// filters
$verified = isset($_GET['verified']) ? (int)$_GET['verified'] : null;

$hospitals = $hospitalModel->getAll($verified);

jsonResponse(200, "Hospitals fetched successfully", $hospitals);