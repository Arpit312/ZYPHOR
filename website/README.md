# ZYPHOR — AI-Verified Smartphone & Parts Marketplace

![Zyphor Platform Banner](https://img.shields.io/badge/Platform-Production_Ready-brightgreen)
![Next.js 14](https://img.shields.io/badge/Framework-Next.js_14_App_Router-black)
![MongoDB](https://img.shields.io/badge/Database-MongoDB_Mongoose-green)
![Google Gemini AI](https://img.shields.io/badge/AI-Google_Gemini_Integration-blue)
![Escrow Safety](https://img.shields.io/badge/Security-Escrow_Protected-orange)

**ZYPHOR** is India's most advanced AI-verified smartphone, tablet, and mobile spare parts marketplace ecosystem. Built on Next.js 14 App Router, MongoDB, and Google Gemini AI, Zyphor connects Customers, Retailers, Wholesalers, and Technicians under a unified escrow-protected marketplace.

---

## 🏗️ Architecture & Folder Structure

The project strictly separates **Frontend Client UI** and **Backend Server Logic**:

```
zyphor-platform/website/
│
├── 🎨 FRONTEND ARCHITECTURE (Client & UI Layer)
│   ├── app/                      # Next.js App Router Page Views
│   │   ├── page.js               # Landing Page & Hero
│   │   ├── buy/                  # Dynamic Catalog & Category Filtering
│   │   ├── marketplace/          # Verified Listings Grid & PDP
│   │   ├── product/[slug]/       # PDP Variant & Condition Selector
│   │   ├── cart/                 # Cart State & Escrow Subtotal
│   │   ├── checkout/             # Payment & Address Selection
│   │   ├── sell/                 # Doorstep Sell Entry & AI Questionnaire
│   │   ├── repair/               # Doorstep Repair & Slot Booking
│   │   ├── stores/               # Offline Store & Kiosk Locator
│   │   ├── orders/               # Customer Order Tracking
│   │   ├── dashboard/            # Role-Based Personal Dashboards
│   │   ├── admin/                # Master Governance Control Portal
│   │   ├── ai-advisor/           # AI Smartphone Recommendation Agent
│   │   ├── verify-imei/          # AI IMEI Blacklist Scanner
│   │   ├── pricing-agent/        # AI Resale Valuation Checker
│   │   ├── subscription/         # B2B & Customer AI Plans
│   │   └── support/              # Help Center & FAQ
│   │
│   ├── components/               # Reusable React UI Components
│   │   └── shared/               # Navbar, Footer, AIAgreementModal, AISmartListerModal, AdminPortalClient, RoleDashboardView
│   │
│   ├── context/                  # Global React State Context (CartContext)
│   ├── styles/ & public/         # Tailwind CSS & Static Image Assets
│
├── ⚙️ BACKEND ARCHITECTURE (Server & Database Layer)
│   ├── app/api/                  # Server REST API Endpoints
│   │   ├── auth/                 # Login & Signup APIs
│   │   ├── orders/               # Order Placement & Escrow Payouts
│   │   ├── cart/                 # Server Cart Persistence
│   │   ├── repair/               # Doorstep Repair Ticket Booking
│   │   ├── stores/               # Store Location Geo Search
│   │   ├── ai/                   # AI Auto-Lister, Legal Agreements, IMEI Check, Advisor, Admin Search
│   │   ├── admin/                # Master Governance & User Access Controls
│   │   └── messages/             # Direct User-to-Admin Messaging
│   │
│   ├── lib/                      # Core Server Logic & Utilities
│   │   ├── db.js                 # MongoDB Connection Pool & Cache
│   │   ├── auth.js               # JWT Cookie Encryption & Verification
│   │   ├── gemini.js             # Google Gemini REST Integration
│   │   ├── imei.js               # Luhn Checksum Algorithm & GSMA TAC Lookup
│   │   ├── catalog.js            # Catalog Aggregator
│   │   ├── token.js              # User Identity Token Generator
│   │   └── pricingEngine.js      # Automated Valuation Calculator
│   │
│   └── models/                   # Mongoose Database Schemas
│       ├── User.js               # Users, Roles, Identity Tokens, Subscriptions
│       ├── Listing.js            # Smartphone & Parts Catalog Items
│       ├── Order.js              # Escrow Orders & Commission Bills
│       ├── Cart.js               # User Saved Cart Items
│       ├── RepairTicket.js       # Doorstep Repair Bookings
│       ├── StoreLocation.js      # Offline Kiosks & Stores
│       ├── Message.js            # Admin Direct Messaging
│       ├── Subscription.js       # B2B & Customer AI Plans
│       └── TACCode.js            # GSMA TAC Database Mapping
```

---

## 💰 Platform Revenue & Monetization Model

Zyphor's monetization rules are embedded directly into the database models and AI Legal Agreements:

1. **Marketplace Sales Commission:** **3% Platform Fee + 18% GST** on device transactions.
2. **Technician Repair Cut:** **15% Platform Service Cut** per doorstep repair booking.
3. **B2B Subscriptions:** 3 Months Free Onboarding, then **₹999/month Pro Plan** for Retailers & Wholesalers.
4. **AI Auto-Lister Subscription:** **3 Free Trial Listings** for Customers on first login, then **₹99/month**.

---

## 🔑 Key Features & Role Access

| Role | Personal Dashboard Features | Key Action |
| :--- | :--- | :--- |
| 🛡️ **Master Admin** | Global Revenue (3%), User Access Grant/Revoke, Gemini AI Token Search Assistant | `/admin` Portal Control |
| 🔧 **Technician** | Assigned Repair Schedule, Pending Work Tickets, 85% Repair Payout Logs | Accept & Issue Reports |
| 🏪 **Retailer** | Phone & Spare Parts Inventory Stock, Shop Details Editor, Admin Direct Messaging | + New Listing / AI Lister |
| 🏬 **Wholesaler** | Bulk Stock Lots, Retailer Network Messages, Escrow Settlement Tracker | Upload Wholesale Lot |
| 👤 **Customer** | Purchased Devices, Doorstep Sell Orders, AI Seller Legal Agreement | Sell Device / Buy |

---

## 🚀 Quick Start & Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (`.env.local`)
Create a `.env.local` file in the project root:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/zyphor
JWT_SECRET=your_jwt_secret_key_zyphor
GEMINI_API_KEY=your_google_gemini_api_key
NEXT_PUBLIC_APP_NAME=ZYPHOR
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_PERCENT=3
GST_PERCENT=18
```

### 3. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛡️ License
Built for **ZYPHOR India** — AI-Verified Smartphone Marketplace. All rights reserved.
