<?php

require_once __DIR__ . '/../models/Campaign.php';
require_once __DIR__ . '/../models/Hospital.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/response.php';

class CampaignController
{
    private $campaign;
    private $db;

    public function __construct($db)
    {
        $this->db = $db;
        $this->campaign = new Campaign($db);
    }

    // =========================
    // FILE UPLOAD HANDLER
    // =========================
    private function uploadSingleFile($file, $destinationDir, array $allowedMimeTypes, int $maxSize, string $prefix)
    {
        if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
            return null;
        }

        if ($file['size'] > $maxSize) {
            jsonResponse(422, "{$prefix} file exceeds allowed size");
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, $allowedMimeTypes, true)) {
            jsonResponse(422, "Invalid {$prefix} file type");
        }

        if (!is_dir($destinationDir)) {
            mkdir($destinationDir, 0755, true);
        }

        $safeName = uniqid($prefix . '_') . '_' . preg_replace('/[^A-Za-z0-9\.\-_]/', '_', basename($file['name']));
        $fullPath = $destinationDir . $safeName;

        if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
            jsonResponse(500, "Failed to upload {$prefix}");
        }

        return str_replace(__DIR__ . '/../', '', $fullPath);
    }

    // =========================
    // CREATE CAMPAIGN
    // =========================
    public function create($authUser)
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            jsonResponse(405, 'Method not allowed');
        }

        $required = ['patient_name', 'title', 'story', 'target_amount', 'hospital_id', 'category'];

        foreach ($required as $field) {
            if (!isset($_POST[$field]) || trim((string)$_POST[$field]) === '') {
                jsonResponse(422, "{$field} is required");
            }
        }

        if (!isset($_FILES['medical_document']) || $_FILES['medical_document']['error'] !== UPLOAD_ERR_OK) {
            jsonResponse(422, 'medical_document is required');
        }

        $targetAmount = filter_var($_POST['target_amount'], FILTER_VALIDATE_FLOAT);

        if ($targetAmount === false || $targetAmount <= 0) {
            jsonResponse(422, 'target_amount must be a valid positive number');
        }

        $hospitalId = (int)$_POST['hospital_id'];

        $hospitalModel = new Hospital($this->db);
        $verifiedHospitals = $hospitalModel->getVerified();
        $hospitalIds = array_map(fn($h) => (int)$h['id'], $verifiedHospitals);

        if (!in_array($hospitalId, $hospitalIds, true)) {
            jsonResponse(422, 'Selected hospital is not verified');
        }

        // Upload files
        $medicalDocumentPath = $this->uploadSingleFile(
            $_FILES['medical_document'],
            __DIR__ . '/../uploads/campaigns/documents/',
            ['application/pdf', 'image/jpeg', 'image/png'],
            5 * 1024 * 1024,
            'medical_doc'
        );

        $videoPath = isset($_FILES['video']) && $_FILES['video']['error'] === UPLOAD_ERR_OK
            ? $this->uploadSingleFile(
                $_FILES['video'],
                __DIR__ . '/../uploads/campaigns/videos/',
                ['video/mp4', 'video/webm'],
                15 * 1024 * 1024,
                'campaign_video'
            )
            : null;

        // Handle images
        $thumbnailImage = null;
        $imagePaths = [];

        if (isset($_FILES['images'])) {
            $count = count($_FILES['images']['name']);

            if ($count > 3) {
                jsonResponse(422, 'Max 3 images allowed');
            }

            for ($i = 0; $i < $count; $i++) {

                if ($_FILES['images']['error'][$i] !== UPLOAD_ERR_OK) continue;

                $file = [
                    'name' => $_FILES['images']['name'][$i],
                    'type' => $_FILES['images']['type'][$i],
                    'tmp_name' => $_FILES['images']['tmp_name'][$i],
                    'error' => $_FILES['images']['error'][$i],
                    'size' => $_FILES['images']['size'][$i],
                ];

                $path = $this->uploadSingleFile(
                    $file,
                    __DIR__ . '/../uploads/campaigns/images/',
                    ['image/jpeg', 'image/png'],
                    2 * 1024 * 1024,
                    'campaign_image'
                );

                if ($path) $imagePaths[] = $path;
            }

            $thumbnailImage = $imagePaths[0] ?? null;
        }

        // Create campaign
        $campaignId = $this->campaign->create([
            'created_by' => (int)$authUser['user_id'],
            'hospital_id' => $hospitalId,
            'patient_name' => trim($_POST['patient_name']),
            'beneficiary_name' => $_POST['beneficiary_name'] ?? null,
            'title' => trim($_POST['title']),
            'story' => trim($_POST['story']),
            'diagnosis_summary' => $_POST['diagnosis_summary'] ?? null,
            'category' => $_POST['category'],
            'target_amount' => $targetAmount,
            'status' => 'active',
            'thumbnail_image' => $thumbnailImage,
            'video_path' => $videoPath,
            'contact_phone' => $_POST['contact_phone'] ?? null,
            'medical_document_path' => $medicalDocumentPath
        ]);

        foreach ($imagePaths as $img) {
            $this->campaign->saveImage($campaignId, $img);
        }

        jsonResponse(201, 'Campaign created successfully', [
            'campaign_id' => $campaignId
        ]);
    }

    // =========================
    // LIST CAMPAIGNS
    // =========================
    public function list()
    {
        $campaigns = $this->campaign->getCampaigns(10, 0);
        $baseUrl = "https://trust.ezirimkingdom.com.ng/";

        foreach ($campaigns as &$campaign) {

            $imagesRaw = $this->campaign->getImages($campaign['id']);
            $images = [];

            if (is_array($imagesRaw)) {
                foreach ($imagesRaw as $img) {

                    if (is_array($img) && isset($img['image_path'])) {
                        $images[] = $baseUrl . $img['image_path'];

                    } elseif (is_array($img) && isset($img['image_url'])) {
                        $images[] = $baseUrl . $img['image_url'];

                    } elseif (is_string($img)) {
                        $images[] = $baseUrl . $img;
                    }
                }
            }

            $campaign['images'] = $images;
            $campaign['cover_image'] = $images[0] ?? null;
        }

        jsonResponse(200, "Campaign list", $campaigns);
    }

    // =========================
    // SHOW SINGLE CAMPAIGN
    // =========================
    public function show()
    {
        if (!isset($_GET['id'])) {
            jsonResponse(422, "campaign id is required");
        }

        $id = (int)$_GET['id'];

        $campaign = $this->campaign->getFullDetails($id);

        if (!$campaign) {
            jsonResponse(404, "Campaign not found");
        }

        $baseUrl = "https://trust.ezirimkingdom.com.ng/";
        $imagesRaw = $this->campaign->getImages($id);

        $images = [];

        if (is_array($imagesRaw)) {
            foreach ($imagesRaw as $img) {

                if (is_array($img) && isset($img['image_path'])) {
                    $images[] = $baseUrl . $img['image_path'];

                } elseif (is_array($img) && isset($img['image_url'])) {
                    $images[] = $baseUrl . $img['image_url'];

                } elseif (is_string($img)) {
                    $images[] = $baseUrl . $img;
                }
            }
        }

        $campaign['images'] = $images;
        $campaign['cover_image'] = $images[0] ?? null;

        jsonResponse(200, "Campaign details", $campaign);
    }

    // =========================
    // CAMPAIGN PROGRESS
    // =========================
    public function progress()
    {
        if (!isset($_GET['id'])) {
            jsonResponse(422, "campaign id is required");
        }

        $id = (int)$_GET['id'];

        $campaign = $this->campaign->findById($id);

        if (!$campaign) {
            jsonResponse(404, 'Campaign not found');
        }

        $target = (float)($campaign['target_amount'] ?? 0);
        $raised = (float)($campaign['raised_amount'] ?? 0);

        $remaining = max($target - $raised, 0);

        $percentage = $target > 0
            ? round(($raised / $target) * 100, 2)
            : 0;

        jsonResponse(200, 'Campaign progress', [
            'campaign_id' => (int)$campaign['id'],
            'target_amount' => $target,
            'raised_amount' => $raised,
            'remaining_amount' => $remaining,
            'progress_percentage' => $percentage,
            'is_fully_funded' => $raised >= $target
        ]);
    }
}