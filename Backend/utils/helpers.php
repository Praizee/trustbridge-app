<?php

require_once __DIR__ . '/response.php';

/*
Get JSON input from request body
*/
function getJsonInput(): array
{
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data) {
        jsonResponse(400, "Invalid JSON payload");
    }

    return $data;
}



/*
Ensure required fields exist
*/
function requireFields($data, $fields)
{
    foreach ($fields as $field) {

        if (!isset($data[$field]) || trim($data[$field]) === '') {

            jsonResponse(400, "$field is required");

        }

    }
}
