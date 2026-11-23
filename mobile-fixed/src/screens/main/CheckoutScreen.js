import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI, authAPI } from "../../api/api";
import { Input, Btn } from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";

const PAYMENT_METHODS = [
  { id: "upi", label: "Instant UPI (GPay, PhonePe, Paytm)", sub: "Fastest verification • Escrow protected", icon: "flash-outline" },
  { id: "card", label: "Credit / Debit Card (Visa, MC, RuPay)", sub: "Secure 256-bit payment gateway", icon: "card-outline" },
  { id: "netbanking", label: "Net Banking (All Indian Banks)", sub: "Direct bank authorization", icon: "business-outline" },
  { id: "cod", label: "Cash on Delivery with Escrow OTP", sub: "Inspect device before handing cash", icon: "cash-outline" },
];

export default function CheckoutScreen({ navigation, route }) {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();

  const singleItem = route.params?.item;
  const itemsToBuy = singleItem
    ? [{ id: singleItem._id, listingId: singleItem._id, title: singleItem.title || `${singleItem.brand} ${singleItem.model}`, price: singleItem.price, quantity: 1 }]
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
      Alert.alert("Shipping Required", "Please provide complete delivery address details.");
      return;
    }
    if (!/^\d{6}$/.test(address.pincode.trim())) {
      Alert.alert("Invalid PIN Code", "Please enter a valid 6-digit postal PIN code.");
      return;
    }
    const phoneDigits = address.phone.replace(/\D/g, "").slice(-10);
    if (!/^\d{10}$/.test(phoneDigits)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit mobile number for courier dispatch.");
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
      const order = res.data.order || res.data;
      const billNo = order.bill?.billNumber || res.data.bill?.billNumber || "ZYP-" + Date.now().toString().slice(-6);

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

      // Navigate directly to luxury OrderSuccess screen
      navigation.navigate("OrderSuccess", {
        order,
        billNo,
        amount: totalAmount,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Order Failed", err.response?.data?.error || "Could not complete order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* Luxury Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout & Escrow</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Safe Escrow Notice Banner */}
        <View style={styles.escrowNotice}>
          <View style={styles.shieldWrap}>
            <Ionicons name="shield-checkmark" size={20} color={tokens.colors.accentStrong} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.escrowTitle}>ZYPHOR Certified Escrow Protection</Text>
            <Text style={styles.escrowText}>
              Payment is held securely in escrow. Released to seller only after your 48-hour doorstep inspection.
            </Text>
          </View>
        </View>

        {/* ── Step 1: Shipping Address ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          {savedAddresses.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.savedAddrScroll}>
              {savedAddresses.map((a) => (
                <TouchableOpacity
                  key={a._id}
                  style={styles.savedAddrChip}
                  onPress={() => applySavedAddress(a)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={13} color={tokens.colors.accentStrong} />
                  <Text style={styles.savedAddrLabel}>{a.label || "Saved"}: </Text>
                  <Text style={styles.savedAddrCity}>{a.city || a.street?.slice(0, 14)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Input
            label="Full Name"
            placeholder="John Doe"
            value={address.name}
            onChangeText={(v) => setAddress((p) => ({ ...p, name: v }))}
          />
          <Input
            label="10-Digit Mobile Phone"
            placeholder="9876543210"
            keyboardType="phone-pad"
            maxLength={10}
            value={address.phone}
            onChangeText={(v) => setAddress((p) => ({ ...p, phone: v }))}
          />
          <Input
            label="House, Street & Area"
            placeholder="Flat 402, Luxury Heights, MG Road"
            value={address.street}
            onChangeText={(v) => setAddress((p) => ({ ...p, street: v }))}
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="City"
                placeholder="Mumbai"
                value={address.city}
                onChangeText={(v) => setAddress((p) => ({ ...p, city: v }))}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="PIN Code"
                placeholder="400001"
                keyboardType="number-pad"
                maxLength={6}
                value={address.pincode}
                onChangeText={(v) => setAddress((p) => ({ ...p, pincode: v }))}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setSaveAddress(!saveAddress)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={saveAddress ? "checkbox" : "square-outline"}
              size={18}
              color={saveAddress ? tokens.colors.accentStrong : tokens.colors.textMuted}
            />
            <Text style={styles.checkboxLabel}>Save this address for future 1-click orders</Text>
          </TouchableOpacity>
        </View>

        {/* ── Step 2: Payment Method ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>Escrow Payment Method</Text>
          </View>

          <View style={styles.methodsList}>
            {PAYMENT_METHODS.map((m) => {
              const active = paymentMethod === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                  onPress={() => setPaymentMethod(m.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.methodRadio, active && styles.methodRadioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.methodIconWrap}>
                    <Ionicons
                      name={m.icon}
                      size={18}
                      color={active ? tokens.colors.accentStrong : tokens.colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>
                      {m.label}
                    </Text>
                    <Text style={styles.methodSub}>{m.sub}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Step 3: Order Breakdown ── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>3</Text>
            </View>
            <Text style={styles.sectionTitle}>Review & Place Order</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Order Total ({itemsToBuy.length} items)</Text>
            <Text style={styles.billVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Doorstep Delivery & Insurance</Text>
            <Text style={[styles.billVal, { color: tokens.colors.success }]}>FREE</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>48h Escrow Guarantee</Text>
            <Text style={[styles.billVal, { color: tokens.colors.success }]}>INCLUDED</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Docked Place Order Footer */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotalLabel}>Total Payable</Text>
          <Text style={styles.bottomTotalVal}>₹{totalAmount.toLocaleString("en-IN")}</Text>
        </View>
        <Btn
          title="Place Escrow Order"
          onPress={handlePlaceOrder}
          loading={loading}
          variant="gold"
          style={{ width: 190 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: { padding: 18, paddingBottom: 120 },

  header: {
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: tokens.colors.ink,
  },

  escrowNotice: {
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
  shieldWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    marginBottom: 2,
  },
  escrowText: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    lineHeight: 16,
  },

  sectionCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 14,
    ...tokens.shadow.card,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: tokens.colors.ink,
  },

  savedAddrScroll: {
    marginBottom: 12,
  },
  savedAddrChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginRight: 8,
    gap: 4,
  },
  savedAddrLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  savedAddrCity: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
  },

  row: {
    flexDirection: "row",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },

  methodsList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: 10,
  },
  methodCardActive: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.accentStrong,
  },
  methodRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  methodRadioActive: {
    borderColor: tokens.colors.accentStrong,
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: tokens.colors.accentStrong,
  },
  methodIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  methodLabelActive: {
    color: tokens.colors.accentStrong,
  },
  methodSub: {
    fontSize: 10.5,
    color: tokens.colors.textSecondary,
    marginTop: 2,
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
