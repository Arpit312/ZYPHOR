# ZYPHOR v2.0 — AI-Verified Phone Marketplace Platform

> One codebase. One database. Website + Mobile App + Admin Panel.
> Same login works everywhere. ✅

---

## 🏗️ Platform Structure

```
zyphor-platform/
├── website/          ← Next.js 14 web app (zyphor.in)
│   ├── app/          ← Pages & API routes
│   ├── components/   ← Shared UI components
│   ├── lib/          ← Auth, DB, Billing utilities
│   └── models/       ← MongoDB schemas
│
├── mobile/           ← React Native + Expo app
│   ├── src/          ← All screens & components
│   └── backend/      ← Node.js API server
│
└── README.md         ← This file
```

---

## ⚡ Quick Start

### 1. MongoDB Setup
```bash
# MongoDB Atlas (free 512MB) → mongodb.com/cloud/atlas
# Copy connection string to both .env files
```

### 2. Website
```bash
cd website
cp .env.example .env.local    # Fill in MONGODB_URI, JWT_SECRET, etc.
npm install
npm run dev                   # http://localhost:3000
```

### 3. Mobile App
```bash
cd mobile
cp backend/.env.example backend/.env   # SAME JWT_SECRET as website!
cd backend && npm install && npm run dev  # API on port 5000
cd .. && npm install && npx expo start   # Scan QR in Expo Go
```

---

## 🔑 CRITICAL: Same JWT_SECRET in BOTH .env files
This enables **cross-platform login** — one account works on website AND app.

```
# website/.env.local
JWT_SECRET=your_super_secret_here

# mobile/backend/.env
JWT_SECRET=your_super_secret_here   ← MUST BE IDENTICAL
```

---

## 🌐 Website Pages

| Route | Description |
|-------|-------------|
| `/` | Home — featured listings |
| `/marketplace` | Browse all devices |
| `/marketplace/[id]` | Device detail + buy |
| `/parts` | Parts marketplace |
| `/sell` | Create listing |
| `/ai-advisor` | AI chat assistant |
| `/pricing-agent` | AI price checker |
| `/verify-imei` | IMEI validation |
| `/subscription` | Seller plans |
| `/login` | Login (shared with app) |
| `/signup` | Register |
| `/dashboard` | Seller dashboard |
| `/dashboard/listings` | Manage listings |
| `/dashboard/orders` | Order history |
| `/dashboard/profile` | Edit profile |
| `/admin/dashboard` | Admin home |
| `/admin/users` | Manage users |
| `/admin/listings` | Manage listings |
| `/admin/orders` | All orders |
| `/admin/subscriptions` | Subscription management |
| `/admin/billing` | Revenue & GST |

---

## 📱 Mobile App Screens

| Screen | Description |
|--------|-------------|
| LoginScreen | Cross-platform login |
| SignupScreen | Role selection + register |
| HomeScreen | Dashboard + quick actions |
| MarketplaceScreen | Search + filter devices |
| PartsScreen | Parts marketplace |
| ListingDetailScreen | Full details + buy |
| SellScreen | Create listing with photos |
| AIAdvisorScreen | AI chat |
| PricingAgentScreen | AI price analysis |
| IMEICheckScreen | IMEI validation |
| DashboardScreen | Account overview |
| ProfileScreen | Edit profile |
| MyListingsScreen | Manage listings |
| MyOrdersScreen | Purchase + sale history |
| SubscriptionScreen | Choose plan |
| AboutScreen | App info |

---

## 💰 Business Model

### Subscription Plans (Sellers Only)
| Plan | Monthly | Yearly | Listings | AI Calls |
|------|---------|--------|----------|----------|
| Basic | ₹299 | ₹2,990 | 10 | 50/mo |
| Pro | ₹799 | ₹7,990 | 50 | 200/mo |
| Enterprise | ₹1,999 | ₹19,990 | Unlimited | Unlimited |

### Per-Transaction Fee (All Sellers)
- Platform fee: **3%** of sale price
- GST on fee: **18%** of platform fee
- Example: Sell ₹30,000 → Platform earns ₹900 + ₹162 GST = ₹1,062 → Seller receives ₹28,938
- **GST invoice generated for every transaction**

### Customers
- Browse: **FREE** forever
- Buy: **FREE** (pay listing price only)
- Sell (individuals): Need subscription

---

## 🔌 API Endpoints

Base URL (website): `http://localhost:3000/api`
Base URL (mobile): `http://localhost:5000/api`

### Auth (shared JWT — works on both platforms)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login → returns token |
| POST | `/auth/signup` | Register → returns token |
| GET | `/auth/me` | Current user |
| PATCH | `/auth/profile` | Update profile |
| POST | `/auth/logout` | Logout |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/listings` | All listings (filterable) |
| GET | `/listings/:id` | Single listing |
| POST | `/listings` | Create listing (auth required) |
| PATCH | `/listings/:id` | Update listing |
| DELETE | `/listings/:id` | Delete listing |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | User's orders |
| POST | `/orders` | Place order (creates bill) |
| PATCH | `/orders/:id/status` | Update order status |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/advisor` | Chat with AI |
| POST | `/ai/pricing` | AI price recommendation |
| POST | `/ai/verify` | Verify device specs |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/imei/check` | Validate IMEI |
| GET | `/subscriptions` | Get subscription |
| POST | `/subscriptions` | Activate plan |
| GET | `/admin/stats` | Admin statistics |

---

## 🔧 Required Environment Variables

### website/.env.local
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=same_secret_as_mobile
ANTHROPIC_API_KEY=sk-ant-...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### mobile/backend/.env
```
MONGODB_URI=mongodb+srv://...   ← SAME DATABASE!
JWT_SECRET=same_secret_as_website  ← SAME SECRET!
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000
```

---

## 🆓 Free Services to Use

| Service | Free Tier | Use For |
|---------|-----------|---------|
| MongoDB Atlas | 512MB | Database (shared) |
| Anthropic Claude | Pay per token | AI Advisor, Pricing |
| Cloudinary | 25GB | Image hosting |
| Razorpay | Free (2% per txn) | Payments (India) |
| Vercel | Free | Website hosting |
| Render | Free tier | Mobile backend |
| Expo | Free | Mobile app build |

---

## 🚀 Production Deployment

### Website → Vercel
```bash
cd website
npx vercel --prod
# Add env vars in Vercel dashboard
```

### Mobile Backend → Render
1. Push `mobile/backend/` to GitHub
2. Create Web Service on render.com
3. Add env vars

### Mobile App → Play Store
```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android
# Submit to Play Store ($99 one-time)
```

---

## 👤 Test Accounts
- **Admin**: Create one by setting `role: "admin"` in MongoDB
- **Buyer**: Signup as `customer`
- **Seller**: Signup as `retailer` → subscribe → list devices

## 💳 Test Stripe Card
- `4242 4242 4242 4242` / 12/25 / 123

## 🔍 Test IMEI
- `353937093209023` (valid)

---

**ZYPHOR v2.0** | Made in India 🇮🇳 | MIT License
