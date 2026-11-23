# ZYPHOR v2.0 - Production Mobile Engineering Architecture & Play Store Guidelines

## ⚡ Full Autonomy & Tool/Package Installation Permission (USER GRANTED)
- **Autonomous Tool & Package Installation:** If you need any npm package, icon library, utility, or build tool (e.g. `npx expo install <package>`, `npm install <package>`) to make any screen or feature 100% functional, complete, and standard:
  - **You have FULL PERMISSION to freely install any packages or tools directly via bash/terminal.**
  - **Do NOT pause or wait for user confirmation.** Install what is needed, build the code, and simply report what was installed and why in your final turn summary.
- **Service Integration:** If any third-party service or API key is required (e.g. Razorpay test mode, Cloudinary, Firebase, SMS service, MongoDB Atlas URI), write standard integration handlers with graceful offline/mock fallback and mention the necessary environment variables in your summary.

---

## 🎨 Brand Originality & Zero-Copyright Policy (CRITICAL)
- **Proprietary Identity:** Zyphor is an original, premium recommerce brand.
- **No Cloning / No Copyright Infringement:** Do NOT copy Cashify, Reebelo, or Apple's exact UI, graphics, or layout structures. Use them solely as reference points for business logic (e.g. doorstep repair flow, instant AI valuation stepper).
- **Luxury Monochrome Aesthetic:** Strictly adhere to Zyphor's signature design language:
  - Charcoal / Jet Black (`#181818`, Pure Black `#000000`).
  - Warm Sand / Soft Grey (`#F6F5F3`).
  - Crisp White Canvas (`#FFFFFF`).
  - Executive Muted Gray (`#787878`).
  - Standard clean Inter typography with generous padding and subtle rounded card elevations.

---

## 🚀 App Launch 1-Second Motion Animation
- On app launch, a custom 1-second 60fps native motion splash animation (`src/components/AppSplashScreen.js`) must play smoothly:
  - Zyphor Circuit Emblem (`assets/symbol-dark.png`) scales in from 0.85 ➔ 1.0 with a gentle spring easing.
  - "ZYPHOR" wordmark and "CERTIFIED ELECTRONICS • RECOMMERCE" tagline gracefully fade in.
  - Soft exit fade into the authenticated TabNavigator or AuthStack.
  - Zero freeze, zero blank white screen, zero dependencies.

---

## 🛡️ Play Store Crash-Prevention & Defensive Engineering Rules
1. **Tool Invocation Imperative:**
   - ALWAYS invoke the `Write` or `Edit` tool immediately. Never summarize or plan without delivering the complete code files in the same turn.
2. **Zero Runtime Exceptions:**
   - ALWAYS use defensive optional chaining: `item?.title`, `order?.shippingAddress?.street`, `user?.role`.
   - ALWAYS provide fallback defaults for array methods: `(items || []).map(...)`, `(orders || []).filter(...)`.
3. **Zero Dummy/Empty Functions:**
   - No placeholder handlers like `onPress={() => {}}` or `console.log("clicked")`.
   - Every button must either: trigger a real API action, navigate to a registered screen, or show a meaningful alert/modal.
4. **Navigation Guarantee:**
   - Every `navigation.navigate("ScreenName")` must match an actual screen registered in `App.js`.
5. **State & Network Resilience:**
   - All async network calls must be wrapped in `try...catch`.
   - Always manage loading states (`loading = true/false`) and display elegant skeletons or `ActivityIndicator`.
   - Handle offline or network drops gracefully with informative retry states.

---

## 📱 Key Modules & Screen Architecture
1. **App Launch Motion:** `AppSplashScreen.js` — 1-sec luxury branding motion.
2. **Wishlist (`WishlistScreen.js`):** Connected to `WishlistContext` & `/api/wishlist`.
3. **Notifications (`NotificationsScreen.js`):** Connected to `/api/notifications`. Real-time alerts.
4. **Order Lifecycle (`OrderDetailScreen.js`):** 5-step delivery tracker, items breakdown, invoice preview.
5. **Address Management (`AddressesScreen.js`):** Delivery address manager with pin-code and phone validation.
6. **Support Ticketing (`SupportScreen.js`):** Categorized tickets, live messaging thread.
7. **Device Comparison (`CompareScreen.js`):** Side-by-side technical specs matrix.
8. **Seller Dashboard / Flow (`SellerScreen.js`):** Verified seller profile, rating, inventory showcase.
9. **Repair Tracker (`RepairTicketsScreen.js`):** Doorstep repair tracker with technician contact.

---

## 🔗 Shared Ecosystem Integration
- Syncs with Web and Admin Dashboard via shared MongoDB collections:
  - Users, LoginSessions, Listings, Orders, Repairs, SupportTickets, Notifications.
- All backend and frontend files must pass `node --check` syntax validation.
