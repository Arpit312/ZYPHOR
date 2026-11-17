import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { ListingCard, Empty, CartHeaderBtn } from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useCart } from "../../context/CartContext";

const CATS = [
  { id: "All", label: "All Parts" },
  { id: "display", label: "Display / Screen" },
  { id: "battery", label: "Battery" },
  { id: "camera", label: "Camera Module" },
  { id: "speaker", label: "Speaker / Ringer" },
  { id: "motor", label: "Vibration Motor" },
  { id: "tempered_glass", label: "Tempered Glass" },
];

export default function PartsScreen({ navigation }) {
  const { addToCart } = useCart();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: "part" };
      if (q) params.q = q;
      if (cat !== "All") params.tag = cat;
      const r = await listingsAPI.getAll(params);
      setParts(r.data.listings || []);
    } catch {
      setParts([]);
    } finally {
      setLoading(false);
    }
  }, [q, cat]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleQuickAdd = (item) => {
    addToCart(item);
    Alert.alert("✓ Added to Cart", `${item.title || item.model} added to your cart.`, [
      { text: "Continue" },
      { text: "View Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.title}>Spare Parts</Text>
              <View style={styles.badge}>
                <Ionicons name="construct" size={11} color={T.amber} />
                <Text style={styles.badgeText}>OEM GENUINE</Text>
              </View>
            </View>
            <Text style={styles.subTitle}>Original tested mobile spare parts</Text>
          </View>
          <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={T.amber} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search parts by phone model, brand, display…"
            placeholderTextColor={T.text.muted}
            value={q}
            onChangeText={setQ}
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ("")}>
              <Ionicons name="close-circle" size={18} color={T.text.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {CATS.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setCat(c.id)}
              style={[styles.chip, cat === c.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, cat === c.id && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={T.amber} size="large" />
        </View>
      ) : parts.length === 0 ? (
        <Empty
          icon="construct-outline"
          title="No parts found"
          sub="No matching spare parts for this filter. Try clearing filters."
          action={() => { setCat("All"); setQ(""); }}
          actionLabel="Clear Filter"
        />
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(i) => i._id}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.navigate("ListingDetail", { id: item._id })}
              onAddToCart={() => handleQuickAdd(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  header: {
    padding: 16,
    paddingTop: 48,
    backgroundColor: T.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: T.text.primary },
  subTitle: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: T.amber + "20", paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 9, color: T.amber, fontWeight: "800" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: T.bg.input,
    borderRadius: T.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  searchInput: { flex: 1, fontSize: 13, color: T.text.primary },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: T.radius.full,
    backgroundColor: T.bg.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  chipActive: { backgroundColor: T.amber, borderColor: T.amber },
  chipText: { fontSize: 12, color: T.text.secondary, fontWeight: "600" },
  chipTextActive: { color: "#000", fontWeight: "700" },
});
