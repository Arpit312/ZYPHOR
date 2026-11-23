import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Image,
  Dimensions,
  Modal,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens, T } from "../theme/tokens";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const W = Dimensions.get("window").width;

// ─── 1. Header Bar with Cart Badge & Navigation ───
export const HeaderBar = ({ title, subtitle, onBack, rightAction, rightIcon, rightBadge }) => (
  <View style={styles.headerBar}>
    <View style={styles.headerLeft}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.headerBackBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={tokens.colors.ink} />
        </TouchableOpacity>
      )}
      <View>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.headerSub} numberOfLines={1}>{subtitle}</Text>}
      </View>
    </View>
    {rightAction && (
      <TouchableOpacity onPress={rightAction} style={styles.headerRightBtn} activeOpacity={0.7}>
        <Ionicons name={rightIcon || "ellipsis-horizontal"} size={22} color={tokens.colors.ink} />
        {Number(rightBadge) > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{rightBadge > 9 ? "9+" : rightBadge}</Text>
          </View>
        )}
      </TouchableOpacity>
    )}
  </View>
);

export const CartHeaderBtn = ({ onPress }) => {
  const { cartCount } = useCart();
  return (
    <TouchableOpacity onPress={onPress} style={styles.cartHeaderBtn} activeOpacity={0.75}>
      <Ionicons name="bag-outline" size={23} color={tokens.colors.ink} />
      {cartCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{cartCount > 9 ? "9+" : cartCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── 2. Luxury Button (Primary, Gold, Secondary, Outline, Danger) ───
export const Btn = ({
  title,
  onPress,
  loading,
  icon,
  rightIcon,
  variant = "primary",
  style,
  textStyle,
  disabled,
  small,
}) => {
  const isGold = variant === "gold";
  const isSec = variant === "secondary";
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";

  const btnBg = isGold
    ? tokens.colors.accent
    : isSec
    ? tokens.colors.surfaceAlt
    : isOutline || isGhost
    ? "transparent"
    : isDanger
    ? tokens.colors.error
    : tokens.colors.ink;

  const textColor = isGold
    ? "#FFFFFF"
    : isSec || isOutline || isGhost
    ? tokens.colors.ink
    : "#FFFFFF";

  const borderStyle = isOutline
    ? { borderWidth: 1.5, borderColor: tokens.colors.ink }
    : isSec
    ? { borderWidth: 1, borderColor: tokens.colors.border }
    : isGold
    ? { borderWidth: 1, borderColor: tokens.colors.accentStrong }
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
          <Text style={[styles.btnText, { color: textColor }, small && { fontSize: 13 }, textStyle]}>
            {title}
          </Text>
          {rightIcon && <Ionicons name={rightIcon} size={small ? 15 : 18} color={textColor} />}
        </View>
      )}
    </TouchableOpacity>
  );
};
export const Button = Btn;

// ─── 3. Precision Input / TextField ───
export const Input = ({ label, icon, error, right, helper, ...props }) => {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputBox, focus && styles.inputFocus, error && styles.inputError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={focus ? tokens.colors.ink : tokens.colors.textMuted}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          style={styles.inputText}
          placeholderTextColor={tokens.colors.textMuted}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          {...props}
        />
        {right}
      </View>
      {error ? (
        <Text style={styles.errText}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </View>
  );
};

// ─── 4. Recommerce Grade Badges ───
export const GradeBadge = ({ grade = "Pristine", showExplainer }) => {
  const g = String(grade).toLowerCase();
  const isPristine = g.includes("pristine");
  const isExcellent = g.includes("excellent");
  const isGood = g.includes("good");

  const bg = isPristine
    ? tokens.colors.accentSoft
    : isExcellent
    ? tokens.colors.successBg
    : isGood
    ? tokens.colors.infoBg
    : tokens.colors.surfaceAlt;

  const color = isPristine
    ? tokens.colors.accentStrong
    : isExcellent
    ? tokens.colors.success
    : isGood
    ? tokens.colors.info
    : tokens.colors.textSecondary;

  const label = isPristine
    ? "Pristine (Like New)"
    : isExcellent
    ? "Excellent"
    : isGood
    ? "Good"
    : "Fair";

  return (
    <View style={[styles.gradeBadgeWrap, { backgroundColor: bg, borderColor: color + "40" }]}>
      <View style={[styles.gradeDot, { backgroundColor: color }]} />
      <Text style={[styles.gradeText, { color }]}>{label}</Text>
      {showExplainer && (
        <Ionicons name="information-circle-outline" size={12} color={color} style={{ marginLeft: 3 }} />
      )}
    </View>
  );
};

export const Badge = ({ label, color = tokens.colors.ink, bg, icon }) => (
  <View style={[styles.badge, { backgroundColor: bg || tokens.colors.surfaceAlt, borderColor: color + "33" }]}>
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

// ─── 5. PriceTag with Rupee Formatting & Discount ───
export const PriceTag = ({ price, originalPrice, size = "md" }) => {
  const p = Number(price || 0);
  const orig = originalPrice ? Number(originalPrice) : Math.round(p * 1.3);
  const discount = orig > p ? Math.round(((orig - p) / orig) * 100) : null;

  const isLg = size === "lg";
  const isSm = size === "sm";

  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceCurrent, isLg && { fontSize: 24 }, isSm && { fontSize: 13 }]}>
        ₹{p.toLocaleString("en-IN")}
      </Text>
      {orig > p && (
        <Text style={[styles.priceOriginal, isLg && { fontSize: 14 }, isSm && { fontSize: 10 }]}>
          ₹{orig.toLocaleString("en-IN")}
        </Text>
      )}
      {discount && (
        <View style={styles.saveTag}>
          <Text style={styles.saveTagText}>{discount}% OFF</Text>
        </View>
      )}
    </View>
  );
};

