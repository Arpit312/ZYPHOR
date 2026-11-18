import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Image, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../styles/theme";
import { useCart } from "../context/CartContext";

const W = Dimensions.get("window").width;

export const CartHeaderBtn = ({ onPress }) => {
  const { cartCount } = useCart();
  return (
    <TouchableOpacity onPress={onPress} style={styles.cartHeaderBtn} activeOpacity={0.7}>
      <Ionicons name="bag-outline" size={23} color={T.text.primary} />
      {cartCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const CategoryBubble = ({ icon, label, onPress, color = T.primary, badge }) => (
  <TouchableOpacity onPress={onPress} style={styles.catBubbleWrap} activeOpacity={0.75}>
    <View style={styles.catBubbleIcon}>
      <Ionicons name={icon} size={22} color={T.primary} />
      {badge && (
        <View style={styles.bubbleBadge}>
          <Text style={styles.bubbleBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.catBubbleLabel} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

export const Btn = ({ title, onPress, loading, icon, variant = "primary", style, disabled, small }) => {
  const isSec = variant === "secondary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isGreen = variant === "green";

  const btnBg = isSec
    ? T.bg.secondary
    : isOutline
    ? "transparent"
    : isDanger
    ? "#DC2626"
    : isGreen
    ? "#16A34A"
    : T.primary; // #181818

  const textColor = isSec || isOutline ? T.text.primary : "#FFFFFF";
  const borderStyle = isOutline
    ? { borderWidth: 1.5, borderColor: T.primary }
    : isSec
    ? { borderWidth: 1, borderColor: T.border.color }
    : {};

  return (
    <TouchableOpacity
      style={[
        styles.btnBase,
        { backgroundColor: btnBg },
        borderStyle,
        small && { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
        (loading || disabled) && { opacity: 0.55 },
        style,
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.btnContent}>
          {icon && <Ionicons name={icon} size={small ? 15 : 18} color={textColor} />}
          <Text style={[styles.btnText, { color: textColor }, small && { fontSize: 13 }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const Input = ({ label, icon, error, right, ...props }) => {
  const [focus, setFocus] = React.useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputBox, focus && styles.inputFocus, error && styles.inputError]}>
        {icon && <Ionicons name={icon} size={18} color={focus ? T.primary : T.text.secondary} style={{ marginRight: 10 }} />}
        <TextInput
          style={styles.inputText}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          {...props}
        />
        {right}
      </View>
      {error && <Text style={styles.errText}>{error}</Text>}
    </View>
  );
};

export const Card = ({ children, style, onPress }) => {
  const content = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.85}>{content}</TouchableOpacity> : content;
};

export const Badge = ({ label, color = T.primary, icon }) => (
  <View style={[styles.badge, { backgroundColor: T.bg.secondary, borderColor: T.border.color }]}>
    {icon && <Ionicons name={icon} size={11} color={color} />}
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

export const ListingCard = ({ item, onPress, wide, onAddToCart }) => {
  const [wishlist, setWishlist] = React.useState(false);
  const trust = item?.verification?.trustScore || 0;
  const price = Number(item?.price || 0);
  const origPrice = item?.originalPrice ? Number(item.originalPrice) : Math.round(price * 1.3);
  const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null;

  return (
    <TouchableOpacity
      style={[styles.listCard, wide && { width: "100%" }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Product Image Canvas */}
      <View style={styles.listImgWrap}>
        {item?.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.listImg} resizeMode="contain" />
        ) : (
          <View style={styles.listImgPlaceholder}>
            <Ionicons name="phone-portrait-outline" size={36} color={T.text.muted} />
          </View>
        )}

        {/* Top Right Heart Wishlist Button (Mōnolith Style) */}
        <TouchableOpacity
          onPress={() => setWishlist((w) => !w)}
          style={styles.wishlistBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={wishlist ? "heart" : "heart-outline"}
            size={18}
            color={wishlist ? T.primary : T.primary}
          />
        </TouchableOpacity>

        {/* Top Left Condition Tag */}
        <View style={styles.condBadge}>
          <Text style={styles.condBadgeText}>{item?.conditionGrade || "Certified"}</Text>
        </View>

        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      {/* Product Info Section */}
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {item?.brand} {item?.model}
        </Text>
        <Text style={styles.listSpec} numberOfLines={1}>
          {[item?.storage, item?.ram].filter(Boolean).join(" • ") || item?.category || item?.partCategory || "Pristine Finish"}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.listPrice}>₹{price.toLocaleString("en-IN")}</Text>
          {origPrice > price && (
            <Text style={styles.mrpCross}>₹{origPrice.toLocaleString("en-IN")}</Text>
          )}
        </View>

        <View style={styles.listBottom}>
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark-outline" size={12} color={T.text.secondary} />
            <Text style={styles.verifiedLabel}>12M Warranty</Text>
          </View>
          {onAddToCart && (
            <TouchableOpacity onPress={onAddToCart} style={styles.quickAddBtn} activeOpacity={0.7}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const SecHeader = ({ title, sub, action, actionLabel }) => (
  <View style={styles.secHead}>
    <View>
      <Text style={styles.secTitle}>{title}</Text>
      {sub && <Text style={styles.secSub}>{sub}</Text>}
    </View>
    {action && (
      <TouchableOpacity onPress={action} style={{ flexDirection: "row", alignItems: "center", gap: 4 }} activeOpacity={0.7}>
        <Text style={styles.secAction}>{actionLabel || "See all"}</Text>
        <Ionicons name="chevron-forward" size={14} color={T.primary} />
      </TouchableOpacity>
    )}
  </View>
);

export const Empty = ({ icon = "search-outline", title, sub, action, actionLabel }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name={icon} size={36} color={T.text.muted} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {sub && <Text style={styles.emptySub}>{sub}</Text>}
    {action && (
      <Btn title={actionLabel || "Retry"} onPress={action} style={{ marginTop: 16, minWidth: 140 }} small />
    )}
  </View>
);

export const StatCard = ({ icon, value, label, color = T.primary }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  cartHeaderBtn: { position: "relative", padding: 6 },
  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: T.primary,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  cartBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },

  catBubbleWrap: { alignItems: "center", width: 70, marginHorizontal: 4 },
  catBubbleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 6,
    position: "relative"
  },
  catBubbleLabel: { fontSize: 11, fontWeight: "600", color: T.text.secondary, textAlign: "center" },
  bubbleBadge: { position: "absolute", top: -2, right: -2, backgroundColor: T.green, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  bubbleBadgeText: { fontSize: 8, fontWeight: "800", color: "#FFFFFF" },

  btnBase: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { fontSize: T.fonts.base, fontWeight: "600", letterSpacing: 0.2 },

  label: { fontSize: 13, color: T.text.secondary, marginBottom: 6, fontWeight: "500" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputFocus: { borderColor: T.primary, backgroundColor: "#FFFFFF" },
  inputError: { borderColor: T.red },
  inputText: { flex: 1, fontSize: 14, color: T.text.primary, paddingVertical: 8 },
  errText: { fontSize: 11, color: T.red, marginTop: 4, marginLeft: 2 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border.color,
    overflow: "hidden",
    ...T.shadow.card
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1
  },
  badgeText: { fontSize: 10, fontWeight: "600" },

  // Mōnolith Minimalist 2-Column Product Card
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: T.border.color,
    overflow: "hidden",
    width: (W - 48) / 2,
    marginBottom: 16,
    ...T.shadow.card
  },
  listImgWrap: {
    height: 160,
    position: "relative",
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    padding: 12
  },
  listImg: { width: "100%", height: "100%" },
  listImgPlaceholder: { justifyContent: "center", alignItems: "center", flex: 1 },
  wishlistBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2
  },
  condBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: T.border.color
  },
  condBadgeText: { fontSize: 9, color: T.text.secondary, fontWeight: "700", textTransform: "uppercase" },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: T.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  discountText: { fontSize: 9, color: "#FFFFFF", fontWeight: "800" },

  listInfo: { padding: 12 },
  listTitle: { fontSize: 13, fontWeight: "700", color: T.text.primary, marginBottom: 2 },
  listSpec: { fontSize: 11, color: T.text.secondary, marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 8 },
  listPrice: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  mrpCross: { fontSize: 11, color: T.text.muted, textDecorationLine: "line-through" },
  listBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verifiedPill: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedLabel: { fontSize: 10, color: T.text.secondary, fontWeight: "500" },
  quickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center"
  },

  secHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14, paddingHorizontal: 2 },
  secTitle: { fontSize: 19, fontWeight: "800", color: T.text.primary, letterSpacing: -0.2 },
  secSub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },
  secAction: { fontSize: 13, color: T.primary, fontWeight: "600" },

  empty: { alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.bg.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: T.text.primary, textAlign: "center" },
  emptySub: { fontSize: 13, color: T.text.secondary, textAlign: "center", marginTop: 6, lineHeight: 18 },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: T.border.color
  },
  statVal: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 10, color: T.text.secondary, textAlign: "center", fontWeight: "500" }
});
