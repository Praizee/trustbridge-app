<?php

require_once '../../middleware/AuthMiddleware.php';
require_once '../../utils/response.php';

$auth = new AuthMiddleware();
$user = $auth->authenticate();

jsonResponse(200, 'Current user', $user);