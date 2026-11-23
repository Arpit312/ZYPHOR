import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { ordersAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { Btn } from "../../components/UI";

const STEPS = ["placed", "confirmed", "shipped", "delivered"];
const ACTIONS = {
  seller: {
    placed: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
  },
  buyer: {
    placed: ["cancelled"],
    shipped: ["delivered"],
    delivered: ["disputed"],
  },
};
const ACTION_LABEL = {
  confirmed: "Confirm Order",
  shipped: "Mark as Shipped",
  delivered: "Mark as Delivered",
  cancelled: "Cancel Order",
  disputed: "Raise Escrow Dispute",
};

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function OrderDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const orderId = route.params?.orderId || route.params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    if (!orderId) { setLoading(false); return; }
    try {
      const r = await ordersAPI.getById(orderId);
      setOrder(r.data.order);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Could not load order.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const runAction = (next) => {
    if (next === "disputed") {
      navigation.navigate("ReturnDispute", { orderId });
      return;
    }

    const label = ACTION_LABEL[next] || next;
    Alert.alert(label, `Are you sure you want to ${label.toLowerCase()}?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: next === "cancelled" ? "destructive" : "default",
        onPress: async () => {
          setBusy(next);
          try {
            await ordersAPI.updateStatus(orderId, { orderStatus: next });
            await load();
          } catch (err) {
            Alert.alert("Could not update", err.response?.data?.error || err.message);
          } finally {
            setBusy("");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={44} color={tokens.colors.textMuted} />
        <Text style={{ color: tokens.colors.textSecondary, marginTop: 10 }}>Order not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={{ color: tokens.colors.accentStrong, fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isBuyer = String(order.buyer?._id || order.buyer) === String(user?.id);
  const role = isBuyer ? "buyer" : "seller";
  const status = order.orderStatus || "placed";
  const nextActions = ACTIONS[role]?.[status] || [];
  const bill = order.bill || {};

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Order Invoice</Text>
          <Text style={styles.sub}>{bill.billNumber || order._id?.slice(-8)}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{status.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.colors.accentStrong} />}
      >
        {/* Safe Escrow Strip */}
        <View style={styles.escrowBanner}>
          <Ionicons name="shield-checkmark" size={20} color={tokens.colors.accentStrong} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.escrowTitle}>ZYPHOR Protected Escrow</Text>
            <Text style={styles.escrowText}>
              Payment is held securely in escrow. Released to seller only after 48-hour inspection.
            </Text>
          </View>
        </View>

        {/* Live Tracking Card CTA */}
        <TouchableOpacity
          style={styles.trackingCardCTA}
          onPress={() => navigation.navigate("OrderTracking", { orderId: order._id })}
          activeOpacity={0.8}
        >
          <View style={styles.radarIconWrap}>
            <Ionicons name="locate" size={20} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.radarTitle}>Live Courier Tracking</Text>
            <Text style={styles.radarSub}>View real-time delivery checkpoints & inspection timer</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={tokens.colors.textMuted} />
        </TouchableOpacity>

        {/* Device Item Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Purchased Device</Text>
          <View style={styles.deviceRow}>
            <View style={styles.imgWrap}>
              {order.listing?.images?.[0] ? (
                <Image source={{ uri: order.listing.images[0] }} style={styles.img} resizeMode="contain" />
              ) : (
                <Ionicons name="phone-portrait-outline" size={30} color={tokens.colors.textMuted} />
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.deviceName}>
                {order.listing?.brand} {order.listing?.model || "Certified Device"}
              </Text>
              <Text style={styles.deviceDetail}>
                Grade: {order.listing?.conditionGrade || "Pristine"} • Storage: {order.listing?.storage || "128GB"}
              </Text>
              <Text style={styles.devicePrice}>{inr(order.amount || bill.listingPrice)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Shipping Destination</Text>
          <Text style={styles.addrText}>{order.deliveryAddress || "Standard Hub Delivery"}</Text>
          <Text style={styles.addrSub}>Dispatched with tamper-proof security seals</Text>
        </View>

        {/* Financial Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Tax Invoice Summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Listing Amount</Text>
            <Text style={styles.rowVal}>{inr(bill.listingPrice || order.amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Insured Shipping</Text>
            <Text style={[styles.rowVal, { color: tokens.colors.success }]}>FREE</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Escrow Protection</Text>
            <Text style={[styles.rowVal, { color: tokens.colors.success }]}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Escrow Amount</Text>
            <Text style={styles.totalVal}>{inr(order.amount)}</Text>
          </View>
        </View>

        {/* Contextual Action Buttons */}
        {nextActions.length > 0 && (
          <View style={styles.actionsBox}>
            {nextActions.map((act) => (
              <Btn
                key={act}
                title={busy === act ? "Updating..." : ACTION_LABEL[act] || act}
                onPress={() => runAction(act)}
                loading={busy === act}
                variant={act === "cancelled" ? "danger" : act === "disputed" ? "outline" : "primary"}
                style={{ marginBottom: 10 }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  title: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },
  sub: { fontSize: 11, color: tokens.colors.textSecondary },
  statusPill: {
    backgroundColor: tokens.colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.6 },

  scroll: { padding: 18, paddingBottom: 60 },

  escrowBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.accentSoft,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "40",
    marginBottom: 14,
  },
  escrowTitle: { fontSize: 13, fontWeight: "800", color: tokens.colors.accentStrong },
  escrowText: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },

  trackingCardCTA: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 14,
    ...tokens.shadow.card,
  },
  radarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  radarTitle: { fontSize: 14, fontWeight: "800", color: tokens.colors.ink },
  radarSub: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 1 },

  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 14,
    ...tokens.shadow.card,
  },
  cardHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: tokens.colors.textSecondary,
    marginBottom: 12,
  },
  deviceRow: { flexDirection: "row", alignItems: "center" },
  imgWrap: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  img: { width: 54, height: 54 },
  deviceName: { fontSize: 14.5, fontWeight: "800", color: tokens.colors.ink },
  deviceDetail: { fontSize: 11, color: tokens.colors.textSecondary, marginVertical: 3 },
  devicePrice: { fontSize: 15, fontWeight: "900", color: tokens.colors.ink },

  addrText: { fontSize: 13, fontWeight: "700", color: tokens.colors.ink, lineHeight: 18 },
  addrSub: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 4 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  rowLabel: { fontSize: 12.5, color: tokens.colors.textSecondary },
  rowVal: { fontSize: 12.5, fontWeight: "700", color: tokens.colors.ink },
  divider: { height: 1, backgroundColor: tokens.colors.borderLight, marginVertical: 10 },
  totalLabel: { fontSize: 14, fontWeight: "800", color: tokens.colors.ink },
  totalVal: { fontSize: 17, fontWeight: "900", color: tokens.colors.ink },

  actionsBox: { marginTop: 6 },
});
