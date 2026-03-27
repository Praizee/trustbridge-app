<?php

class User
{
    private $conn;
    private $table = "users";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE USER
    |--------------------------------------------------------------------------
    */
    public function create($name, $email, $password, $role = 'user')
    {
        $query = "INSERT INTO {$this->table}
                  (name, email, password, role, status, created_at)
                  VALUES (:name, :email, :password, :role, 'active', NOW())";

        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":email", $email);
        $stmt->bindParam(":password", $hashedPassword);
        $stmt->bindParam(":role", $role);

        return $stmt->execute();
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BY EMAIL (LOGIN)
    |--------------------------------------------------------------------------
    */
    public function findByEmail($email)
    {
        $query = "SELECT * FROM {$this->table} WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | FIND BY ID
    |--------------------------------------------------------------------------
    */
    public function findById($id)
    {
        $query = "SELECT id, name, email, role, status, created_at
                  FROM {$this->table}
                  WHERE id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | GET ALL USERS (ADMIN)
    |--------------------------------------------------------------------------
    */
    public function getAll($limit = 10, $offset = 0, $search = null)
    {
        if ($search) {
            $query = "SELECT id, name, email, role, status, created_at
                      FROM {$this->table}
                      WHERE name LIKE :search OR email LIKE :search
                      ORDER BY id DESC
                      LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':search', "%$search%");
        } else {
            $query = "SELECT id, name, email, role, status, created_at
                      FROM {$this->table}
                      ORDER BY id DESC
                      LIMIT :limit OFFSET :offset";

            $stmt = $this->conn->prepare($query);
        }

        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE USER STATUS (ACTIVE / SUSPENDED)
    |--------------------------------------------------------------------------
    */
    public function updateStatus($userId, $status)
    {
        $query = "UPDATE {$this->table} SET status = :status WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $userId);

        return $stmt->execute();
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE USER
    |--------------------------------------------------------------------------
    */
    public function delete($userId)
    {
        $query = "DELETE FROM {$this->table} WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $userId);

        return $stmt->execute();
    }

    /*
    |--------------------------------------------------------------------------
    | COUNT USERS (FOR DASHBOARD)
    |--------------------------------------------------------------------------
    */
    public function countAll()
    {
        $query = "SELECT COUNT(*) as total FROM {$this->table}";
        $stmt = $this->conn->query($query);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$row['total'];
    }

    /*
    |--------------------------------------------------------------------------
    | COUNT BY ROLE (OPTIONAL ANALYTICS)
    |--------------------------------------------------------------------------
    */
    public function countByRole($role)
    {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE role = :role";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':role', $role);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)$row['total'];
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK IF EMAIL EXISTS (REGISTER VALIDATION)
    |--------------------------------------------------------------------------
    */
    public function emailExists($email)
    {
        $query = "SELECT id FROM {$this->table} WHERE email = :email LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC) ? true : false;
    }
}