import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../styles/theme";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const W = Dimensions.get("window").width;

export const CartHeaderBtn = ({ onPress }) => {
  const { cartCount } = useCart();
  return (
    <TouchableOpacity onPress={onPress} style={styles.cartHeaderBtn} activeOpacity={0.75}>
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
  <TouchableOpacity onPress={onPress} style={styles.catBubbleWrap} activeOpacity={0.78}>
    <View style={styles.catBubblePodium}>
      <View style={styles.catBubbleIcon}>
        <Ionicons name={icon} size={22} color={T.primary} />
        {badge && (
          <View style={styles.bubbleBadge}>
            <Text style={styles.bubbleBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </View>
    <Text style={styles.catBubbleLabel} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const Btn = ({
  title,
  onPress,
  loading,
  icon,
  variant = "primary",
  style,
  disabled,
  small,
}) => {
  const isSec = variant === "secondary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isGreen = variant === "green";
  const isBooth = variant === "booth";

  const btnBg = isSec
    ? T.bg.secondary
    : isOutline
    ? "transparent"
    : isDanger
    ? "#DC2626"
    : isGreen
    ? "#16A34A"
    : isBooth
    ? "#181818"
    : T.primary; // #181818

  const textColor = isSec || isOutline ? T.text.primary : "#FFFFFF";
  const borderStyle = isOutline
    ? { borderWidth: 1.5, borderColor: T.primary }
    : isSec
    ? { borderWidth: 1, borderColor: T.border.color }
    : isBooth
    ? { borderWidth: 1, borderColor: "#333333" }
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
          <Text style={[styles.btnText, { color: textColor }, small && { fontSize: 13 }]}>
            {title}
          </Text>
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
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focus ? T.primary : T.text.secondary}
            style={{ marginRight: 10 }}
          />
        )}
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
  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
};

export const Badge = ({ label, color = T.primary, icon }) => (
  <View style={[styles.badge, { backgroundColor: T.bg.secondary, borderColor: T.border.color }]}>
    {icon && <Ionicons name={icon} size={11} color={color} />}
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>
);

export const BoothBadge = ({ label, status = "CERTIFIED" }) => (
  <View style={styles.boothBadge}>
    <View style={styles.boothBadgeDot} />
    <Text style={styles.boothBadgeText}>{label || status}</Text>
  </View>
);

export const ListingCard = ({ item, onPress, wide, onAddToCart }) => {
  const { isWishlisted, toggle } = useWishlist();
  const cardId = String(item?._id || item?.id || "");
  const wishlist = isWishlisted(cardId);
  const price = Number(item?.price || 0);
  const origPrice = item?.originalPrice ? Number(item.originalPrice) : Math.round(price * 1.3);
  const discount = origPrice > price ? Math.round(((origPrice - price) / origPrice) * 100) : null;
  const grade = item?.conditionGrade || "Pristine";

  return (
    <TouchableOpacity
      style={[styles.listCard, wide && { width: "100%" }]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* ─── Sculpted Museum Plinth Image Canvas (Booth Style) ─── */}
      <View style={styles.plinthCanvas}>
        {item?.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.listImg} resizeMode="contain" />
        ) : (
          <View style={styles.listImgPlaceholder}>
            <Ionicons name="phone-portrait-outline" size={38} color={T.text.muted} />
          </View>
        )}

        {/* Delicate Plinth Pedestal Reflection Bar */}
        <View style={styles.plinthPedestalBar} />

        {/* Top Right Frosted Wishlist Pill */}
        <TouchableOpacity
          onPress={() => toggle(cardId)}
          style={styles.wishlistBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={wishlist ? "heart" : "heart-outline"}
            size={17}
            color={wishlist ? T.red : T.primary}
          />
        </TouchableOpacity>

        {/* Bottom Left Exhibition Edition Tag */}
        <View style={styles.boothTag}>
          <View style={styles.boothTagDot} />
          <Text style={styles.boothTagText}>{grade}</Text>
        </View>

        {/* Top Left Discount Tag */}
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      {/* ─── Product Exhibition Info Section ─── */}
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {item?.brand} {item?.model}
        </Text>
        <Text style={styles.listSpec} numberOfLines={1}>
          {[item?.storage, item?.ram].filter(Boolean).join(" • ") ||
            item?.category ||
            item?.partCategory ||
            "OEM Hardware"}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.listPrice}>₹{price.toLocaleString("en-IN")}</Text>
          {origPrice > price && (
            <Text style={styles.mrpCross}>₹{origPrice.toLocaleString("en-IN")}</Text>
          )}
        </View>

        <View style={styles.listBottom}>
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark-outline" size={11} color={T.text.secondary} />
            <Text style={styles.verifiedLabel}>12M Boutique Wrty</Text>
          </View>

          {onAddToCart && (
            <TouchableOpacity onPress={onAddToCart} style={styles.quickAddBtn} activeOpacity={0.75}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const SecHeader = ({ index, title, sub, action, actionLabel }) => (
  <View style={styles.secHead}>
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        {index && <Text style={styles.secIndex}>{index} //</Text>}
        <Text style={styles.secTitle}>{title}</Text>
      </View>
      {sub && <Text style={styles.secSub}>{sub}</Text>}
    </View>
    {action && (
      <TouchableOpacity
        onPress={action}
        style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        activeOpacity={0.7}
      >
        <Text style={styles.secAction}>{actionLabel || "See all"}</Text>
        <Ionicons name="chevron-forward" size={13} color={T.primary} />
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
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },

  // Boutique Category Podium Bubble
  catBubbleWrap: { alignItems: "center", width: 72, marginHorizontal: 3 },
  catBubblePodium: {
    padding: 3,
    borderRadius: 32,
    backgroundColor: "#FAF9F7",
    borderWidth: 1,
    borderColor: "#EAE8E4",
    marginBottom: 6,
  },
  catBubbleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: T.border.color,
    position: "relative",
  },
  catBubbleLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: T.text.secondary,
    textAlign: "center",
  },
  bubbleBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: T.green,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bubbleBadgeText: { fontSize: 8, fontWeight: "800", color: "#FFFFFF" },

  btnBase: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { fontSize: T.fonts.base, fontWeight: "700", letterSpacing: 0.2 },

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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: T.border.color,
    overflow: "hidden",
    ...T.shadow.card,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 10, fontWeight: "600" },

  boothBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FAF9F7",
    borderWidth: 1,
    borderColor: "#EAE8E4",
  },
  boothBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#16A34A" },
  boothBadgeText: { fontSize: 9, fontWeight: "800", color: "#181818", letterSpacing: 0.8 },

  // ─── Boutique Exhibition Plinth Product Card ───
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EAE8E4",
    overflow: "hidden",
    width: (W - 48) / 2,
    marginBottom: 16,
    ...T.shadow.card,
  },
  plinthCanvas: {
    height: 164,
    position: "relative",
    backgroundColor: "#FAF9F7",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EFEB",
  },
  plinthPedestalBar: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: "#E5E3DF",
  },
  listImg: { width: "100%", height: "100%" },
  listImgPlaceholder: { justifyContent: "center", alignItems: "center", flex: 1 },

  wishlistBtn: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#EAE8E4",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  boothTag: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderWidth: 1,
    borderColor: "#EAE8E4",
  },
  boothTagDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#181818" },
  boothTagText: {
    fontSize: 9,
    color: "#181818",
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  discountBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    backgroundColor: "#181818",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  discountText: { fontSize: 8.5, color: "#FFFFFF", fontWeight: "900", letterSpacing: 0.4 },

  listInfo: { padding: 12 },
  listTitle: { fontSize: 13, fontWeight: "700", color: T.text.primary, marginBottom: 2 },
  listSpec: { fontSize: 11, color: T.text.secondary, marginBottom: 7 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 8 },
  listPrice: { fontSize: 15, fontWeight: "900", color: T.text.primary },
  mrpCross: { fontSize: 11, color: T.text.muted, textDecorationLine: "line-through" },
  listBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verifiedPill: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedLabel: { fontSize: 9.5, color: T.text.secondary, fontWeight: "600" },
  quickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },

  secHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  secIndex: { fontSize: 11, fontWeight: "800", color: "#C5A880", letterSpacing: 1 },
  secTitle: { fontSize: 19, fontWeight: "900", color: T.text.primary, letterSpacing: -0.3 },
  secSub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },
  secAction: { fontSize: 12, color: T.primary, fontWeight: "700", letterSpacing: 0.3 },

  empty: { alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.bg.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: T.text.primary, textAlign: "center" },
  emptySub: { fontSize: 13, color: T.text.secondary, textAlign: "center", marginTop: 6, lineHeight: 18 },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#EAE8E4",
    ...T.shadow.card,
  },
  statVal: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, color: T.text.secondary, textAlign: "center", fontWeight: "600" },
});