// ─── 6. Four-Pillar Trust Strip ───
export const TrustStrip = () => (
  <View style={styles.trustStripContainer}>
    <View style={styles.trustPillar}>
      <Ionicons name="shield-checkmark" size={17} color={tokens.colors.accent} />
      <Text style={styles.trustPillarTitle}>45-Point Check</Text>
      <Text style={styles.trustPillarSub}>Certified OEM Parts</Text>
    </View>
    <View style={styles.trustDivider} />
    <View style={styles.trustPillar}>
      <Ionicons name="time" size={17} color={tokens.colors.accent} />
      <Text style={styles.trustPillarTitle}>48h Approval</Text>
      <Text style={styles.trustPillarSub}>Escrow Protected</Text>
    </View>
    <View style={styles.trustDivider} />
    <View style={styles.trustPillar}>
      <Ionicons name="ribbon" size={17} color={tokens.colors.accent} />
      <Text style={styles.trustPillarTitle}>6M Warranty</Text>
      <Text style={styles.trustPillarSub}>Free Replacement</Text>
    </View>
    <View style={styles.trustDivider} />
    <View style={styles.trustPillar}>
      <Ionicons name="car" size={17} color={tokens.colors.accent} />
      <Text style={styles.trustPillarTitle}>Free Delivery</Text>
      <Text style={styles.trustPillarSub}>Doorstep Express</Text>
    </View>
  </View>
);

