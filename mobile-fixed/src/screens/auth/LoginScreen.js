import React, { useState } from "react";
import {
  View,
  Text,
  Image,
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
  { value: "customer", label: "Customer", icon: "person-outline", desc: "Buy Certified Phones" },
  { value: "retailer", label: "Retailer", icon: "storefront-outline", desc: "Sell & Earn" },
  { value: "wholesaler", label: "Wholesaler", icon: "cube-outline", desc: "Bulk Lots" },
  { value: "technician", label: "Technician", icon: "construct-outline", desc: "Parts & Service" },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const selectedRoleObj = ROLES.find((r) => r.value === selectedRole);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in your email and password");
      return;
    }
    setLoading(true);
    setError("");
    const r = await login(email, password, selectedRole);
    setLoading(false);
    if (!r.success) setError(r.message);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Editorial Top Brand Header (Mōnolith Aesthetic) */}
        <View style={styles.brandContainer}>
          <View style={styles.symbolWrap}>
            <Image
              source={require("../../../assets/symbol-white.png")}
              style={styles.symbolImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTitle}>ZYPHOR</Text>
          <Text style={styles.brandSubtitle}>
            Certified refurbished smartphones & precision electronics. Objects verified not just to perform, but to define intentional living.
          </Text>
        </View>

        {/* Role Selection Pills */}
        <View style={styles.roleContainer}>
          <Text style={styles.sectionHeading}>Account Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleScroll}>
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
                    size={15}
                    color={active ? "#FFFFFF" : T.text.secondary}
                  />
                  <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Form Body */}
        <View style={styles.formCard}>
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={16} color={T.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry={!showPwd}
            editable={!loading}
            right={
              <TouchableOpacity onPress={() => setShowPwd((v) => !v)} disabled={loading}>
                <Ionicons
                  name={showPwd ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={T.text.secondary}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Btn
            title={`Sign in as ${selectedRoleObj?.label}`}
            onPress={handleLogin}
            loading={loading}
            icon="arrow-forward"
            style={{ marginTop: 8 }}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or</Text>
            <View style={styles.divLine} />
          </View>

          {/* Create Account Link */}
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => navigation.navigate("Signup")}
            disabled={loading}
          >
            <Text style={styles.signupText}>
              New to ZYPHOR? <Text style={styles.signupLink}>Create account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={T.text.secondary} />
          <Text style={styles.footerNoteText}>
            Universal Account: Sign in to both Web & Mobile App
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },

  brandContainer: { marginBottom: 28 },
  symbolWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  symbolImg: { width: 24, height: 24 },
  brandTitle: {
    fontSize: 42,
    fontWeight: "900",
    color: T.text.primary,
    letterSpacing: -1,
    lineHeight: 46
  },
  brandSubtitle: {
    fontSize: 14,
    color: T.text.secondary,
    lineHeight: 22,
    marginTop: 10,
    fontWeight: "400"
  },

  roleContainer: { marginBottom: 20 },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: T.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10
  },
  roleScroll: { gap: 8 },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color
  },
  rolePillActive: {
    backgroundColor: T.primary,
    borderColor: T.primary
  },
  rolePillText: { fontSize: 13, fontWeight: "600", color: T.text.secondary },
  rolePillTextActive: { color: "#FFFFFF" },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border.color,
    padding: 20,
    ...T.shadow.card
  },
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

  forgotBtn: { alignSelf: "flex-end", marginBottom: 12, marginTop: -4 },
  forgotText: { fontSize: 12, color: T.text.secondary, fontWeight: "500" },

  divider: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  divLine: { flex: 1, height: 1, backgroundColor: T.border.color },
  divText: { marginHorizontal: 12, fontSize: 12, color: T.text.secondary, textTransform: "lowercase" },

  signupBtn: { alignItems: "center", paddingVertical: 6 },
  signupText: { fontSize: 14, color: T.text.secondary },
  signupLink: { color: T.text.primary, fontWeight: "700" },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24
  },
  footerNoteText: { fontSize: 12, color: T.text.secondary }
});
