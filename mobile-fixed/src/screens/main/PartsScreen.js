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
  { id: "display", label: "OLED / Screens" },
  { id: "battery", label: "Batteries" },
  { id: "camera", label: "Cameras" },
  { id: "speaker", label: "Speakers" },
  { id: "motherboard", label: "Motherboards" },
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>OEM Spare Parts</Text>
            <Text style={styles.subTitle}>Factory verified modules & components</Text>
          </View>
          <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={17} color={T.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search screens, batteries, cameras…"
            placeholderTextColor="#9CA3AF"
            value={q}
            onChangeText={setQ}
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ("")}>
              <Ionicons name="close-circle" size={18} color={T.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATS.map((c) => {
            const active = cat === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setCat(c.id)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      ) : parts.length === 0 ? (
        <Empty
          icon="construct-outline"
          title="No spare parts found"
          sub="Try searching for another phone model or component."
          action={() => {
            setCat("All");
            setQ("");
          }}
          actionLabel="View All Parts"
        />
      ) : (
        <FlatList
          data={parts}
          keyExtractor={(i) => i._id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
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
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  subTitle: { fontSize: 13, color: T.text.secondary, marginTop: 2 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: T.text.primary },

  catRow: { gap: 8, paddingTop: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  chipActive: { backgroundColor: T.primary, borderColor: T.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  chipTextActive: { color: "#FFFFFF" },

  gridContainer: { padding: 18, paddingBottom: 90 },
});
