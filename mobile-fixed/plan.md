# ZYPHOR Mobile App – Master Architectural Audit & Redesign Plan
> **Document Version:** 2.1.0  
> **Target Release:** ZYPHOR 2.0 Luxury Recommerce Edition  
> **Framework:** React Native (Expo SDK 58, Hermes, New Architecture)  
> **Source Audit Document:** *Marketplace App – Audit & Premium Redesign Report (Nov 23, 2026)*  
> **Tracker Legend:**  
> `[x]` = Fully Implemented & Verified  
> `[-]` = In Progress  
> `[ ]` = Pending Execution  

---

## 1. Executive Summary & Audit Context

The current `mobile-fixed` codebase has been completely upgraded from a basic prototype to a **Tier-1 Luxury Branded Recommerce Platform** matching the PDF specifications:
1. **Full Brand Design Token System:** Enforcing Champagne Gold (`#C5A880`), Deep Velvet Ink (`#121110` / `#181818`), Soft Canvas (`#FAF8F5`), Museum Plinths, and `Sora` + `Manrope` typography.
2. **Complete Screen Suite (20+ Screens):**
   - Core Discovery: Luxury Home, Catalog Grid with Filters (`MarketplaceScreen`), Search & Filter Bottom Sheet (`SearchFilterScreen`), PDP with 45-Point Certificate (`ListingDetailScreen`).
   - Transaction & Escrow: Shopping Bag (`CartScreen`), 3-Step Escrow Checkout (`CheckoutScreen`), Order Success Confirmation (`OrderSuccessScreen`), Order Tracking with 48h Inspection Window (`OrderTrackingScreen`), Doorstep Return & Escrow Dispute (`ReturnDisputeScreen`).
   - Authentication: 3-Slide Luxury Onboarding (`OnboardingScreen`), Phone OTP + Social + Password Dual-Mode Login (`LoginScreen`), 2-Step Guided Signup (`SignupScreen`), Password Recovery (`ForgotPasswordScreen`).
   - Recommerce Engine: 5-Step Sell Wizard (`SellScreen`), Digital Device Passport (`DevicePassportScreen`), Escrow Payment Methods (`PaymentMethodsScreen`).
   - User & Compliance: Profile with Verified Badges (`ProfileScreen`), Saved Vault (`WishlistScreen`), Notifications (`NotificationsScreen`), Saved Delivery Addresses (`AddressesScreen`), Orders & Invoices (`MyOrdersScreen`, `OrderDetailScreen`), Settings (`SettingsScreen`), Help & Statutory Grievance Center (`HelpLegalScreen`).
3. **Opening Brand Splash Animation:** Full-screen deep velvet ink canvas (`#121110`), Champagne Gold orbital ring rotation, ambient pulse, laser hairline divider, and smooth velvet dissolve.
4. **Zero-Error Compilation:** Bundled across Android (967 modules) and iOS (972 modules) with exit code 0.

---

## 2. Master Blueprint: Add, Change, Remove

### 2.1 What Was Added
- [x] `@expo-google-fonts/sora` (Display/Headings: `Sora_600SemiBold`, `Sora_700Bold`)
- [x] `@expo-google-fonts/manrope` (Body/Buttons/Data: `Manrope_400Regular`, `Manrope_500Medium`, `Manrope_600SemiBold`, `Manrope_700Bold`)
- [x] `expo-secure-store` (Hardware-backed encrypted storage for JWT tokens)
- [x] `react-native-svg` (Sharp luxury badges, seals, vector diagnostic icons)
- [x] `src/theme/tokens.js` (Unified luxury design system: Champagne Gold `#C5A880`, Ink `#181818`, Ivory `#FAF8F5`, surfaces, plinths)
- [x] `src/i18n/` (Bilingual English + Hindi translation engine & context toggle with instant reactivity)
- [x] 12 Master Base UI Components in `src/components/UI.js`
- [x] Full-Screen Velvet Luxury Opening Animation (`src/components/AppSplashScreen.js`)
- [x] 3-Slide Luxury Onboarding Screen (`src/screens/auth/OnboardingScreen.js`)
- [x] Search & Filter Screen with Interactive Bottom Sheet (`src/screens/main/SearchFilterScreen.js`)
- [x] Vertical Order Tracking Screen with 48h Countdown (`src/screens/main/OrderTrackingScreen.js`)
- [x] Doorstep Return & Escrow Dispute Screen (`src/screens/main/ReturnDisputeScreen.js`)
- [x] Recommerce 5-Step Sell Wizard (`src/screens/main/SellScreen.js`)
- [x] Digital Device Passport with 45-Pt Breakdown (`src/screens/main/DevicePassportScreen.js`)
- [x] Order Success Celebration Screen (`src/screens/main/OrderSuccessScreen.js`)
- [x] Payment Methods & Escrow Nodal Screen (`src/screens/main/PaymentMethodsScreen.js`)
- [x] Settings Screen with Language & Dark Mode Toggle (`src/screens/main/SettingsScreen.js`)
- [x] Help Centre, Warranty Policy & Statutory Grievance Officer Screen (`src/screens/main/HelpLegalScreen.js`)

