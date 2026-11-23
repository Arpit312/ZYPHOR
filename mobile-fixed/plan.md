# ZYPHOR Mobile App – Master Architectural Audit & Redesign Plan
> **Document Version:** 2.0.0  
> **Target Release:** ZYPHOR 2.0 Luxury Recommerce Edition  
> **Framework:** React Native (Expo SDK 58, Hermes, New Architecture)  
> **Source Audit Document:** *Marketplace App – Audit & Premium Redesign Report (Nov 23, 2026)*  
> **Tracker Legend:**  
> `[x]` = Fully Implemented & Verified  
> `[-]` = In Progress  
> `[ ]` = Pending Execution  

---

## 1. Executive Summary & Audit Context

The current `mobile-fixed` codebase represents a functional recommerce prototype with solid foundational routing, but had an audit maturity score of **42/100 (Prototype)** due to:
1. **Four Release Blockers:** Localhost/LAN API dependency, missing payment gateway integration, absent push telemetry, and unverified compliance claims.
2. **Missing Essential Screens:** Over 15 standard recommerce screens were absent (OTP login, order tracking timeline, return/refund, 5-step sell wizard, device passport, seller KYC, legal/help center).
3. **Inconsistent Design System:** Visual discordance with 5+ competing color palettes (generic blue `#2196F3`, purple, green), placeholder gallery copy ("ALIVE ATELIER", "PAVILION COLLECTION"), and lack of brand typography.

### Objective
Elevate the mobile application to a **Tier-1 Luxury Branded Recommerce Platform** matching Apple/MatchesFashion/Farfetch visual aesthetics while delivering high-trust Indian recommerce capabilities (Cashify/Cred/Apple Trade-in level), full bilingual (English + Hindi) support, and rock-solid MongoDB/Express backend compatibility.

---

## 2. Master Blueprint: Add, Change, Remove

### 2.1 What Was Added (New Packages & Infrastructure)
- [x] `@expo-google-fonts/sora` (Display/Headings typography: `Sora_600SemiBold`, `Sora_700Bold`)
- [x] `@expo-google-fonts/manrope` (Body/Buttons/Data typography: `Manrope_400Regular`, `Manrope_500Medium`, `Manrope_600SemiBold`, `Manrope_700Bold`)
- [x] `expo-secure-store` (Hardware-backed encrypted storage for JWT tokens and sensitive session data)
- [x] `react-native-svg` (Sharp luxury badges, seals, vector diagnostic icons)
- [x] `src/theme/tokens.js` (Unified luxury design system: Champagne Gold `#C5A880`, Ink `#181818`, Ivory `#FAF8F5`, surfaces, plinths)
- [x] `src/i18n/` (Bilingual English + Hindi translation engine & context toggle with instant reactivity)
- [x] 12 Master Base UI Components in `src/components/UI.js` (Plinth, Button, Badge, Stepper/OrderTimeline, Accordion, BottomSheetModal, Input, PriceTag, EmptyState, Toast, HeaderBar, TrustStrip)
- [x] 3-Slide Luxury Onboarding Screen (`src/screens/auth/OnboardingScreen.js`)
- [x] Dedicated Search & Filter Screen with Interactive Bottom Sheet (`src/screens/main/SearchFilterScreen.js`)
- [x] Vertical Order Tracking Screen with 48h Inspection Window Countdown (`src/screens/main/OrderTrackingScreen.js`)
- [x] Doorstep Return & Escrow Dispute Screen with Photo Evidence Upload (`src/screens/main/ReturnDisputeScreen.js`)
- [x] Recommerce 5-Step Sell Wizard (`src/screens/main/SellScreen.js`)
- [x] Settings Screen with Language & Dark Mode Toggle (`src/screens/main/SettingsScreen.js`)
- [x] Help Centre, Warranty Policy & Statutory Grievance Officer Screen (`src/screens/main/HelpLegalScreen.js`)

