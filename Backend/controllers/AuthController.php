<?php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/jwt.php';


class AuthController {

    private $user;

    public function __construct($db)
    {
        $this->user = new User($db);
    }

    public function register($data)
    {
        requireFields($data, ['name','email','password','role']);

        $name = $data['name'];
        $email = $data['email'];
        $password = $data['password'];
        $role = $data['role'];

        $existing = $this->user->findByEmail($email);

        if ($existing) {
            jsonResponse(400,"Email already exists");
        }

        $created = $this->user->create($name,$email,$password,$role);

        if($created){
            jsonResponse(201,"User registered successfully");
        }

        jsonResponse(500,"Registration failed");
    }
    
   public function login($data)
{
    requireFields($data,['email','password']);

    $email = $data['email'];
    $password = $data['password'];

    $user = $this->user->findByEmail($email);

    if(!$user){
        jsonResponse(401,"Invalid credentials");
    }

    if(!password_verify($password,$user['password'])){
        jsonResponse(401,"Invalid credentials");
    }

    $token = createJwt([
        "user_id"=>$user['id'],
        "email"=>$user['email'],
        "role"=>$user['role']
    ]);

    jsonResponse(200,"Login successful",[
        "token"=>$token,
        "user"=>$user
    ]);
}

    
}
