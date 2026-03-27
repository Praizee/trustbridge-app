<?php

return [
    'merchant_code' => '',
    'pay_item_id' => '',

    'base_url' => 'https://webpay.interswitchng.com',
    'verify_endpoint' => '/collections/api/v1/gettransaction.json',
    'payment_url' => 'https://newwebpay.interswitchng.com/collections/w/pay',

    'frontend_callback_url' => 'https://trustbridgeapp.netlify.app/payment/callback',
    'redirect_url' => 'https://trust.ezirimkingdom.com.ng/api/donations/redirect.php',
    'currency' => 566
];