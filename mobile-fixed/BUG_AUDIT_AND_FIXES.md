# 🔍 ZYPHOR MOBILE APP — BUG AUDIT & FIX REPORT

## Context on the "178 screens" reference

The Cashify module breakdown you shared (~178 screens: Repair, Refurbished,
Accessories, Store Locator, Compare, Wishlist, etc.) describes a **mature,
multi-year e-commerce app**. Your current app has **22 screens** covering the
core marketplace loop: Auth (3) + Home/Browse/Parts/Sell/AI/IMEI/Account (19).

Building all 178 screens is a multi-month effort, not something to bolt on in
one pass — most of those screens (Repair booking, Store locator, Wishlist,
Compare, Accessories catalog, Coupons/Wallet) don't exist anywhere in your
backend either, so screens would just be empty shells with nothing to
connect to. **What I did instead: audited every screen and API route you
already have, and fixed every broken connection I found** — this was the
literal ask ("jo bhi screen missing hai ya error hai use fix karo... connected
sab"). A prioritized list of which *new* modules to build next is at the
bottom.

---

## 🐛 Real Bugs Found & Fixed

### 1. Broken cross-tab navigation (multiple crash points)
Your app has 5 tabs, each with its own nested Stack. In React Navigation,
`navigation.navigate("X")` only reaches screens in the **same stack** or
**direct tab names** — it does NOT automatically drill into another tab's
nested stack. Several places called `navigate()` with a screen name that
lived two levels down in a *different* tab, which throws
`"The action 'NAVIGATE' was not handled by any navigator"` and crashes the
interaction.

| Location | Was calling | Problem | Fixed to |
|---|---|---|---|
| `HomeScreen` → "See all" deals | `navigate("Marketplace")` | No such route reachable from Home tab | `navigate("Browse")` |
| `HomeScreen` → search bar tap | `navigate("Marketplace",{focus:true})` | Same + focus param never even used | `navigate("Browse",{screen:"Marketplace",params:{focus:true}})` |
| `HomeScreen` → Quick Actions grid | `navigate(q.screen)` e.g. `"Parts"`, `"Advisor"`, `"PricingAgent"` | These screens live inside other tabs' stacks, unreachable by flat name | Rebuilt with `{tab, screen}` pairs + proper nested `navigate(tab,{screen})` |
| `HomeScreen` → subscription banner | `navigate("Subscription")` | Not in Home's stack at all | `navigate("Account",{screen:"Subscription"})` |
| `ListingDetailScreen` → "View Orders" after purchase | `navigate("MyOrders")` | Only reachable when this screen is opened via Account tab; broke when opened from Home/Browse | `navigate("Account",{screen:"MyOrders"})` |
| `SubscriptionScreen` → "Go to Dashboard" after paying | `navigate("Dashboard")` | Broke when Subscription was opened from the Sell tab | `navigate("Account")` *(Dashboard is Account's default screen)* |

### 2. Sell flow was uploading fake image paths (real data-loss bug)
`SellScreen`'s photo picker grabbed the **local device file path**
(`file:///...`) and saved that directly into the listing — even though a
working `/api/uploads` (Cloudinary) endpoint already existed and was never
called. Every listing photo would have been a dead link the moment anyone
else opened the listing (or even you, after closing the app once).
**Fixed:** `pickImage` now uploads each photo through `uploadAPI.uploadImage`
and stores the returned Cloudinary URL, with a visible "Uploading…" state and
partial-failure handling.

### 3. Upload endpoint had zero authentication (security bug)
`/api/uploads` accepted files from **anyone**, logged in or not — a completely
open door to your Cloudinary storage/bandwidth. Added the same `auth`
middleware every other write route uses, plus an 8MB file-size cap and an
image-only MIME filter so it can't be used to store arbitrary files.

### 4. Forgot Password screen was 100% fake
It showed a hardcoded "reset link sent" alert regardless of what was typed —
**no network call was made at all**, and there was no backend route for it.
Rebuilt as a real 2-step flow:
- `POST /api/auth/forgot-password` — generates a 6-digit code, stores it with
  a 15-minute expiry on the user record, and (since no email/SMS provider is
  connected yet) logs it server-side. In dev mode the response also includes
  the code directly so you can test end-to-end today.
- `POST /api/auth/reset-password` — verifies the code and updates the
  password.
- Screen now has a proper 2-step UI (email → code + new password) with real
  loading/error states.

### 5. Sold/earnings math was always zero on the Dashboard
`DashboardScreen` compared `order.seller === user.id`, but the orders API
returns `seller` as a **populated object** (`{_id, name, ...}`), not a raw ID
string — so this comparison was always `false` and total earnings/sold count
silently showed 0 for every seller, forever. Fixed to compare
`(order.seller?._id || order.seller) === user.id`.

### 6. Session didn't actually end when a token expired
When any API call came back `401` (expired/invalid token), the interceptor
cleared AsyncStorage but never told the app's in-memory auth state — so the
user stayed "logged in" on screen while every request silently failed,
instead of being bounced back to the Login screen. Added a small pub-sub hook
(`setUnauthorizedHandler`) so `AuthContext` is notified and clears the session
properly the moment this happens.

### 7. Sellers who needed a subscription were dropped on Home after signup
`SignupScreen` tried `navigation.replace("Subscription")` right after signup
— but at that exact moment the auth state flips and the whole navigator tree
swaps from `AuthStack` to `TabNavigator`, unmounting the very navigator that
call was targeting. The call silently failed (or errored), and
retailer/wholesaler/technician accounts landed on the Home tab with **no
prompt to subscribe at all**. Fixed with a proper pattern: `AuthContext`
tracks a `needsSubscription` flag set at signup, and the root navigator
(using a navigation ref + "retry until ready" check) redirects to the
Subscription screen the instant the fresh Tab navigator finishes mounting.

### 8. Parts category filter did nothing (filter chips were decorative only)
Two separate gaps combined into one dead feature:
- `SellScreen` had **no way to pick a part category** (Screen/Battery/
  Charger/etc.) when listing a part — the `tags` field was never sent.
- The backend `/api/listings` route accepted a `tag` query param from
  `PartsScreen`'s filter chips but **never used it** in the Mongo query.
Fixed both: added a required category chip-picker to the part listing form
(tags sent on create), and the backend now filters
`{ tags: <selected category> }` when `?tag=` is present.

### 9. Misleading `.env.example` for AI keys
The backend code calls Google's Gemini REST API directly
(`generativelanguage.googleapis.com`) using `GEMINI_API_KEY`, but
`.env.example` only documented `ANTHROPIC_API_KEY` — someone following the
example file would set the wrong variable and get silent auth failures.
Rewritten to clearly document `GEMINI_API_KEY` as the one that's actually
used, with a note on where to get a free key.

### 10. `require()`-based screen import instead of a real `import`
`App.js` loaded `ForgotPasswordScreen` via an inline
`require("./src/screens/auth/ForgotPasswordScreen").default` instead of a
top-level `import`. Works, but is non-standard, bypasses Metro's static
analysis/tree-shaking, and is inconsistent with every other screen in the
file. Converted to a normal import.

### 11. Missing autofocus on the search field it was supposedly wired for
`MarketplaceScreen` accepted a `route.params.focus` flag (sent by Home's
search bar tap) but never did anything with it. Added a ref + timed
`.focus()` so tapping "Search" on Home actually opens the keyboard on the
Marketplace search input, instead of just landing on the tab.

---

## ✅ Validation performed

Every `.js` file in both `mobile/` (frontend) and `mobile/backend/` was
parsed with a real Babel JSX/ESNext parser (not just `node --check`, which
turned out to silently accept broken JSX in this environment — confirmed with
a deliberately malformed test file). **All 23 frontend files and 15 backend
files parse cleanly with zero syntax errors** after every fix above.

---

## 🔧 Manual work still required before this is production-ready

1. **Real Cloudinary credentials** — `.env` currently has placeholder
   `CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`. Image upload will fail with
   an auth error from Cloudinary until you add real ones (free tier at
   cloudinary.com covers this easily).
2. **Real email/SMS delivery for password reset** — the new
   forgot-password flow generates and validates real codes, but currently
   only `console.log`s them server-side (documented in the route with a
   `TODO`). Wire a provider like Resend, SendGrid, or Twilio to actually
   deliver the code, then remove the `devCode` field from the response.
3. **Double-check your `GEMINI_API_KEY` value** — the one currently in
   `.env` starts with `AQ.` which doesn't match the usual Google AI Studio
   key format (`AIza...`). Verify it's active at
   https://aistudio.google.com/apikey.
4. **`JWT_SECRET`/`MONGODB_URI` must match your website's `.env`** exactly —
   this is what makes one login work on both platforms. Confirm both
   projects point at the same values before testing cross-platform login.
5. Nothing else new to install — no new dependencies were added, only
   existing ones (`multer`, `cloudinary`, `bcrypt`) got wired correctly.

---

## 📌 Suggested next module (pick one)

Given your real backend today, these are buildable *now* without inventing
fake data, in rough order of business value:

1. **Wishlist** — small addition (array on User + heart icon on ListingCard)
2. **Order status tracking screen** (Placed → Shipped → Delivered) — you
   already store `orderStatus`, just needs a seller-side "update status" UI
3. **Compare 2 listings side-by-side** — pure frontend, no new backend needed
4. **Push notifications** for order/offer updates (Expo push tokens)
5. **Repair booking module** — this is the biggest lift since it needs new
   backend models (technician availability, booking slots, pricing) from
   scratch

Tell me which one and I'll build it the same way — audited, wired end-to-end,
no dummy data.