### 2.2 What Was Changed
- [x] **API & Config Layer:** Updated `src/api/api.js` to utilize hardware-backed `SecureStore`.
- [x] **Authentication Flow:** Transformed `LoginScreen.js` into dual-mode 10-digit Phone OTP + Google social sign-in + Email/Password fallback.
- [x] **Design Tokens:** Purged random `#2196F3` blue and ad-hoc colors across all screens.
- [x] **Home Screen:** Transformed into luxury recommerce marketplace with 4-pillar trust strip, brand rail, and Deal of the Day plinth.
- [x] **Marketplace Catalog:** Transformed `MarketplaceScreen.js` into luxury catalog with brand chips, sort dropdown, and dual-column grid.
- [x] **Cart & Checkout:** Redesigned `CartScreen.js` and `CheckoutScreen.js` with escrow guarantee banners, item cards, and transparent fee breakdown.
- [x] **Orders & Tracking:** Updated `MyOrdersScreen.js` and `OrderDetailScreen.js` to link directly to live `OrderTrackingScreen` and `ReturnDisputeScreen`.
- [x] **Profile & Vault:** Updated `ProfileScreen.js`, `WishlistScreen.js`, `NotificationsScreen.js`, `AddressesScreen.js`, and `ForgotPasswordScreen.js` with luxury tokens.

