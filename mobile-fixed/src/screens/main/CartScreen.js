import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { useCart } from "../../context/CartContext";
import { Btn } from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, clearCart, cartCount, cartSubtotal } = useCart();
  const { t } = useTranslation();

  const deliveryFee = 0; // Free Insured Express Delivery
  const totalPayable = cartSubtotal + deliveryFee;

  const handleCheckout = () => {
    navigation.navigate("Checkout");
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.canvas} />
        <View style={styles.emptyIconCircle}>
          <Ionicons name="bag-handle-outline" size={44} color={tokens.colors.accentStrong} />
        </View>
        <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
        <Text style={styles.emptySub}>
          Discover certified pre-owned smartphones backed by a 45-point diagnostic check, 6-month warranty, and 48-hour escrow window.
        </Text>
        <View style={styles.emptyActions}>
          <Btn
            title="Browse Certified Devices"
            onPress={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            rightIcon="arrow-forward"
            variant="primary"
            style={{ minWidth: 220 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* Luxury Editorial Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
          <Text style={styles.headerSub}>
            {cartCount} {cartCount === 1 ? "certified device" : "certified devices"}
          </Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn} activeOpacity={0.7}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Buyer Protection & Escrow Guarantee Plinth */}
        <View style={styles.guaranteeBanner}>
          <View style={styles.shieldIconWrap}>
            <Ionicons name="shield-checkmark" size={20} color={tokens.colors.accentStrong} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guaranteeTitle}>ZYPHOR 48h Escrow Guarantee</Text>
            <Text style={styles.guaranteeText}>
              Payment is held securely in escrow. Released to seller only after your 48-hour approval inspection.
            </Text>
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {cart.map((item) => {
            const orig = item.originalPrice || Math.round(item.price * 1.25);
            return (
              <View key={item.id} style={styles.cartCard}>
                <View style={styles.itemImgWrap}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="contain" />
                  ) : (
                    <Ionicons name="phone-portrait-outline" size={32} color={tokens.colors.textMuted} />
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.brand} {item.model}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      style={styles.trashBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color={tokens.colors.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.specBadgeRow}>
                    <View style={styles.specBadge}>
                      <Text style={styles.specBadgeText}>
                        {item.storage || item.condition || "Certified Pristine"}
                      </Text>
                    </View>
                    <View style={styles.warrantyBadge}>
                      <Ionicons name="ribbon-outline" size={11} color={tokens.colors.accentStrong} />
                      <Text style={styles.warrantyText}>6M Warranty</Text>
                    </View>
                  </View>

                  <View style={styles.itemBottomRow}>
                    <View style={styles.itemPrices}>
                      <Text style={styles.itemPrice}>₹{Number(item.price).toLocaleString("en-IN")}</Text>
                      {orig > item.price && (
                        <Text style={styles.itemOrig}>₹{orig.toLocaleString("en-IN")}</Text>
                      )}
                    </View>

                    {/* Quantity Controls */}
                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="remove" size={14} color={tokens.colors.ink} />
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{item.quantity || 1}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        style={styles.qtyBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="add" size={14} color={tokens.colors.ink} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary & Fee Transparency Plinth */}
        <View style={styles.billCard}>
          <Text style={styles.billHeader}>Order Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Bag Subtotal</Text>
            <Text style={styles.billVal}>₹{cartSubtotal.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Express Insured Delivery</Text>
            <Text style={[styles.billVal, { color: tokens.colors.success }]}>FREE</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>48h Escrow Protection Insurance</Text>
            <Text style={[styles.billVal, { color: tokens.colors.success }]}>FREE</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Estimated GST (18% Included)</Text>
            <Text style={styles.billVal}>Included</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{totalPayable.toLocaleString("en-IN")}</Text>
          </View>
        </View>

        {/* Trust Badges Rail */}
        <View style={styles.trustFooterRow}>
          <View style={styles.trustItem}>
            <Ionicons name="lock-closed-outline" size={14} color={tokens.colors.accentStrong} />
            <Text style={styles.trustItemText}>256-Bit Escrow</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Ionicons name="refresh-outline" size={14} color={tokens.colors.accentStrong} />
            <Text style={styles.trustItemText}>Easy Doorstep Return</Text>
          </View>
          <View style={styles.trustDot} />
          <View style={styles.trustItem}>
            <Ionicons name="shield-outline" size={14} color={tokens.colors.accentStrong} />
            <Text style={styles.trustItemText}>6M Vault Warranty</Text>
          </View>
        </View>
      </ScrollView>

      {/* Docked Checkout Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalVal}>₹{totalPayable.toLocaleString("en-IN")}</Text>
        </View>
        <Btn
          title="Proceed to Escrow →"
          onPress={handleCheckout}
          variant="primary"
          style={{ width: 190 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: { padding: 18, paddingBottom: 120 },

  emptyContainer: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: tokens.colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "40",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: tokens.colors.ink,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyActions: {
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  headerSub: {
    fontSize: 11.5,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
    marginTop: 1,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },

  guaranteeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.accentSoft,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "50",
    marginBottom: 16,
    gap: 12,
  },
  shieldIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    marginBottom: 2,
  },
  guaranteeText: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    lineHeight: 16,
  },

  itemsList: {
    gap: 12,
    marginBottom: 18,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  itemImgWrap: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemImg: {
    width: 64,
    height: 64,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
    flex: 1,
    marginRight: 6,
  },
  trashBtn: {
    padding: 2,
  },
  specBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 6,
  },
  specBadge: {
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  specBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
  },
  warrantyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  warrantyText: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemPrices: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  itemOrig: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    textDecorationLine: "line-through",
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyVal: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.ink,
    paddingHorizontal: 8,
  },

  billCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  billHeader: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
  },
  billVal: {
    fontSize: 12.5,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: "900",
    color: tokens.colors.ink,
  },

  trustFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustItemText: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.textSecondary,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: tokens.colors.border,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...tokens.shadow.elevated,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    fontWeight: "600",
  },
  bottomTotalVal: {
    fontSize: 20,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
});
