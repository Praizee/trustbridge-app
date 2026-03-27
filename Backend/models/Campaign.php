<?php

class Campaign
{
    private $conn;
    private $table = "campaigns";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // CREATE CAMPAIGN
    public function create($data)
    {
        $query = "INSERT INTO {$this->table}
        (created_by, hospital_id, patient_name, beneficiary_name, title, story, diagnosis_summary,
         category, target_amount, raised_amount, status, thumbnail_image, video_path,
         contact_phone, medical_document_path)
        VALUES
        (:created_by, :hospital_id, :patient_name, :beneficiary_name, :title, :story, :diagnosis_summary,
         :category, :target_amount, 0, :status, :thumbnail_image, :video_path,
         :contact_phone, :medical_document_path)";

        $stmt = $this->conn->prepare($query);

        $stmt->execute([
            ':created_by' => $data['created_by'],
            ':hospital_id' => $data['hospital_id'],
            ':patient_name' => $data['patient_name'],
            ':beneficiary_name' => $data['beneficiary_name'],
            ':title' => $data['title'],
            ':story' => $data['story'],
            ':diagnosis_summary' => $data['diagnosis_summary'],
            ':category' => $data['category'],
            ':target_amount' => $data['target_amount'],
            ':status' => $data['status'],
            ':thumbnail_image' => $data['thumbnail_image'],
            ':video_path' => $data['video_path'],
            ':contact_phone' => $data['contact_phone'],
            ':medical_document_path' => $data['medical_document_path']
        ]);

        return $this->conn->lastInsertId(); // 🔥 IMPORTANT FIX
    }

    // FIND CAMPAIGN BY ID
 public function findById($id)
{
    $query = "SELECT * FROM {$this->table} WHERE id = :id LIMIT 1";
    $stmt = $this->conn->prepare($query);
    $stmt->execute([':id' => $id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

    // GET FULL DETAILS (WITH HOSPITAL)
    public function getFullDetails($id)
    {
        $query = "SELECT c.*, h.name AS hospital_name, h.address
                  FROM campaigns c
                  LEFT JOIN hospitals h ON c.hospital_id = h.id
                  WHERE c.id = :id
                  LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // SAVE IMAGE
    public function saveImage($campaignId, $path)
    {
        $query = "INSERT INTO campaign_images (campaign_id, image_path)
                  VALUES (:campaign_id, :image_path)";

        $stmt = $this->conn->prepare($query);

        return $stmt->execute([
            ':campaign_id' => $campaignId,
            ':image_path' => $path
        ]);
    }

    // GET IMAGES ✅ FIXED HERE
    public function getImages($campaignId)
    {
        $query = "SELECT image_path 
                  FROM campaign_images 
                  WHERE campaign_id = :campaign_id";

        $stmt = $this->conn->prepare($query); // ✅ FIXED
        $stmt->execute([':campaign_id' => $campaignId]);

        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'image_path');
    }

    // INCREMENT RAISED AMOUNT
  public function incrementRaisedAmount($campaignId, $amount)
{
    $query = "UPDATE {$this->table}
              SET raised_amount = raised_amount + :amount
              WHERE id = :id";

    $stmt = $this->conn->prepare($query);

    return $stmt->execute([
        ':amount' => $amount,
        ':id' => $campaignId
    ]);
}


    // GET CAMPAIGNS (LISTING)
    public function getCampaigns($limit = 10, $offset = 0)
    {
        $query = "SELECT c.*, h.name AS hospital_name
                  FROM campaigns c
                  LEFT JOIN hospitals h ON c.hospital_id = h.id
                  WHERE c.status = 'active'
                  ORDER BY c.created_at DESC
                  LIMIT :limit OFFSET :offset";

        $stmt = $this->conn->prepare($query);

        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // UPDATE STATUS
public function updateStatus($campaignId, $status)
{
    $query = "UPDATE {$this->table}
              SET status = :status
              WHERE id = :id";

    $stmt = $this->conn->prepare($query);

    return $stmt->execute([
        ':status' => $status,
        ':id' => $campaignId
    ]);
}


    // GET ALL
    public function getAll()
    {
        $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // GET ACTIVE ONLY
    public function getActive()
    {
        $query = "SELECT * FROM {$this->table}
                  WHERE status = 'active'
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}