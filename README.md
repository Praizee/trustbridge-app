# 🏥 TrustBridge: Escrow-Backed Medical Crowdfunding

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-10B981?style=for-the-badge)](https://trustbridgeapp.netlify.app/)

**Zero Fraud. Absolute Trust. Direct to Care.**

TrustBridge is a secure, B2B2C medical crowdfunding platform designed to completely eliminate donation fraud. By leveraging the **Interswitch API**, TrustBridge acts as a digital escrow service. Funds are never released to individuals; they are disbursed strictly and directly into the corporate bank accounts of pre-verified partner hospitals.

---

## 👥 Team Contributions (The Squad)

| Team Member               | Role               | Key Contributions |
| :------------------------ | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Stephen Adeniji**       | Frontend Lead      | Architected Vite/React app, integrated Zustand state, routing, layouts, auth, and built dashboards (creator, hospital, and super admin). |
| **Israel Oluniyi**        | Frontend Developer | Developed UI components, landing page, explore campaigns, ensured responsiveness, and wired up payment flows. |
| **Kingdom Ezirim**        | Backend Lead       | Built REST APIs with PHP, JWT auth, hospital verification system, and integrated Interswitch payment & payout systems. |
| **Muoneke Julia-Frances** | Product Manager    | Defined strategy, user flows, managed sprint, and prepared documentation. |

---

## 🚨 The Problem

Medical crowdfunding suffers from a massive trust deficit. Donors hesitate due to fake campaigns and misuse of funds. When trust is lost, real patients suffer.

---

## 💡 The Solution (Maker-Checker Flow)

1. **Verified Network:** Campaigns must be linked to verified hospitals  
2. **Secure Inflow:** Donations via **Interswitch Web Checkout**  
3. **Verification Gate:** Hospitals submit documents before withdrawal  
4. **Direct Settlement:** Funds are sent directly to hospital accounts  

---

## 💳 Interswitch Integration

TrustBridge transforms Interswitch into a **Trust Engine**:

- **Collection:** Inline Checkout (WebPay)
- **Verification:** Server-to-server transaction validation
- **Disbursement:** Payout API to hospital accounts

---

## 🖥️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Zustand
- Framer Motion

### Backend
- PHP (Structured REST API)
- MySQL
- JWT Authentication
- PHPMailer

### Payments
- Interswitch API

---

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

- TIN & CAC validation via external APIs
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

### 🔹 Campaigns
- GET /campaigns/list.php
- GET /campaigns/show.php?id=ID
- POST /campaigns/create.php

### 🔹 Donations
- POST /donations/initiate.php
- GET /donations/verify.php

### 🔹 Hospitals
- POST /hospitals/request.php
- GET /hospitals/index.php
- GET /hospitals/stats.php

### 🔹 Admin
- GET /admin/stats.php
- POST /admin/hospitals/approve.php

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

To ensure security, sensitive files (e.g., database configuration, API keys, and payment credentials) are not included in this repository.

The following files have been excluded:

- config/app.php
- config/database.php
- config/payment.php

Please use the provided .example files and replace them with your own environment-specific values.

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

---

## 🏁 Conclusion

TrustBridge ensures every donation is traceable, verified, and impactful.

---

_Built with ❤️ for the Enyata <> Interswitch Hackathon._