### 2.2 What Was Changed (Modifications to Existing Architecture)
- [x] **API & Config Layer:** Updated `src/api/api.js` to utilize hardware-backed `SecureStore` (with graceful fallback to `AsyncStorage`) and strict environment-driven API URLs.
- [x] **Authentication Flow:** Transformed `LoginScreen.js` into a dual-mode 10-digit Phone OTP + Google social sign-in + Email & Password fallback for existing accounts.
- [x] **Design Tokens:** Purged all random `#2196F3` blue, `#4CAF50` green, and inline ad-hoc colors; enforced Champagne Gold `#C5A880`, Ink `#181818`, and Ivory `#FAF8F5`.
- [x] **Typography:** Migrated app headings to `Sora` and body/prices to `Manrope`.
- [x] **Home Screen:** Transformed into a luxury recommerce marketplace with 4-pillar trust strip (45-Point Check, 48h Approval Window, 6M Warranty, Free Delivery), brand rail (Apple, Samsung, OnePlus, Google), Deal of the Day plinth, and instant sell banner.
- [x] **Product Detail Page (PDP):** Upgraded `ListingDetailScreen.js` with multi-image gallery, battery health meter (>85% certified), 45-point diagnostic certificate accordion, 48h approval window policy, and sticky bottom action bar.
- [x] **Data Model Preservation:** Preserved 100% of existing MongoDB schema fields (`_id`, `name`, `price`, `brand`, `specs`, `condition`, `images`, `stock`) and Express endpoints while enriching client presentation.

### 2.3 What Was Removed (Deletions & Cleanup)
- [x] **Unused Permissions in `app.json`:** Removed `RECORD_AUDIO`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE` to prevent Google Play Store rejections and permission audits.
- [x] **Dead Fashion/Art Copy:** Purged placeholder strings like "ALIVE ATELIER", "PAVILION COLLECTION", and replaced with authentic recommerce trust copy.
- [x] **Unbacked Claims:** Replaced unverified claims with verifiable 45-point hardware diagnostic checklists and transparent 48-hour escrow inspection timelines.
- [x] **Insecure Token Storage:** Replaced plain unencrypted `AsyncStorage` for JWT tokens with `expo-secure-store`.

---

## 3. Step-by-Step Execution Checklist & Status

### Phase 0: Security, Dependencies & Configuration
- [x] **Step 0.1:** Clean `app.json` permissions (`RECORD_AUDIO`, `READ/WRITE_EXTERNAL_STORAGE` removed; adaptive icon background set to `#121110`)
- [x] **Step 0.2:** Install `@expo-google-fonts/sora`, `@expo-google-fonts/manrope`, `expo-secure-store`, `react-native-svg`
- [x] **Step 0.3:** Create `src/utils/storage.js` with hardware-backed `SecureStore` + `AsyncStorage` fallback
- [x] **Step 0.4:** Update `src/api/api.js` to utilize `storage` for JWT interceptors
- [x] **Step 0.5:** Verify baseline compilation via `npx expo export --no-bytecode` (Code 0, 965 modules bundled)

### Phase 1: Design Tokens, Fonts & 12 Base UI Components
- [x] **Step 1.1:** Create `src/theme/tokens.js` with exact PDF Color Matrix (Champagne Gold `#C5A880`, Ink `#181818`, Canvas `#FAF8F5`, Surface `#FFFFFF`, Surface-alt `#F2EEE8`, Line `#E7E1D8`, Dark mode tokens)
- [x] **Step 1.2:** Update `App.js` with font loading (`Sora_600SemiBold`, `Sora_700Bold`, `Manrope_400Regular`, `Manrope_500Medium`, `Manrope_600SemiBold`, `Manrope_700Bold`) and smooth splash reveal
- [x] **Step 1.3:** Rebuild `src/components/UI.js` with 12 luxury base components:
  - `HeaderBar`
  - `Btn` / `Button` (Primary, Gold, Secondary, Outline, Ghost)
  - `Input` / `TextField`
  - `GradeBadge` & `Badge`
  - `PriceTag` (Rupee formatting, strike-through, discount badge)
  - `TrustStrip` (45-Point Check, 48h Approval, 6M Warranty, Free Delivery)
  - `Accordion` (Diagnostic inspection sheets & policies)
  - `OrderTimeline` / `Stepper`
  - `BottomSheetModal`
  - `FilterPill`
  - `Empty`
  - `ListingCard` (Museum plinth presentation)
