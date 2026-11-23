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
  BoothBadge,
} from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const { width: W } = Dimensions.get("window");

const CATEGORIES = [
  { id: "phones", label: "Flagships", icon: "phone-portrait-outline", tab: "Browse", screen: "Marketplace" },
  { id: "repair", label: "Doorstep Lab", icon: "construct-outline", tab: "Repair", screen: "RepairMain", badge: "6M WRTY" },
  { id: "parts", label: "OEM Vault", icon: "hardware-chip-outline", tab: "Browse", screen: "Parts" },
  { id: "sell", label: "Sell Device", icon: "cash-outline", tab: "Sell", screen: "SellMain" },
  { id: "advisor", label: "AI Advisor", icon: "sparkles-outline", tab: "Advisor" },
  { id: "imei", label: "IMEI Scan", icon: "scan-outline", tab: "IMEICheck" },
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
      {/* ─── BOUTIQUE PAVILION TOP BAR ─── */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={styles.brandLogoBox}>
                <Image
                  source={require("../../../assets/symbol-white.png")}
                  style={{ width: 15, height: 15 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandTitle}>ZYPHOR</Text>
              <BoothBadge label="LIVE ATELIER" />
            </View>

            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => navigation.navigate("Account", { screen: "Profile" })}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={11} color={T.text.secondary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {user?.city ? `Exhibition Delivery: ${user.city}` : "Pan-India Express Delivery"}
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

        {/* Gallery Search Console */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() =>
            navigation.navigate("Browse", { screen: "Marketplace", params: { focus: true } })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={16} color={T.text.secondary} />
          <Text style={styles.searchText}>Search iPhone 15 Pro, AMOLED displays, repairs…</Text>
          <View style={styles.searchArrow}>
            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
      >
        {/* ─── BOUTIQUE SHOWROOM HERO BANNER ─── */}
        <View style={styles.heroCard}>
          <View style={styles.heroMetaRow}>
            <Text style={styles.heroPretitle}>PAVILION COLLECTION // VOL. 01</Text>
            <View style={styles.heroSerialTag}>
              <Text style={styles.heroSerialText}>GRADE A+ AUDIT</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Sculpted Electronics & Certified Flagships</Text>
          <Text style={styles.heroSubtitle}>
            Every device inspected across 45 hardware checkpoints. Clean OEM batteries, pristine displays, and 12-month comprehensive boutique warranty.
          </Text>

          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            activeOpacity={0.88}
          >
            <Text style={styles.heroBtnText}>Explore Showroom Devices →</Text>
          </TouchableOpacity>
        </View>

        {/* ─── CATEGORY PEDESTAL BUBBLES ─── */}
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

        {/* ─── ARCHITECTURAL TRUST PLINTH ROW ─── */}
        <View style={styles.trustGrid}>
          {[
            { n: "45-PT", l: "Diagnostics", icon: "shield-checkmark-outline" },
            { n: "100%", l: "Escrow Vault", icon: "lock-closed-outline" },
            { n: "GSMA", l: "IMEI Clean", icon: "finger-print-outline" },
            { n: "7-Day", l: "Atelier Return", icon: "repeat-outline" },
          ].map((item, idx) => (
            <View key={idx} style={styles.trustItem}>
              <View style={styles.trustIconCircle}>
                <Ionicons name={item.icon} size={14} color={T.text.primary} />
              </View>
              <Text style={styles.trustNum}>{item.n}</Text>
              <Text style={styles.trustLabel}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* ─── SECTION 1: CURATED SHOWROOM DEVICES ─── */}
        <View style={styles.section}>
          <SecHeader
            index="01"
            title="Curated Devices"
            sub="Inspected, graded, and warranty-backed flagships"
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

        {/* ─── SECTION 2: ATELIER SERVICES ─── */}
        <View style={styles.promoSection}>
          <SecHeader
            index="02"
            title="Atelier Services"
            sub="Instant fair valuation and doorstep diagnostics"
          />

          {/* Sell Phone Card */}
          <View style={styles.serviceCard}>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>INSTANT BUYBACK // 60 SECONDS</Text>
            </View>
            <Text style={styles.serviceTitle}>Sell Your Old Phone Instantly</Text>
            <Text style={styles.serviceSub}>
              Instant valuation backed by AI resale data. Free doorstep device pickup with immediate escrow payout.
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
              <Text style={styles.serviceTagText}>DOORSTEP SERVICE // CERTIFIED LAB</Text>
            </View>
            <Text style={styles.serviceTitle}>Certified Screen & Battery Repair</Text>
            <Text style={styles.serviceSub}>
              Expert technician arrives at your doorstep. 6-month warranty on 100% original OEM spare parts.
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

        {/* ─── SECTION 3: GENUINE SPARE VAULT ─── */}
        {partListings.length > 0 && (
          <View style={styles.section}>
            <SecHeader
              index="03"
              title="OEM Spare Parts"
              sub="Original screens, batteries & camera modules"
              action={() => navigation.navigate("Browse", { screen: "Parts" })}
              actionLabel="All parts"
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 14, paddingHorizontal: 2 }}
            >
              {partListings.map((part) => (
                <View key={part._id} style={{ width: 172 }}>
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
    borderBottomColor: "#EAE8E4",
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  brandLogoBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: { fontSize: 21, fontWeight: "900", color: T.text.primary, letterSpacing: 0.8 },
  locationPill: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText: { fontSize: 11, color: T.text.secondary, maxWidth: 210, fontWeight: "500" },

  topRightActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { padding: 4 },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAF9F7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE8E4",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchText: { fontSize: 13, color: T.text.secondary, flex: 1, marginHorizontal: 8, fontWeight: "400" },
  searchArrow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#181818",
    alignItems: "center",
    justifyContent: "center",
  },

  // ─── Boutique Hero Plinth ───
  heroCard: {
    marginHorizontal: 18,
    marginTop: 18,
    backgroundColor: "#FAF9F7",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#EAE8E4",
    shadowColor: "#181818",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  heroMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  heroPretitle: { fontSize: 10.5, fontWeight: "800", color: "#C5A880", letterSpacing: 1.2 },
  heroSerialTag: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: "#EAE8E4",
  },
  heroSerialText: { fontSize: 8.5, fontWeight: "900", color: "#181818", letterSpacing: 0.6 },
  heroTitle: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5, lineHeight: 33 },
  heroSubtitle: { fontSize: 13, color: T.text.secondary, marginTop: 10, lineHeight: 20 },
  heroBtn: {
    backgroundColor: T.primary,
    borderRadius: 13,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 18,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBtnText: { color: "#FFFFFF", fontSize: 13.5, fontWeight: "700" },

  catSection: { marginTop: 22 },
  catScroll: { paddingHorizontal: 16, gap: 4 },

  // ─── Trust Plinth Grid ───
  trustGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EAE8E4",
    padding: 14,
    ...T.shadow.card,
  },
  trustItem: { alignItems: "center", flex: 1, gap: 3 },
  trustIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FAF9F7",
    borderWidth: 1,
    borderColor: "#EAE8E4",
    alignItems: "center",
    justifyContent: "center",
  },
  trustNum: { fontSize: 13, fontWeight: "900", color: T.text.primary, marginTop: 1 },
  trustLabel: { fontSize: 9.5, color: T.text.secondary, fontWeight: "600" },

  section: { marginHorizontal: 18, marginTop: 28 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  promoSection: { marginHorizontal: 18, marginTop: 28 },
  serviceCard: {
    backgroundColor: "#FAF9F7",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#EAE8E4",
  },
  serviceTag: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EAE8E4",
  },
  serviceTagText: { fontSize: 9, fontWeight: "800", color: "#181818", letterSpacing: 0.6 },
  serviceTitle: { fontSize: 19, fontWeight: "900", color: T.text.primary, letterSpacing: -0.2 },
  serviceSub: { fontSize: 12.5, color: T.text.secondary, lineHeight: 19, marginTop: 6, marginBottom: 14 },
  serviceBtn: {
    backgroundColor: T.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  serviceBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
