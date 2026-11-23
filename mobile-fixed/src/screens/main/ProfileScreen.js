import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn, Input } from "../../components/UI";
import { authAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";

export default function ProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: user?.name || "",
    city: user?.city || "",
    phone: user?.phone || "",
    businessName: user?.businessName || "",
    gstNumber: user?.gstNumber || "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const isSeller = ["retailer", "wholesaler", "technician"].includes(user?.role);

  const save = async () => {
    if (!form.name.trim()) {
      Alert.alert("Required", "Full Name is required.");
      return;
    }
    setLoading(true);
    try {
      const r = await authAPI.updateProfile(form);
      updateUser(r.data.user);
      Alert.alert("✓ Profile Updated", "Your account information has been saved successfully.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Update Failed", e.response?.data?.error || "Could not save profile.");
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

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Account Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Luxury Member Card Plinth */}
        <View style={styles.memberCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "Z"}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={tokens.colors.accent} />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name || "Zyphor Member"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.memberPillsRow}>
            <View style={styles.rolePill}>
              <Ionicons name="shield-outline" size={12} color={tokens.colors.accentStrong} />
              <Text style={styles.rolePillText}>
                {user?.role?.toUpperCase() || "CUSTOMER"}
              </Text>
            </View>
            <View style={styles.trustPill}>
              <Ionicons name="star" size={11} color="#EAB308" />
              <Text style={styles.trustPillText}>
                {user?.trustRating ? `${user.trustRating}.0 TRUST SCORE` : "5.0 VERIFIED"}
              </Text>
            </View>
          </View>
        </View>

        {/* Profile Information Form */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeader}>Personal & Contact Details</Text>

          <Input
            label="Full Name *"
            placeholder="Rahul Sharma"
            value={form.name}
            onChangeText={set("name")}
            icon="person-outline"
          />
          <Input
            label="City"
            placeholder="Mumbai"
            value={form.city}
            onChangeText={set("city")}
            icon="location-outline"
          />
          <Input
            label="Phone Number"
            placeholder="98765 43210"
            value={form.phone}
            onChangeText={set("phone")}
            keyboardType="phone-pad"
            icon="call-outline"
          />

          {isSeller && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Business Credentials</Text>
              <Input
                label="Registered Business / Store Name"
                placeholder="Apex Mobile Store"
                value={form.businessName}
                onChangeText={set("businessName")}
                icon="storefront-outline"
              />
            </>
          )}

          {(user?.role === "retailer" || user?.role === "wholesaler") && (
            <Input
              label="GST Identification Number (GSTIN)"
              placeholder="27AAAAA0000A1Z5"
              autoCapitalize="characters"
              value={form.gstNumber}
              onChangeText={set("gstNumber")}
              icon="document-text-outline"
            />
          )}

          <Btn
            title={loading ? "Saving Profile..." : "Save Profile Changes"}
            onPress={save}
            loading={loading}
            variant="primary"
            style={{ marginTop: 14 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  topBar: {
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
  topBarTitle: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },

  scroll: { padding: 18, paddingBottom: 60 },

  memberCard: {
    alignItems: "center",
    paddingVertical: 26,
    paddingHorizontal: 20,
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 16,
    ...tokens.shadow.card,
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: tokens.colors.ink,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: tokens.colors.accent,
  },
  avatarText: { fontSize: 30, fontWeight: "900", color: "#FFFFFF" },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
    marginBottom: 14,
  },
  memberPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  rolePillText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    letterSpacing: 0.5,
  },
  trustPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  trustPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: tokens.colors.ink,
  },

  formCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
    marginVertical: 14,
  },
});
