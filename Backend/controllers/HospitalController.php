<?php

require_once __DIR__ . '/../models/Hospital.php';
require_once __DIR__ . '/../models/Campaign.php';
require_once __DIR__ . '/../services/InterswitchMarketplaceService.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/response.php';

class HospitalController
{
    private $hospital;
    private $campaign;
    private $marketplace;

    public function __construct($db)
    {
        $this->hospital = new Hospital($db);
        $this->campaign = new Campaign($db);
        $this->marketplace = new InterswitchMarketplaceService($db);
    }

    public function list()
    {
        $data = $this->hospital->getVerified();
        jsonResponse(200, "Hospitals retrieved", $data);
    }

    public function pendingRequests()
    {
        $data = $this->hospital->getPendingRequests();
        jsonResponse(200, "Pending hospital requests", $data);
    }

    public function approve($data)
    {
        requireFields($data, [
            'request_id',
            'hospital_name',
            'hospital_address',
            'bank_account',
            'bank_code'
        ]);

        $created = $this->hospital->approveHospital($data);

        if ($created) {
            $this->hospital->markRequestApproved($data['request_id']);
            jsonResponse(200, "Hospital approved");
        }

        jsonResponse(500, "Approval failed");
    }

    public function requestVerification($data)
    {
        requireFields($data, [
            'hospital_name',
            'hospital_address',
            'license_document',
            'contact_email'
        ]);

        $created = $this->hospital->createVerificationRequest($data);

        if ($created) {
            jsonResponse(201, "Verification request submitted");
        }

        jsonResponse(500, "Request failed");
    }

    public function verifyOwnHospital($authUser, $data)
    {
        if (($authUser['role'] ?? '') !== 'hospital') {
            jsonResponse(403, "Only hospital accounts can verify hospital profiles");
        }

        requireFields($data, [
            'hospital_name',
            'hospital_address',
            'verification_method',
            'verification_value',
            'bank_account',
            'bank_name',
            'bank_code'
        ]);

        $method = strtoupper(trim($data['verification_method']));
        $value = trim($data['verification_value']);

        if (!in_array($method, ['TIN', 'CAC'], true)) {
            jsonResponse(422, "verification_method must be either TIN or CAC");
        }

        if ($method === 'TIN') {
            $verification = $this->marketplace->verifyTin($value);
        } else {
            $verification = $this->marketplace->verifyCac($value);
        }

        if (!$verification['success']) {
            jsonResponse(400, "Hospital verification failed", [
                'status_code' => $verification['status_code'] ?? null,
                'response' => $verification['data'] ?? null,
                'raw' => $verification['raw'] ?? null
            ]);
        }

        $saved = $this->hospital->upsertVerifiedHospital((int)$authUser['user_id'], [
            'name' => trim($data['hospital_name']),
            'address' => trim($data['hospital_address']),
            'bank_account' => trim($data['bank_account']),
            'bank_name' => trim($data['bank_name']),
            'bank_code' => trim($data['bank_code']),
            'verified' => 1,
            'verification_method' => $method,
            'verification_data' => json_encode($verification['data'])
        ]);

        if (!$saved) {
            jsonResponse(500, "Hospital verified but failed to save locally");
        }

        $hospital = $this->hospital->findByUserId((int)$authUser['user_id']);

        jsonResponse(200, "Hospital verified successfully", [
            'hospital' => $hospital,
            'verification_result' => $verification['data']
        ]);
    }

    public function myHospital($authUser)
    {
        if (($authUser['role'] ?? '') !== 'hospital') {
            jsonResponse(403, "Only hospital accounts can access this resource");
        }

        $hospital = $this->hospital->findByUserId((int)$authUser['user_id']);

        if (!$hospital) {
            jsonResponse(200, "Hospital profile not yet created", [
                'verified' => 0,
                'hospital' => null
            ]);
        }

        jsonResponse(200, "Hospital profile retrieved", [
            'verified' => (int)$hospital['verified'],
            'hospital' => $hospital
        ]);
    }

    public function myCampaigns($authUser)
    {
        if (($authUser['role'] ?? '') !== 'hospital') {
            jsonResponse(403, "Only hospital accounts can access this resource");
        }

        $hospital = $this->hospital->findByUserId((int)$authUser['user_id']);

        if (!$hospital || (int)$hospital['verified'] !== 1) {
            jsonResponse(404, "Verified hospital profile not found");
        }

        $campaigns = $this->hospital->getCampaignsByHospitalId((int)$hospital['id']);

        $result = [];

        foreach ($campaigns as $campaign) {
            $target = (float)($campaign['target_amount'] ?? 0);
            $raised = (float)($campaign['raised_amount'] ?? 0);
            $remaining = max($target - $raised, 0);
            $progress = $target > 0 ? round(($raised / $target) * 100, 2) : 0;

            $result[] = [
                'id' => (int)$campaign['id'],
                'title' => $campaign['title'],
                'patient_name' => $campaign['patient_name'],
                'target_amount' => $target,
                'raised_amount' => $raised,
                'remaining_amount' => $remaining,
                'progress_percentage' => $progress,
                'is_fully_funded' => $raised >= $target,
                'status' => $campaign['status'],
                'created_at' => $campaign['created_at']
            ];
        }

        jsonResponse(200, "Hospital campaigns retrieved", [
            'hospital' => [
                'id' => (int)$hospital['id'],
                'name' => $hospital['name'],
                'verified' => (int)$hospital['verified']
            ],
            'campaigns' => $result
        ]);
    }

    public function campaignProgress($authUser)
    {
        if (($authUser['role'] ?? '') !== 'hospital') {
            jsonResponse(403, "Only hospital accounts can access this resource");
        }

        if (!isset($_GET['campaign_id'])) {
            jsonResponse(422, "campaign_id is required");
        }

        $campaignId = (int)$_GET['campaign_id'];
        $hospital = $this->hospital->findByUserId((int)$authUser['user_id']);

        if (!$hospital || (int)$hospital['verified'] !== 1) {
            jsonResponse(404, "Verified hospital profile not found");
        }

        $campaign = $this->campaign->findById($campaignId);

        if (!$campaign || (int)$campaign['hospital_id'] !== (int)$hospital['id']) {
            jsonResponse(404, "Campaign not found for this hospital");
        }

        $target = (float)($campaign['target_amount'] ?? 0);
        $raised = (float)($campaign['raised_amount'] ?? 0);
        $remaining = max($target - $raised, 0);
        $progress = $target > 0 ? round(($raised / $target) * 100, 2) : 0;

        jsonResponse(200, "Campaign progress retrieved", [
            'campaign_id' => (int)$campaign['id'],
            'title' => $campaign['title'],
            'target_amount' => $target,
            'raised_amount' => $raised,
            'remaining_amount' => $remaining,
            'progress_percentage' => $progress,
            'is_fully_funded' => $raised >= $target,
            'status' => $campaign['status']
        ]);
    }
}