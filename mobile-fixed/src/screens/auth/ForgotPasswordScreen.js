import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { authAPI } from "../../api/api";
import { Btn, Input } from "../../components/UI";

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0: request code, 1: verify & reset
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState(null);

  const requestCode = async () => {
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid registered email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(email.trim().toLowerCase());
      setDevCode(res.data?.devCode || null);
      setStep(1);
      Alert.alert("Code Sent", res.data?.message || "If this email is registered, a reset code has been sent.");
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || "Could not send reset code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!code.trim() || !newPassword.trim()) {
      Alert.alert("Required Fields", "Please enter the code and new password.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Password Length", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });
      Alert.alert("✓ Success", "Your password has been reset. Please sign in with your new password.", [
        { text: "Sign In", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (e) {
      Alert.alert("Reset Failed", e.response?.data?.error || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Password Recovery</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={32} color={tokens.colors.accentStrong} />
          </View>

          <Text style={styles.title}>
            {step === 0 ? "Reset Account Password" : "Enter Verification Code"}
          </Text>
          <Text style={styles.subtitle}>
            {step === 0
              ? "Enter your registered email address to receive a secure 6-digit recovery code."
              : `Enter the 6-digit code sent to ${email} and set your new password.`}
          </Text>

          {step === 0 ? (
            <View style={{ width: "100%" }}>
              <Input
                label="Registered Email"
                icon="mail-outline"
                placeholder="name@zyphor.store"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <Btn
                title="Send Recovery Code"
                onPress={requestCode}
                loading={loading}
                variant="primary"
                style={{ marginTop: 8 }}
              />
            </View>
          ) : (
            <View style={{ width: "100%" }}>
              {devCode ? (
                <View style={styles.devCodeBox}>
                  <Text style={styles.devCodeText}>Testing Code: {devCode}</Text>
                </View>
              ) : null}

              <Input
                label="6-Digit Reset Code"
                icon="shield-checkmark-outline"
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
              <Input
                label="New Password (8+ characters)"
                icon="lock-closed-outline"
                placeholder="••••••••"
                secureTextEntry={!showPwd}
                value={newPassword}
                onChangeText={setNewPassword}
                right={
                  <TouchableOpacity onPress={() => setShowPwd(!showPwd)}>
                    <Ionicons
                      name={showPwd ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color={tokens.colors.textSecondary}
                    />
                  </TouchableOpacity>
                }
              />

              <Btn
                title="Set New Password"
                onPress={resetPassword}
                loading={loading}
                variant="gold"
                style={{ marginTop: 8 }}
              />

              <TouchableOpacity onPress={() => setStep(0)} style={styles.changeEmailBtn}>
                <Text style={styles.changeEmailText}>Use different email address</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },

  scroll: { padding: 20 },
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },

  devCodeBox: {
    backgroundColor: tokens.colors.accentSoft,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  devCodeText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },
  changeEmailBtn: {
    alignItems: "center",
    marginTop: 14,
    padding: 6,
  },
  changeEmailText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },
});
