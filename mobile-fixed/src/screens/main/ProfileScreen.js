import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Btn, Input } from "../../components/UI";
import { authAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
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
      Alert.alert("Error", "Name is required");
      return;
    }
    setLoading(true);
    try {
      const r = await authAPI.updateProfile(form);
      updateUser(r.data.user);
      Alert.alert("✓ Profile Saved", "Your account settings have been updated.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={T.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Account Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "Z"}</Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || "CUSTOMER"}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Input label="Full Name *" placeholder="Rahul Sharma" value={form.name} onChangeText={set("name")} icon="person-outline" />
          <Input label="City" placeholder="Mumbai" value={form.city} onChangeText={set("city")} icon="location-outline" />
          <Input label="Phone Number" placeholder="9876543210" value={form.phone} onChangeText={set("phone")} keyboardType="phone-pad" icon="call-outline" />
          {isSeller && <Input label="Business Name" placeholder="Your Store / Brand Name" value={form.businessName} onChangeText={set("businessName")} icon="storefront-outline" />}
          {(user?.role === "retailer" || user?.role === "wholesaler") && (
            <Input label="GST Number" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChangeText={set("gstNumber")} icon="document-text-outline" />
          )}

          <Btn title={loading ? "Saving Profile..." : "Save Profile Changes →"} onPress={save} loading={loading} style={{ marginTop: 10 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topBarTitle: { fontSize: 20, fontWeight: "800", color: T.text.primary },

  scroll: { padding: 20, paddingBottom: 60 },
  avatarCard: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: T.bg.secondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 20,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: T.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  email: { fontSize: 13, color: T.text.secondary, marginBottom: 8 },
  roleBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  roleText: { fontSize: 11, fontWeight: "700", color: T.text.primary, letterSpacing: 0.5 },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: T.border.color,
    ...T.shadow.card,
  },
});
