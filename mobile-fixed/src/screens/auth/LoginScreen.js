import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  FlatList
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Btn, Input } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

const ROLES = [
  {
    value: "customer",
    label: "Customer",
    icon: "person-outline",
    desc: "Buy phones freely",
    color: "#10B981",
    bgColor: "#10B98120",
    borderColor: "#10B98180"
  },
  {
    value: "retailer",
    label: "Retailer",
    icon: "storefront-outline",
    desc: "Sell & earn money",
    color: "#3B82F6",
    bgColor: "#3B82F620",
    borderColor: "#3B82F680"
  },
  {
    value: "wholesaler",
    label: "Wholesaler",
    icon: "cube-outline",
    desc: "Bulk sales",
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    borderColor: "#F59E0B80"
  },
  {
    value: "technician",
    label: "Technician",
    icon: "construct-outline",
    desc: "Parts & repair",
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    borderColor: "#8B5CF680"
  }
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const { login } = useAuth();

  const selectedRoleObj = ROLES.find(r => r.value === selectedRole);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    const r = await login(email, password, selectedRole);
    setLoading(false);
    if (!r.success) setError(r.message);
  };

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setShowRoleModal(false);
  };

  // Animate modal entrance
  React.useEffect(() => {
    if (showRoleModal) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [showRoleModal]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#0B1220", "#16233D", "#1F2937"]}
          style={styles.hero}
        >
          <View style={styles.logoRow}>
            <View style={styles.logoBg}>
              <Ionicons name="scan-outline" size={32} color={T.green} />
            </View>
            <Text style={styles.logo}>ZYPHOR</Text>
          </View>
          <Text style={styles.tagline}>India's most trusted phone marketplace</Text>
        </LinearGradient>

        {/* Form Container */}
        <View style={styles.form}>
          <Text style={styles.heading}>Welcome back</Text>
          <Text style={styles.subheading}>Log in with your role</Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={T.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Role Selection - TAB STYLE */}
          <View style={styles.roleSectionLabel}>
            <Text style={styles.roleLabelText}>Select Your Role</Text>
            <Text style={styles.roleSubText}>Choose to continue</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleScroll}
            scrollEventThrottle={16}
          >
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleTab,
                  selectedRole === role.value
                    ? [
                        styles.roleTabActive,
                        { borderBottomColor: role.color, backgroundColor: role.bgColor }
                      ]
                    : styles.roleTabInactive
                ]}
                onPress={() => handleSelectRole(role.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.roleTabIcon,
                    { backgroundColor: role.bgColor, borderColor: role.color }
                  ]}
                >
                  <Ionicons
                    name={role.icon}
                    size={24}
                    color={role.color}
                  />
                </View>
                <Text
                  style={[
                    styles.roleTabLabel,
                    selectedRole === role.value && { color: role.color, fontWeight: "700" }
                  ]}
                >
                  {role.label}
                </Text>
                <Text style={styles.roleTabDesc}>{role.desc}</Text>

                {/* Active Indicator */}
                {selectedRole === role.value && (
                  <View style={[styles.activeIndicator, { backgroundColor: role.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Email Input */}
          <Input
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          {/* Password Input */}
          <Input
            label="Password"
            placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry={!showPwd}
            editable={!loading}
            right={
              <TouchableOpacity
                onPress={() => setShowPwd((v) => !v)}
                disabled={loading}
              >
                <Ionicons
                  name={showPwd ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={T.text.muted}
                />
              </TouchableOpacity>
            }
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Btn
            title={`Sign in as ${selectedRoleObj?.label}`}
            onPress={handleLogin}
            loading={loading}
            icon="arrow-forward"
            style={{ marginTop: 12 }}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>OR</Text>
            <View style={styles.divLine} />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => navigation.navigate("Signup")}
            disabled={loading}
          >
            <Text style={styles.signupText}>
              New here?{" "}
              <Text style={styles.signupLink}>Create account</Text>
            </Text>
          </TouchableOpacity>

          {/* Cross Platform Info */}
          <View style={styles.crossPlatformBox}>
            <Ionicons name="globe-outline" size={14} color={T.green} />
            <Text style={styles.crossText}>
              Same login works on{" "}
              <Text style={{ color: T.green, fontWeight: "700" }}>zyphor.in</Text>{" "}
              website
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Role Selection Modal (Alternative - Optional) */}
      <Modal
        visible={showRoleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRoleModal(false)}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Role</Text>
              <TouchableOpacity
                onPress={() => setShowRoleModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={T.text.primary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={ROLES}
              keyExtractor={(item) => item.value}
              scrollEnabled={false}
              renderItem={({ item: role }) => (
                <TouchableOpacity
                  style={[
                    styles.modalRoleItem,
                    selectedRole === role.value && {
                      backgroundColor: role.bgColor,
                      borderLeftColor: role.color,
                      borderLeftWidth: 4
                    }
                  ]}
                  onPress={() => handleSelectRole(role.value)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.modalRoleIcon,
                      { backgroundColor: role.bgColor }
                    ]}
                  >
                    <Ionicons
                      name={role.icon}
                      size={24}
                      color={role.color}
                    />
                  </View>
                  <View style={styles.modalRoleText}>
                    <Text style={styles.modalRoleLabel}>{role.label}</Text>
                    <Text style={styles.modalRoleDesc}>{role.desc}</Text>
                  </View>
                  {selectedRole === role.value && (
                    <View style={[styles.checkmark, { backgroundColor: role.color }]}>
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  scroll: { flexGrow: 1 },

  /* Header */
  hero: {
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 12
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  logoBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2
  },
  tagline: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center"
  },

  /* Form */
  form: {
    flex: 1,
    backgroundColor: T.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    padding: 24
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: T.text.primary,
    marginBottom: 4
  },
  subheading: {
    fontSize: 13,
    color: T.text.muted,
    marginBottom: 16
  },

  /* Error Box */
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.red + "15",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.red + "30"
  },
  errorText: {
    fontSize: 13,
    color: T.red,
    flex: 1
  },

  /* Role Selection */
  roleSectionLabel: {
    marginBottom: 12,
    marginTop: 8
  },
  roleLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: T.text.primary
  },
  roleSubText: {
    fontSize: 11,
    color: T.text.muted,
    marginTop: 2
  },
  roleScroll: {
    paddingHorizontal: 0,
    gap: 10,
    marginBottom: 20
  },
  roleTab: {
    width: 90,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
    backgroundColor: T.bg.card,
    borderWidth: 1,
    borderColor: T.border.color
  },
  roleTabActive: {
    borderBottomWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  roleTabInactive: {
    opacity: 0.6
  },
  roleTabIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1
  },
  roleTabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: T.text.primary,
    marginBottom: 2,
    textAlign: "center"
  },
  roleTabDesc: {
    fontSize: 10,
    color: T.text.muted,
    textAlign: "center"
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6
  },

  /* Forgot Password */
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 12
  },
  forgotText: {
    fontSize: 12,
    color: T.green,
    fontWeight: "600"
  },

  /* Divider */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16
  },
  divLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.border.color
  },
  divText: {
    fontSize: 12,
    color: T.text.muted,
    fontWeight: "600"
  },

  /* Sign Up Button */
  signupBtn: {
    alignItems: "center",
    paddingVertical: 12
  },
  signupText: {
    fontSize: 14,
    color: T.text.secondary
  },
  signupLink: {
    color: T.primary,
    fontWeight: "700"
  },

  /* Cross Platform Info */
  crossPlatformBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.green + "10",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: T.green + "20"
  },
  crossText: {
    fontSize: 12,
    color: T.text.muted,
    flex: 1
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: T.bg.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: "80%"
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: T.text.primary
  },
  modalCloseBtn: {
    padding: 4
  },
  modalRoleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color
  },
  modalRoleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  modalRoleText: {
    flex: 1
  },
  modalRoleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: T.text.primary
  },
  modalRoleDesc: {
    fontSize: 11,
    color: T.text.muted,
    marginTop: 2
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  }
});
