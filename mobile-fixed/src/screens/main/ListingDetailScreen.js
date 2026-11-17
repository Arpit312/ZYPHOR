import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { CartHeaderBtn, Btn } from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const { width: W } = Dimensions.get("window");

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const r = await listingsAPI.getById(id);
        setItem(r.data.listing);
      } catch (err) {
        Alert.alert("Error", "Could not load device details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    addToCart(item);
    Alert.alert("✓ Added to Cart", `${item.brand} ${item.model} is now in your cart.`, [
      { text: "Continue Browsing" },
      { text: "Go to Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  const handleBuyNow = () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login to purchase with Escrow buyer protection.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }
    navigation.navigate("Checkout", { item });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={{ color: T.text.muted }}>Product not found</Text>
      </View>
    );
  }

  const price = Number(item.price || 0);
  const origPrice = item.originalPrice ? Number(item.originalPrice) : Math.round(price * 1.3);
  const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null;
  const emiPerMonth = Math.round(price / 6);

  const trust = item.verification?.trustScore || 95;
  const tColor = trust >= 80 ? T.green : trust >= 50 ? T.amber : T.red;

  const images = item.images && item.images.length > 0 ? item.images : ["/placeholder-device.svg"];

  const SPECS = [
    { k: "Brand", v: item.brand, icon: "cube-outline" },
    { k: "Model", v: item.model, icon: "hardware-chip-outline" },
    { k: "Storage", v: item.storage, icon: "save-outline" },
    { k: "RAM", v: item.ram, icon: "speedometer-outline" },
    { k: "Condition", v: item.conditionGrade, icon: "ribbon-outline" },
    { k: "City", v: item.city || "Pan India", icon: "location-outline" },
    { k: "Category", v: item.category || (item.listingType === "part" ? "Spare Part" : "Smartphone"), icon: "pricetag-outline" },
  ].filter((s) => s.v);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={22} color={T.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.brand} {item.model}</Text>
        <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Product Image Gallery */}
        <View style={styles.galleryWrap}>
          <Image source={{ uri: images[imgIdx] }} style={styles.mainImg} resizeMode="cover" />

          {discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}

          <View style={styles.condPill}>
            <Text style={styles.condPillText}>{item.conditionGrade || "Verified"}</Text>
          </View>

          {images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow}>
              {images.map((img, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setImgIdx(i)}
                  style={[styles.thumb, imgIdx === i && styles.thumbActive]}
                >
                  <Image source={{ uri: img }} style={styles.thumbImg} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Details Header */}
        <View style={styles.card}>
          <Text style={styles.brandSubtitle}>{item.brand.toUpperCase()}</Text>
          <Text style={styles.title}>{item.title || `${item.brand} ${item.model}`}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{price.toLocaleString("en-IN")}</Text>
            {origPrice > price && (
              <Text style={styles.mrpCross}>₹{origPrice.toLocaleString("en-IN")}</Text>
            )}
            {discount && (
              <View style={styles.savePill}>
                <Text style={styles.savePillText}>Save ₹{(origPrice - price).toLocaleString("en-IN")}</Text>
              </View>
            )}
          </View>

          <View style={styles.emiBanner}>
            <Ionicons name="card-outline" size={16} color={T.green} />
            <Text style={styles.emiText}>
              EMI starts at <Text style={{ fontWeight: "800", color: "#fff" }}>₹{emiPerMonth.toLocaleString("en-IN")}/mo</Text> with No-Cost EMI options.
            </Text>
          </View>
        </View>

        {/* AI Trust Score Gauge Card */}
        <View style={styles.card}>
          <View style={styles.trustHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.trustScoreIcon, { backgroundColor: tColor + "22" }]}>
                <Ionicons name="shield-checkmark" size={24} color={tColor} />
              </View>
              <View>
                <Text style={styles.trustCardTitle}>AI Trust Verification</Text>
                <Text style={styles.trustCardSub}>5-point hardware & document check</Text>
              </View>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: tColor + "22", borderColor: tColor }]}>
              <Text style={[styles.scoreNumber, { color: tColor }]}>{trust}</Text>
              <Text style={[styles.scoreTotal, { color: tColor }]}>/100</Text>
            </View>
          </View>

          <View style={styles.trustBreakdown}>
            {[
              { label: "Physical Condition", score: item.verification?.components?.physicalCondition || 96 },
              { label: "Functional Health", score: item.verification?.components?.functionalCondition || 98 },
              { label: "IMEI & Blacklist Check", score: item.verification?.components?.documentAuthenticity || 100 },
              { label: "Seller Reliability", score: item.verification?.components?.sellerReliability || 99 },
            ].map((c, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{c.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${c.score}%`, backgroundColor: tColor }]} />
                </View>
                <Text style={styles.barScore}>{c.score}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Specifications Grid */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Device Specifications</Text>
          <View style={styles.specGrid}>
            {SPECS.map((s, idx) => (
              <View key={idx} style={styles.specBox}>
                <Ionicons name={s.icon} size={16} color={T.primary} />
                <Text style={styles.specKey}>{s.k}</Text>
                <Text style={styles.specValue}>{s.v}</Text>
              </View>
            ))}
          </View>

          {item.description ? (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.descLabel}>Condition & Description</Text>
              <Text style={styles.descText}>{item.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Verified Seller Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={styles.sellerAvatar}>
                <Ionicons name="storefront" size={20} color={T.primary} />
              </View>
              <View>
                <Text style={styles.sellerName}>
                  {item.seller?.businessName || item.seller?.name || "ZYPHOR Certified Partner Store"}
                </Text>
                <Text style={styles.sellerCity}>{item.seller?.city || item.city || "Pan India"} • Verified Merchant</Text>
              </View>
            </View>
            <View style={styles.merchantBadge}>
              <Ionicons name="checkmark-circle" size={12} color={T.green} />
              <Text style={styles.merchantBadgeText}>KYC Done</Text>
            </View>
          </View>
        </View>

        {/* Buyer Escrow Protection Badges */}
        <View style={styles.protectionCard}>
          <View style={styles.protItem}>
            <Ionicons name="lock-closed" size={20} color={T.green} />
            <Text style={styles.protTitle}>Escrow Payment</Text>
            <Text style={styles.protSub}>Funds held securely until delivery</Text>
          </View>
          <View style={styles.protItem}>
            <Ionicons name="repeat" size={20} color={T.primary} />
            <Text style={styles.protTitle}>7-Day Return</Text>
            <Text style={styles.protSub}>Hassle-free replacement policy</Text>
          </View>
          <View style={styles.protItem}>
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={styles.protTitle}>Original Parts</Text>
            <Text style={styles.protSub}>100% OEM genuine guarantee</Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── E-COMMERCE STICKY BOTTOM ACTION BAR ─── */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={[styles.cartBtn, isInCart(item._id) && styles.cartBtnActive]}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isInCart(item._id) ? "checkmark-circle" : "cart-outline"}
            size={18}
            color={isInCart(item._id) ? T.green : "#fff"}
          />
          <Text style={[styles.cartBtnText, isInCart(item._id) && { color: T.green }]}>
            {isInCart(item._id) ? "In Cart" : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBuyNow} style={styles.buyBtn} activeOpacity={0.8}>
          <Ionicons name="flash" size={18} color="#fff" />
          <Text style={styles.buyBtnText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bg.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: T.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  headerIconBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: "700", color: T.text.primary, flex: 1, marginHorizontal: 12 },

  galleryWrap: { position: "relative", backgroundColor: T.bg.surface },
  mainImg: { width: W, height: W * 0.8 },
  discountBadge: { position: "absolute", top: 16, left: 16, backgroundColor: "#EF4444", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  condPill: { position: "absolute", bottom: 16, right: 16, backgroundColor: "rgba(0,0,0,0.8)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  condPillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  thumbRow: { position: "absolute", bottom: 16, left: 16 },
  thumb: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", overflow: "hidden", marginRight: 8 },
  thumbActive: { borderColor: T.primary, borderWidth: 2 },
  thumbImg: { width: "100%", height: "100%" },

  card: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  brandSubtitle: { fontSize: 11, fontWeight: "800", color: T.primary, letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: "800", color: T.text.primary, marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 10, marginTop: 10 },
  price: { fontSize: 24, fontWeight: "900", color: "#fff" },
  mrpCross: { fontSize: 15, color: T.text.muted, textDecorationLine: "line-through" },
  savePill: { backgroundColor: T.green + "20", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  savePillText: { fontSize: 11, fontWeight: "700", color: T.green },
  emiBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 10, marginTop: 12 },
  emiText: { fontSize: 12, color: T.text.secondary, flex: 1 },

  trustHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trustScoreIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  trustCardTitle: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  trustCardSub: { fontSize: 11, color: T.text.muted, marginTop: 1 },
  scoreBadge: { flexDirection: "row", alignItems: "baseline", borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  scoreNumber: { fontSize: 20, fontWeight: "900" },
  scoreTotal: { fontSize: 11, fontWeight: "700" },
  trustBreakdown: { marginTop: 14, gap: 8 },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  barLabel: { fontSize: 11, color: T.text.muted, width: 140 },
  barTrack: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  barScore: { fontSize: 11, fontWeight: "700", color: T.text.secondary, width: 34, textAlign: "right" },

  sectionTitle: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginBottom: 12 },
  specGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specBox: { width: "48%", backgroundColor: T.bg.surface, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: T.border.color },
  specKey: { fontSize: 10, color: T.text.muted, marginTop: 4 },
  specValue: { fontSize: 12, fontWeight: "700", color: T.text.primary, marginTop: 2 },
  descLabel: { fontSize: 11, fontWeight: "700", color: T.text.secondary, marginBottom: 4 },
  descText: { fontSize: 12, color: T.text.muted, lineHeight: 18 },

  sellerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: T.primary + "18", alignItems: "center", justifyContent: "center" },
  sellerName: { fontSize: 13, fontWeight: "700", color: T.text.primary },
  sellerCity: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  merchantBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: T.green + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  merchantBadgeText: { fontSize: 10, fontWeight: "700", color: T.green },

  protectionCard: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16, marginTop: 14, backgroundColor: T.bg.card, borderRadius: T.radius.lg, padding: 14, borderWidth: 1, borderColor: T.border.color },
  protItem: { alignItems: "center", width: "32%", gap: 4 },
  protTitle: { fontSize: 11, fontWeight: "700", color: T.text.primary, textAlign: "center", marginTop: 2 },
  protSub: { fontSize: 9, color: T.text.muted, textAlign: "center" },

  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    backgroundColor: T.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: T.border.color,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cartBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.bg.surface,
    borderRadius: T.radius.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  cartBtnActive: { borderColor: T.green, backgroundColor: T.green + "12" },
  cartBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  buyBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.primary,
    borderRadius: T.radius.lg,
    paddingVertical: 14,
  },
  buyBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
});
