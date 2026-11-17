import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/api";
import { Input, Btn } from "../../components/UI";

const PAYMENT_METHODS = [
  { id: "upi", label: "Instant UPI (GPay, PhonePe, Paytm)", icon: "flash-outline", color: T.green },
  { id: "card", label: "Credit / Debit Card (Visa, RuPay)", icon: "card-outline", color: T.primary },
  { id: "netbanking", label: "Net Banking (All Indian Banks)", icon: "business-outline", color: "#3B82F6" },
  { id: "cod", label: "Cash on Delivery (Verified Escrow)", icon: "cash-outline", color: T.amber },
];

export default function CheckoutScreen({ navigation, route }) {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Can checkout single item passed via route.params OR entire cart
  const singleItem = route.params?.item;
  const itemsToBuy = singleItem
    ? [{ id: singleItem._id, listingId: singleItem._id, title: singleItem.title, price: singleItem.price, quantity: 1 }]
    : cart;

  const totalAmount = singleItem ? singleItem.price : cartSubtotal;

  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: "",
    city: user?.city || "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.name.trim() || !address.phone.trim() || !address.street.trim() || !address.pincode.trim()) {
      Alert.alert("Missing Details", "Please fill in all shipping address fields.");
      return;
    }

    setLoading(true);
    try {
      const fullDeliveryAddress = `${address.street}, ${address.city || "India"} - ${address.pincode} (Phone: ${address.phone})`;

      const payload = {
        deliveryAddress: fullDeliveryAddress,
        paymentMethod: paymentMethod,
      };

      if (singleItem) {
        payload.listingId = singleItem._id;
      } else {
        payload.items = itemsToBuy;
      }

      const res = await ordersAPI.create(payload);

      const billNo = res.data.bill?.billNumber || res.data.order?.bill?.billNumber || "ZYP-" + Date.now().toString().slice(-6);

      if (!singleItem) {
        await clearCart();
      }

      Alert.alert(
        "🎉 Order Placed Successfully!",
        `Invoice: ${billNo}\nAmount: ₹${totalAmount.toLocaleString("en-IN")}\n\nYour payment is held safely in ZYPHOR Escrow until you inspect & confirm delivery.`,
        [
          {
            text: "View My Orders",
            onPress: () => navigation.navigate("Account", { screen: "MyOrders" }),
          },
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Order Failed", err.response?.data?.error || "Could not complete order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={T.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout & Escrow</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Safe Escrow Notice */}
        <View style={styles.escrowNotice}>
          <Ionicons name="shield-checkmark" size={24} color={T.green} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.escrowTitle}>ZYPHOR Buyer Escrow Protection</Text>
            <Text style={styles.escrowText}>
              Your money is safe. Sellers are only paid after you receive and inspect your device.
            </Text>
          </View>
        </View>

        {/* Step 1: Shipping Address */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            value={address.name}
            onChangeText={(t) => setAddress({ ...address, name: t })}
          />
          <Input
            label="Mobile Number"
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            value={address.phone}
            onChangeText={(t) => setAddress({ ...address, phone: t })}
          />
          <Input
            label="Street Address / Flat / Landmark"
            placeholder="House/Flat No, Street, Landmark"
            value={address.street}
            onChangeText={(t) => setAddress({ ...address, street: t })}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="City"
                placeholder="Mumbai"
                value={address.city}
                onChangeText={(t) => setAddress({ ...address, city: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Pincode"
                placeholder="400001"
                keyboardType="numeric"
                value={address.pincode}
                onChangeText={(t) => setAddress({ ...address, pincode: t })}
              />
            </View>
          </View>
        </View>

        {/* Step 2: Payment Method */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
          </View>

          <View style={{ gap: 10 }}>
            {PAYMENT_METHODS.map((pm) => {
              const selected = paymentMethod === pm.id;
              return (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => setPaymentMethod(pm.id)}
                  style={[styles.payMethodOption, selected && styles.payMethodSelected]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.payIconWrap, { backgroundColor: pm.color + "22" }]}>
                    <Ionicons name={pm.icon} size={20} color={pm.color} />
                  </View>
                  <Text style={[styles.payMethodLabel, selected && { color: "#fff", fontWeight: "700" }]}>
                    {pm.label}
                  </Text>
                  <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 3: Order Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.sectionTitle}>Order Summary ({itemsToBuy.length} items)</Text>
          </View>

          {itemsToBuy.map((it, idx) => (
            <View key={idx} style={styles.orderSummaryItem}>
              <Text style={styles.summaryTitle} numberOfLines={1}>{it.title}</Text>
              <Text style={styles.summaryPrice}>₹{Number(it.price).toLocaleString("en-IN")}</Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doorstep Delivery</Text>
            <Text style={[styles.summaryVal, { color: T.green }]}>FREE</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Escrow Fee</Text>
            <Text style={[styles.summaryVal, { color: T.green }]}>WAIVED</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalPayableLabel}>Final Amount</Text>
            <Text style={styles.totalPayableVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.barTotalLabel}>Amount to Pay</Text>
          <Text style={styles.barTotalVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
        </View>
        <Btn
          title={loading ? "Securing Order..." : "Place Order & Pay"}
          loading={loading}
          onPress={handlePlaceOrder}
          icon="lock-closed"
          style={{ minWidth: 190 }}
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
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: T.text.primary },

  escrowNotice: {
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
  escrowTitle: { fontSize: 13, fontWeight: "700", color: T.green },
  escrowText: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2, lineHeight: 16 },

  sectionCard: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: T.primary, alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: T.text.primary },

  payMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.surface,
    padding: 12,
    borderRadius: T.radius.md,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  payMethodSelected: { borderColor: T.primary, backgroundColor: T.primary + "12" },
  payIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  payMethodLabel: { flex: 1, fontSize: 13, color: T.text.secondary, fontWeight: "600" },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: T.text.muted, alignItems: "center", justifyContent: "center" },
  radioCircleSelected: { borderColor: T.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.primary },

  orderSummaryItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryTitle: { fontSize: 13, color: T.text.secondary, flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: "700", color: T.text.primary },
  divider: { height: 1, backgroundColor: T.border.color, marginVertical: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 12, color: T.text.muted },
  summaryVal: { fontSize: 13, fontWeight: "600", color: T.text.primary },
  totalPayableLabel: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  totalPayableVal: { fontSize: 18, fontWeight: "900", color: T.primary },

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
  barTotalLabel: { fontSize: 11, color: T.text.muted },
  barTotalVal: { fontSize: 20, fontWeight: "900", color: T.text.primary, marginTop: 2 },
});
