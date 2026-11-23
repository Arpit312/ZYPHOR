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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { ListingCard, Empty, CartHeaderBtn } from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "../../i18n/I18nContext";

const BRANDS = ["All", "Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Realme", "Vivo"];
const SORTS = [
  { k: "trust", l: "Recommended" },
  { k: "newest", l: "Newest Arrivals" },
  { k: "price_low", l: "Price: Low to High" },
  { k: "price_high", l: "Price: High to Low" },
];

export default function MarketplaceScreen({ navigation, route }) {
  const { addToCart } = useCart();
  const { t } = useTranslation();
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
      const timer = setTimeout(() => searchRef.current?.focus(), 350);
      return () => clearTimeout(timer);
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
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const handleQuickAdd = (item) => {
    addToCart(item);
    Alert.alert("✓ Added to Bag", `${item.brand} ${item.model} is now in your shopping bag.`, [
      { text: "Continue" },
      { text: "View Bag", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  const currentSortLabel = SORTS.find((s) => s.k === sort)?.l || "Recommended";

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.canvas} />

      {/* ─── LUXURY CATALOG HEADER ─── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>{t("marketplace") || "Certified Devices"}</Text>
            <View style={styles.trustTagRow}>
              <View style={styles.goldDot} />
              <Text style={styles.subTitleStamp}>45-POINT AUDITED • 48H ESCROW</Text>
            </View>
          </View>
          <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
        </View>

        {/* Sub-bar: Sort by ... on left, Search & Filter trigger on right */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.sortDropdownBtn}
            onPress={() => setShowSortDropdown((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={styles.sortPrefixText}>Sort: </Text>
            <Text style={styles.sortValueText}>{currentSortLabel}</Text>
            <Ionicons
              name={showSortDropdown ? "chevron-up" : "chevron-down"}
              size={13}
              color={tokens.colors.ink}
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>

          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowSearch((s) => !s)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showSearch ? "close-outline" : "search-outline"}
                size={20}
                color={tokens.colors.ink}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("SearchFilter")}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={20} color={tokens.colors.ink} />
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
                {sort === s.k && <Ionicons name="checkmark" size={16} color={tokens.colors.accentStrong} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Collapsible Search Input */}
        {showSearch && (
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={tokens.colors.textMuted} />
            <TextInput
              ref={searchRef}
              style={styles.searchInput}
              placeholder="Search by brand, model or storage…"
              placeholderTextColor={tokens.colors.textMuted}
              value={q}
              onChangeText={setQ}
            />
            {q ? (
              <TouchableOpacity onPress={() => setQ("")}>
                <Ionicons name="close-circle" size={18} color={tokens.colors.textMuted} />
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
          <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
          <Text style={styles.loadingText}>Loading certified inventory...</Text>
        </View>
      ) : listings.length === 0 ? (
        <Empty
          icon="search-outline"
          title="No devices match your criteria"
          sub="Try adjusting your brand filter or search keyword."
          action={() => {
            setBrand("All");
            setQ("");
          }}
          actionLabel="View All Inventory"
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
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
    letterSpacing: 0.5,
  },

  header: {
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: tokens.colors.ink,
    letterSpacing: -0.5,
  },
  trustTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 3,
  },
  goldDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: tokens.colors.accent,
  },
  subTitleStamp: {
    fontSize: 9.5,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    letterSpacing: 1.1,
  },

  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  sortDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortPrefixText: { fontSize: 13, color: tokens.colors.textSecondary },
  sortValueText: { fontSize: 13, fontWeight: "700", color: tokens.colors.ink },

  actionIcons: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },

  sortDropdownMenu: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginTop: 6,
    marginBottom: 6,
    paddingVertical: 6,
    ...tokens.shadow.card,
  },
  sortMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sortMenuItemActive: { backgroundColor: tokens.colors.surfaceAlt },
  sortMenuText: { fontSize: 13, color: tokens.colors.textSecondary },
  sortMenuTextActive: { color: tokens.colors.ink, fontWeight: "700" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginTop: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: tokens.colors.ink },

  brandRow: { gap: 8, paddingTop: 10, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  chipActive: {
    backgroundColor: tokens.colors.ink,
    borderColor: tokens.colors.ink,
  },
  chipText: { fontSize: 12, color: tokens.colors.textSecondary, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF", fontWeight: "700" },

  gridContainer: { padding: 16, paddingBottom: 90 },
});
