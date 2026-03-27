<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

$auth = new AuthMiddleware();
$user = $auth->authenticate();

$db = (new Database())->connect();

try {

    $stmt = $db->prepare("
        SELECT 
            id,
            title,
            patient_name,
            beneficiary_name,
            category,
            target_amount,
            raised_amount,
            status,
            thumbnail_image,
            created_at,

            CASE 
                WHEN target_amount > 0 
                THEN (raised_amount / target_amount) * 100 
                ELSE 0 
            END AS progress

        FROM campaigns
        WHERE created_by = ?
        AND deleted_at IS NULL
        ORDER BY created_at DESC
    ");

    $stmt->execute([$user['id']]);
    $campaigns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    jsonResponse(200, 'My campaigns fetched successfully', $campaigns);

} catch (Exception $e) {
    jsonResponse(500, 'Server error', [
        "error" => $e->getMessage()
    ]);
}