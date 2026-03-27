<?php

class Donation
{
    private PDO $conn;
    private string $table = 'donations';

    public function __construct(PDO $db)
    {
        $this->conn = $db;
    }

    public function create(array $data): bool
    {
        $query = "INSERT INTO {$this->table}
            (campaign_id, donor_name, donor_email, amount, payment_reference, payment_gateway, status, payment_link)
            VALUES
            (:campaign_id, :donor_name, :donor_email, :amount, :payment_reference, :payment_gateway, :status, :payment_link)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':campaign_id' => $data['campaign_id'],
            ':donor_name' => $data['donor_name'] ?? null,
            ':donor_email' => $data['donor_email'] ?? null,
            ':amount' => $data['amount'],
            ':payment_reference' => $data['payment_reference'],
            ':payment_gateway' => $data['payment_gateway'] ?? 'interswitch',
            ':status' => $data['status'] ?? 'pending',
            ':payment_link' => $data['payment_link'] ?? null,
        ]);
    }

    public function findByReference(string $reference): ?array
    {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE payment_reference = ? LIMIT 1");
        $stmt->execute([$reference]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function markSuccessful(int $id): bool
    {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET status = 'successful' WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function markFailed(int $id): bool
    {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET status = 'failed' WHERE id = ?");
        return $stmt->execute([$id]);
    }
}