<?php

function jsonResponse($status, $message, $data = null)
{
    http_response_code($status);

    header("Content-Type: application/json");

    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ], JSON_UNESCAPED_SLASHES);

    exit;
}