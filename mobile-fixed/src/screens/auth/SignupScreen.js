import React, { useState } from "react";
import {
  View,
  Text,
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
  { value: "customer", label: "Customer", icon: "person-outline", desc: "Buy certified phones with 48h escrow", free: true },
  { value: "retailer", label: "Retailer", icon: "storefront-outline", desc: "Sell & manage certified stock", free: false },
  { value: "wholesaler", label: "Wholesaler", icon: "cube-outline", desc: "Bulk device lots & lots", free: false },
  { value: "technician", label: "Technician", icon: "construct-outline", desc: "OEM parts & repair lab", free: false },
];

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    city: "",
    businessName: "",
    gstNumber: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const { t, locale } = useTranslation();

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    const r = await signup({ ...form, role });
    setLoading(false);
    if (!r.success) {
      setError(r.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.canvas} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Join ZYPHOR — The benchmark in certified refurbished tech
          </Text>

          {/* Stepper */}
          <View style={styles.stepsRow}>
            <View style={[styles.stepItem, step === 0 && styles.stepItemActive]}>
              <Text style={[styles.stepItemText, step === 0 && styles.stepItemTextActive]}>
                1. Account Role
              </Text>
            </View>
            <View style={[styles.stepItem, step === 1 && styles.stepItemActive]}>
              <Text style={[styles.stepItemText, step === 1 && styles.stepItemTextActive]}>
                2. Details
              </Text>
            </View>
          </View>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={16} color={tokens.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {step === 0 ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Select your account role</Text>
            <Text style={styles.stepSub}>Individual buyers join free. Merchants access trade tools.</Text>

            <View style={{ gap: 12, marginTop: 16 }}>
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setRole(r.value)}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
                      <Ionicons
                        name={r.icon}
                        size={22}
                        color={active ? "#FFFFFF" : tokens.colors.ink}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.roleCardTitle, active && styles.roleCardTitleActive]}>
                          {r.label}
                        </Text>
                        {r.free && (
                          <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>FREE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.roleCardDesc}>{r.desc}</Text>
                    </View>
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={active ? tokens.colors.accent : tokens.colors.border}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Btn
              title="Continue to Details"
              onPress={() => setStep(1)}
              variant="primary"
              rightIcon="arrow-forward"
              style={{ marginTop: 24 }}
            />
          </View>
        ) : (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Complete your profile</Text>
            <Text style={styles.stepSub}>Signing up as {role.toUpperCase()}</Text>

            <View style={{ marginTop: 16 }}>
              <Input
                label="Full Name"
                icon="person-outline"
                placeholder="e.g. Arpit Pathak"
                value={form.name}
                onChangeText={set("name")}
              />

              <Input
                label="Mobile Phone"
                icon="call-outline"
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={set("phone")}
              />

              <Input
                label="Email Address"
                icon="mail-outline"
                placeholder="e.g. arpit@zyphor.store"
                autoCapitalize="none"
                keyboardType="email-address"
                value={form.email}
                onChangeText={set("email")}
              />

              <Input
                label="Password"
                icon="lock-closed-outline"
                placeholder="At least 8 characters"
                secureTextEntry={!showPwd}
                value={form.password}
                onChangeText={set("password")}
                right={
                  <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ padding: 6 }}>
                    <Ionicons
                      name={showPwd ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={tokens.colors.textSecondary}
                    />
                  </TouchableOpacity>
                }
              />

              <Input
                label="City / Pincode"
                icon="location-outline"
                placeholder="e.g. Mumbai, 400001"
                value={form.city}
                onChangeText={set("city")}
              />

              {role !== "customer" && (
                <View>
                  <Input
                    label="Business Name"
                    icon="business-outline"
                    placeholder="e.g. Arpit Tech Hub"
                    value={form.businessName}
                    onChangeText={set("businessName")}
                  />
                  <Input
                    label="GSTIN / Trade License (Optional)"
                    icon="document-text-outline"
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    autoCapitalize="characters"
                    value={form.gstNumber}
                    onChangeText={set("gstNumber")}
                  />
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <Btn
                  title="Back"
                  onPress={() => setStep(0)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Btn
                  title="Complete Signup"
                  onPress={handleSignup}
                  loading={loading}
                  variant="gold"
                  style={{ flex: 2 }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footerRow}>
          <Text style={styles.footerPrompt}>{t("have_account")} </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")} activeOpacity={0.7}>
            <Text style={styles.footerLink}>{t("sign_in")}</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    marginTop: 3,
  },
  stepsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  stepItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: tokens.colors.borderLight,
  },
  stepItemActive: {
    borderBottomColor: tokens.colors.accent,
  },
  stepItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.textMuted,
  },
  stepItemTextActive: {
    color: tokens.colors.ink,
    fontWeight: "700",
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
  stepContent: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  stepHeading: {
    fontSize: 17,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  stepSub: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  roleCardActive: {
    borderColor: tokens.colors.ink,
    backgroundColor: "#FFFFFF",
    ...tokens.shadow.subtle,
  },
  roleIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  roleIconWrapActive: {
    backgroundColor: tokens.colors.ink,
    borderColor: tokens.colors.ink,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  roleCardTitleActive: {
    color: tokens.colors.ink,
  },
  roleCardDesc: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  freeBadge: {
    backgroundColor: tokens.colors.successBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: tokens.colors.success,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
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
});
