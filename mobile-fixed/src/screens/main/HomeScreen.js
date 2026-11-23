import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import {
  ListingCard,
  SecHeader,
  Empty,
  CategoryBubble,
  CartHeaderBtn,
} from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const { width: W } = Dimensions.get("window");

const CATEGORIES = [
  { id: "phones", label: "Certified Phones", icon: "phone-portrait-outline", tab: "Browse", screen: "Marketplace" },
  { id: "repair", label: "Doorstep Repair", icon: "construct-outline", tab: "Repair", screen: "RepairMain", badge: "6M WRTY" },
  { id: "parts", label: "OEM Parts", icon: "hardware-chip-outline", tab: "Browse", screen: "Parts" },
  { id: "sell", label: "Sell Device", icon: "cash-outline", tab: "Sell", screen: "SellMain" },
  { id: "advisor", label: "AI Advisor", icon: "sparkles-outline", tab: "Advisor" },
  { id: "imei", label: "IMEI Check", icon: "scan-outline", tab: "IMEICheck" },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [deviceListings, setDeviceListings] = useState([]);
  const [partListings, setPartListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const rDevices = await listingsAPI.getAll({ type: "device", sort: "trust", limit: 6 });
      setDeviceListings(rDevices.data.listings || []);

      const rParts = await listingsAPI.getAll({ type: "part", limit: 4 });
      setPartListings(rParts.data.listings || []);
    } catch (err) {
      console.warn("Home data fetch warning:", err?.message);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleQuickAdd = (item) => {
    addToCart(item);
    Alert.alert("✓ Added to Cart", `${item.brand} ${item.model} has been added to your cart.`, [
      { text: "Continue" },
      { text: "View Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* ─── EDITORIAL TOP BAR ─── */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={styles.brandLogoBox}>
                <Image
                  source={require("../../../assets/symbol-white.png")}
                  style={{ width: 16, height: 16 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandTitle}>ZYPHOR</Text>
            </View>

            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => navigation.navigate("Account", { screen: "Profile" })}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={12} color={T.text.secondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {user?.city ? `Deliver to: ${user.city}` : "Pan-India Express Delivery"}
              </Text>
              <Ionicons name="chevron-down" size={10} color={T.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate("IMEICheck")}
              activeOpacity={0.7}
            >
              <Ionicons name="scan-outline" size={20} color={T.text.primary} />
            </TouchableOpacity>
            <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
          </View>
        </View>

        {/* Minimal Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Browse", { screen: "Marketplace", params: { focus: true } })}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={17} color={T.text.secondary} />
          <Text style={styles.searchText}>Search iPhone 15, AMOLED screens, repairs…</Text>
          <Ionicons name="arrow-forward" size={14} color={T.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
      >
        {/* ─── EDITORIAL HERO BANNER (Left Phone in Reference Image) ─── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroPretitle}>THE CERTIFIED COLLECTION</Text>
          <Text style={styles.heroTitle}>Precision Engineered Refurbished Tech</Text>
          <Text style={styles.heroSubtitle}>
            Devices inspected across 45 hardware checkpoints. Clean OEM batteries, pristine screens, and 12-month comprehensive warranty.
          </Text>

          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            activeOpacity={0.88}
          >
            <Text style={styles.heroBtnText}>Explore All Devices →</Text>
          </TouchableOpacity>
        </View>

        {/* ─── CLEAN HORIZONTAL CATEGORIES BUBBLE ROW ─── */}
        <View style={styles.catSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <CategoryBubble
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                badge={cat.badge}
                onPress={() => navigation.navigate(cat.tab, cat.screen ? { screen: cat.screen } : undefined)}
              />
            ))}
          </ScrollView>
        </View>

        {/* ─── TRUST STATS ROW ─── */}
        <View style={styles.trustGrid}>
          {[
            { n: "100%", l: "Escrow Safe", icon: "shield-checkmark-outline" },
            { n: "7-Day", l: "Money Back", icon: "repeat-outline" },
            { n: "GSMA", l: "IMEI Clean", icon: "finger-print-outline" },
            { n: "Free", l: "Express Ship", icon: "cube-outline" },
          ].map((item, idx) => (
            <View key={idx} style={styles.trustItem}>
              <Ionicons name={item.icon} size={15} color={T.text.primary} />
              <Text style={styles.trustNum}>{item.n}</Text>
              <Text style={styles.trustLabel}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* ─── SECTION 1: VERIFIED PHONES (2-Column Grid) ─── */}
        <View style={styles.section}>
          <SecHeader
            title="Curated Devices"
            sub="Inspected, graded, and warranty-backed"
            action={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            actionLabel="View all"
          />

          {deviceListings.length === 0 ? (
            <Empty icon="phone-portrait-outline" title="Loading collection…" sub="Connecting to live inventory" />
          ) : (
            <View style={styles.grid}>
              {deviceListings.map((item) => (
                <ListingCard
                  key={item._id}
                  item={item}
                  onPress={() => navigation.navigate("ListingDetail", { id: item._id })}
                  onAddToCart={() => handleQuickAdd(item)}
                />
              ))}
            </View>
          )}
        </View>

        {/* ─── SERVICE PROMOTIONS ─── */}
        <View style={styles.promoSection}>
          {/* Sell Phone Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>INSTANT BUYBACK</Text>
            </View>
            <Text style={styles.serviceTitle}>Sell Your Old Phone in 60s</Text>
            <Text style={styles.serviceSub}>
              Instant valuation backed by AI resale data. Free doorstep device pickup with instant payment.
            </Text>
            <TouchableOpacity
              style={styles.serviceBtn}
              onPress={() => navigation.navigate("Sell", { screen: "SellMain" })}
              activeOpacity={0.85}
            >
              <Text style={styles.serviceBtnText}>Check Device Resale Value →</Text>
            </TouchableOpacity>
          </View>

          {/* Doorstep Repair Card */}
          <View style={[styles.serviceCard, { marginTop: 14 }]}>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>DOORSTEP SERVICE</Text>
            </View>
            <Text style={styles.serviceTitle}>Certified Screen & Battery Repair</Text>
            <Text style={styles.serviceSub}>
              Expert technician arrives at your home or office. 6-month warranty on original spare parts.
            </Text>
            <TouchableOpacity
              style={styles.serviceBtn}
              onPress={() => navigation.navigate("Repair", { screen: "RepairMain" })}
              activeOpacity={0.85}
            >
              <Text style={styles.serviceBtnText}>Book Repair Service →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── SECTION 2: GENUINE SPARE PARTS ─── */}
        {partListings.length > 0 && (
          <View style={styles.section}>
            <SecHeader
              title="OEM Spare Parts"
              sub="Original screens, batteries & camera modules"
              action={() => navigation.navigate("Browse", { screen: "Parts" })}
              actionLabel="All parts"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingHorizontal: 2 }}>
              {partListings.map((part) => (
                <View key={part._id} style={{ width: 170 }}>
                  <ListingCard
                    item={part}
                    onPress={() => navigation.navigate("ListingDetail", { id: part._id })}
                    onAddToCart={() => handleQuickAdd(part)}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  topBar: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brandLogoBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: { fontSize: 20, fontWeight: "900", color: T.text.primary, letterSpacing: 0.5 },
  locationPill: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText: { fontSize: 11, color: T.text.secondary, maxWidth: 200 },

  topRightActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { padding: 4 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchText: { fontSize: 13, color: T.text.secondary, flex: 1, marginHorizontal: 8 },

  // Hero Card
  heroCard: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: T.bg.secondary,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  heroPretitle: { fontSize: 11, fontWeight: "800", color: T.text.secondary, letterSpacing: 1.2, marginBottom: 6 },
  heroTitle: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5, lineHeight: 32 },
  heroSubtitle: { fontSize: 13, color: T.text.secondary, marginTop: 10, lineHeight: 20 },
  heroBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 18,
    alignSelf: "flex-start",
  },
  heroBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

  catSection: { marginTop: 22 },
  catScroll: { paddingHorizontal: 16, gap: 4 },

  trustGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border.color,
    padding: 14,
    ...T.shadow.card,
  },
  trustItem: { alignItems: "center", flex: 1, gap: 2 },
  trustNum: { fontSize: 13, fontWeight: "800", color: T.text.primary, marginTop: 2 },
  trustLabel: { fontSize: 10, color: T.text.secondary, fontWeight: "500" },

  section: { marginHorizontal: 18, marginTop: 28 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  promoSection: { marginHorizontal: 18, marginTop: 24 },
  serviceCard: {
    backgroundColor: T.bg.secondary,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  serviceTag: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  serviceTagText: { fontSize: 9, fontWeight: "800", color: T.text.secondary, letterSpacing: 0.5 },
  serviceTitle: { fontSize: 18, fontWeight: "800", color: T.text.primary },
  serviceSub: { fontSize: 12, color: T.text.secondary, lineHeight: 18, marginTop: 6, marginBottom: 14 },
  serviceBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  serviceBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
