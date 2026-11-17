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
import { LinearGradient } from "expo-linear-gradient";
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
  { id: "phones", label: "Buy Phones", icon: "phone-portrait-outline", color: T.primary, tab: "Browse", screen: "Marketplace" },
  { id: "repair", label: "Doorstep Repair", icon: "construct-outline", color: T.green, tab: "Repair", screen: "RepairMain", badge: "NEW" },
  { id: "parts", label: "Spare Parts", icon: "hardware-chip-outline", color: T.amber, tab: "Browse", screen: "Parts" },
  { id: "sell", label: "Sell Device", icon: "cash-outline", color: "#8B5CF6", tab: "Sell", screen: "SellMain" },
  { id: "advisor", label: "AI Advisor", icon: "sparkles-outline", color: "#06B6D4", tab: "AI Tools", screen: "Advisor" },
  { id: "imei", label: "Check IMEI", icon: "scan-outline", color: "#EC4899", tab: "AI Tools", screen: "IMEICheck" },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [deviceListings, setDeviceListings] = useState([]);
  const [partListings, setPartListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch top verified phones
      const rDevices = await listingsAPI.getAll({ type: "device", sort: "trust", limit: 6 });
      setDeviceListings(rDevices.data.listings || []);

      // 2. Fetch popular spare parts
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
      {/* ─── E-COMMERCE TOP APP BAR ─── */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <View style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
                <Image 
                  source={require("../../../assets/symbol-white.png")} 
                  style={{ width: 17, height: 17 }} 
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.brandName}>ZYPHOR</Text>
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={10} color="#fff" />
                <Text style={styles.verifiedTagText}>AI VERIFIED</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.locationPill}
              onPress={() => navigation.navigate("Account", { screen: "Profile" })}
            >
              <Ionicons name="location-sharp" size={12} color={T.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {user?.city ? `Deliver to: ${user.city}` : "Deliver to: India (Pan-India Express)"}
              </Text>
              <Ionicons name="chevron-down" size={10} color={T.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.navigate("AI Tools", { screen: "IMEICheck" })}
            >
              <Ionicons name="scan-outline" size={20} color={T.text.primary} />
            </TouchableOpacity>
            <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate("Browse", { screen: "Marketplace", params: { focus: true } })}
          activeOpacity={0.85}
        >
          <Ionicons name="search-outline" size={18} color={T.primary} />
          <Text style={styles.searchText}>Search iPhone 15, AMOLED screens, repairs…</Text>
          <View style={styles.searchMic}>
            <Ionicons name="sparkles" size={14} color={T.green} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
      >
        {/* ─── CASHIFY-STYLE CATEGORIES BUBBLE ROW ─── */}
        <View style={styles.catSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <CategoryBubble
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                color={cat.color}
                badge={cat.badge}
                onPress={() => navigation.navigate(cat.tab, { screen: cat.screen })}
              />
            ))}
          </ScrollView>
        </View>

        {/* ─── PROMOTIONAL BANNER CAROUSEL (Hero Cards) ─── */}
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.bannerCarousel}>
          {/* Slide 1: Sell Device AI */}
          <LinearGradient colors={["#1E1B4B", "#312E81"]} style={styles.promoCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={styles.promoPill}>
                <Ionicons name="flash" size={11} color={T.amber} />
                <Text style={styles.promoPillText}>INSTANT AI CASH</Text>
              </View>
              <Text style={styles.promoTitle}>Sell Your Old Phone in 60s</Text>
              <Text style={styles.promoSub}>Get highest resale value with AI price prediction.</Text>
              <TouchableOpacity
                style={styles.promoBtn}
                onPress={() => navigation.navigate("Sell", { screen: "SellMain" })}
              >
                <Text style={styles.promoBtnText}>Sell Now →</Text>
              </TouchableOpacity>
            </View>
            <Ionicons name="cash" size={64} color="rgba(255,255,255,0.15)" />
          </LinearGradient>

          {/* Slide 2: Doorstep Repair */}
          <LinearGradient colors={["#064E3B", "#065F46"]} style={styles.promoCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={[styles.promoPill, { backgroundColor: T.green + "25" }]}>
                <Ionicons name="construct" size={11} color={T.green} />
                <Text style={[styles.promoPillText, { color: T.green }]}>DOORSTEP SERVICE</Text>
              </View>
              <Text style={styles.promoTitle}>Screen & Battery Repairs</Text>
              <Text style={styles.promoSub}>Certified engineers at home from ₹899 with 6M warranty.</Text>
              <TouchableOpacity
                style={[styles.promoBtn, { backgroundColor: T.green }]}
                onPress={() => navigation.navigate("Repair", { screen: "RepairMain" })}
              >
                <Text style={styles.promoBtnText}>Book Repair →</Text>
              </TouchableOpacity>
            </View>
            <Ionicons name="build" size={64} color="rgba(255,255,255,0.15)" />
          </LinearGradient>
        </ScrollView>

        {/* ─── TRUST STATS ROW ─── */}
        <View style={styles.trustRow}>
          {[
            { n: "100%", l: "Escrow Safe", icon: "shield-checkmark" },
            { n: "7-Day", l: "Return Policy", icon: "repeat" },
            { n: "GSMA", l: "IMEI Screened", icon: "finger-print" },
            { n: "Free", l: "Doorstep Delivery", icon: "cube" },
          ].map((item, idx) => (
            <View key={idx} style={styles.trustItem}>
              <Ionicons name={item.icon} size={16} color={T.green} />
              <Text style={styles.trustNum}>{item.n}</Text>
              <Text style={styles.trustLabel}>{item.l}</Text>
            </View>
          ))}
        </View>

        {/* ─── SECTION 1: TOP VERIFIED PHONES ─── */}
        <View style={styles.section}>
          <SecHeader
            title="🔥 Verified Phone Deals"
            sub="AI inspected, genuine & warranty backed"
            action={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            actionLabel="View All"
          />

          {deviceListings.length === 0 ? (
            <Empty icon="phone-portrait-outline" title="Loading Catalog..." sub="Fetching real-time verified devices" />
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

        {/* ─── SECTION 2: GENUINE SPARE PARTS ─── */}
        {partListings.length > 0 && (
          <View style={styles.section}>
            <SecHeader
              title="⚙️ OEM Spare Parts"
              sub="Original screens, batteries & camera modules"
              action={() => navigation.navigate("Browse", { screen: "Parts" })}
              actionLabel="All Parts"
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
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

        {/* ─── SELLER SUBSCRIPTION BANNER ─── */}
        {user && ["retailer", "wholesaler", "technician"].includes(user.role) && user.subscription?.status !== "active" && (
          <TouchableOpacity
            style={styles.subBanner}
            onPress={() => navigation.navigate("Account", { screen: "Subscription" })}
          >
            <View style={styles.subStar}><Ionicons name="star" size={18} color="#000" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subTitle}>Unlock Seller Catalog Privileges</Text>
              <Text style={styles.subSub}>Subscribe now to list products & access wholesale bulk pricing.</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={24} color={T.amber} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  topBar: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: T.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  brandName: { fontSize: 22, fontWeight: "900", color: "#fff", letterSpacing: 1.5 },
  verifiedTag: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: T.green, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedTagText: { fontSize: 8, fontWeight: "800", color: "#fff" },
  locationPill: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  locationText: { fontSize: 11, color: T.text.secondary, maxWidth: 200 },

  topRightActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: T.bg.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.input,
    borderRadius: T.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: T.border.color,
    gap: 8,
  },
  searchText: { flex: 1, fontSize: 13, color: T.text.muted },
  searchMic: { padding: 4 },

  catSection: { paddingTop: 16, paddingBottom: 6 },
  catScroll: { paddingHorizontal: 12 },

  bannerCarousel: { paddingLeft: 16, marginVertical: 12 },
  promoCard: {
    width: W - 48,
    borderRadius: T.radius.lg,
    padding: 18,
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, marginBottom: 8 },
  promoPillText: { fontSize: 9, fontWeight: "800", color: "#fff" },
  promoTitle: { fontSize: 17, fontWeight: "800", color: "#fff", marginBottom: 4 },
  promoSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", lineHeight: 16, marginBottom: 12 },
  promoBtn: { backgroundColor: T.primary, alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  promoBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  trustRow: {
    flexDirection: "row",
    backgroundColor: T.bg.card,
    marginHorizontal: 16,
    borderRadius: T.radius.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: T.border.color,
    justifyContent: "space-around",
    marginVertical: 10,
  },
  trustItem: { alignItems: "center", gap: 2 },
  trustNum: { fontSize: 11, fontWeight: "800", color: T.text.primary, marginTop: 2 },
  trustLabel: { fontSize: 9, color: T.text.muted },

  section: { paddingHorizontal: 16, marginTop: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },

  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: T.amber + "15",
    borderWidth: 1,
    borderColor: T.amber + "33",
    borderRadius: T.radius.lg,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
  },
  subStar: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.amber, alignItems: "center", justifyContent: "center" },
  subTitle: { fontSize: 13, fontWeight: "800", color: T.amber },
  subSub: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },
});
