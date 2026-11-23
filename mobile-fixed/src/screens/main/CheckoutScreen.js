import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI, authAPI } from "../../api/api";
import { Input, Btn } from "../../components/UI";

const PAYMENT_METHODS = [
  { id: "upi", label: "Instant UPI (GPay, PhonePe, Paytm)", icon: "flash-outline" },
  { id: "card", label: "Credit / Debit Card (Visa, Mastercard, RuPay)", icon: "card-outline" },
  { id: "netbanking", label: "Net Banking (All Indian Banks)", icon: "business-outline" },
  { id: "cod", label: "Cash on Delivery (Verified Escrow)", icon: "cash-outline" },
];

export default function CheckoutScreen({ navigation, route }) {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();

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
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await authAPI.addresses.getAll();
        setSavedAddresses(r.data.addresses || []);
      } catch {}
    })();
  }, [user?.id]);

  const applySavedAddress = (a) => {
    setAddress((prev) => ({
      ...prev,
      name: a.name || prev.name,
      phone: a.phone || prev.phone,
      street: a.street || "",
      city: a.city || prev.city,
      pincode: a.pincode || "",
    }));
  };

  const handlePlaceOrder = async () => {
    if (!address.name.trim() || !address.phone.trim() || !address.street.trim() || !address.pincode.trim()) {
      Alert.alert("Missing Details", "Please fill in all shipping address fields.");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      Alert.alert("Invalid PIN Code", "Please enter a valid 6-digit PIN code.");
      return;
    }
    const phoneDigits = address.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(phoneDigits)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number.");
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

      if (saveAddress) {
        try {
          await authAPI.addresses.add({
            label: savedAddresses.length === 0 ? "Home" : "Address",
            name: address.name.trim(),
            phone: address.phone.trim(),
            street: address.street.trim(),
            city: address.city.trim(),
            state: "",
            pincode: address.pincode.trim(),
            isDefault: savedAddresses.length === 0,
          });
        } catch {}
      }

      Alert.alert(
        "🎉 Order Confirmed",
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={T.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout & Escrow</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Safe Escrow Notice */}
        <View style={styles.escrowNotice}>
          <Ionicons name="shield-checkmark-outline" size={20} color={T.primary} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.escrowTitle}>ZYPHOR Certified Escrow Protection</Text>
            <Text style={styles.escrowText}>Payment is released to the seller only after your inspection.</Text>
          </View>
        </View>

        {/* 1. Shipping Address */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>

          {(savedAddresses || []).length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: T.text.secondary, marginBottom: 8 }}>SAVED ADDRESSES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {savedAddresses.map((a) => (
                  <TouchableOpacity
                    key={a._id}
                    onPress={() => applySavedAddress(a)}
                    style={styles.savedAddrChip}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="location" size={12} color={T.primary} />
                    <Text style={styles.savedAddrText} numberOfLines={1}>
                      {a.label || "Address"} · {a.city} {a.pincode}{a.isDefault ? " · Default" : ""}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => navigation.navigate("Account", { screen: "Addresses" })}
                  style={[styles.savedAddrChip, { borderStyle: "dashed" }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={12} color={T.text.secondary} />
                  <Text style={[styles.savedAddrText, { color: T.text.secondary }]}>Manage</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          <Input
            label="Full Recipient Name *"
            placeholder="Rahul Sharma"
            value={address.name}
            onChangeText={(v) => setAddress((a) => ({ ...a, name: v }))}
            icon="person-outline"
          />

          <Input
            label="Phone Number *"
            placeholder="10-digit mobile number"
            value={address.phone}
            onChangeText={(v) => setAddress((a) => ({ ...a, phone: v }))}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          <Input
            label="Flat / House / Street Address *"
            placeholder="Flat 402, Highrise Heights, Link Road"
            value={address.street}
            onChangeText={(v) => setAddress((a) => ({ ...a, street: v }))}
            icon="home-outline"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="City *"
                placeholder="Mumbai"
                value={address.city}
                onChangeText={(v) => setAddress((a) => ({ ...a, city: v }))}
                icon="location-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="PIN Code *"
                placeholder="400001"
                value={address.pincode}
                onChangeText={(v) => setAddress((a) => ({ ...a, pincode: v }))}
                icon="pin-outline"
                keyboardType="number-pad"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setSaveAddress((s) => !s)}
            style={styles.saveAddrRow}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, saveAddress && styles.checkboxOn]}>
              {saveAddress && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
            </View>
            <Text style={styles.saveAddrText}>Save this address for future orders</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Payment Method */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <View style={{ gap: 10 }}>
            {PAYMENT_METHODS.map((pm) => {
              const selected = paymentMethod === pm.id;
              return (
                <TouchableOpacity
                  key={pm.id}
                  style={[styles.payMethodOption, selected && styles.payMethodSelected]}
                  onPress={() => setPaymentMethod(pm.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.payIconWrap}>
                    <Ionicons name={pm.icon} size={18} color={T.primary} />
                  </View>
                  <Text style={[styles.payMethodLabel, selected && { color: T.text.primary, fontWeight: "700" }]}>
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

        {/* 3. Items & Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          {itemsToBuy.map((it, idx) => (
            <View key={idx} style={styles.orderSummaryItem}>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {it.title || `${it.brand} ${it.model}`} × {it.quantity || 1}
              </Text>
              <Text style={styles.summaryPrice}>
                ₹{(Number(it.price) * (it.quantity || 1)).toLocaleString("en-IN")}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Doorstep Delivery</Text>
            <Text style={[styles.summaryVal, { color: T.green }]}>Free</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Escrow Protection Fee</Text>
            <Text style={[styles.summaryVal, { color: T.green }]}>Waived</Text>
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
          title={loading ? "Securing Order..." : "Confirm & Pay →"}
          loading={loading}
          onPress={handlePlaceOrder}
          icon="lock-closed-outline"
          style={{ minWidth: 180, borderRadius: 14 }}
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
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: T.text.primary },

  escrowNotice: {
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
  escrowTitle: { fontSize: 13, fontWeight: "700", color: T.text.primary },
  escrowText: { fontSize: 11, color: T.text.secondary, marginTop: 2, lineHeight: 16 },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: T.border.color,
    ...T.shadow.card,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: T.text.primary },

  payMethodOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.secondary,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  payMethodSelected: { borderColor: T.primary, backgroundColor: "#FFFFFF" },
  payIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginRight: 10 },
  payMethodLabel: { flex: 1, fontSize: 13, color: T.text.secondary, fontWeight: "500" },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: T.border.color, alignItems: "center", justifyContent: "center" },
  radioCircleSelected: { borderColor: T.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: T.primary },

  orderSummaryItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryTitle: { fontSize: 13, color: T.text.secondary, flex: 1, marginRight: 8 },
  summaryPrice: { fontSize: 13, fontWeight: "700", color: T.text.primary },
  divider: { height: 1, backgroundColor: T.border.color, marginVertical: 10 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  summaryLabel: { fontSize: 12, color: T.text.secondary },
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: T.border.color,
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
  },
  barTotalLabel: { fontSize: 11, color: T.text.secondary },
  barTotalVal: { fontSize: 20, fontWeight: "900", color: T.text.primary, marginTop: 1 },

  savedAddrChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  savedAddrText: { fontSize: 11, fontWeight: "600", color: T.text.primary, maxWidth: 150 },

  saveAddrRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 1.5, borderColor: T.border.color,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxOn: { backgroundColor: T.primary, borderColor: T.primary },
  saveAddrText: { fontSize: 12, color: T.text.secondary, fontWeight: "500" },
});
