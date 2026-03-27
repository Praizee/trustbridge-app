<?php
require_once '../../config/database.php';
require_once '../../models/Donation.php';

$data = json_decode(file_get_contents("php://input"), true);

$reference = $data['MerchantReference'] ?? null;
$responseCode = $data['ResponseCode'] ?? null;

if (!$reference) exit;

$donation = new Donation($pdo);

if ($responseCode === "00") {
    $donation->markAsSuccess($reference);
} else {
    $donation->markAsFailed($reference);
}