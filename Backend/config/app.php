<?php

return [
    'app_name' => 'TrustBridge API',
    'app_env' => 'production',

    
    'jwt_secret' => '',
    'jwt_issuer' => 'https://trust.ezirimkingdom.com.ng',
    'jwt_audience' => 'https://trust.ezirimkingdom.com.ng',
    'jwt_exp_minutes' => 120,

  
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://trust.ezirimkingdom.com.ng',
        // i should enable this also
        // 'https://app.trust.ezirimkingdom.com.ng',
    ],
];