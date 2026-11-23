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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
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

  const openAdd = () => {
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
    if (!form.name.trim() || !form.phone.trim() || !form.street.trim() || !form.pincode.trim()) {
      setError("Name, phone, street and pincode are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        label: form.label.trim() || "Home",
        name: form.name.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        isDefault: form.isDefault,
      };
      const r = editingId
        ? await authAPI.addresses.update(editingId, payload)
        : await authAPI.addresses.add(payload);
      setAddresses(r.data.addresses || []);
      setModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Could not save address.");
    } finally {
      setSaving(false);
    }
  };

  const remove = (a) => {
    Alert.alert("Delete address", `Remove '${a.label}' — ${a.street}, ${a.city}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const r = await authAPI.addresses.remove(a._id);
            setAddresses(r.data.addresses || []);
          } catch (err) {
            Alert.alert("Error", err.response?.data?.error || "Could not delete.");
          }
        },
      },
    ]);
  };

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <View style={styles.root}>
      <View style={styles.subHeader}>
        <Text style={styles.countText}>{addresses.length} saved {addresses.length === 1 ? "address" : "addresses"}</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn} activeOpacity={0.75}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Address</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={T.primary} size="large" /></View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(a) => a._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 60, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Empty
                icon="location-outline"
                title="No addresses saved"
                sub="Add a delivery address so checkout is one tap."
                action={openAdd}
                actionLabel="Add Address"
              />
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.labelRow}>
                  <Ionicons name="location" size={15} color={T.primary} />
                  <Text style={styles.labelText}>{item.label || "Address"}</Text>
                  {item.isDefault && <Badge label="DEFAULT" color={T.green} />}
                </View>
                <View style={{ flexDirection: "row", gap: 6 }}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn} activeOpacity={0.7}>
                    <Ionicons name="pencil-outline" size={16} color={T.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={16} color={T.red} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.nameText}>{item.name} • {item.phone}</Text>
              <Text style={styles.addrText} numberOfLines={2}>
                {item.street}{item.city ? `, ${item.city}` : ""}{item.state ? `, ${item.state}` : ""} — {item.pincode}
              </Text>
            </View>
          )}
        />
      )}

      {/* Add / Edit modal */}
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView
          style={styles.modalWrap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{editingId ? "Edit Address" : "New Address"}</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={20} color={T.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Input label="Label (Home / Work / Other)" icon="pricetag-outline" value={form.label} onChangeText={set("label")} placeholder="Home" />
              <Input label="Full name" icon="person-outline" value={form.name} onChangeText={set("name")} placeholder="Recipient name" autoCapitalize="words" />
              <Input label="Phone" icon="call-outline" value={form.phone} onChangeText={set("phone")} placeholder="10-digit mobile" keyboardType="phone-pad" maxLength={15} />
              <Input label="Street / Area" icon="home-outline" value={form.street} onChangeText={set("street")} placeholder="House no, street, landmark" multiline />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input label="City" icon="business-outline" value={form.city} onChangeText={set("city")} placeholder="City" autoCapitalize="words" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="State" value={form.state} onChangeText={set("state")} placeholder="State" autoCapitalize="words" />
                </View>
              </View>
              <Input label="Pincode" icon="navigate-outline" value={form.pincode} onChangeText={set("pincode")} placeholder="6-digit pincode" keyboardType="number-pad" maxLength={6} />
              <TouchableOpacity
                style={styles.defaultRow}
                onPress={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={form.isDefault ? "checkbox" : "square-outline"}
                  size={20}
                  color={form.isDefault ? T.primary : T.text.muted}
                />
                <Text style={styles.defaultText}>Set as default delivery address</Text>
              </TouchableOpacity>
              {!!error && <Text style={styles.errorText}>{error}</Text>}
              <Btn title={editingId ? "Save Changes" : "Save Address"} onPress={save} loading={saving} icon="checkmark" style={{ marginTop: 6 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.border.color,
  },
  countText: { fontSize: 13, color: T.text.secondary, fontWeight: "600" },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: T.primary, borderRadius: 999, paddingHorizontal: 14, height: 34,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1,
    borderColor: T.border.color, padding: 16, marginBottom: 12, ...T.shadow.card,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  labelText: { fontSize: 14, fontWeight: "800", color: T.text.primary },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: T.bg.secondary,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color,
  },
  nameText: { fontSize: 13, fontWeight: "700", color: T.text.primary, marginBottom: 3 },
  addrText: { fontSize: 12, color: T.text.secondary, lineHeight: 17 },
  modalWrap: {
    flex: 1, backgroundColor: "rgba(24,24,24,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: "88%",
  },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 19, fontWeight: "900", color: T.text.primary, letterSpacing: -0.3 },
  defaultRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2, marginBottom: 4 },
  defaultText: { fontSize: 13, color: T.text.primary, fontWeight: "600" },
  errorText: { fontSize: 12, color: T.red, marginTop: 6 },
});
