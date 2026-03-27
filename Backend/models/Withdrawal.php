<?php

class Withdrawal
{
    private $conn;
    private $table = "withdrawals";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    public function create($data)
    {
        $query = "INSERT INTO {$this->table}
                  (hospital_id, campaign_id, amount, status)
                  VALUES (:hospital_id, :campaign_id, :amount, 'pending')";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':hospital_id' => $data['hospital_id'],
            ':campaign_id' => $data['campaign_id'],
            ':amount' => $data['amount']
        ]);
    }

    public function getPending()
    {
        $query = "SELECT w.*, h.name AS hospital_name, c.title AS campaign_title
                  FROM {$this->table} w
                  INNER JOIN hospitals h ON h.id = w.hospital_id
                  INNER JOIN campaigns c ON c.id = w.campaign_id
                  WHERE w.status = 'pending'
                  ORDER BY w.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status)
    {
        $query = "UPDATE {$this->table}
                  SET status = :status
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':status' => $status,
            ':id' => $id
        ]);
    }
}