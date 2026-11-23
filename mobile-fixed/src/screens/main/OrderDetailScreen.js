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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Badge } from "../../components/UI";
import { ordersAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const STEPS = ["placed", "confirmed", "shipped", "delivered"];
// Mirrors backend TRANSITIONS in orderRoutes.js
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
  disputed: "Raise Dispute",
};

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return ""; }
};

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
    const label = ACTION_LABEL[next] || next;
    Alert.alert(label, `Move this order to '${next}'?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: next === "cancelled" || next === "disputed" ? "destructive" : "default",
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
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={44} color={T.text.muted} />
        <Text style={{ color: T.text.secondary, marginTop: 10 }}>Order not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 14 }}>
          <Text style={{ color: T.primary, fontWeight: "700" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isBuyer = String(order.buyer?._id || order.buyer) === String(user?.id);
  const role = isBuyer ? "buyer" : "seller";
  const status = order.orderStatus || "placed";
  const stepIdx = STEPS.indexOf(status);
  const nextActions = ACTIONS[role]?.[status] || [];
  const bill = order.bill || {};

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={T.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Order Detail</Text>
          <Text style={styles.sub}>{bill.billNumber || order._id?.slice(-8)}</Text>
        </View>
        <Badge
          label={status.toUpperCase()}
          color={status === "cancelled" ? T.red : status === "delivered" ? T.green : T.primary}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 50 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
      >
        {/* Device */}
        <TouchableOpacity
          style={styles.deviceCard}
          activeOpacity={0.85}
          onPress={() => order.listing?._id && navigation.navigate("ListingDetail", { id: order.listing._id })}
        >
          <View style={styles.thumbWrap}>
            {order.listing?.images?.[0] ? (
              <Image source={{ uri: order.listing.images[0] }} style={styles.thumb} resizeMode="contain" />
            ) : (
              <Ionicons name="phone-portrait-outline" size={26} color={T.text.secondary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.deviceName} numberOfLines={1}>
              {order.listing?.brand} {order.listing?.model || order.listing?.title || "Device"}
            </Text>
            <Text style={styles.deviceSpec}>
              {[order.listing?.storage, order.listing?.ram, order.listing?.conditionGrade].filter(Boolean).join(" • ")}
            </Text>
            <Text style={styles.priceText}>{inr(order.amount || bill.listingPrice)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
        </TouchableOpacity>

        {/* Stepper */}
        {status !== "cancelled" && status !== "disputed" && (
          <View style={styles.stepperWrap}>
            {STEPS.map((step, idx) => {
              const completed = stepIdx >= idx;
              return (
                <View key={step} style={styles.stepItem}>
                  <View style={[styles.stepDot, completed && { backgroundColor: T.primary, borderColor: T.primary }]}>
                    {completed && <Ionicons name="checkmark" size={10} color="#FFFFFF" />}
                  </View>
                  <Text style={[styles.stepLabel, completed && { color: T.text.primary, fontWeight: "700" }]}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Parties */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Parties</Text>
          <View style={styles.line}>
            <Text style={styles.label}>{isBuyer ? "Seller" : "Buyer"}</Text>
            <Text style={styles.value} numberOfLines={1}>
              {isBuyer
                ? order.seller?.businessName || order.seller?.name || "Seller"
                : order.buyer?.name || "Buyer"}
            </Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Payment</Text>
            <Text style={styles.value}>{(order.paymentMethod || "upi").toUpperCase()}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Escrow</Text>
            <Text style={[styles.value, { color: order.escrowStatus === "released" ? T.green : order.escrowStatus === "refunded" ? T.red : T.amber }]}>
              {order.escrowStatus === "released" ? "Released to seller" : order.escrowStatus === "refunded" ? "Refunded to buyer" : "Held safely"}
            </Text>
          </View>
          {!!order.deliveryAddress && (
            <View style={styles.line}>
              <Text style={styles.label}>Deliver to</Text>
              <Text style={[styles.value, { flex: 1, textAlign: "right" }]} numberOfLines={2}>
                {order.deliveryAddress}
              </Text>
            </View>
          )}
        </View>

        {/* Bill */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Invoice {bill.billNumber || ""}</Text>
          <View style={styles.line}>
            <Text style={styles.label}>Listing price</Text>
            <Text style={styles.value}>{inr(bill.listingPrice || order.amount)}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Platform fee</Text>
            <Text style={styles.value}>{inr(bill.platformFee)}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>GST on fee</Text>
            <Text style={styles.value}>{inr(bill.gstOnFee)}</Text>
          </View>
          <View style={[styles.line, { borderTopWidth: 1, borderTopColor: T.border.color, paddingTop: 8, marginTop: 4 }]}>
            <Text style={[styles.label, { fontWeight: "800", color: T.text.primary }]}>Buyer pays</Text>
            <Text style={[styles.value, { fontWeight: "900", fontSize: 15 }]}>{inr(bill.buyerPays || order.amount)}</Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.label}>Seller receives</Text>
            <Text style={[styles.value, { color: T.green }]}>{inr(bill.sellerReceives)}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Timeline</Text>
          {(order.statusHistory || []).map((h, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.timelineStatus}>{h.status.toUpperCase()}</Text>
                {!!h.note && <Text style={styles.timelineNote}>{h.note}</Text>}
                <Text style={styles.timelineTime}>
                  {fmtDate(h.at || h.createdAt)}
                  {h.by?.name ? ` • by ${h.by.name}${h.by?.role ? ` (${h.by.role})` : ""}` : ""}
                </Text>
              </View>
            </View>
          ))}
          <Text style={styles.timelineTime}>Ordered {fmtDate(order.createdAt)}</Text>
        </View>

        {/* Actions */}
        {nextActions.length > 0 && (
          <View style={{ gap: 10, marginTop: 6 }}>
            {nextActions.map((a) => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.actionBtn,
                  { backgroundColor: a === "cancelled" || a === "disputed" ? "#FFFFFF" : T.primary,
                    borderWidth: a === "cancelled" || a === "disputed" ? 1.5 : 0,
                    borderColor: T.red },
                ]}
                onPress={() => runAction(a)}
                disabled={!!busy}
                activeOpacity={0.85}
              >
                {busy === a ? (
                  <ActivityIndicator color={a === "cancelled" || a === "disputed" ? T.red : "#FFFFFF"} size="small" />
                ) : (
                  <Text style={{
                    fontSize: 14, fontWeight: "700",
                    color: a === "cancelled" || a === "disputed" ? T.red : "#FFFFFF",
                  }}>
                    {ACTION_LABEL[a] || a}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: T.bg.secondary, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: T.border.color,
  },
  title: { fontSize: 24, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },
  deviceCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1,
    borderColor: T.border.color, padding: 14, marginBottom: 14, ...T.shadow.card,
  },
  thumbWrap: {
    width: 58, height: 58, borderRadius: 12, backgroundColor: T.bg.secondary,
    alignItems: "center", justifyContent: "center", padding: 4,
  },
  thumb: { width: "100%", height: "100%" },
  deviceName: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  deviceSpec: { fontSize: 11, color: T.text.secondary, marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: "900", color: T.text.primary, marginTop: 4 },
  stepperWrap: {
    flexDirection: "row", justifyContent: "space-between",
    backgroundColor: T.bg.secondary, paddingHorizontal: 12, paddingVertical: 12,
    borderRadius: 12, marginBottom: 14,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1.5,
    borderColor: T.border.color, backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  stepLabel: { fontSize: 10, color: T.text.secondary },
  box: {
    backgroundColor: T.bg.secondary, borderRadius: 14, padding: 14,
    marginBottom: 14, borderWidth: 1, borderColor: T.border.color,
  },
  boxTitle: { fontSize: 13, fontWeight: "800", color: T.text.primary, marginBottom: 10 },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7, gap: 10 },
  label: { fontSize: 12, color: T.text.secondary },
  value: { fontSize: 12, fontWeight: "700", color: T.text.primary },
  timelineRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary, marginTop: 5 },
  timelineStatus: { fontSize: 12, fontWeight: "800", color: T.text.primary },
  timelineNote: { fontSize: 11, color: T.text.secondary, marginTop: 1 },
  timelineTime: { fontSize: 10, color: T.text.muted, marginTop: 2 },
  actionBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center",
  },
});
