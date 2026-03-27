<?php

class Hospital
{
    private $conn;
    private $table = "hospitals";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /*
    |--------------------------------------------------------------------------
    | BASIC FETCHING
    |--------------------------------------------------------------------------
    */

    public function getAll($verified = null)
    {
        $query = "SELECT id, user_id, name, address, bank_account, bank_name, bank_code, verified, status, created_at
                  FROM {$this->table}
                  WHERE 1=1";

        if ($verified !== null) {
            $query .= " AND verified = :verified";
        }

        $query .= " ORDER BY id DESC";

        $stmt = $this->conn->prepare($query);

        if ($verified !== null) {
            $stmt->bindValue(':verified', $verified, PDO::PARAM_INT);
        }

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVerified()
    {
        $query = "SELECT id, name, address, bank_account, bank_name, bank_code
                  FROM {$this->table}
                  WHERE verified = 1
                  ORDER BY id DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById($id)
    {
        $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findByUserId($userId)
    {
        $query = "SELECT * FROM {$this->table} WHERE user_id = :user_id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':user_id' => $userId]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | VERIFICATION REQUEST FLOW
    |--------------------------------------------------------------------------
    */

    public function createVerificationRequest($data)
    {
        $query = "INSERT INTO hospital_verification_requests
        (hospital_name, hospital_address, license_document, contact_email)
        VALUES (:name, :address, :license, :email)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':name' => $data['hospital_name'],
            ':address' => $data['hospital_address'],
            ':license' => $data['license_document'],
            ':email' => $data['contact_email']
        ]);
    }

    public function getPendingRequests()
    {
        $query = "SELECT * FROM hospital_verification_requests 
                  WHERE status = 'pending' 
                  ORDER BY id DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markRequestApproved($id)
    {
        $query = "UPDATE hospital_verification_requests
                  SET status = 'approved'
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':id' => $id]);
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE HOSPITAL PROFILE
    |--------------------------------------------------------------------------
    */

    public function createHospitalAccountProfile($data)
    {
        $query = "INSERT INTO {$this->table}
        (user_id, name, address, bank_account, bank_name, bank_code, verified, verification_method, verification_data, status)
        VALUES (:user_id, :name, :address, :bank_account, :bank_name, :bank_code, :verified, :verification_method, :verification_data, 'active')";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':user_id' => $data['user_id'],
            ':name' => $data['name'],
            ':address' => $data['address'],
            ':bank_account' => $data['bank_account'],
            ':bank_name' => $data['bank_name'],
            ':bank_code' => $data['bank_code'],
            ':verified' => $data['verified'],
            ':verification_method' => $data['verification_method'],
            ':verification_data' => $data['verification_data']
        ]);
    }

    public function updateHospitalVerification($userId, $data)
    {
        $query = "UPDATE {$this->table}
                  SET name = :name,
                      address = :address,
                      bank_account = :bank_account,
                      bank_name = :bank_name,
                      bank_code = :bank_code,
                      verified = :verified,
                      verification_method = :verification_method,
                      verification_data = :verification_data
                  WHERE user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':name' => $data['name'],
            ':address' => $data['address'],
            ':bank_account' => $data['bank_account'],
            ':bank_name' => $data['bank_name'],
            ':bank_code' => $data['bank_code'],
            ':verified' => $data['verified'],
            ':verification_method' => $data['verification_method'],
            ':verification_data' => $data['verification_data'],
            ':user_id' => $userId
        ]);
    }

    public function upsertVerifiedHospital($userId, $data)
    {
        $existing = $this->findByUserId($userId);

        if ($existing) {
            return $this->updateHospitalVerification($userId, $data);
        }

        return $this->createHospitalAccountProfile([
            'user_id' => $userId,
            'name' => $data['name'],
            'address' => $data['address'],
            'bank_account' => $data['bank_account'],
            'bank_name' => $data['bank_name'],
            'bank_code' => $data['bank_code'],
            'verified' => $data['verified'],
            'verification_method' => $data['verification_method'],
            'verification_data' => $data['verification_data']
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | ADMIN ACTIONS
    |--------------------------------------------------------------------------
    */

    public function updateVerification($id, $verified)
    {
        $query = "UPDATE {$this->table} 
                  SET verified = :verified 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':verified', $verified, PDO::PARAM_INT);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }

    public function updateStatus($id, $status)
    {
        $query = "UPDATE {$this->table} 
                  SET status = :status 
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $id);

        return $stmt->execute();
    }

    /*
    |--------------------------------------------------------------------------
    | RELATIONS (IMPORTANT)
    |--------------------------------------------------------------------------
    */

    public function getCampaignsByHospitalId($hospitalId)
    {
        $query = "SELECT *
                  FROM campaigns
                  WHERE hospital_id = :hospital_id
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':hospital_id' => $hospitalId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}