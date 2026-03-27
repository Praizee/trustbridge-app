<?php

require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../utils/jwt.php';

class AuthMiddleware
{
    private static function getAuthorizationHeader(): string
    {
        $headers = [];

        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        }

        return $headers['Authorization']
            ?? $headers['authorization']
            ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? '')
            ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    }

    public static function authenticate(): array
    {
        $authHeader = self::getAuthorizationHeader();

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            jsonResponse(401, 'Authorization token is required');
        }

        $token = $matches[1];

        try {
            $decoded = verifyJwt($token);

           
            return [
                'id' => $decoded['user_id'], 
                'user_id' => $decoded['user_id'],
                'email' => $decoded['email'] ?? null,
                'role' => $decoded['role'] ?? null
            ];

        } catch (Exception $e) {
            jsonResponse(401, 'Invalid or expired token', null, [
                'token_error' => $e->getMessage()
            ]);
        }
    }

    public static function authorize(array $allowedRoles): array
    {
        $user = self::authenticate();

        if (!in_array($user['role'] ?? '', $allowedRoles, true)) {
            jsonResponse(403, 'You are not allowed to access this resource');
        }

        return $user;
    }
}