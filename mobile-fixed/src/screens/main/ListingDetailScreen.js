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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCompare } from "../../context/CompareContext";

const { width: W } = Dimensions.get("window");

const SWATCHES = [
  { label: "Space Black", color: "#181818" },
  { label: "Natural Titanium", color: "#8E8E93" },
  { label: "Warm Sand", color: "#D7C4B7" },
];

const Stars = ({ value = 0, size = 12 }) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons key={i} name={i <= Math.round(value) ? "star" : "star-outline"} size={size} color={T.amber} />
    ))}
  </View>
);

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { isCompared, toggle: toggleCompare, max: MAX_COMPARE } = useCompare();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const r = await listingsAPI.getById(id);
      setItem(r.data.listing);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this certified ${item?.brand || ""} ${item?.model || ""} on ZYPHOR: ₹${Number(item?.price || 0).toLocaleString("en-IN")}`,
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
    if (!item) return;
    navigation.navigate("Checkout", { item });
  };

  const handleWishlist = () => {
    if (!item) return;
    const res = toggleWishlist(item._id || item.id);
    // toggle is async in context; fire and forget with a friendly alert on failure
    Promise.resolve(res).then((r) => {
      if (r && r.success === false) Alert.alert("Wishlist", r.message || "Could not update wishlist.");
    }).catch(() => {});
  };

  const handleCompare = () => {
    if (!item) return;
    const r = toggleCompare(item);
    if (r && r.success === false) {
      Alert.alert("Compare", r.message || `You can compare up to ${MAX_COMPARE} devices.`);
    } else {
      Alert.alert("Compare", r?.added ? "Added to comparison." : "Removed from comparison.", [
        { text: "OK" },
        ...(r?.added ? [{ text: "Open Compare", onPress: () => navigation.navigate("Account", { screen: "Compare" }) }] : []),
      ]);
    }
  };

  const handleSubmitReview = async () => {
    if (!item) return;
    if (reviewRating < 1) {
      Alert.alert("Rating required", "Tap the stars to give a rating before submitting.");
      return;
    }
    setSubmittingReview(true);
    try {
      const r = await listingsAPI.addReview(item._id, { rating: reviewRating, comment: reviewComment });
      setItem(r.data.listing);
      setReviewRating(0);
      setReviewComment("");
      Alert.alert("✓ Review posted", "Thanks! Your review is now visible on this listing.");
    } catch (err) {
      Alert.alert("Review failed", err.response?.data?.error || "Could not post review. Try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const goSeller = () => {
    if (!item) return;
    const sellerId = item.seller?._id || item.seller;
    if (!sellerId) return;
    navigation.navigate("Account", { screen: "Seller", params: { id: String(sellerId) } });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  if (loadError || !item) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={40} color={T.text.muted} />
        <Text style={{ color: T.text.secondary, marginTop: 10 }}>Could not load device details.</Text>
        <TouchableOpacity onPress={load} style={styles.retryBtn} activeOpacity={0.8}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = Number(item.price || 0);
  const origPrice = item.originalPrice ? Number(item.originalPrice) : Math.round(price * 1.3);
  const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null;
  const trust = item.verification?.trustScore || 96;
  const images = (item.images || []).filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
  const safeImgIdx = images.length > 0 ? Math.min(imgIdx, images.length - 1) : 0;
  const wished = isWishlisted(String(item._id || item.id || ""));
  const compared = isCompared(String(item._id || item.id || ""));
  const reviews = item.reviews || [];
  const myReview = reviews.find((r) => String(r.user?._id || r.user) === String(user?.id || ""));
  const sellerId = item.seller?._id || item.seller;

  return (
    <View style={styles.root}>
      {/* ─── TOP EDITORIAL NAVIGATION ─── */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navIconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={T.primary} />
        </TouchableOpacity>

        <View style={styles.topNavActions}>
          <TouchableOpacity onPress={handleCompare} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons name="git-compare-outline" size={21} color={compared ? T.green : T.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={21} color={T.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWishlist} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons name={wished ? "heart" : "heart-outline"} size={22} color={wished ? T.red : T.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── HERO PRODUCT IMAGE CANVAS ─── */}
        <View style={styles.heroCanvas}>
          {images.length > 0 ? (
            <Image source={{ uri: images[safeImgIdx] }} style={styles.heroImage} resizeMode="contain" />
          ) : (
            <Ionicons name="phone-portrait-outline" size={110} color={T.text.muted} />
          )}

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
                  style={[styles.indicatorBar, safeImgIdx === i && styles.indicatorBarActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* ─── TYPOGRAPHY & PRODUCT HEADER ─── */}
        <View style={styles.productBody}>
          <Text style={styles.brandSubtitle}>{(item.brand || "ZYPHOR").toUpperCase()}</Text>
          <Text style={styles.productTitle}>{item.title || `${item.brand || ""} ${item.model || ""}`.trim()}</Text>
          <Text style={styles.productPrice}>₹{price.toLocaleString("en-IN")}</Text>

          {origPrice > price && (
            <View style={styles.origPriceRow}>
              <Text style={styles.origPriceCross}>Original MRP: ₹{origPrice.toLocaleString("en-IN")}</Text>
              {discount ? <Text style={styles.discountHighlight}>({discount}% off)</Text> : null}
            </View>
          )}

          {/* Editorial Paragraph */}
          <Text style={styles.productDescription}>
            {item.description ||
              `Certified refurbished ${item.brand || ""} ${item.model || ""} verified across 45 hardware and biometric checkpoints. Clean IMEI status, authentic OEM battery, and backed by comprehensive 1-year warranty for effortless peace of mind.`}
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

          {/* Specifications Bullet List */}
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
                  <Text style={styles.bulletLabel}>City: </Text>
                  {item.city || "Pan-India"}
                </Text>
              </View>
              {item.imei ? (
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.bulletLabel}>IMEI: </Text>
                    {item.imei}
                  </Text>
                </View>
              ) : null}
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

          {/* Seller / Merchant Details — tappable to open storefront */}
          <TouchableOpacity onPress={goSeller} style={styles.sellerRow} activeOpacity={0.7} disabled={!sellerId}>
            <Ionicons name="storefront-outline" size={16} color={T.text.secondary} />
            <Text style={styles.sellerText}>
              Fulfilled by:{" "}
              <Text style={{ fontWeight: "700", color: T.text.primary }}>
                {item.seller?.businessName || item.seller?.name || "ZYPHOR Certified Warehouse"}
              </Text>
              {item.seller?.verifiedSeller ? <Text style={{ color: T.green, fontWeight: "700" }}> ✓ Verified</Text> : null}
            </Text>
            <Ionicons name="chevron-forward" size={14} color={T.text.secondary} />
          </TouchableOpacity>

          {/* ─── REVIEWS ─── */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.specsHeading}>Reviews</Text>
              {item.reviewCount > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Stars value={item.averageRating || 0} />
                  <Text style={{ fontSize: 12, color: T.text.secondary, fontWeight: "600" }}>
                    {item.averageRating} ({item.reviewCount})
                  </Text>
                </View>
              )}
            </View>

            {(reviews || []).map((rv, i) => (
              <View key={rv._id || i} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>{(rv.user?.name || "U")[0].toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{rv.user?.name || "Verified Buyer"}</Text>
                    <Stars value={rv.rating || 0} size={10} />
                  </View>
                  {rv.createdAt ? (
                    <Text style={styles.reviewDate}>{new Date(rv.createdAt).toLocaleDateString("en-IN")}</Text>
                  ) : null}
                </View>
                {rv.comment ? <Text style={styles.reviewComment}>{rv.comment}</Text> : null}
              </View>
            ))}

            {reviews.length === 0 && (
              <Text style={{ fontSize: 13, color: T.text.secondary, marginBottom: 12 }}>No reviews yet — be the first to review this device.</Text>
            )}

            {/* Add review form */}
            {myReview ? (
              <Text style={{ fontSize: 12, color: T.green, fontWeight: "600" }}>
                ✓ You rated this {myReview.rating}★ — one review per listing.
              </Text>
            ) : (
              <View style={styles.reviewForm}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: T.text.secondary, marginBottom: 8 }}>WRITE A REVIEW</Text>
                <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity key={i} onPress={() => setReviewRating(i)} activeOpacity={0.7}>
                      <Ionicons name={i <= reviewRating ? "star" : "star-outline"} size={24} color={T.amber} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Share your experience with this device…"
                  placeholderTextColor="#9CA3AF"
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  maxLength={500}
                  multiline
                />
                <TouchableOpacity
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                  style={[styles.reviewSubmit, submittingReview && { opacity: 0.55 }]}
                  activeOpacity={0.85}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Post Review</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ─── DOCKED ACTION BAR: Add to Cart + Buy Now ─── */}
      <View style={styles.dockedBar}>
        <View style={styles.dockRow}>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={[styles.mainActionBtn, styles.dockBtnFlex, isInCart(item._id) && styles.mainActionBtnInCart]}
            activeOpacity={0.88}
          >
            <Text style={styles.mainActionBtnText}>
              {isInCart(item._id) ? "✓ In Cart" : "Add to Cart"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBuyNow}
            style={[styles.mainActionBtn, styles.dockBtnFlex, styles.buyNowBtn]}
            activeOpacity={0.88}
          >
            <Text style={styles.mainActionBtnText}>Buy Now · ₹{price.toLocaleString("en-IN")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  retryBtn: { marginTop: 14, backgroundColor: T.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 },
  retryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

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
  indicatorBar: { width: 24, height: 3, borderRadius: 2, backgroundColor: "#D1D5DB" },
  indicatorBarActive: { backgroundColor: T.primary, width: 34 },

  // Product Body
  productBody: { paddingHorizontal: 22, paddingTop: 20 },
  brandSubtitle: { fontSize: 11, fontWeight: "700", color: T.text.secondary, letterSpacing: 1.2 },
  productTitle: { fontSize: 26, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5, marginTop: 4, marginBottom: 6 },
  productPrice: { fontSize: 22, fontWeight: "800", color: T.text.primary, marginBottom: 4 },
  origPriceRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 14 },
  origPriceCross: { fontSize: 13, color: T.text.secondary, textDecorationLine: "line-through" },
  discountHighlight: { fontSize: 12, color: T.green, fontWeight: "700" },

  productDescription: { fontSize: 14, color: T.text.secondary, lineHeight: 22, marginBottom: 20 },

  // Color Swatches
  swatchSection: { marginBottom: 20 },
  swatchTitle: { fontSize: 12, fontWeight: "700", color: T.text.secondary, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 },
  swatchRow: { flexDirection: "row", gap: 12 },
  swatchCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "transparent" },
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
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.bg.secondary, alignItems: "center", justifyContent: "center",
  },
  trustTitle: { fontSize: 14, fontWeight: "700", color: T.text.primary },
  trustSubtitle: { fontSize: 11, color: T.text.secondary, marginTop: 1 },
  trustPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: T.primary },
  trustPillText: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },

  sellerRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, marginBottom: 8 },
  sellerText: { fontSize: 12, color: T.text.secondary, flex: 1 },

  // Reviews
  reviewsSection: { marginTop: 8, marginBottom: 10 },
  reviewsHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  reviewCard: {
    backgroundColor: T.bg.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border.color,
    padding: 14,
    marginBottom: 10,
  },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: T.primary, alignItems: "center", justifyContent: "center",
  },
  reviewAvatarText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  reviewName: { fontSize: 13, fontWeight: "700", color: T.text.primary, marginBottom: 2 },
  reviewDate: { fontSize: 10, color: T.text.muted },
  reviewComment: { fontSize: 13, color: T.text.secondary, lineHeight: 18, marginTop: 8 },
  reviewForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border.color,
    padding: 14,
    ...T.shadow.card,
  },
  reviewInput: {
    backgroundColor: T.bg.input,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: T.border.color,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: T.text.primary,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  reviewSubmit: {
    backgroundColor: T.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },

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
  dockRow: { flexDirection: "row", gap: 10 },
  dockBtnFlex: { flex: 1 },
  mainActionBtn: {
    backgroundColor: T.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mainActionBtnInCart: { backgroundColor: T.green },
  buyNowBtn: { backgroundColor: T.primaryDark || "#000000" },
  mainActionBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.3 },
});
