# 🏥 TrustBridge - Frontend Application

This is the frontend repository for **TrustBridge**, built with React and Vite. It serves as the user interface for our escrow-backed medical crowdfunding platform, featuring direct integration with the Interswitch Web Checkout.


## Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS v3
- **State Management:** Zustand
- **Routing:** React Router DOM
- **Animations:** Framer Motion
- **Payment Integration:** Interswitch Web Checkout (Inline WebPay)

## Contributors

- **Stephen Adeniji** - Frontend Lead
- **Israel Oluniyi** - Frontend Developer

## Getting Started

Follow these instructions to get the frontend running locally on your machine.


### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed. We recommend using `pnpm` as your package manager.

### 1. Installation

Navigate to the frontend directory and install the required dependencies:

```bash
# Ensure you are in the frontend folder
cd frontend

# Install dependencies
pnpm install
```


### 2\. Environment Variables

Create a `.env` file in the root of the `frontend` directory and add your backend API URL. 

### 3\. Run the Development Server

Start the Vite development server:

```bash
pnpm dev
```

Open [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173) in your browser to view the application.


## Project Structure

To keep the codebase modular and scalable, the `src` directory is organized as follows:

- `/components` - Reusable UI elements (Buttons, Forms, Campaign Cards) and layout wrappers (Navbar, Footer).
- `/pages` - The core route views (Home, Campaign Details, Dashboards).
- `/store` - Zustand state management files (`useAuthStore.js` for JWT handling).


## Role-Based Views & Routing

The frontend dynamically routes users to different dashboards based on their authentication role returned from the backend JWT:

1.  **Public/Donor (No Auth Required):** Can freely browse campaigns and donate seamlessly via the Interswitch Checkout modal to reduce friction.
2.  **Campaign Creator:** Routed to `/creator` to monitor their active medical campaigns.
3.  **Hospital Admin:** Routed to `/admin` to view 100% funded campaigns and upload stamped medical invoices.
4.  **Super Admin:** Routed to `/super-admin` to review uploaded invoices and trigger the final Interswitch Payout.

