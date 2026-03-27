<?php

require_once __DIR__ . '/../../utils/cors.php';
require_once __DIR__ . '/../../utils/response.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

$auth = new AuthMiddleware();
$user = $auth->authenticate();

if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    jsonResponse(422, 'Valid campaign id is required');
}

$campaign_id = (int) $_GET['id'];

$db = (new Database())->connect();

try {

    /**
     * 🔹 1. CAMPAIGN DETAILS
     */
    $stmt = $db->prepare("
        SELECT 
            *,
            CASE 
                WHEN target_amount > 0 
                THEN (raised_amount / target_amount) * 100 
                ELSE 0 
            END AS progress
        FROM campaigns
        WHERE id = ?
        AND created_by = ?
        AND deleted_at IS NULL
    ");

    $stmt->execute([$campaign_id, $user['id']]);
    $campaign = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$campaign) {
        jsonResponse(404, 'Campaign not found or unauthorized');
    }

    /**
     * 🔹 2. STATS
     */
    $stmt = $db->prepare("
        SELECT 
            COUNT(DISTINCT donor_email) AS total_donors,
            COUNT(*) AS total_donations,
            COALESCE(SUM(amount), 0) AS total_amount
        FROM donations
        WHERE campaign_id = ?
        AND status = 'successful'
    ");

    $stmt->execute([$campaign_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    /**
     * 🔹 3. RECENT TRANSACTIONS
     */
    $stmt = $db->prepare("
        SELECT 
            donor_name,
            donor_email,
            amount,
            status,
            created_at
        FROM donations
        WHERE campaign_id = ?
        ORDER BY created_at DESC
        LIMIT 10
    ");

    $stmt->execute([$campaign_id]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /**
     * 🔹 4. CAMPAIGN IMAGES
     */
    $stmt = $db->prepare("
        SELECT 
            id,
            image_path,
            created_at
        FROM campaign_images
        WHERE campaign_id = ?
        ORDER BY created_at DESC
    ");

    $stmt->execute([$campaign_id]);
    $images = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /**
     * 🔹 FINAL RESPONSE
     */
    jsonResponse(200, 'Campaign details fetched', [
        "campaign" => [
            "id" => $campaign['id'],
            "title" => $campaign['title'],
            "story" => $campaign['story'],
            "patient_name" => $campaign['patient_name'],
            "beneficiary_name" => $campaign['beneficiary_name'],
            "category" => $campaign['category'],
            "target_amount" => (float) $campaign['target_amount'],
            "raised_amount" => (float) $campaign['raised_amount'],
            "progress" => (float) $campaign['progress'],
            "status" => $campaign['status'],
            "thumbnail" => $campaign['thumbnail_image'],
            "video" => $campaign['video_path'],
            "medical_document" => $campaign['medical_document_path'],
            "contact_phone" => $campaign['contact_phone'],
            "created_at" => $campaign['created_at']
        ],

        "stats" => [
            "total_donors" => (int) $stats['total_donors'],
            "total_donations" => (int) $stats['total_donations'],
            "total_amount" => (float) $stats['total_amount']
        ],

        "recent_transactions" => $transactions,
        "images" => $images
    ]);

} catch (Exception $e) {
    jsonResponse(500, 'Server error', [
        "error" => $e->getMessage()
    ]);
}