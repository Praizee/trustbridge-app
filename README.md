# 🏥 TrustBridge: Escrow-Backed Medical Crowdfunding

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-10B981?style=for-the-badge)](https://trustbridgeapp.netlify.app/)

**Zero Fraud. Absolute Trust. Direct to Care.**

TrustBridge is a secure, B2B2C medical crowdfunding platform designed to completely eliminate donation fraud. By leveraging the **Interswitch API**, TrustBridge acts as a digital escrow service. Funds are never released to individuals; they are disbursed strictly and directly into the corporate bank accounts of pre-verified partner hospitals.

---

## 👥 Team Contributions (The Squad)

| Team Member               | Role               | Key Contributions                                                                                                                        |
| :------------------------ | :----------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Stephen Adeniji**       | Frontend Lead      | Architected Vite/React app, integrated Zustand state, routing, layouts, auth, and built dashboards (creator, hospital, and super admin). |
| **Israel Oluniyi**        | Frontend Developer | Developed UI components, landing page, explore campaigns, ensured responsiveness, and wired up payment flows.                            |
| **Kingdom Ezirim**        | Backend Lead       | Built REST APIs with PHP, JWT auth, hospital verification system, and integrated Interswitch payment & payout systems.                   |
| **Julia-Frances Muoneke** | Product Manager    | Defined strategy, user flows, managed sprint, and prepared documentation.                                                                |

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

## � Documentation

For detailed information on the frontend and backend, please refer to their respective README files:

- [Frontend README](./frontend/README.md)
- [Backend README](./Backend/README.md)

---

## �🔑 Test Credentials

Campaign Creator  
Email: ezirimchukwuebuka24@gmail.com  
Password: @Kingdom123

Hospital Admin  
Email: upthph@gmail.com  
Password: #Hospital123

Admin  
Email: king@gmail.com  
Password: 12345678

---

## 🏁 Conclusion

TrustBridge ensures every donation is traceable, verified, and impactful.

---

_Built with ❤️ for the Enyata <> Interswitch Hackathon._

