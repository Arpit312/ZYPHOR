import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Empty, Btn, Input, Badge } from "../../components/UI";
import { authAPI } from "../../api/api";

const EMPTY_FORM = {
  label: "Home",
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await authAPI.addresses.getAll();
      setAddresses(r.data.addresses || []);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Could not load addresses.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, isDefault: addresses.length === 0 });
    setError("");
    setModal(true);
  };

  const openEdit = (a) => {
    setEditingId(a._id);
    setForm({
      label: a.label || "Home",
      name: a.name || "",
      phone: a.phone || "",
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
      isDefault: !!a.isDefault,
    });
    setError("");
    setModal(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.city.trim() || !form.pincode.trim()) {
      setError("Name, phone, street, city and pincode are required.");
      return;
    }
    if (!/^\d{6}$/.test(form.pincode.trim())) {
      setError("PIN code must be exactly 6 digits.");
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = { ...form, phone: cleanPhone, pincode: form.pincode.trim() };
      let r;
      if (editingId) {
        r = await authAPI.addresses.update(editingId, payload);
      } else {
        r = await authAPI.addresses.add(payload);
      }
      setAddresses(r.data.addresses || []);
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (id) => {
    Alert.alert("Delete Address", "Remove this delivery address from your profile?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const r = await authAPI.addresses.remove(id);
            setAddresses(r.data.addresses || []);
          } catch (err) {
            Alert.alert("Error", err.response?.data?.error || "Could not delete address.");
          }
        },
      },
    ]);
  };

  const setDefault = async (a) => {
    try {
      const r = await authAPI.addresses.update(a._id, { isDefault: true });
      setAddresses(r.data.addresses || []);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Could not set default.");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Delivery Addresses</Text>
          <Text style={styles.sub}>{addresses.length} saved destinations</Text>
        </View>
        <TouchableOpacity onPress={openNew} style={styles.addBtn} activeOpacity={0.7}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {addresses.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="location-outline"
            title="No addresses saved"
            sub="Add your delivery address for fast 1-click escrow checkout."
            action={openNew}
            actionLabel="+ Add New Address"
          />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.colors.accentStrong} />}
          renderItem={({ item }) => (
            <View style={styles.addrCard}>
              <View style={styles.cardTopRow}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{item.label || "Home"}</Text>
                  {item.isDefault && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultPillText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <View style={styles.iconActions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={17} color={tokens.colors.ink} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item._id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={17} color={tokens.colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.street}>{item.street}</Text>
              <Text style={styles.cityLine}>
                {item.city}{item.state ? `, ${item.state}` : ""} - {item.pincode}
              </Text>
              <Text style={styles.phone}>Phone: +91 {item.phone}</Text>

              {!item.isDefault && (
                <TouchableOpacity onPress={() => setDefault(item)} style={styles.makeDefaultBtn} activeOpacity={0.7}>
                  <Text style={styles.makeDefaultText}>Set as default delivery address</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}

      {/* Address Form Modal */}
      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Address" : "Add Address"}</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Ionicons name="close" size={22} color={tokens.colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
              {error ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={tokens.colors.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Label Pills */}
              <View style={styles.labelPills}>
                {["Home", "Work", "Warehouse", "Other"].map((lbl) => (
                  <TouchableOpacity
                    key={lbl}
                    onPress={() => setForm((p) => ({ ...p, label: lbl }))}
                    style={[styles.pill, form.label === lbl && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, form.label === lbl && styles.pillTextActive]}>{lbl}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Input label="Recipient Full Name" placeholder="Rahul Sharma" value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} />
              <Input label="10-Digit Mobile Phone" placeholder="9876543210" keyboardType="phone-pad" maxLength={10} value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))} />
              <Input label="House / Flat / Street Address" placeholder="Flat 402, Royal Palms, MG Road" value={form.street} onChangeText={(v) => setForm((p) => ({ ...p, street: v }))} />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input label="City" placeholder="Mumbai" value={form.city} onChangeText={(v) => setForm((p) => ({ ...p, city: v }))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="PIN Code" placeholder="400001" keyboardType="number-pad" maxLength={6} value={form.pincode} onChangeText={(v) => setForm((p) => ({ ...p, pincode: v }))} />
                </View>
              </View>

              <Btn title={saving ? "Saving..." : "Save Address"} onPress={save} loading={saving} variant="primary" style={{ marginTop: 14 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  title: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },
  sub: { fontSize: 11, color: tokens.colors.textSecondary },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },

  addrCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 12,
    ...tokens.shadow.card,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink },
  defaultPill: {
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultPillText: { fontSize: 9.5, fontWeight: "800", color: tokens.colors.accentStrong },
  iconActions: { flexDirection: "row", gap: 10 },
  iconBtn: { padding: 4 },

  name: { fontSize: 14, fontWeight: "800", color: tokens.colors.ink, marginBottom: 2 },
  street: { fontSize: 12.5, color: tokens.colors.textSecondary, lineHeight: 18 },
  cityLine: { fontSize: 12.5, color: tokens.colors.textSecondary, marginBottom: 4 },
  phone: { fontSize: 12, fontWeight: "600", color: tokens.colors.ink },

  makeDefaultBtn: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  makeDefaultText: { fontSize: 11.5, fontWeight: "700", color: tokens.colors.accentStrong },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: tokens.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: tokens.colors.errorBg,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: { fontSize: 12, color: tokens.colors.error, fontWeight: "600" },
  labelPills: { flexDirection: "row", gap: 8, marginBottom: 12 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  pillActive: { backgroundColor: tokens.colors.ink, borderColor: tokens.colors.ink },
  pillText: { fontSize: 12, fontWeight: "600", color: tokens.colors.textSecondary },
  pillTextActive: { color: "#FFFFFF" },
});