### 2.3 What Was Removed
- [x] Unused permissions in `app.json` (`RECORD_AUDIO`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`).
- [x] Obsolete placeholder text ("ALIVE ATELIER", "PAVILION COLLECTION").
- [x] Unbacked compliance claims replaced with verifiable 45-point hardware diagnostic checklists and 48-hour escrow inspection timelines.

---

## 3. Step-by-Step Execution Checklist & Status

### Phase 0: Security, Dependencies & Configuration
- [x] **Step 0.1:** Clean `app.json` permissions (`RECORD_AUDIO`, `READ/WRITE_EXTERNAL_STORAGE` removed; adaptive icon background set to `#121110`)
- [x] **Step 0.2:** Install `@expo-google-fonts/sora`, `@expo-google-fonts/manrope`, `expo-secure-store`, `react-native-svg`
- [x] **Step 0.3:** Create `src/utils/storage.js` with hardware-backed `SecureStore` + `AsyncStorage` fallback
- [x] **Step 0.4:** Update `src/api/api.js` to utilize `storage` for JWT interceptors
- [x] **Step 0.5:** Verify baseline compilation via `npx expo export --no-bytecode` (Code 0)

### Phase 1: Design Tokens, Fonts & Base UI Components
- [x] **Step 1.1:** Create `src/theme/tokens.js` with exact PDF Color Matrix (Champagne Gold `#C5A880`, Ink `#181818`, Canvas `#FAF8F5`, Surface `#FFFFFF`, Surface-alt `#F2EEE8`, Line `#E7E1D8`, Dark mode tokens)
- [x] **Step 1.2:** Update `App.js` with font loading (`Sora`, `Manrope`) and luxury splash reveal
- [x] **Step 1.3:** Build `src/components/UI.js` with 12 luxury base components
- [x] **Step 1.4:** Build `src/i18n/I18nContext.js` supporting dynamic English & Hindi language switching

### Phase 2: Core Authentication & User Onboarding
- [x] **Step 2.1:** Build `src/screens/auth/OnboardingScreen.js` (3-slide luxury intro)
- [x] **Step 2.2:** Redesign `src/screens/auth/LoginScreen.js` (10-digit Phone OTP + Google social + Password fallback)
- [x] **Step 2.3:** Redesign `src/screens/auth/SignupScreen.js` (Two-step guided signup)
- [x] **Step 2.4:** Redesign `src/screens/auth/ForgotPasswordScreen.js` (Luxury OTP password recovery)

### Phase 3: Core Discovery & Shopping Screens
- [x] **Step 3.1:** Redesign `src/screens/main/HomeScreen.js` (Top luxury bar, trust strip, brand rail, Deal of the Day, bento grid)
- [x] **Step 3.2:** Build `src/screens/main/SearchFilterScreen.js` (Real-time search with bottom sheet filters)
- [x] **Step 3.3:** Redesign `src/screens/main/ListingDetailScreen.js` (PDP with multi-image gallery, battery health, 45-point certificate accordion, digital passport link, sticky bottom bar)
- [x] **Step 3.4:** Redesign `src/screens/main/MarketplaceScreen.js` (Luxury catalog with brand chips, sort dropdown, and dual-column grid)

### Phase 4: Cart, Checkout & Order Management
- [x] **Step 4.1:** Redesign `src/screens/main/CartScreen.js` (Escrow guarantee banner, luxury item cards, fee transparency summary)
- [x] **Step 4.2:** Redesign `src/screens/main/CheckoutScreen.js` (3-step flow: Address → Escrow Payment Method → Review & Place Order)
- [x] **Step 4.3:** Build `src/screens/main/OrderSuccessScreen.js` (Animated checkmark, order summary plinth, invoice sharing, track CTA)
- [x] **Step 4.4:** Build `src/screens/main/OrderTrackingScreen.js` (Vertical timeline with 48h Inspection Window countdown)
- [x] **Step 4.5:** Build `src/screens/main/ReturnDisputeScreen.js` (Doorstep return & escrow dispute with photo upload)
- [x] **Step 4.6:** Redesign `src/screens/main/MyOrdersScreen.js` & `OrderDetailScreen.js` (Direct link to live OrderTracking and invoice breakdown)

### Phase 5: Recommerce Sell Wizard & Digital Passport
- [x] **Step 5.1:** Redesign `src/screens/main/SellScreen.js` (5-Step Sell Wizard)
- [x] **Step 5.2:** Build `src/screens/main/DevicePassportScreen.js` (Digital Hardware Certificate with 45-Point Audit, Battery Health, and IMEI provenance)
- [x] **Step 5.3:** Build `src/screens/main/PaymentMethodsScreen.js` (Saved UPI/Cards with Escrow Nodal Protection details)

### Phase 6: Account, Settings, Help & Compliance
- [x] **Step 6.1:** Redesign `src/screens/main/ProfileScreen.js` (Luxury member card with verified badge, trust score, personal & GST details)
- [x] **Step 6.2:** Redesign `src/screens/main/AddressesScreen.js` (Default delivery addresses management modal)
- [x] **Step 6.3:** Redesign `src/screens/main/WishlistScreen.js` & `NotificationsScreen.js` (Saved vault and activity alerts)
- [x] **Step 6.4:** Build `src/screens/main/SettingsScreen.js` (Language switcher, dark mode, DPDPA data delete)
- [x] **Step 6.5:** Build `src/screens/main/HelpLegalScreen.js` (Concierge, FAQs, Statutory Grievance Officer details)
- [x] **Step 6.6:** Redesign `src/components/AppSplashScreen.js` (Full-Screen Deep Velvet Ink `#121110` + Champagne Gold `#C5A880` animation)

### Phase 7: Navigation Integration & Standalone Verification
- [x] **Step 7.1:** Register all new screens in `App.js` stacks (`HomeStack`, `MarketStack`, `AccountStack`, `AuthStack`)
- [x] **Step 7.2:** Clean up obsolete assets and verify font loading
- [x] **Step 7.3:** Run full Expo compilation test (`npx expo export --no-bytecode`) -> Verified 0 errors (967 Android modules, 972 iOS modules)
- [x] **Step 7.4:** Test mobile backend API connectivity (tested port 5000 /api/auth/login -> 200 OK)
