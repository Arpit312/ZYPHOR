import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { authAPI } from "../../api/api";

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0 = enter email, 1 = enter code + new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(null); // shown only in dev mode by backend

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
    if (!code || code.length !== 6) { Alert.alert("Invalid code", "Enter the 6-digit code."); return; }
    if (!newPassword || newPassword.length < 8) { Alert.alert("Weak password", "Password must be at least 8 characters."); return; }
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => (step === 1 ? setStep(0) : navigation.goBack())}>
          <Ionicons name="arrow-back" size={24} color={T.text.primary} />
        </TouchableOpacity>

        <View style={styles.content}>
          {step === 0 ? (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.sub}>Enter your email — we'll send a 6-digit reset code.</Text>

              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={T.text.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor={T.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={requestCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Code</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Enter Code</Text>
              <Text style={styles.sub}>
                We sent a 6-digit code to {email}. Enter it below along with your new password.
              </Text>
              {devCode && (
                <View style={styles.devBox}>
                  <Text style={styles.devText}>DEV MODE — reset code: {devCode}</Text>
                </View>
              )}

              <View style={styles.inputWrap}>
                <Ionicons name="keypad-outline" size={20} color={T.text.muted} />
                <TextInput
                  style={[styles.input, { letterSpacing: 6, fontWeight: "700" }]}
                  placeholder="6-digit code"
                  placeholderTextColor={T.text.muted}
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={T.text.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="New password (min. 8 characters)"
                  placeholderTextColor={T.text.muted}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPwd}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPwd((v) => !v)}>
                  <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={20} color={T.text.muted} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={resetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Reset Password</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.resendBtn} onPress={requestCode} disabled={loading}>
                <Text style={styles.resendText}>Didn't get a code? Resend</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  backBtn: { padding: 20, paddingTop: 60 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: "700", color: T.text.primary, marginBottom: 8 },
  sub: { fontSize: 14, color: T.text.secondary, marginBottom: 24, lineHeight: 20 },
  devBox: { backgroundColor: T.amber + "18", borderColor: T.amber + "40", borderWidth: 1, borderRadius: T.radius.md, padding: 10, marginBottom: 16 },
  devText: { color: T.amber, fontSize: 12, fontWeight: "600" },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: T.bg.secondary, borderRadius: T.radius.lg, paddingHorizontal: 16, height: 54, borderWidth: 1, borderColor: T.border.color, marginBottom: 16 },
  input: { flex: 1, color: T.text.primary, fontSize: 15, marginLeft: 10 },
  btn: { backgroundColor: T.primary, height: 54, borderRadius: T.radius.lg, justifyContent: "center", alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resendBtn: { alignItems: "center", marginTop: 16, padding: 8 },
  resendText: { color: T.primary, fontSize: 13, fontWeight: "600" },
});
