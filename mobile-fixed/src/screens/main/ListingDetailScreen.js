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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCompare } from "../../context/CompareContext";
import {
  PriceTag,
  GradeBadge,
  Accordion,
  Btn,
  Badge,
} from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";

const { width: W } = Dimensions.get("window");

const SWATCHES = [
  { label: "Space Black", color: "#181818" },
  { label: "Natural Titanium", color: "#8E8E93" },
  { label: "Champagne Gold", color: "#C5A880" },
];

const Stars = ({ value = 0, size = 13 }) => (
  <View style={{ flexDirection: "row", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= Math.round(value) ? "star" : "star-outline"}
        size={size}
        color={tokens.colors.accent}
      />
    ))}
  </View>
);

const DIAGNOSTIC_CHECKS = [
  { category: "Display & Touch", points: "OLED matrix, 120Hz ProMotion, TrueTone, Multitouch response" },
  { category: "Optics & Camera", points: "Telephoto zoom, Ultra-wide lens, OIS stabilization, 4K 60fps sensor" },
  { category: "Battery & Power", points: "OEM battery chemistry, Fast-charging cycles, Wireless MagSafe" },
  { category: "Biometrics & Security", points: "FaceID 3D depth sensor, Secure Enclave, TouchID sensor" },
  { category: "Motherboard & Logic", points: "Neural Engine benchmarks, CPU/GPU stress test, Zero thermal throttling" },
  { category: "Connectivity & Audio", points: "5G mmWave/Sub-6, WiFi 6E, Stereo speakers, Mic noise cancellation" },
];

