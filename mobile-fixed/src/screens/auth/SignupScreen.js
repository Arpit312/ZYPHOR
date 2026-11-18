import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Btn, Input } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const ROLES = [
  { value: "customer", label: "Customer", icon: "person-outline", desc: "Buy & sell certified phones", free: true },
  { value: "retailer", label: "Retailer", icon: "storefront-outline", desc: "Sell & manage storefront", free: false },
  { value: "wholesaler", label: "Wholesaler", icon: "cube-outline", desc: "Bulk device lots", free: false },
  { value: "technician", label: "Technician", icon: "construct-outline", desc: "Parts & repair network", free: false },
];

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", businessName: "", gstNumber: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={T.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            Join ZYPHOR — The standard in certified refurbished tech
          </Text>

          {/* Stepper */}
          <View style={styles.stepsRow}>
            <View style={[styles.stepItem, step === 0 && styles.stepItemActive]}>
              <Text style={[styles.stepItemText, step === 0 && styles.stepItemTextActive]}>1. Account Role</Text>
            </View>
            <View style={[styles.stepItem, step === 1 && styles.stepItemActive]}>
              <Text style={[styles.stepItemText, step === 1 && styles.stepItemTextActive]}>2. Personal Details</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        {step === 0 ? (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Select your account role</Text>
            <Text style={styles.stepSub}>Individual buyers join free. Merchants access trade tools.</Text>

            <View style={styles.roleGrid}>
              {ROLES.map((r) => {
                const active = role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.roleCard, active && styles.roleCardActive]}
                    onPress={() => setRole(r.value)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
                      <Ionicons name={r.icon} size={22} color={active ? "#FFFFFF" : T.primary} />
                    </View>
                    <Text style={styles.roleLabel}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                    <View style={[styles.freeTag, { backgroundColor: r.free ? "#E8F5E9" : T.bg.secondary }]}>
                      <Text style={[styles.freeTagText, { color: r.free ? T.green : T.text.secondary }]}>
                        {r.free ? "FREE ACCESS" : "TRADE PLAN"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Btn title="Continue to Details →" onPress={() => setStep(1)} style={{ marginTop: 12 }} />
          </View>
        ) : (
          <View style={styles.stepContent}>
            <Text style={styles.stepHeading}>Complete your profile</Text>
            <Text style={styles.stepSub}>Your credentials work across website and mobile app.</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={T.red} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Full Name *"
              placeholder="Rahul Sharma"
              value={form.name}
              onChangeText={set("name")}
              icon="person-outline"
            />
            <Input
              label="Email Address *"
              placeholder="name@example.com"
              value={form.email}
              onChangeText={set("email")}
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password (8+ chars) *"
              placeholder="Create password"
              value={form.password}
              onChangeText={set("password")}
              icon="lock-closed-outline"
              secureTextEntry={!showPwd}
              right={
                <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                  <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color={T.text.secondary} />
                </TouchableOpacity>
              }
            />
            <Input
              label="City"
              placeholder="Mumbai"
              value={form.city}
              onChangeText={set("city")}
              icon="location-outline"
            />
            {role !== "customer" && (
              <Input
                label="Business / Store Name"
                placeholder="TechHub Enterprises"
                value={form.businessName}
                onChangeText={set("businessName")}
                icon="storefront-outline"
              />
            )}
            {(role === "retailer" || role === "wholesaler") && (
              <Input
                label="GST Number (optional)"
                placeholder="22AAAAA0000A1Z5"
                value={form.gstNumber}
                onChangeText={set("gstNumber")}
                icon="document-text-outline"
              />
            )}

            <Btn title="Create Account →" onPress={handleSignup} loading={loading} style={{ marginTop: 8 }} />
            <TouchableOpacity style={{ alignItems: "center", marginTop: 14 }} onPress={() => setStep(0)}>
              <Text style={{ fontSize: 13, color: T.text.secondary, fontWeight: "500" }}>← Change role</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer sign in link */}
        <TouchableOpacity style={styles.loginFooter} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginFooterText}>
            Already have an account? <Text style={styles.loginLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 24, paddingTop: 54, paddingBottom: 40 },

  header: { marginBottom: 24 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border.color
  },
  headerTitle: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: T.text.secondary, marginTop: 4, lineHeight: 18 },

  stepsRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  stepItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color
  },
  stepItemActive: { backgroundColor: T.primary, borderColor: T.primary },
  stepItemText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  stepItemTextActive: { color: "#FFFFFF" },

  stepContent: { marginTop: 4 },
  stepHeading: { fontSize: 18, fontWeight: "700", color: T.text.primary },
  stepSub: { fontSize: 13, color: T.text.secondary, marginTop: 4, marginBottom: 18 },

  roleGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  roleCard: {
    width: "48%",
    backgroundColor: T.bg.secondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: T.border.color,
  },
  roleCardActive: {
    borderColor: T.primary,
    backgroundColor: "#FFFFFF",
    ...T.shadow.card
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border.color
  },
  roleIconWrapActive: {
    backgroundColor: T.primary,
    borderColor: T.primary
  },
  roleLabel: { fontSize: 14, fontWeight: "700", color: T.text.primary, marginBottom: 2 },
  roleDesc: { fontSize: 11, color: T.text.secondary, marginBottom: 8, lineHeight: 15 },
  freeTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, alignSelf: "flex-start" },
  freeTagText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 14
  },
  errorText: { fontSize: 13, color: T.red, flex: 1, fontWeight: "500" },

  loginFooter: { alignItems: "center", marginTop: 24 },
  loginFooterText: { fontSize: 13, color: T.text.secondary },
  loginLink: { color: T.text.primary, fontWeight: "700" }
});
