import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const translations = {
  en: {
    // App & Tagline
    app_name: "ZYPHOR",
    tagline: "Certified Refurbished & Precision Electronics",
    curated_tagline: "Verified not just to perform, but to define intentional living.",
    
    // Auth
    login_title: "Sign in to ZYPHOR",
    login_subtitle: "Access certified inventory, active orders & digital passports.",
    phone_number: "Phone Number",
    phone_placeholder: "Enter 10-digit mobile number",
    send_otp: "Get Verification Code",
    verify_otp: "Verify & Continue",
    enter_otp: "Enter 6-digit OTP",
    resend_otp: "Resend Code",
    or_continue_with: "or continue with",
    google_sign_in: "Continue with Google",
    use_password_login: "Use Email & Password instead",
    use_otp_login: "Use Phone OTP instead",
    email_address: "Email address",
    password: "Password",
    sign_in: "Sign In",
    sign_up: "Create Account",
    no_account: "New to ZYPHOR?",
    have_account: "Already registered?",
    forgot_password: "Forgot password?",
    terms_agree: "By continuing, you agree to ZYPHOR's Terms of Service & Privacy Policy.",
    
    // Navigation
    tab_home: "Home",
    tab_marketplace: "Shop",
    tab_sell: "Sell",
    tab_orders: "Orders",
    tab_profile: "Profile",

    // Trust & Value Props
    verified_45_point: "45-Point Certified",
    warranty_6_month: "6-Month Warranty",
    escrow_protection: "48-Hour Approval Window",
    free_delivery: "Free Doorstep Delivery",
    battery_health: "Battery Health",
    purity_guarantee: "100% Genuine Parts Guarantee",

    // Actions
    add_to_cart: "Add to Bag",
    buy_now: "Buy Now",
    sell_now: "Get Instant Quote",
    view_details: "View Inspection",
    track_order: "Track Order",
    accept_device: "Accept Device",
    raise_dispute: "Return or Raise Issue",
    download_invoice: "Invoice PDF",
    apply_coupon: "Apply",
    checkout: "Proceed to Checkout",
    continue_btn: "Continue",
    back_to_shop: "Continue Shopping",

    // Grades
    grade_pristine: "Pristine (Like New)",
    grade_excellent: "Excellent",
    grade_good: "Good",
    grade_fair: "Fair",

    // Sections
    deals_of_day: "Deal of the Day",
    featured_collection: "Verified Flagships",
    brand_spotlight: "Official Brand Rails",
    sell_banner_title: "Sell Your Old Phone",
    sell_banner_sub: "Instant AI valuation with free same-day doorstep pickup.",
    recently_viewed: "Recently Viewed",
    customer_reviews: "Verified Buyer Reviews",

    // Settings & Profile
    settings: "Settings",
    language: "Language",
    language_en: "English",
    language_hi: "हिंदी (Hindi)",
    dark_mode: "Dark Appearance",
    help_support: "Help Centre & Legal",
    delete_account: "Delete Account",
    logout: "Log Out",
    my_addresses: "Saved Addresses",
    wishlist: "Saved Items",
    device_passport: "Digital Device Passport",
  },
  hi: {
    // App & Tagline
    app_name: "ZYPHOR",
    tagline: "प्रमाणित नवीनीकृत स्मार्टफ़ोन और इलेक्ट्रॉनिक्स",
    curated_tagline: "सिर्फ काम करने के लिए नहीं, एक प्रीमियम अनुभव के लिए प्रमाणित।",
    
    // Auth
    login_title: "ZYPHOR में साइन इन करें",
    login_subtitle: "प्रमाणित इन्वेंट्री, अपने ऑर्डर्स और डिजिटल पासपोर्ट देखें।",
    phone_number: "फ़ोन नंबर",
    phone_placeholder: "10 अंकों का मोबाइल नंबर दर्ज करें",
    send_otp: "ओटीपी प्राप्त करें",
    verify_otp: "सत्यापित करें और आगे बढ़ें",
    enter_otp: "6 अंकों का ओटीपी दर्ज करें",
    resend_otp: "कोड पुनः भेजें",
    or_continue_with: "या इसके साथ जारी रखें",
    google_sign_in: "Google के साथ जारी रखें",
    use_password_login: "ईमेल और पासवर्ड का उपयोग करें",
    use_otp_login: "फ़ोन ओटीपी का उपयोग करें",
    email_address: "ईमेल पता",
    password: "पासवर्ड",
    sign_in: "साइन इन करें",
    sign_up: "खाता बनाएं",
    no_account: "ZYPHOR पर नए हैं?",
    have_account: "पहले से खाता है?",
    forgot_password: "पासवर्ड भूल गए?",
    terms_agree: "आगे बढ़कर, आप ZYPHOR की सेवा की शर्तें और गोपनीयता नीति से सहमत होते हैं।",

    // Navigation
    tab_home: "होम",
    tab_marketplace: "खरीदें",
    tab_sell: "बेचें",
    tab_orders: "ऑर्डर्स",
    tab_profile: "प्रोफ़ाइल",

    // Trust & Value Props
    verified_45_point: "45-बिंदु प्रमाणित जांच",
    warranty_6_month: "6 महीने की वारंटी",
    escrow_protection: "48 घंटे अनुमोदन विंडो",
    free_delivery: "मुफ़्त डोरस्टेप डिलीवरी",
    battery_health: "बैटरी स्वास्थ्य",
    purity_guarantee: "100% असली पुर्जों की गारंटी",

    // Actions
    add_to_cart: "बैग में जोड़ें",
    buy_now: "अभी खरीदें",
    sell_now: "तुरंत मूल्य पाएं",
    view_details: "जांच रिपोर्ट देखें",
    track_order: "ऑर्डर ट्रैक करें",
    accept_device: "डिवाइस स्वीकार करें",
    raise_dispute: "वापसी या शिकायत दर्ज करें",
    download_invoice: "इनवॉइस पीडीएफ",
    apply_coupon: "लागू करें",
    checkout: "भुगतान के लिए आगे बढ़ें",
    continue_btn: "जारी रखें",
    back_to_shop: "खरीदारी जारी रखें",

    // Grades
    grade_pristine: "प्रिस्टीन (एकदम नया जैसा)",
    grade_excellent: "उत्कृष्ट (एक्सीलेंट)",
    grade_good: "अच्छा (गुड)",
    grade_fair: "साधारण (फेयर)",

    // Sections
    deals_of_day: "आज की विशेष डील",
    featured_collection: "सत्यापित फ्लैगशिप फ़ोन",
    brand_spotlight: "प्रमुख ब्रांड्स",
    sell_banner_title: "अपना पुराना फ़ोन बेचें",
    sell_banner_sub: "मुफ़्त पिकअप और तुरंत यूपीआई भुगतान के साथ एआई मूल्यांकन।",
    recently_viewed: "हाल ही में देखे गए",
    customer_reviews: "सत्यापित खरीदार समीक्षाएं",

    // Settings & Profile
    settings: "सेटिंग्स",
    language: "भाषा (Language)",
    language_en: "English",
    language_hi: "हिंदी (Hindi)",
    dark_mode: "डार्क मोड",
    help_support: "सहायता केंद्र और नियम",
    delete_account: "खाता हटाएं",
    logout: "लॉग आउट",
    my_addresses: "सहेजे गए पते",
    wishlist: "पसंदीदा सूची",
    device_passport: "डिजिटल डिवाइस पासपोर्ट",
  },
};

const I18nContext = createContext({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => key,
});

export const I18nProvider = ({ children }) => {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("zyphor_locale");
        if (saved === "en" || saved === "hi") {
          setLocaleState(saved);
        }
      } catch {}
    })();
  }, []);

  const setLocale = async (newLocale) => {
    setLocaleState(newLocale);
    try {
      await AsyncStorage.setItem("zyphor_locale", newLocale);
    } catch {}
  };

  const toggleLocale = () => {
    const next = locale === "en" ? "hi" : "en";
    setLocale(next);
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
export default I18nContext;
