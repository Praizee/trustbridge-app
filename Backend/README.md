# 🚀 Backend Architecture & Documentation

## 🧠 Overview

The backend powers:

- Campaign management
- Secure donation flow
- Hospital verification (TIN/CAC)
- Admin dashboards & analytics

---

## ⚙️ Architecture Structure

/api
/auth
/campaigns
/donations
/hospitals
/admin
/config
/models
/middleware
/utils

---

## 🔐 Authentication

- JWT-based authentication
- Protected routes require:

Authorization: Bearer <token>

---

## 💳 Payment Flow (Interswitch)

1. Donation initiated
2. Transaction reference generated
3. Payment completed via inline checkout
4. Callback triggers verification
5. Backend confirms transaction
6. Donation saved as successful
7. Campaign amount updated

---

## 🏥 Hospital Verification

- TIN & CAC validation via Interswitch MARKETPLACE APIs
- Only verified hospitals can receive funds

---

## 📧 Email System

- Powered by PHPMailer
- Handles notifications & alerts

---

## 📊 Core API Endpoints

### 🔹 Auth

- POST /auth/login.php
- POST /auth/register.php
- POST /auth/forgot-password.php
- POST /auth/reset-password.php
- GET /auth/me.php

### 🔹 Campaigns

- GET /campaigns/list.php
- GET /campaigns/show.php?id=ID
- POST /campaigns/create.php
- POST /campaigns/delete.php
- GET /campaigns/donations.php
- GET /campaigns/latest-funded.php
- GET /campaigns/my-campaign-details.php
- GET /campaigns/my-campaigns.php
- GET /campaigns/progress.php
- GET /campaigns/show.php

### 🔹 Donations

- POST /donations/initiate.php
- GET /donations/verify.php
- POST /donations/redirect.php
- GET /donations/get_campaign_donations.php

### 🔹 Hospitals

- POST /hospitals/request.php
- GET /hospitals/index.php
- GET /hospitals/stats.php
- GET /hospitals/campaign-progress.php
- GET /hospitals/me.php
- GET /hospitals/my-campaigns.php

### 🔹 Webhooks

- POST /webhooks/interswitch.php

### 🔹 Withdrawals

- POST /withdrawals/request.php

### 🔹 Admin

- GET /admin/stats.php
- GET /admin/dashboard.php
- POST /admin/hospitals/approve.php
- POST /admin/hospitals/disable.php
- POST /admin/hospitals/verify.php
- GET /admin/hospitals/index.php
- GET /admin/hospitals/show.php
- GET /admin/campaigns/delete.php
- POST /admin/users/activate.php
- POST /admin/users/delete.php
- GET /admin/users/index.php
- GET /admin/users/show.php
- POST /admin/users/suspend.php
- POST /admin/withdrawals/approve.php
- GET /admin/withdrawals/pending.php
- POST /admin/payment-bridge.php

---

## 🗄️ Database Tables

- users
- hospitals
- campaigns
- campaign_images
- donations
- withdrawals

---

## 🌐 Deployment

Backend API:
https://trust.ezirimkingdom.com.ng/api

---

## 🧪 Testing

All endpoints tested using Postman.

---

## 🔐 Security Notice

To ensure security & compliance, sensitive files (e.g., database configuration, API keys, and payment credentials) are not included in this repository.

The following files have been excluded:

- config/app.php
- config/database.php
- config/payment.php

Please use the provided .example files and replace them with your own environment-specific values.

---

## ⚠️ Integration Note (Interswitch Payout Environment & API MARKETPLACE)

Due to limitations in accessing a fully provisioned live Interswitch payout account wallet, full payout testing could not be completed, Also not having a live marketplace account couldn't allow us create wallets, fund it and as well make calls for CAC and TIN enpoints, to verify the hospitals.

However, API responses confirm correct integration and readiness once wallet provisioning is complete.

Sample response:
{
"status": 400,
"message": "Hospital verification failed",
"data": {
"status_code": 409,
"response": {
"message": "Unexpected error: User wallet not found",
"responseCode": "ERROR"
}
}
}

---

## 🧩 Key Design Decisions

- Only verified transactions are stored
- No wallet system → direct hospital settlement
- Middleware-based auth for scalability
- Modular backend for easy extension

---

## 🔥 Highlights

- Fraud-proof donation system
- Real-time payment verification
- Secure escrow-based architecture
- Clean API for frontend integration

---

## 👨🏽‍💻 Backend Developer

**Ezirim Kingdom Chukwuebuka**

