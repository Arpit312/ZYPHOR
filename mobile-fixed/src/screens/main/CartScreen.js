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
  const totalPayable = cartSubtotal + deliveryFee;

  const handleCheckout = () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login to proceed with your order and unlock Escrow protection.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => navigation.navigate("Login") },
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
          <Ionicons name="bag-outline" size={44} color={T.text.secondary} />
        </View>
        <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
        <Text style={styles.emptySub}>
          Explore certified refurbished smartphones and OEM spare parts with 12 months comprehensive warranty.
        </Text>
        <View style={styles.emptyActions}>
          <Btn
            title="Browse Devices"
            onPress={() => navigation.navigate("Browse", { screen: "Marketplace" })}
            icon="phone-portrait-outline"
            style={{ width: 170 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Editorial Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={T.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Shopping Bag</Text>
          <Text style={styles.headerSub}>{cartCount} {cartCount === 1 ? "device" : "devices"} selected</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn} activeOpacity={0.7}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Buyer Protection Guarantee */}
        <View style={styles.guaranteeBanner}>
          <Ionicons name="shield-checkmark-outline" size={18} color={T.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.guaranteeTitle}>ZYPHOR 100% Escrow Protection</Text>
            <Text style={styles.guaranteeText}>Payment is held in escrow until you inspect & confirm delivery.</Text>
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
                    <Ionicons name="phone-portrait-outline" size={30} color={T.text.secondary} />
                  )}
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.brand} {item.model}
                    </Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.trashBtn} activeOpacity={0.7}>
                      <Ionicons name="close" size={18} color={T.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.itemSpecs} numberOfLines={1}>
                    {item.storage || item.category || "Certified Pristine"}
                  </Text>

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
                      >
                        <Ionicons name="remove" size={14} color={T.primary} />
                      </TouchableOpacity>
                      <Text style={styles.qtyVal}>{item.quantity || 1}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                        style={styles.qtyBtn}
                      >
                        <Ionicons name="add" size={14} color={T.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Summary Card */}
        <View style={styles.billCard}>
          <Text style={styles.billHeader}>Order Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Bag Subtotal</Text>
            <Text style={styles.billVal}>₹{cartSubtotal.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Express Shipping</Text>
            <Text style={[styles.billVal, { color: T.green }]}>Free</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Escrow Protection Fee</Text>
            <Text style={[styles.billVal, { color: T.green }]}>Included</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{totalPayable.toLocaleString("en-IN")}</Text>
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
          title="Checkout →"
          onPress={handleCheckout}
          style={{ width: 170, borderRadius: 14 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: T.text.primary },
  headerSub: { fontSize: 11, color: T.text.secondary, marginTop: 1 },
  clearBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  clearText: { color: T.text.secondary, fontSize: 12, fontWeight: "600" },

  emptyContainer: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", padding: 32 },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: T.text.primary, marginBottom: 8 },
  emptySub: { fontSize: 13, color: T.text.secondary, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  emptyActions: { flexDirection: "row", gap: 12 },

  guaranteeBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 16,
  },
  guaranteeTitle: { fontSize: 12, fontWeight: "700", color: T.text.primary },
  guaranteeText: { fontSize: 11, color: T.text.secondary, marginTop: 2 },

  itemsList: { paddingHorizontal: 20, marginTop: 16, gap: 12 },
  cartCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    alignItems: "center",
    ...T.shadow.card,
  },
  itemImgWrap: {
    width: 74,
    height: 74,
    borderRadius: 12,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  itemImg: { width: "100%", height: "100%" },
  itemDetails: { flex: 1, marginLeft: 12 },
  itemTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontSize: 14, fontWeight: "700", color: T.text.primary, flex: 1, marginRight: 8 },
  trashBtn: { padding: 4 },
  itemSpecs: { fontSize: 11, color: T.text.secondary, marginTop: 2, marginBottom: 8 },
  itemBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemPrices: { flexDirection: "row", alignItems: "baseline", gap: 6 },
  itemPrice: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  itemOrig: { fontSize: 11, color: T.text.muted, textDecorationLine: "line-through" },

  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.secondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  qtyBtn: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
  qtyVal: { fontSize: 12, fontWeight: "700", color: T.text.primary, paddingHorizontal: 6 },

  billCard: {
    backgroundColor: T.bg.secondary,
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  billHeader: { fontSize: 15, fontWeight: "800", color: T.text.primary, marginBottom: 12 },
  billRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  billLabel: { fontSize: 13, color: T.text.secondary },
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: T.border.color,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
  },
  bottomTotalLabel: { fontSize: 11, color: T.text.secondary },
  bottomTotalVal: { fontSize: 20, fontWeight: "900", color: T.text.primary, marginTop: 1 },
});
