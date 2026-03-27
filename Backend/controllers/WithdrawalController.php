<?php

require_once __DIR__ . '/../models/Withdrawal.php';
require_once __DIR__ . '/../models/Hospital.php';
require_once __DIR__ . '/../models/Campaign.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/response.php';

class WithdrawalController
{
    private $withdrawal;
    private $hospital;
    private $campaign;

    public function __construct($db)
    {
        $this->withdrawal = new Withdrawal($db);
        $this->hospital = new Hospital($db);
        $this->campaign = new Campaign($db);
    }

    public function request($authUser, $data)
    {
        if (($authUser['role'] ?? '') !== 'hospital') {
            jsonResponse(403, "Only hospital accounts can request withdrawal");
        }

        requireFields($data, ['campaign_id', 'amount']);

        $hospital = $this->hospital->findByUserId((int)$authUser['user_id']);

        if (!$hospital || (int)$hospital['verified'] !== 1) {
            jsonResponse(404, "Verified hospital profile not found");
        }

        $campaign = $this->campaign->findById((int)$data['campaign_id']);

        if (!$campaign || (int)$campaign['hospital_id'] !== (int)$hospital['id']) {
            jsonResponse(404, "Campaign not found for this hospital");
        }

        $target = (float)$campaign['target_amount'];
        $raised = (float)$campaign['raised_amount'];
        $amount = (float)$data['amount'];

        if ($amount <= 0) {
            jsonResponse(422, "amount must be greater than 0");
        }

        if ($raised < $target) {
            jsonResponse(400, "Campaign is not fully funded yet");
        }

        if ($amount > $raised) {
            jsonResponse(422, "Requested amount exceeds available campaign funds");
        }

        $created = $this->withdrawal->create([
            'hospital_id' => $hospital['id'],
            'campaign_id' => $campaign['id'],
            'amount' => $amount
        ]);

        if (!$created) {
            jsonResponse(500, "Withdrawal request failed");
        }

        jsonResponse(201, "Withdrawal request submitted");
    }

    public function pending($authUser)
    {
        if (!in_array(($authUser['role'] ?? ''), ['admin', 'super-admin', 'super_admin'], true)) {
            jsonResponse(403, "Only admins can view pending withdrawals");
        }

        $data = $this->withdrawal->getPending();
        jsonResponse(200, "Pending withdrawals retrieved", $data);
    }

    public function approve($authUser, $data)
    {
        if (!in_array(($authUser['role'] ?? ''), ['admin', 'super-admin', 'super_admin'], true)) {
            jsonResponse(403, "Only admins can approve withdrawals");
        }

        requireFields($data, ['withdrawal_id']);

        $updated = $this->withdrawal->updateStatus((int)$data['withdrawal_id'], 'approved');

        if (!$updated) {
            jsonResponse(500, "Withdrawal approval failed");
        }

        jsonResponse(200, "Withdrawal approved");
    }
}