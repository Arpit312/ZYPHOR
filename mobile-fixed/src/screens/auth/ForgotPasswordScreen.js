import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { authAPI } from "../../api/api";
import { Btn } from "../../components/UI";

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(null);

  const requestCode = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email.trim().toLowerCase());
      setDevCode(res.data?.devCode || null);
      setStep(1);
      Alert.alert("Code sent", res.data?.message || "If this email is registered, a reset code has been sent.");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || "Could not send reset code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Invalid code", "Enter the 6-digit code.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({ email: email.trim().toLowerCase(), code, newPassword });
      Alert.alert("Success", "Password reset successfully. Please log in.", [
        { text: "OK", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || "Could not reset password. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (step === 1 ? setStep(0) : navigation.goBack())}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={T.primary} />
        </TouchableOpacity>

        <View style={styles.content}>
          {step === 0 ? (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.sub}>
                Enter your account email. We'll send a 6-digit verification code to reset your password.
              </Text>

              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={T.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <Btn title="Send Reset Code →" onPress={requestCode} loading={loading} style={{ marginTop: 14 }} />
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter Security Code</Text>
              <Text style={styles.sub}>
                We sent a 6-digit code to {email}. Enter it below along with your new password.
              </Text>

              {devCode && (
                <View style={styles.devBox}>
                  <Text style={styles.devText}>Demo code: {devCode}</Text>
                </View>
              )}

              <View style={styles.inputWrap}>
                <Ionicons name="keypad-outline" size={18} color={T.text.secondary} />
                <TextInput
                  style={[styles.input, { letterSpacing: 6, fontWeight: "700" }]}
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={[styles.inputWrap, { marginTop: 12 }]}>
                <Ionicons name="lock-closed-outline" size={18} color={T.text.secondary} />
                <TextInput
                  style={styles.input}
                  placeholder="New password (8+ characters)"
                  placeholderTextColor="#9CA3AF"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPwd}
                />
                <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                  <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color={T.text.secondary} />
                </TouchableOpacity>
              </View>

              <Btn title="Update Password →" onPress={resetPassword} loading={loading} style={{ marginTop: 14 }} />

              <TouchableOpacity style={styles.resendBtn} onPress={requestCode} disabled={loading}>
                <Text style={styles.resendText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  scroll: { paddingHorizontal: 24, paddingTop: 54, paddingBottom: 40, flexGrow: 1 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: T.border.color
  },
  content: { marginTop: 10 },
  title: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: T.text.secondary, marginTop: 8, marginBottom: 24, lineHeight: 22 },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 10
  },
  input: { flex: 1, fontSize: 14, color: T.text.primary, paddingVertical: 10 },
  devBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#DCFCE7"
  },
  devText: { fontSize: 12, color: T.green, fontWeight: "600" },
  resendBtn: { alignItems: "center", marginTop: 16 },
  resendText: { fontSize: 13, color: T.text.secondary, fontWeight: "500" }
});