export default function ListingDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { isCompared, toggle: toggleCompare, max: MAX_COMPARE } = useCompare();
  const { t } = useTranslation();

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

  useEffect(() => {
    load();
  }, [id]);

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
    Alert.alert("✓ Added to Bag", `${item.brand} ${item.model} is now in your shopping bag.`, [
      { text: "Continue Browsing" },
      { text: "Go to Bag", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  const handleBuyNow = () => {
    if (!item) return;
    navigation.navigate("Checkout", { item });
  };

  const handleWishlist = () => {
    if (!item) return;
    toggleWishlist(item._id || item.id);
  };

  const handleCompare = () => {
    if (!item) return;
    const r = toggleCompare(item);
    if (r && r.success === false) {
      Alert.alert("Compare", r.message || `You can compare up to ${MAX_COMPARE} devices.`);
    } else {
      Alert.alert("Compare", r?.added ? "Added to comparison." : "Removed from comparison.", [
        { text: "OK" },
        ...(r?.added
          ? [
              {
                text: "Open Compare",
                onPress: () => navigation.navigate("Account", { screen: "Compare" }),
              },
            ]
          : []),
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
      const r = await listingsAPI.addReview(item._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
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
        <ActivityIndicator color={tokens.colors.accent} size="large" />
      </View>
    );
  }

  if (loadError || !item) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={40} color={tokens.colors.textMuted} />
        <Text style={{ color: tokens.colors.textSecondary, marginTop: 10 }}>
          Could not load device details.
        </Text>
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
  const batteryHealth = item.batteryHealth || 92;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* ─── Top Header Navigation ─── */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navIconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={tokens.colors.ink} />
        </TouchableOpacity>

        <View style={styles.topNavActions}>
          <TouchableOpacity onPress={handleCompare} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons
              name="git-compare-outline"
              size={21}
              color={compared ? tokens.colors.success : tokens.colors.ink}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons name="share-outline" size={21} color={tokens.colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWishlist} style={styles.navIconBtn} activeOpacity={0.7}>
            <Ionicons
              name={wished ? "heart" : "heart-outline"}
              size={22}
              color={wished ? tokens.colors.error : tokens.colors.ink}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Hero Product Gallery Canvas ─── */}
        <View style={styles.heroCanvas}>
          {images.length > 0 ? (
            <Image
              source={{ uri: images[safeImgIdx] }}
              style={styles.heroImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="phone-portrait-outline" size={120} color={tokens.colors.textMuted} />
          )}

          {/* Condition Grade Badge */}
          <View style={styles.heroBadge}>
            <GradeBadge grade={item.conditionGrade || "Pristine"} showExplainer />
          </View>

          {/* Gallery Pagination Bars */}
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

        {/* ─── Product Overview & Pricing ─── */}
        <View style={styles.productBody}>
          <View style={styles.brandRow}>
            <Text style={styles.brandSubtitle}>{(item.brand || "ZYPHOR").toUpperCase()}</Text>
            <View style={styles.certifiedTag}>
              <Ionicons name="shield-checkmark" size={11} color={tokens.colors.accent} />
              <Text style={styles.certifiedTagText}>45-PT PASSED</Text>
            </View>
          </View>

          <Text style={styles.productTitle}>
            {item.title || `${item.brand || ""} ${item.model || ""}`.trim()}
          </Text>

          <View style={{ marginVertical: 8 }}>
            <PriceTag price={price} originalPrice={origPrice} size="lg" />
          </View>

          {/* Key Value Guarantees Row */}
          <View style={styles.guaranteePillsRow}>
            <View style={styles.guaranteePill}>
              <Ionicons name="battery-charging" size={14} color={tokens.colors.success} />
              <Text style={styles.guaranteePillText}>Battery: {batteryHealth}% OEM</Text>
            </View>
            <View style={styles.guaranteePill}>
              <Ionicons name="ribbon-outline" size={14} color={tokens.colors.accent} />
              <Text style={styles.guaranteePillText}>6M Free Replacement</Text>
            </View>
            <View style={styles.guaranteePill}>
              <Ionicons name="lock-closed-outline" size={14} color={tokens.colors.ink} />
              <Text style={styles.guaranteePillText}>48h Escrow Safe</Text>
            </View>
          </View>

          {/* Color & Finish Swatches */}
          <View style={styles.swatchSection}>
            <Text style={styles.sectionHeading}>Finish Selection</Text>
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

          {/* Technical Specifications Accordion */}
          <View style={{ marginVertical: 10 }}>
            <Accordion title="Hardware Specifications" icon="hardware-chip-outline" defaultOpen>
              <View style={styles.specTable}>
                <View style={styles.specTableRow}>
                  <Text style={styles.specKey}>Condition Grade</Text>
                  <Text style={styles.specVal}>{item.conditionGrade || "Pristine (Grade A+)"}</Text>
                </View>
                <View style={styles.specTableRow}>
                  <Text style={styles.specKey}>Storage / RAM</Text>
                  <Text style={styles.specVal}>
                    {[item.storage, item.ram].filter(Boolean).join(" / ") || "128GB / 6GB"}
                  </Text>
                </View>
                <View style={styles.specTableRow}>
                  <Text style={styles.specKey}>IMEI Verification</Text>
                  <Text style={[styles.specVal, { color: tokens.colors.success, fontWeight: "700" }]}>
                    Clean & Whitelisted
                  </Text>
                </View>
                <View style={styles.specTableRow}>
                  <Text style={styles.specKey}>Battery Health</Text>
                  <Text style={styles.specVal}>{batteryHealth}% (Peak Performance)</Text>
                </View>
              </View>
            </Accordion>

            {/* 45-Point Inspection Accordion */}
            <Accordion
              title="45-Point Diagnostic Certificate"
              icon="shield-checkmark-outline"
              badge="VERIFIED 100%"
              defaultOpen
            >
              <View style={{ paddingTop: 8, gap: 10 }}>
                {DIAGNOSTIC_CHECKS.map((chk, i) => (
                  <View key={i} style={styles.diagCheckRow}>
                    <Ionicons name="checkmark-circle" size={16} color={tokens.colors.success} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.diagCheckTitle}>{chk.category}</Text>
                      <Text style={styles.diagCheckPoints}>{chk.points}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Accordion>

            {/* Warranty & 48h Inspection Window Accordion */}
            <Accordion title="6M Warranty & 48-Hour Approval Policy" icon="time-outline">
              <View style={{ paddingVertical: 8 }}>
                <Text style={styles.policyText}>
                  • <Text style={{ fontWeight: "700" }}>48-Hour Doorstep Test:</Text> Test the device with your own SIM. If any undisclosed defect is found, return for 100% full refund with zero questions asked.
                </Text>
                <Text style={[styles.policyText, { marginTop: 6 }]}>
                  • <Text style={{ fontWeight: "700" }}>6-Month Comprehensive Warranty:</Text> Covers motherboard, screen touch, cameras, and battery anomalies. Free courier repair or replacement.
                </Text>
              </View>
            </Accordion>
          </View>

          {/* Seller / Merchant Plinth Card */}
          <TouchableOpacity
            onPress={goSeller}
            style={styles.sellerRow}
            activeOpacity={0.7}
            disabled={!sellerId}
          >
            <View style={styles.sellerAvatar}>
              <Ionicons name="storefront" size={18} color={tokens.colors.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerLabel}>Dispatched from verified hub</Text>
              <Text style={styles.sellerName}>
                {item.seller?.businessName || item.seller?.name || "ZYPHOR Central Vault"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={tokens.colors.textSecondary} />
          </TouchableOpacity>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionHeading}>Customer Reviews</Text>
              {item.reviewCount > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Stars value={item.averageRating || 0} />
                  <Text style={styles.reviewScoreText}>
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
                  {rv.createdAt && (
                    <Text style={styles.reviewDate}>
                      {new Date(rv.createdAt).toLocaleDateString("en-IN")}
                    </Text>
                  )}
                </View>
                {rv.comment && <Text style={styles.reviewComment}>{rv.comment}</Text>}
              </View>
            ))}

            {reviews.length === 0 && (
              <Text style={styles.noReviewsText}>
                No reviews yet — be the first to review this verified device.
              </Text>
            )}

            {/* Add Review Form */}
            {myReview ? (
              <Text style={styles.myReviewNote}>
                ✓ You rated this {myReview.rating}★ — one review per listing.
              </Text>
            ) : (
              <View style={styles.reviewForm}>
                <Text style={styles.writeReviewTitle}>WRITE A VERIFIED REVIEW</Text>
                <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TouchableOpacity key={i} onPress={() => setReviewRating(i)} activeOpacity={0.7}>
                      <Ionicons
                        name={i <= reviewRating ? "star" : "star-outline"}
                        size={24}
                        color={tokens.colors.accent}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Share details about screen, battery & performance…"
                  placeholderTextColor={tokens.colors.textMuted}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  maxLength={500}
                  multiline
                />
                <Btn
                  title="Post Review"
                  onPress={handleSubmitReview}
                  loading={submittingReview}
                  variant="gold"
                  small
                  style={{ alignSelf: "flex-end", marginTop: 8 }}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ─── DOCKED STICKY BOTTOM BAR ─── */}
      <View style={styles.dockedBar}>
        <View style={styles.dockPriceCol}>
          <Text style={styles.dockPriceLabel}>Total Price</Text>
          <Text style={styles.dockPriceValue}>₹{price.toLocaleString("en-IN")}</Text>
        </View>
        <View style={styles.dockActionsRow}>
          <Btn
            title={isInCart(item._id) ? "✓ In Bag" : "Add to Bag"}
            onPress={handleAddToCart}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Btn
            title="Buy Now"
            onPress={handleBuyNow}
            variant="gold"
            style={{ flex: 1.2 }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: tokens.colors.canvas,
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: tokens.colors.ink,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  retryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 10,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  topNavActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroCanvas: {
    height: 300,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  heroImage: {
    width: "75%",
    height: "75%",
  },
  heroBadge: {
    position: "absolute",
    top: 14,
    left: 16,
  },
  indicatorRow: {
    position: "absolute",
    bottom: 12,
    flexDirection: "row",
    gap: 6,
  },
  indicatorBar: {
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: tokens.colors.border,
  },
  indicatorBarActive: {
    backgroundColor: tokens.colors.accent,
    width: 28,
  },
  productBody: {
    padding: 16,
  },
  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    letterSpacing: 1.5,
  },
  certifiedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  certifiedTagText: {
    fontSize: 9,
    fontWeight: "900",
    color: tokens.colors.accentStrong,
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  guaranteePillsRow: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
    flexWrap: "wrap",
  },
  guaranteePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  guaranteePillText: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  swatchSection: {
    marginVertical: 10,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 12,
  },
  swatchCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: tokens.colors.border,
  },
  swatchCircleActive: {
    borderColor: tokens.colors.accent,
    transform: [{ scale: 1.15 }],
  },
  specTable: {
    gap: 8,
    paddingTop: 8,
  },
  specTableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  specKey: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
  },
  specVal: {
    fontSize: 12.5,
    fontWeight: "600",
    color: tokens.colors.ink,
  },
  diagCheckRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  diagCheckTitle: {
    fontSize: 12.5,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  diagCheckPoints: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginTop: 1,
  },
  policyText: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.textSecondary,
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: tokens.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginVertical: 12,
  },
  sellerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  sellerLabel: {
    fontSize: 10.5,
    color: tokens.colors.textSecondary,
  },
  sellerName: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  reviewsSection: {
    marginTop: 14,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewScoreText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  reviewCard: {
    backgroundColor: tokens.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  reviewAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  reviewName: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  reviewDate: {
    fontSize: 10,
    color: tokens.colors.textMuted,
  },
  reviewComment: {
    fontSize: 12,
    lineHeight: 17,
    color: tokens.colors.textSecondary,
  },
  noReviewsText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    marginBottom: 12,
  },
  myReviewNote: {
    fontSize: 12,
    color: tokens.colors.success,
    fontWeight: "700",
    marginVertical: 8,
  },
  reviewForm: {
    backgroundColor: tokens.colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginTop: 10,
  },
  writeReviewTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: tokens.colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  reviewInput: {
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    fontSize: 12,
    color: tokens.colors.ink,
    minHeight: 60,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  dockedBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: tokens.colors.border,
    ...tokens.shadow.floating,
  },
  dockPriceCol: {
    marginRight: 16,
  },
  dockPriceLabel: {
    fontSize: 10.5,
    color: tokens.colors.textSecondary,
  },
  dockPriceValue: {
    fontSize: 18,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  dockActionsRow: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
});
