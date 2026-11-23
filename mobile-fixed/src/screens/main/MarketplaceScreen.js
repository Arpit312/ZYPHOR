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

const BRANDS = ["All", "Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Realme", "Vivo"];
const SORTS = [
  { k: "trust", l: "Popularity" },
  { k: "newest", l: "Newest Arrivals" },
  { k: "price_low", l: "Price: Low to High" },
  { k: "price_high", l: "Price: High to Low" },
];

export default function MarketplaceScreen({ navigation, route }) {
  const { addToCart } = useCart();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("trust");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (route?.params?.focus) {
      setShowSearch(true);
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
    Alert.alert("✓ Added to Cart", `${item.brand} ${item.model} is now in your cart.`, [
      { text: "Continue" },
      { text: "View Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  const currentSortLabel = SORTS.find((s) => s.k === sort)?.l || "Popularity";

  return (
    <View style={styles.root}>
      {/* ─── MŌNOLITH EDITORIAL HEADER (Middle Screen in Reference) ─── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>All products</Text>
            <Text style={styles.subTitleStamp}>GALLERY EXHIBIT // 45-PT VERIFIED</Text>
          </View>
          <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
        </View>

        {/* Sub-bar: Sort by ... ˅ on left, Search & Filter on right */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.sortDropdownBtn}
            onPress={() => setShowSortDropdown((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.sortPrefixText}>Sort by </Text>
            <Text style={styles.sortValueText}>{currentSortLabel}</Text>
            <Ionicons
              name={showSortDropdown ? "chevron-up" : "chevron-down"}
              size={13}
              color={T.text.primary}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>

          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowSearch((s) => !s)}
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={20} color={T.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setBrand((b) => (b === "All" ? "Apple" : "All"))}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={20} color={T.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Expandable Sort Dropdown */}
        {showSortDropdown && (
          <View style={styles.sortDropdownMenu}>
            {SORTS.map((s) => (
              <TouchableOpacity
                key={s.k}
                onPress={() => {
                  setSort(s.k);
                  setShowSortDropdown(false);
                }}
                style={[styles.sortMenuItem, sort === s.k && styles.sortMenuItemActive]}
              >
                <Text style={[styles.sortMenuText, sort === s.k && styles.sortMenuTextActive]}>
                  {s.l}
                </Text>
                {sort === s.k && <Ionicons name="checkmark" size={16} color={T.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Collapsible Search Input */}
        {showSearch && (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={T.text.secondary} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search by model, brand, or memory…"
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
        )}

        {/* Brand Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRow}>
          {BRANDS.map((b) => {
            const active = brand === b;
            return (
              <TouchableOpacity
                key={b}
                onPress={() => setBrand(b)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      ) : listings.length === 0 ? (
        <Empty
          icon="search-outline"
          title="No devices found"
          sub="Try adjusting your brand filter or search keyword."
          action={() => {
            setBrand("All");
            setQ("");
          }}
          actionLabel="View All Products"
        />
      ) : (
        <FlatList
          data={listings}
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
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: T.text.primary,
    letterSpacing: -0.6,
  },
  subTitleStamp: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#C5A880",
    letterSpacing: 1.2,
    marginTop: 2,
  },

  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  sortDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortPrefixText: { fontSize: 13, color: T.text.secondary },
  sortValueText: { fontSize: 13, fontWeight: "700", color: T.text.primary },

  actionIcons: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconBtn: { padding: 4 },

  sortDropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border.color,
    marginTop: 8,
    marginBottom: 6,
    paddingVertical: 6,
    ...T.shadow.card,
  },
  sortMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortMenuItemActive: { backgroundColor: T.bg.secondary },
  sortMenuText: { fontSize: 13, color: T.text.secondary },
  sortMenuTextActive: { color: T.text.primary, fontWeight: "700" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: T.bg.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: T.border.color,
    marginTop: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: T.text.primary },

  brandRow: { gap: 8, paddingTop: 10, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  chipActive: {
    backgroundColor: T.primary,
    borderColor: T.primary,
  },
  chipText: { fontSize: 12, color: T.text.secondary, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF" },

  gridContainer: { padding: 18, paddingBottom: 90 },
});