// ─── 7. Accordion for Inspection & Policies ───
export const Accordion = ({ title, children, defaultOpen = false, icon, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          {icon && <Ionicons name={icon} size={18} color={tokens.colors.accent} />}
          <Text style={styles.accordionTitle}>{title}</Text>
          {badge && (
            <View style={styles.accordionBadge}>
              <Text style={styles.accordionBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={tokens.colors.textSecondary}
        />
      </TouchableOpacity>
      {open && <View style={styles.accordionBody}>{children}</View>}
    </View>
  );
};

// ─── 8. Stepper / Order Timeline ───
export const OrderTimeline = ({ steps, activeIndex = 0 }) => {
  return (
    <View style={styles.timelineWrap}>
      {steps.map((st, i) => {
        const isDone = i < activeIndex;
        const isCurrent = i === activeIndex;
        const isLast = i === steps.length - 1;

        return (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.timelineTrack}>
              <View
                style={[
                  styles.timelineNode,
                  isDone && styles.timelineNodeDone,
                  isCurrent && styles.timelineNodeCurrent,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <View style={[styles.timelineNodeDot, isCurrent && { backgroundColor: tokens.colors.accent }]} />
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    isDone && { backgroundColor: tokens.colors.success },
                  ]}
                />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={[styles.timelineTitle, isCurrent && { color: tokens.colors.ink, fontWeight: "700" }]}>
                {st.title}
              </Text>
              {st.description && <Text style={styles.timelineDesc}>{st.description}</Text>}
              {st.time && <Text style={styles.timelineTime}>{st.time}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
};

// ─── 9. Bottom Sheet Modal ───
export const BottomSheetModal = ({ visible, onClose, title, children }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.modalBackdrop} onPress={onClose}>
      <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
            <Ionicons name="close" size={20} color={tokens.colors.ink} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

// ─── 10. Filter Pill ───
export const FilterPill = ({ label, active, onPress, count }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.filterPill, active && styles.filterPillActive]}
    activeOpacity={0.75}
  >
    <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
    {count !== undefined && (
      <View style={[styles.filterPillBadge, active && styles.filterPillBadgeActive]}>
        <Text style={[styles.filterPillBadgeText, active && styles.filterPillBadgeTextActive]}>
          {count}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

// ─── 11. Empty State ───
export const Empty = ({ icon = "search-outline", title, sub, action, actionLabel }) => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name={icon} size={36} color={tokens.colors.accent} />
    </View>
    <Text style={styles.emptyTitle}>{title}</Text>
    {sub && <Text style={styles.emptySub}>{sub}</Text>}
    {action && (
      <Btn
        title={actionLabel || "Retry"}
        onPress={action}
        style={{ marginTop: 16, minWidth: 140 }}
        small
      />
    )}
  </View>
);

// ─── 12. Museum Plinth Product Listing Card ───
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
      <View style={styles.plinthCanvas}>
        {item?.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.listImg} resizeMode="contain" />
        ) : (
          <View style={styles.listImgPlaceholder}>
            <Ionicons name="phone-portrait-outline" size={38} color={tokens.colors.textMuted} />
          </View>
        )}
        <View style={styles.plinthPedestalBar} />

        <TouchableOpacity
          onPress={() => toggle(cardId)}
          style={styles.wishlistBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={wishlist ? "heart" : "heart-outline"}
            size={17}
            color={wishlist ? tokens.colors.error : tokens.colors.ink}
          />
        </TouchableOpacity>

        <View style={styles.boothTag}>
          <View style={styles.boothTagDot} />
          <Text style={styles.boothTagText}>{grade}</Text>
        </View>

        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>

      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {item?.brand} {item?.model || item?.name}
        </Text>
        <Text style={styles.listSpec} numberOfLines={1}>
          {[item?.storage, item?.ram].filter(Boolean).join(" • ") ||
            item?.category ||
            "OEM Refurbished"}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.listPrice}>₹{price.toLocaleString("en-IN")}</Text>
          {origPrice > price && (
            <Text style={styles.mrpCross}>₹{origPrice.toLocaleString("en-IN")}</Text>
          )}
        </View>

        <View style={styles.listBottom}>
          <View style={styles.verifiedPill}>
            <Ionicons name="shield-checkmark" size={11} color={tokens.colors.accent} />
            <Text style={styles.verifiedLabel}>6M Warranty</Text>
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
        <Ionicons name="chevron-forward" size={13} color={tokens.colors.ink} />
      </TouchableOpacity>
    )}
  </View>
);

export const CategoryBubble = ({ icon, label, onPress, badge }) => (
  <TouchableOpacity onPress={onPress} style={styles.catBubbleWrap} activeOpacity={0.78}>
    <View style={styles.catBubblePodium}>
      <View style={styles.catBubbleIcon}>
        <Ionicons name={icon} size={22} color={tokens.colors.ink} />
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

export const StatCard = ({ icon, value, label, color = tokens.colors.ink }) => (
  <View style={styles.statCard}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.statVal, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  headerBackBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: tokens.colors.ink },
  headerSub: { fontSize: 12, color: tokens.colors.textSecondary, marginTop: 1 },
  headerRightBtn: { padding: 6, position: "relative" },

  cartHeaderBtn: { position: "relative", padding: 6 },
  cartBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: tokens.colors.ink,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },

  btnBase: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  btnContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  btnText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.2 },

  label: { fontSize: 13, color: tokens.colors.textSecondary, marginBottom: 6, fontWeight: "500" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputFocus: { borderColor: tokens.colors.ink, backgroundColor: "#FFFFFF" },
  inputError: { borderColor: tokens.colors.error },
  inputText: { flex: 1, fontSize: 14, color: tokens.colors.ink, paddingVertical: 8 },
  errText: { fontSize: 11, color: tokens.colors.error, marginTop: 4, marginLeft: 2 },
  helperText: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 4, marginLeft: 2 },

  gradeBadgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  gradeDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 5 },
  gradeText: { fontSize: 11, fontWeight: "700" },

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
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  boothBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: tokens.colors.success },
  boothBadgeText: { fontSize: 9, fontWeight: "800", color: tokens.colors.ink, letterSpacing: 0.8 },

  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  priceCurrent: { fontSize: 16, fontWeight: "800", color: tokens.colors.ink },
  priceOriginal: { fontSize: 12, color: tokens.colors.textMuted, textDecorationLine: "line-through" },
  saveTag: {
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  saveTagText: { fontSize: 9, fontWeight: "800", color: tokens.colors.accentStrong },

  trustStripContainer: {
    flexDirection: "row",
    backgroundColor: tokens.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
    ...tokens.shadow.subtle,
  },
  trustPillar: { flex: 1, alignItems: "center" },
  trustPillarTitle: { fontSize: 10.5, fontWeight: "700", color: tokens.colors.ink, marginTop: 4 },
  trustPillarSub: { fontSize: 8.5, color: tokens.colors.textSecondary, marginTop: 1 },
  trustDivider: { width: 1, height: 26, backgroundColor: tokens.colors.border },

  accordionContainer: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 8,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  accordionTitle: { fontSize: 14, fontWeight: "600", color: tokens.colors.ink },
  accordionBadge: {
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  accordionBadgeText: { fontSize: 10, color: tokens.colors.textSecondary, fontWeight: "600" },
  accordionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },

  timelineWrap: { paddingVertical: 8 },
  timelineRow: { flexDirection: "row", minHeight: 56 },
  timelineTrack: { alignItems: "center", width: 26 },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineNodeDone: { backgroundColor: tokens.colors.success, borderColor: tokens.colors.success },
  timelineNodeCurrent: { borderColor: tokens.colors.accent, backgroundColor: "#FFFFFF" },
  timelineNodeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.colors.border },
  timelineLine: { flex: 1, width: 2, backgroundColor: tokens.colors.border, marginVertical: 2 },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 16 },
  timelineTitle: { fontSize: 13, fontWeight: "600", color: tokens.colors.textSecondary },
  timelineDesc: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },
  timelineTime: { fontSize: 10, color: tokens.colors.textMuted, marginTop: 2 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 30,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: tokens.colors.border,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: tokens.colors.ink },
  sheetCloseBtn: { padding: 4 },
  sheetScroll: { paddingHorizontal: 20, paddingTop: 14 },

  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  filterPillActive: { backgroundColor: tokens.colors.ink, borderColor: tokens.colors.ink },
  filterPillText: { fontSize: 12, fontWeight: "600", color: tokens.colors.textSecondary },
  filterPillTextActive: { color: "#FFFFFF" },
  filterPillBadge: {
    marginLeft: 6,
    backgroundColor: tokens.colors.border,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  filterPillBadgeActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  filterPillBadgeText: { fontSize: 9, color: tokens.colors.ink, fontWeight: "700" },
  filterPillBadgeTextActive: { color: "#FFFFFF" },

  empty: { alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tokens.colors.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: tokens.colors.ink, textAlign: "center" },
  emptySub: { fontSize: 13, color: tokens.colors.textSecondary, textAlign: "center", marginTop: 6, lineHeight: 18 },

  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: "hidden",
    width: (W - 48) / 2,
    marginBottom: 16,
    ...tokens.shadow.card,
  },
  plinthCanvas: {
    height: 164,
    position: "relative",
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  plinthPedestalBar: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: tokens.colors.border,
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
    borderColor: tokens.colors.border,
    zIndex: 2,
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
    borderColor: tokens.colors.border,
  },
  boothTagDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: tokens.colors.ink },
  boothTagText: {
    fontSize: 9,
    color: tokens.colors.ink,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  discountBadge: {
    position: "absolute",
    top: 9,
    left: 9,
    backgroundColor: tokens.colors.ink,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
  },
  discountText: { fontSize: 8.5, color: "#FFFFFF", fontWeight: "900", letterSpacing: 0.4 },

  listInfo: { padding: 12 },
  listTitle: { fontSize: 13, fontWeight: "700", color: tokens.colors.ink, marginBottom: 2 },
  listSpec: { fontSize: 11, color: tokens.colors.textSecondary, marginBottom: 7 },
  listPrice: { fontSize: 15, fontWeight: "900", color: tokens.colors.ink },
  mrpCross: { fontSize: 11, color: tokens.colors.textMuted, textDecorationLine: "line-through" },
  listBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  verifiedPill: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedLabel: { fontSize: 9.5, color: tokens.colors.textSecondary, fontWeight: "600" },
  quickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: "hidden",
    ...tokens.shadow.card,
  },

  secHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  secIndex: { fontSize: 11, fontWeight: "800", color: tokens.colors.accent, letterSpacing: 1 },
  secTitle: { fontSize: 19, fontWeight: "900", color: tokens.colors.ink, letterSpacing: -0.3 },
  secSub: { fontSize: 12, color: tokens.colors.textSecondary, marginTop: 2 },
  secAction: { fontSize: 12, color: tokens.colors.ink, fontWeight: "700", letterSpacing: 0.3 },

  catBubbleWrap: { alignItems: "center", width: 72, marginHorizontal: 3 },
  catBubblePodium: {
    padding: 3,
    borderRadius: 32,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
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
    borderColor: tokens.colors.border,
    position: "relative",
  },
  catBubbleLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
    textAlign: "center",
  },
  bubbleBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    backgroundColor: tokens.colors.success,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  bubbleBadgeText: { fontSize: 8, fontWeight: "800", color: "#FFFFFF" },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  statVal: { fontSize: 18, fontWeight: "900" },
  statLabel: { fontSize: 10, color: tokens.colors.textSecondary, textAlign: "center", fontWeight: "600" },
});
