<?php

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../models/User.php';
require_once __DIR__ . '/../../../utils/helpers.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../middleware/AuthMiddleware.php';



$db = (new Database())->connect();
$userModel = new User($db);

$authUser = AuthMiddleware::authorize(['admin', 'super-admin', 'super_admin']);

// pagination
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
$offset = ($page - 1) * $limit;

// search
$search = $_GET['search'] ?? null;

$users = $userModel->getAll($limit, $offset, $search);

jsonResponse(200, "Users retrieved", $users);