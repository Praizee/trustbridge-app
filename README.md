# 🏥 TrustBridge: Escrow-Backed Medical Crowdfunding

[![Live Demo](https://img.shields.io/badge/Live_Demo-Click_Here-10B981?style=for-the-badge)](https://trustbridgeapp.netlify.app/)

**Zero Fraud. Absolute Trust. Direct to Care.**

TrustBridge is a secure, B2B2C medical crowdfunding platform designed to completely eliminate donation fraud. By leveraging the **Interswitch API**, TrustBridge acts as a digital escrow service. Funds are never released to individuals; they are disbursed strictly and directly into the corporate bank accounts of pre-verified partner hospitals.

## Team Contributions (The Squad)

| Team Member               | Role               | Key Contributions                                                                                                                                                         |
| :------------------------ | :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Stephen Adeniji**       | Frontend Lead      | Architected Vite/React app, integrated Zustand state, routing, layouts, auth, and built 'dashboards' (creator, hospital, and super admin).                                |
| **Israel Oluniyi**        | Frontend Developer | Developed UI components (GoFundMe-inspired layout), landing page, explore campaigns + campaign details, ensured mobile responsiveness, and wired up inline payment flows. |
| **Kingdom Ezirim**        | Backend Lead       | Built REST APIs with PHP, seeded verified hospital DB, handled JWT auth, and integrated the Interswitch Payouts API.                                                      |
| **Muoneke Julia-Frances** | Product Manager    | Defined B2B2C Go-To-Market strategy, designed user flows, managed the agile sprint, and prepared the final pitch/documentation.                                           |

## The Problem

Medical crowdfunding suffers from a massive trust deficit. Donors hesitate to contribute due to fake patient stories and organizers who misapply funds. When trust disappears, genuine patients lose access to life-saving support.

## The Solution (The Maker-Checker Flow)

1. **Verified Network:** Campaigns must be linked to a pre-vetted, verified hospital.
2. **Secure Inflow:** Donors fund campaigns seamlessly using **Interswitch Web Checkout**.
3. **The Gate:** Hospitals must upload required documentation, to request funds.
4. **Direct Settlement:** Upon approval, the **Interswitch Payouts API** automatically settles the funds directly into the hospital's corporate account.

## The Interswitch Integration

This platform transforms Interswitch from a payment gateway into a programmable **Trust Engine**:

- **Collection:** `Inline Checkout (WebPay)` is used to securely collect donor funds without them leaving the campaign page.
- **Verification:** Server-to-server transaction status queries ensure escrowed amounts are 100% accurate.
- **Disbursement:** The `/api/v1/payouts` endpoint is triggered dynamically by our Super Admin to route funds to the pre-seeded hospital bank accounts.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v3, Zustand, Framer Motion.
- **Backend:** PHP, REST API.
- **Payment Infrastructure:** Interswitch API.

## Future Roadmap (V2 Architecture)

While this MVP proves the core Escrow-to-Hospital concept, our roadmap for scaling TrustBridge includes:

- **SEO & Discoverability Optimization:** Transitioning from database IDs (`/campaign/camp_123`) to SEO-friendly dynamic slugs (`/campaign/amina-heart-surgery`) to improve organic sharing and Twitter/WhatsApp unfurling.
- **Enterprise Architecture:** Allowing major partner hospitals to host their own localized subdomains (e.g., `luth.trustbridge.com`) and integrating Institutional SSO.
- **Advanced Fintech Integration:** Implementing Interswitch card tokenization for recurring "General Indigent Fund" subscriptions, and automated OCR invoice verification.

---

_Built with ❤️ for the Enyata <> Interswitch Hackathon._

