import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Empty, Badge } from "../../components/UI";
import { ordersAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLOR = {
  placed: T.amber,
  confirmed: "#3B82F6",
  shipped: "#8B5CF6",
  delivered: T.green,
  cancelled: T.red,
  disputed: T.red,
};

const STEPS = ["placed", "confirmed", "shipped", "delivered"];

export default function MyOrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await ordersAPI.getAll();
      setOrders(r.data.orders || []);
    } catch (err) {
      console.warn("Orders fetch warning:", err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Orders & Invoices</Text>
          <Text style={styles.sub}>{orders.length} transactions recorded</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={18} color={T.primary} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="receipt-outline"
            title="No orders yet"
            sub="Your purchased phones, spare parts, and sales will appear here with live Escrow tracking."
            action={() => navigation.navigate("Browse")}
            actionLabel="Start Shopping"
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
          renderItem={({ item }) => {
            const isBuyer = (item.buyer?._id || item.buyer) === user?.id;
            const currentStatus = item.orderStatus || "placed";
            const currentStepIdx = STEPS.indexOf(currentStatus);

            return (
              <View style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderTypeBadge}>
                    <Ionicons
                      name={isBuyer ? "cart" : "storefront"}
                      size={12}
                      color={isBuyer ? T.primary : T.green}
                    />
                    <Text style={[styles.orderTypeText, { color: isBuyer ? T.primary : T.green }]}>
                      {isBuyer ? "PURCHASE ORDER" : "SALE ORDER"}
                    </Text>
                  </View>
                  <Badge
                    label={currentStatus.toUpperCase()}
                    color={STATUS_COLOR[currentStatus] || T.text.muted}
                  />
                </View>

                {/* Device Title & Image */}
                <View style={styles.deviceRow}>
                  <View style={styles.thumbWrap}>
                    {item.listing?.images?.[0] ? (
                      <Image source={{ uri: item.listing.images[0] }} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <Ionicons name="phone-portrait-outline" size={24} color={T.text.muted} />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.deviceName} numberOfLines={1}>
                      {item.listing?.brand} {item.listing?.model || "Device / Part"}
                    </Text>
                    <Text style={styles.deviceSpec}>
                      {[item.listing?.storage, item.listing?.conditionGrade].filter(Boolean).join(" • ")}
                    </Text>
                    <Text style={styles.priceText}>
                      ₹{Number(item.amount || item.bill?.listingPrice || 0).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>

                {/* Tracking Stepper (Flipkart / Amazon style) */}
                {currentStatus !== "cancelled" && (
                  <View style={styles.stepperWrap}>
                    {STEPS.map((step, idx) => {
                      const completed = currentStepIdx >= idx;
                      return (
                        <View key={step} style={styles.stepItem}>
                          <View
                            style={[
                              styles.stepDot,
                              completed && { backgroundColor: T.green, borderColor: T.green },
                            ]}
                          >
                            {completed ? (
                              <Ionicons name="checkmark" size={10} color="#fff" />
                            ) : (
                              <View style={styles.stepDotInner} />
                            )}
                          </View>
                          <Text style={[styles.stepLabel, completed && { color: "#fff", fontWeight: "700" }]}>
                            {step.charAt(0).toUpperCase() + step.slice(1)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Bill & Escrow Box */}
                <View style={styles.billBox}>
                  <View style={styles.billLine}>
                    <Text style={styles.billLabel}>Invoice Number:</Text>
                    <Text style={styles.billValue}>{item.bill?.billNumber || "ZYP-GEN"}</Text>
                  </View>
                  <View style={styles.billLine}>
                    <Text style={styles.billLabel}>Escrow Protection:</Text>
                    <View style={styles.escrowPill}>
                      <Ionicons name="shield-checkmark" size={10} color={T.green} />
                      <Text style={styles.escrowPillText}>
                        {item.escrowStatus === "released" ? "PAYMENT RELEASED" : "FUNDS SECURELY HELD"}
                      </Text>
                    </View>
                  </View>
                  {item.deliveryAddress && (
                    <View style={styles.billLine}>
                      <Text style={styles.billLabel}>Delivery To:</Text>
                      <Text style={[styles.billValue, { maxWidth: "60%" }]} numberOfLines={1}>
                        {item.deliveryAddress}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.dateText}>
                    Ordered on: {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Text style={styles.statusHelper}>
                    {currentStatus === "delivered" ? "Delivered & Verified ✓" : "Tracking Active"}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bg.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: T.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  title: { fontSize: 18, fontWeight: "800", color: T.text.primary },
  sub: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  refreshBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: T.bg.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color },

  orderCard: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  orderTypeBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: T.bg.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  orderTypeText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },

  deviceRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  thumbWrap: { width: 56, height: 56, borderRadius: 10, backgroundColor: T.bg.surface, overflow: "hidden", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color },
  thumb: { width: "100%", height: "100%" },
  deviceName: { fontSize: 14, fontWeight: "800", color: T.text.primary },
  deviceSpec: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: "900", color: "#fff", marginTop: 4 },

  stepperWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: T.bg.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: T.text.muted, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  stepDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: T.text.muted },
  stepLabel: { fontSize: 9, color: T.text.muted },

  billBox: { backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 10, gap: 6, marginBottom: 10 },
  billLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { fontSize: 11, color: T.text.muted },
  billValue: { fontSize: 11, fontWeight: "700", color: T.text.primary },
  escrowPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: T.green + "18", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  escrowPillText: { fontSize: 9, fontWeight: "800", color: T.green },

  footerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: T.border.color, paddingTop: 8 },
  dateText: { fontSize: 10, color: T.text.muted },
  statusHelper: { fontSize: 10, fontWeight: "700", color: T.primary },
});