- [x] **Step 1.4:** Build `src/i18n/I18nContext.js` supporting dynamic English & Hindi language switching

### Phase 2: Core Authentication & User Onboarding
- [x] **Step 2.1:** Build `src/screens/auth/OnboardingScreen.js` (3-slide luxury intro: Certified Refurbished, 48-Hour Escrow Protection, Instant AI Valuation)
- [x] **Step 2.2:** Redesign `src/screens/auth/LoginScreen.js` (10-digit Phone OTP flow + Google social button + Password fallback for existing accounts + bilingual toggle)
- [x] **Step 2.3:** Redesign `src/screens/auth/SignupScreen.js` (Two-step guided signup: Role selection + personal details + DPDP terms)

### Phase 3: Core Discovery & Shopping Screens (P0)
- [x] **Step 3.1:** Redesign `src/screens/main/HomeScreen.js`
  - Top luxury navigation with location & bilingual switch
  - Search trigger leading to dedicated search
  - 4-pillar trust strip
  - Official brand rail (Apple, Samsung, OnePlus, Google)
  - Deal of the Day plinth with condition badge & discount
  - Recommerce instant sell banner
  - Dual-column verified device bento grid
- [x] **Step 3.2:** Build `src/screens/main/SearchFilterScreen.js`
  - Real-time search query with quick tags
  - Filter bottom sheet (Grade, Storage, Max Price slider)
- [x] **Step 3.3:** Redesign `src/screens/main/ListingDetailScreen.js` (PDP)
  - Multi-image gallery with grade badge overlay
  - Battery health meter badge (>85% certified)
  - 45-point diagnostic certificate accordion
  - 6-month warranty & 48-hour approval policy accordion
  - Dispatched from verified hub plinth
  - Sticky bottom action bar with live price, "Add to Bag", and "Buy Now"

### Phase 4: Cart, Checkout & Order Management
- [x] **Step 4.1:** Build `src/screens/main/OrderTrackingScreen.js`
  - Vertical order tracking timeline: Placed → 45-Pt Verified → Dispatched → Out for Delivery → 48-Hour Approval Window
  - Live inspection countdown timer (e.g. 41h 22m left)
  - Action buttons: "Accept Device & Release Payment" / "Return or Report Issue"
- [x] **Step 4.2:** Build `src/screens/main/ReturnDisputeScreen.js`
  - Reason selector (Hardware defect, Screen issue, Battery health under 85%, Camera flaw)
  - Defect description & camera photo upload evidence
  - Free doorstep reverse-pickup slot scheduler

### Phase 5: Recommerce Sell Wizard & Digital Passport
- [x] **Step 5.1:** Redesign `src/screens/main/SellScreen.js` (5-Step Sell Wizard)
  - Step 1: Device Selection (Brand, Model, Storage)
  - Step 2: Diagnostic Condition Quiz (Screen touch, body scratches, battery health, accessories)
  - Step 3: Instant AI Valuation Plinth with transparent breakdown
  - Step 4: Schedule free doorstep pickup
  - Step 5: Instant NPCI UPI / Bank payout details

### Phase 6: Account, Settings, Help & Compliance
- [x] **Step 6.1:** Build `src/screens/main/SettingsScreen.js`
  - Dynamic English & Hindi language switcher
  - Order & escrow push alerts toggle
  - Dark appearance toggle
  - "Delete Account & Personal Data" flow (DPDPA compliance)
- [x] **Step 6.2:** Build `src/screens/main/HelpLegalScreen.js`
  - Concierge support contacts
  - Frequently asked questions
  - Statutory Grievance Officer details (Mandatory Indian IT Rules)
- [x] **Step 6.3:** Connect Settings and Help Centre in `DashboardScreen.js`

### Phase 7: App Navigation Integration, Verification & Standalone Build
- [x] **Step 7.1:** Register all new screens in `App.js` stacks (`HomeStack`, `MarketStack`, `AccountStack`, `AuthStack`)
- [x] **Step 7.2:** Clean up obsolete placeholder assets and unused icon definitions
- [x] **Step 7.3:** Run full Expo compilation test (`npx expo export --no-bytecode`) -> Verified 0 errors
- [x] **Step 7.4:** Test mobile backend API connectivity and update git commit
