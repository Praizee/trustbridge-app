<?php

require_once __DIR__ . '/../models/Donation.php';
require_once __DIR__ . '/../models/Campaign.php';
require_once __DIR__ . '/../utils/interswitch.php';
require_once __DIR__ . '/../utils/response.php';

class DonationController
{
    private $db;
    private $donationModel;
    private $campaignModel;

    public function __construct($db)
    {
        $this->db = $db;
        $this->donationModel = new Donation($db);
        $this->campaignModel = new Campaign($db);
    }

    public function initialize()
    {
        $data = json_decode(file_get_contents("php://input"), true);

        if (!isset($data['campaign_id'], $data['amount'])) {
            jsonResponse(422, "campaign_id and amount required");
        }

        $campaignId = (int)$data['campaign_id'];
        $amount = (float)$data['amount'];

        if ($campaignId <= 0) {
            jsonResponse(422, "campaign_id must be valid");
        }

        if ($amount <= 0) {
            jsonResponse(422, "amount must be greater than 0");
        }

        $campaign = $this->campaignModel->findById($campaignId);

        if (!$campaign) {
            jsonResponse(404, "Campaign not found");
        }

        if ($campaign['status'] !== 'active') {
            jsonResponse(400, "Campaign not active");
        }

        $remaining = (float)$campaign['target_amount'] - (float)$campaign['raised_amount'];

        if ($remaining <= 0) {
            jsonResponse(422, "Campaign already fully funded");
        }

        if ($amount > $remaining) {
            jsonResponse(422, "Donation exceeds remaining amount");
        }

        $reference = generatePaymentReference();
        $payment = getPaymentConfig();

        $this->donationModel->create([
            'campaign_id' => $campaignId,
            'donor_name' => $data['donor_name'] ?? 'Anonymous',
            'donor_email' => $data['donor_email'] ?? null,
            'amount' => $amount,
            'payment_reference' => $reference,
            'payment_link' => $payment['checkout_url']
        ]);

        jsonResponse(200, "Payment initialized", [
            'reference' => $reference,
            'gateway' => 'interswitch',
            'checkout_method' => 'web_redirect',
            'checkout_url' => $payment['checkout_url'],
            'checkout_fields' => [
                'merchant_code' => $payment['merchant_code'],
                'pay_item_id' => $payment['pay_item_id'],
                'site_redirect_url' => $payment['site_redirect_url'],
                'txn_ref' => $reference,
                'amount' => convertToMinor($amount),
                'currency' => $payment['currency'],
                'cust_name' => $data['donor_name'] ?? 'Anonymous',
                'cust_email' => $data['donor_email'] ?? '',
                'pay_item_name' => 'TrustBridge Donation'
            ],
            'campaign' => [
                'id' => (int)$campaign['id'],
                'title' => $campaign['title'],
                'target_amount' => (float)$campaign['target_amount'],
                'raised_amount' => (float)$campaign['raised_amount'],
                'remaining_amount' => $remaining
            ]
        ]);
    }

    public function verify()
    {
        $reference = $_GET['reference'] ?? null;

        if (!$reference) {
            $data = json_decode(file_get_contents("php://input"), true);
            $reference = $data['reference'] ?? null;
        }

        if (!$reference) {
            jsonResponse(422, "reference required");
        }

        $donation = $this->donationModel->findByReference($reference);

        if (!$donation) {
            jsonResponse(404, "Donation not found");
        }

        if ($donation['status'] === 'successful') {
            $campaign = $this->campaignModel->findById($donation['campaign_id']);
            $target = (float)$campaign['target_amount'];
            $raised = (float)$campaign['raised_amount'];
            $progress = $target > 0 ? round(($raised / $target) * 100, 2) : 0;

            jsonResponse(200, "Donation already verified", [
                'reference' => $reference,
                'campaign_id' => (int)$campaign['id'],
                'raised_amount' => $raised,
                'target_amount' => $target,
                'progress_percentage' => $progress,
                'status' => $campaign['status']
            ]);
        }

        try {
            $requery = requeryTransaction(
                $reference,
                convertToMinor((float)$donation['amount'])
            );
        } catch (Exception $e) {
            jsonResponse(500, "Verification failed", null, [
                'error' => $e->getMessage()
            ]);
        }

        $responseCode = $requery['ResponseCode'] ?? null;
        $responseAmount = isset($requery['Amount']) ? (int)$requery['Amount'] : null;
        $expectedMinor = convertToMinor((float)$donation['amount']);

        if ($responseCode !== '00') {
            $this->donationModel->markFailed($reference);

            jsonResponse(400, "Payment not successful", [
                'reference' => $reference,
                'response_code' => $responseCode,
                'gateway_response' => $requery
            ]);
        }

        if ($responseAmount !== $expectedMinor) {
            jsonResponse(400, "Paid amount does not match donation amount", [
                'reference' => $reference,
                'expected_amount_minor' => $expectedMinor,
                'received_amount_minor' => $responseAmount
            ]);
        }

        $this->db->beginTransaction();

        try {
            $this->donationModel->markSuccessful($reference);
            $this->campaignModel->incrementRaisedAmount($donation['campaign_id'], $donation['amount']);

            $campaign = $this->campaignModel->findById($donation['campaign_id']);

            $target = (float)$campaign['target_amount'];
            $raised = (float)$campaign['raised_amount'];
            $progress = $target > 0 ? round(($raised / $target) * 100, 2) : 0;

            if ($raised >= $target) {
                $this->campaignModel->updateStatus($campaign['id'], 'funded');
                $campaign['status'] = 'funded';
            }

            $this->db->commit();

            jsonResponse(200, "Donation verified", [
                'reference' => $reference,
                'campaign_id' => (int)$campaign['id'],
                'raised_amount' => $raised,
                'target_amount' => $target,
                'progress_percentage' => $progress,
                'status' => $campaign['status'],
                'gateway_response' => [
                    'response_code' => $responseCode,
                    'response_description' => $requery['ResponseDescription'] ?? null,
                    'payment_reference' => $requery['PaymentReference'] ?? null,
                    'retrieval_reference_number' => $requery['RetrievalReferenceNumber'] ?? null
                ]
            ]);
        } catch (Exception $e) {
            $this->db->rollBack();

            jsonResponse(500, "Failed to update donation records", null, [
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getCampaignDonations()
    {
        if (!isset($_GET['campaign_id'])) {
            jsonResponse(422, "campaign_id is required");
        }

        $campaignId = (int)$_GET['campaign_id'];

        $campaign = $this->campaignModel->findById($campaignId);

        if (!$campaign) {
            jsonResponse(404, "Campaign not found");
        }

        $donations = $this->donationModel->getByCampaign($campaignId);
        $totals = $this->donationModel->getTotalByCampaign($campaignId);

        jsonResponse(200, "Campaign donations", [
            "campaign_id" => $campaignId,
            "total_donations" => (int)($totals['total_donations'] ?? 0),
            "total_amount" => (float)($totals['total_amount'] ?? 0),
            "donations" => $donations
        ]);
    }
}