import React, { useState, useEffect, useCallback, useRef } from "react";
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

const BRANDS = ["All", "Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google"];
const SORTS = [
  { k: "newest", l: "Newest" },
  { k: "price_low", l: "Price ↑" },
  { k: "price_high", l: "Price ↓" },
  { k: "trust", l: "Trust Score" },
];

export default function MarketplaceScreen({ navigation, route }) {
  const { addToCart } = useCart();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("newest");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);

  useEffect(() => {
    if (route?.params?.focus) {
      const t = setTimeout(() => searchRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [route?.params?.focus]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, type: "device" };
      if (q) params.q = q;
      if (brand !== "All") params.brand = brand;
      const r = await listingsAPI.getAll(params);
      setListings(r.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [q, brand, sort]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleQuickAdd = (item) => {
    addToCart(item);
    Alert.alert("✓ Added to Cart", `${item.brand} ${item.model} is in your cart.`, [
      { text: "Continue" },
      { text: "View Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Marketplace</Text>
          <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={T.primary} />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search verified phones, models, specs…"
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

        {/* Brands Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
          {BRANDS.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => setBrand(b)}
              style={[styles.chip, brand === b && styles.chipActive]}
            >
              <Text style={[styles.chipText, brand === b && styles.chipTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s.k}
              onPress={() => setSort(s.k)}
              style={[styles.sortChip, sort === s.k && styles.sortChipActive]}
            >
              <Text style={[styles.sortText, sort === s.k && styles.sortTextActive]}>{s.l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      ) : listings.length === 0 ? (
        <Empty
          icon="search-outline"
          title="No devices found"
          sub="Try adjusting your brand filter or search keyword."
          action={() => { setBrand("All"); setQ(""); }}
          actionLabel="Clear Filters"
        />
      ) : (
        <FlatList
          data={listings}
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
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "900", color: T.text.primary },
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
    paddingVertical: 6,
    borderRadius: T.radius.full,
    backgroundColor: T.bg.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  chipActive: { backgroundColor: T.primary, borderColor: T.primary },
  chipText: { fontSize: 12, color: T.text.secondary, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: T.bg.surface,
    marginRight: 6,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  sortChipActive: { borderColor: T.primary, backgroundColor: T.primary + "18" },
  sortText: { fontSize: 11, color: T.text.muted, fontWeight: "500" },
  sortTextActive: { color: T.primary, fontWeight: "700" },
});
