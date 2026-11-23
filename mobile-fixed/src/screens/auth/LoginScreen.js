import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn, Input } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";

const ROLES = [
  { value: "customer", label: "Customer", icon: "person-outline" },
  { value: "retailer", label: "Retailer", icon: "storefront-outline" },
  { value: "wholesaler", label: "Wholesaler", icon: "cube-outline" },
  { value: "technician", label: "Technician", icon: "construct-outline" },
];

export default function LoginScreen({ navigation }) {
  const [authMode, setAuthMode] = useState("otp"); // "otp" or "password"
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Email/password fallback state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPwd, setShowPwd] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, loginWithOTP } = useAuth();
  const { t, locale, toggleLocale } = useTranslation();

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = () => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setResendTimer(30);
    }, 600);
  };

  const handleVerifyOTP = async () => {
    if (otpCode.trim().length < 4) {
      setError("Please enter the verification code");
      return;
    }
    setLoading(true);
    setError("");
    const r = await loginWithOTP(phone, otpCode, selectedRole);
    setLoading(false);
    if (!r.success) {
      setError(r.message);
    }
  };

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }
    setLoading(true);
    setError("");
    const r = await login(email, password, selectedRole);
    setLoading(false);
    if (!r.success) {
      setError(r.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("Google Sign-In will connect to OAuth in production. Signing in with demo session...");
    setLoading(true);
    setTimeout(async () => {
      await loginWithOTP("9999900001", "123456", selectedRole);
      setLoading(false);
    }, 800);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.canvas} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header with Language Switcher */}
        <View style={styles.topRow}>
          <TouchableOpacity onPress={toggleLocale} style={styles.langPill} activeOpacity={0.75}>
            <Ionicons name="globe-outline" size={14} color={tokens.colors.ink} />
            <Text style={styles.langText}>{locale === "en" ? "EN / HI" : "HI / EN"}</Text>
          </TouchableOpacity>
        </View>

        {/* Brand Editorial Header */}
        <View style={styles.brandContainer}>
          <View style={styles.symbolWrap}>
            <Image
              source={require("../../../assets/symbol-white.png")}
              style={styles.symbolImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>{t("app_name")}</Text>
          <Text style={styles.brandSubtitle}>{t("tagline")}</Text>
        </View>

        {/* Account Role Selector */}
        <View style={styles.roleContainer}>
          <Text style={styles.sectionHeading}>Account Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleScroll}
          >
            {ROLES.map((r) => {
              const active = selectedRole === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  onPress={() => setSelectedRole(r.value)}
                  style={[styles.rolePill, active && styles.rolePillActive]}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={r.icon}
                    size={14}
                    color={active ? "#FFFFFF" : tokens.colors.textSecondary}
                  />
                  <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={tokens.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {authMode === "otp" ? (
            /* ─── Phone OTP Mode ─── */
            <View>
              {!otpSent ? (
                <View>
                  <Input
                    label={t("phone_number")}
                    icon="call-outline"
                    placeholder="98765 43210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(val) => {
                      setPhone(val);
                      if (error) setError("");
                    }}
                    helper="We'll send an SMS code to verify your device"
                  />
                  <Btn
                    title={t("send_otp")}
                    onPress={handleSendOTP}
                    loading={loading}
                    variant="primary"
                    rightIcon="arrow-forward"
                    style={{ marginTop: 8 }}
                  />
                </View>
              ) : (
                <View>
                  <View style={styles.otpHeader}>
                    <Text style={styles.otpPrompt}>Code sent to +91 {phone}</Text>
                    <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.changePhoneBtn}>
                      <Text style={styles.changePhoneText}>Change</Text>
                    </TouchableOpacity>
                  </View>

                  <Input
                    label={t("enter_otp")}
                    icon="shield-checkmark-outline"
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otpCode}
                    onChangeText={setOtpCode}
                    helper="Enter demo code 123456"
                  />

                  <Btn
                    title={t("verify_otp")}
                    onPress={handleVerifyOTP}
                    loading={loading}
                    variant="gold"
                    style={{ marginTop: 8 }}
                  />

                  <View style={styles.resendRow}>
                    {resendTimer > 0 ? (
                      <Text style={styles.resendTimerText}>Resend code in {resendTimer}s</Text>
                    ) : (
                      <TouchableOpacity onPress={handleSendOTP} activeOpacity={0.7}>
                        <Text style={styles.resendBtnText}>{t("resend_otp")}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Social Login & Password Toggle */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t("or_continue_with")}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={handleGoogleSignIn}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={17} color={tokens.colors.ink} />
                <Text style={styles.googleBtnText}>{t("google_sign_in")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setAuthMode("password");
                  setError("");
                }}
                style={styles.modeSwitchBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="key-outline" size={15} color={tokens.colors.accentStrong} />
                <Text style={styles.modeSwitchText}>{t("use_password_login")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* ─── Email & Password Mode ─── */
            <View>
              <Input
                label={t("email_address")}
                icon="mail-outline"
                placeholder="name@zyphor.store"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError("");
                }}
              />

              <Input
                label={t("password")}
                icon="lock-closed-outline"
                placeholder="••••••••"
                secureTextEntry={!showPwd}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (error) setError("");
                }}
                right={
                  <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={styles.eyeBtn}>
                    <Ionicons
                      name={showPwd ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={tokens.colors.textSecondary}
                    />
                  </TouchableOpacity>
                }
              />

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                style={styles.forgotBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotText}>{t("forgot_password")}</Text>
              </TouchableOpacity>

              <Btn
                title={`Sign In as ${ROLES.find((r) => r.value === selectedRole)?.label}`}
                onPress={handlePasswordLogin}
                loading={loading}
                variant="primary"
                style={{ marginTop: 4 }}
              />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t("or_continue_with")}</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={() => {
                  setAuthMode("otp");
                  setError("");
                }}
                style={styles.modeSwitchBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="phone-portrait-outline" size={15} color={tokens.colors.accentStrong} />
                <Text style={styles.modeSwitchText}>{t("use_otp_login")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Footer Signup Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>{t("no_account")} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")} activeOpacity={0.7}>
              <Text style={styles.footerLink}>{t("sign_up")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Regulatory & Safety Footer */}
        <Text style={styles.termsNotice}>{t("terms_agree")}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 36,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  langText: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  symbolWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.accent,
    ...tokens.shadow.card,
  },
  symbolImg: {
    width: 28,
    height: 28,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2,
    color: tokens.colors.ink,
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  roleContainer: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  roleScroll: {
    gap: 8,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  rolePillActive: {
    backgroundColor: tokens.colors.ink,
    borderColor: tokens.colors.ink,
  },
  rolePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
  },
  rolePillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: tokens.colors.errorBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: tokens.colors.error + "30",
  },
  errorText: {
    fontSize: 12,
    color: tokens.colors.error,
    fontWeight: "600",
    flex: 1,
  },
  otpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  otpPrompt: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: "500",
  },
  changePhoneBtn: {
    padding: 2,
  },
  changePhoneText: {
    fontSize: 12,
    color: tokens.colors.accentStrong,
    fontWeight: "700",
  },
  resendRow: {
    alignItems: "center",
    marginTop: 14,
  },
  resendTimerText: {
    fontSize: 12,
    color: tokens.colors.textMuted,
  },
  resendBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: tokens.colors.borderLight,
  },
  dividerText: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    marginHorizontal: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    borderRadius: 14,
    paddingVertical: 13,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  modeSwitchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 6,
  },
  modeSwitchText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },
  eyeBtn: {
    padding: 6,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 14,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  footerPrompt: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  termsNotice: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
