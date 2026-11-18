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
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const { width: W } = Dimensions.get("window");

const SWATCHES = [
  { label: "Space Black", color: "#181818" },
  { label: "Natural Titanium", color: "#8E8E93" },
  { label: "Warm Sand", color: "#D7C4B7" },
];

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [wishlist, setWishlist] = useState(false);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this certified ${item?.brand} ${item?.model} on ZYPHOR: ₹${Number(item?.price || 0).toLocaleString("en-IN")}`,
      });
    } catch {}
  };

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
        <Text style={{ color: T.text.secondary }}>Product not found</Text>
      </View>
    );
  }

  const price = Number(item.price || 0);
  const origPrice = item.originalPrice ? Number(item.originalPrice) : Math.round(price * 1.3);
  const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null;
  const trust = item.verification?.trustScore || 96;
  const images = item.images && item.images.length > 0 ? item.images : ["/placeholder-device.svg"];

  return (
    <View style={styles.root}>
      {/* ─── TOP EDITORIAL NAVIGATION (Right Screen in Reference) ─── */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navIconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={T.primary} />
        </TouchableOpacity>

        <View style={styles.topNavActions}>
          <TouchableOpacity onPress={handleShare} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={21} color={T.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setWishlist((w) => !w)} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons name={wishlist ? "heart" : "heart-outline"} size={22} color={T.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── HERO PRODUCT IMAGE CANVAS ─── */}
        <View style={styles.heroCanvas}>
          <Image
            source={{ uri: images[imgIdx] }}
            style={styles.heroImage}
            resizeMode="contain"
          />

          {/* Condition Badge */}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{item.conditionGrade || "Certified Pristine"}</Text>
          </View>

          {/* Image Dots / Carousel Indicator */}
          {images.length > 1 && (
            <View style={styles.indicatorRow}>
              {images.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setImgIdx(i)}
                  style={[styles.indicatorBar, imgIdx === i && styles.indicatorBarActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ─── TYPOGRAPHY & PRODUCT HEADER ─── */}
        <View style={styles.productBody}>
          <Text style={styles.brandSubtitle}>{item.brand.toUpperCase()}</Text>
          <Text style={styles.productTitle}>{item.title || `${item.brand} ${item.model}`}</Text>
          <Text style={styles.productPrice}>₹{price.toLocaleString("en-IN")}</Text>

          {origPrice > price && (
            <View style={styles.origPriceRow}>
              <Text style={styles.origPriceCross}>Original MRP: ₹{origPrice.toLocaleString("en-IN")}</Text>
              {discount && <Text style={styles.discountHighlight}>({discount}% off)</Text>}
            </View>
          )}

          {/* Editorial Paragraph */}
          <Text style={styles.productDescription}>
            {item.description ||
              `Certified refurbished ${item.brand} ${item.model} verified across 45 hardware and biometric checkpoints. Clean IMEI status, authentic OEM battery, and backed by comprehensive 1-year warranty for effortless peace of mind.`}
          </Text>

          {/* Color / Variant Swatches */}
          <View style={styles.swatchSection}>
            <Text style={styles.swatchTitle}>Color & Finish</Text>
            <View style={styles.swatchRow}>
              {SWATCHES.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedColor(idx)}
                  style={[
                    styles.swatchCircle,
                    { backgroundColor: s.color },
                    selectedColor === idx && styles.swatchCircleActive,
                  ]}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </View>

          {/* Specifications Bullet List (Matching Reference Image) */}
          <View style={styles.specsContainer}>
            <Text style={styles.specsHeading}>Certified Specifications</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Condition: </Text>
                  {item.conditionGrade || "Pristine (Grade A+)"}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Storage & RAM: </Text>
                  {[item.storage, item.ram].filter(Boolean).join(" / ") || "Standard Configuration"}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Hardware Testing: </Text>
                  45-Point Sensor, Touchscreen & Camera Diagnostic Passed
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>Warranty: </Text>
                  12 Months Comprehensive ZYPHOR Warranty
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletLabel}>In The Box: </Text>
                  Smartphone, Fast Charging Adapter, Braided Cable & Official Invoice
                </Text>
              </View>
            </View>
          </View>

          {/* AI Trust Score Gauge */}
          <View style={styles.trustScoreCard}>
            <View style={styles.trustTop}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={styles.trustIconCircle}>
                  <Ionicons name="shield-checkmark" size={20} color={T.primary} />
                </View>
                <View>
                  <Text style={styles.trustTitle}>Hardware Verification</Text>
                  <Text style={styles.trustSubtitle}>OEM Diagnostics & IMEI Certified</Text>
                </View>
              </View>
              <View style={styles.trustPill}>
                <Text style={styles.trustPillText}>{trust}/100</Text>
              </View>
            </View>
          </View>

          {/* Seller / Merchant Details */}
          <View style={styles.sellerRow}>
            <Ionicons name="storefront-outline" size={16} color={T.text.secondary} />
            <Text style={styles.sellerText}>
              Fulfilled by:{" "}
              <Text style={{ fontWeight: "700", color: T.text.primary }}>
                {item.seller?.businessName || item.seller?.name || "ZYPHOR Certified Warehouse"}
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ─── DOCKED JET BLACK ACTION BUTTON (Mōnolith Style) ─── */}
      <View style={styles.dockedBar}>
        <TouchableOpacity
          onPress={handleAddToCart}
          style={[styles.mainActionBtn, isInCart(item._id) && styles.mainActionBtnInCart]}
          activeOpacity={0.88}
        >
          <Text style={styles.mainActionBtnText}>
            {isInCart(item._id)
              ? `In Cart · View Details`
              : `₹${price.toLocaleString("en-IN")} · Add to Cart`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  topNavActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  navIconBtn: { padding: 4 },

  scrollContent: { paddingBottom: 120 },

  // Hero Canvas
  heroCanvas: {
    width: W,
    height: W * 0.88,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    padding: 24,
  },
  heroImage: { width: "100%", height: "100%" },
  heroBadge: {
    position: "absolute",
    top: 16,
    left: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  heroBadgeText: { fontSize: 10, fontWeight: "700", color: T.text.secondary, textTransform: "uppercase" },

  indicatorRow: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    gap: 6,
    alignSelf: "center",
  },
  indicatorBar: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  indicatorBarActive: { backgroundColor: T.primary, width: 34 },

  // Product Body
  productBody: { paddingHorizontal: 22, paddingTop: 20 },
  brandSubtitle: { fontSize: 11, fontWeight: "700", color: T.text.secondary, letterSpacing: 1.2 },
  productTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: T.text.primary,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 6,
  },
  productPrice: { fontSize: 22, fontWeight: "800", color: T.text.primary, marginBottom: 4 },
  origPriceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  origPriceCross: { fontSize: 13, color: T.text.secondary, textDecorationLine: "line-through" },
  discountHighlight: { fontSize: 12, color: T.green, fontWeight: "700" },

  productDescription: {
    fontSize: 14,
    color: T.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Color Swatches
  swatchSection: { marginBottom: 20 },
  swatchTitle: { fontSize: 12, fontWeight: "700", color: T.text.secondary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  swatchRow: { flexDirection: "row", gap: 12 },
  swatchCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchCircleActive: { borderColor: T.primary, transform: [{ scale: 1.1 }] },

  // Specs Bullet List
  specsContainer: {
    backgroundColor: T.bg.secondary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 16,
  },
  specsHeading: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginBottom: 12 },
  bulletList: { gap: 8 },
  bulletItem: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  bulletDot: { fontSize: 14, color: T.text.secondary, lineHeight: 18 },
  bulletText: { fontSize: 13, color: T.text.secondary, flex: 1, lineHeight: 18 },
  bulletLabel: { fontWeight: "700", color: T.text.primary },

  // Trust Score Card
  trustScoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border.color,
    padding: 16,
    marginBottom: 16,
    ...T.shadow.card,
  },
  trustTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trustIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  trustTitle: { fontSize: 14, fontWeight: "700", color: T.text.primary },
  trustSubtitle: { fontSize: 11, color: T.text.secondary, marginTop: 1 },
  trustPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: T.primary,
  },
  trustPillText: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },

  sellerRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8 },
  sellerText: { fontSize: 12, color: T.text.secondary },

  // Docked Bottom Bar
  dockedBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: T.border.color,
  },
  mainActionBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mainActionBtnInCart: { backgroundColor: T.green },
  mainActionBtnText: { fontSize: 15, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.3 },
});
