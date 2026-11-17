import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { Btn } from "../../components/UI";

export default function CartScreen({ navigation }) {
  const { cart, removeFromCart, updateQuantity, clearCart, cartCount, cartSubtotal } = useCart();
  const { user } = useAuth();

  const deliveryFee = 0; // Free delivery
  const escrowFee = 0;   // Free escrow protection
  const totalPayable = cartSubtotal + deliveryFee + escrowFee;
  const estimatedSavings = Math.round(cartSubtotal * 0.25);

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login to proceed with your order and unlock Escrow protection.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate("Login") }
        ]
      );
      return;
    }
    navigation.navigate("Checkout");
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="cart-outline" size={48} color={T.text.muted} />
        </View>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySub}>
          Explore AI-verified phones and original spare parts with verified trust scores.
        </Text>
        <View style={styles.emptyActions}>
          <Btn
            title="Browse Phones"
            onPress={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            icon="phone-portrait-outline"
            style={{ width: 170 }}
          />
          <Btn
            title="Spare Parts"
            variant="secondary"
            onPress={() => navigation.navigate("Browse", { screen: "Parts" })}
            icon="construct-outline"
            style={{ width: 150 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={T.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.headerSub}>{cartCount} {cartCount === 1 ? "item" : "items"} selected</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Buyer Protection Banner */}
        <View style={styles.guaranteeBanner}>
          <Ionicons name="shield-checkmark" size={20} color={T.green} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.guaranteeTitle}>ZYPHOR 100% Escrow Protection</Text>
            <Text style={styles.guaranteeText}>Payment held securely until you inspect & confirm delivery.</Text>
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
                    <Image source={{ uri: item.image }} style={styles.itemImg} resizeMode="cover" />
                  ) : (
                    <Ionicons name="phone-portrait-outline" size={32} color={T.text.muted} />
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.trashBtn}>
                      <Ionicons name="trash-outline" size={16} color={T.red} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemSpecs}>
                    {item.conditionGrade || "Verified"} • {item.storage || item.listingType}
                  </Text>

                  <View style={styles.itemBottomRow}>
                    <View style={styles.itemPrices}>
                      <Text style={styles.itemPrice}>₹{item.price?.toLocaleString("en-IN")}</Text>
                      {orig > item.price && (
                        <Text style={styles.itemOrig}>₹{orig?.toLocaleString("en-IN")}</Text>
                      )}
                    </View>

                    {/* Quantity controls */}
                    <View style={styles.qtyControl}>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        style={styles.qtyBtn}
                      >
                        <Ionicons name="remove" size={14} color={T.text.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.qtyBtn}
                      >
                        <Ionicons name="add" size={14} color={T.text.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <Text style={styles.billHeader}>Bill Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total ({cartCount} items)</Text>
            <Text style={styles.billVal}>₹{cartSubtotal?.toLocaleString("en-IN")}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={[styles.billVal, { color: T.green }]}>FREE</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Escrow Safety Guarantee</Text>
            <Text style={[styles.billVal, { color: T.green }]}>INCLUDED</Text>
          </View>

          {estimatedSavings > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Total Savings on MRP</Text>
              <Text style={[styles.billVal, { color: T.green }]}>-₹{estimatedSavings?.toLocaleString("en-IN")}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{totalPayable?.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Amount</Text>
          <Text style={styles.bottomTotalVal}>₹{totalPayable?.toLocaleString("en-IN")}</Text>
        </View>
        <Btn
          title="Checkout Now →"
          onPress={handleCheckout}
          style={{ minWidth: 180 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: T.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: T.text.primary },
  headerSub: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  clearText: { color: T.red, fontSize: 12, fontWeight: "600" },

  emptyContainer: { flex: 1, backgroundColor: T.bg.primary, alignItems: "center", justifyContent: "center", padding: 30 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.bg.card, alignItems: "center", justifyContent: "center", marginBottom: 20, borderWidth: 1, borderColor: T.border.color },
  emptyTitle: { fontSize: 22, fontWeight: "800", color: T.text.primary, marginBottom: 8 },
  emptySub: { fontSize: 13, color: T.text.muted, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  emptyActions: { flexDirection: "row", gap: 12 },

  guaranteeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.green + "15",
    borderWidth: 1,
    borderColor: T.green + "33",
    borderRadius: T.radius.lg,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 16,
  },
  guaranteeTitle: { fontSize: 12, fontWeight: "700", color: T.green },
  guaranteeText: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  itemsList: { paddingHorizontal: 16, marginTop: 16, gap: 12 },
  cartCard: {
    flexDirection: "row",
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    alignItems: "center",
  },
  itemImgWrap: { width: 74, height: 74, borderRadius: T.radius.md, backgroundColor: T.bg.surface, overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color },
  itemImg: { width: "100%", height: "100%" },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontSize: 14, fontWeight: "700", color: T.text.primary, flex: 1, marginRight: 8 },
  trashBtn: { padding: 4 },
  itemSpecs: { fontSize: 11, color: T.text.muted, marginTop: 2, marginBottom: 8 },
  itemBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemPrices: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  itemPrice: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  itemOrig: { fontSize: 11, color: T.text.muted, textDecorationLine: "line-through" },

  qtyControl: { flexDirection: "row", alignItems: "center", backgroundColor: T.bg.surface, borderRadius: 8, borderWidth: 1, borderColor: T.border.color },
  qtyBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  qtyVal: { fontSize: 13, fontWeight: "700", color: T.text.primary, paddingHorizontal: 6 },

  billCard: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  billHeader: { fontSize: 15, fontWeight: "800", color: T.text.primary, marginBottom: 12 },
  billRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  billLabel: { fontSize: 12, color: T.text.secondary },
  billVal: { fontSize: 13, fontWeight: "600", color: T.text.primary },
  divider: { height: 1, backgroundColor: T.border.color, marginVertical: 10 },
  totalLabel: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  totalVal: { fontSize: 18, fontWeight: "900", color: T.primary },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: T.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: T.border.color,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bottomTotalLabel: { fontSize: 11, color: T.text.muted },
  bottomTotalVal: { fontSize: 20, fontWeight: "900", color: T.text.primary, marginTop: 2 },
});
