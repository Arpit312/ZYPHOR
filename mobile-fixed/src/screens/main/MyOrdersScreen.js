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
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Orders & Invoices</Text>
          <Text style={styles.sub}>{orders.length} transaction records</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn} activeOpacity={0.7}>
          <Ionicons name="refresh" size={18} color={T.primary} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="receipt-outline"
            title="No orders recorded"
            sub="Your purchased certified smartphones, spare parts, and invoices will appear here."
            action={() => navigation.navigate("Browse")}
            actionLabel="Browse Marketplace"
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i, idx) => i._id || String(idx)}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
          renderItem={({ item }) => {
            const isBuyer = (item.buyer?._id || item.buyer) === user?.id;
            const currentStatus = item.orderStatus || "placed";
            const currentStepIdx = STEPS.indexOf(currentStatus);

            return (
              <TouchableOpacity
                style={styles.orderCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate("OrderDetail", { id: item._id })}
              >
                {/* Header Row */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderTypeBadge}>
                    <Text style={styles.orderTypeText}>
                      {isBuyer ? "PURCHASE" : "MERCHANT SALE"}
                    </Text>
                  </View>
                  <Badge label={currentStatus.toUpperCase()} color={T.primary} />
                </View>

                {/* Device Title & Image */}
                <View style={styles.deviceRow}>
                  <View style={styles.thumbWrap}>
                    {item.listing?.images?.[0] ? (
                      <Image source={{ uri: item.listing.images[0] }} style={styles.thumb} resizeMode="contain" />
                    ) : (
                      <Ionicons name="phone-portrait-outline" size={24} color={T.text.secondary} />
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

                {/* Stepper */}
                {currentStepIdx >= 0 && (
                  <View style={styles.stepperWrap}>
                    {STEPS.map((step, idx) => {
                      const completed = currentStepIdx >= idx;
                      return (
                        <View key={step} style={styles.stepItem}>
                          <View
                            style={[
                              styles.stepDot,
                              completed && { backgroundColor: T.primary, borderColor: T.primary },
                            ]}
                          >
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

                {/* Bill Box */}
                <View style={styles.billBox}>
                  <View style={styles.billLine}>
                    <Text style={styles.billLabel}>Invoice ID:</Text>
                    <Text style={styles.billValue}>{item.bill?.billNumber || "ZYP-" + item._id.slice(-6).toUpperCase()}</Text>
                  </View>
                  <View style={styles.billLine}>
                    <Text style={styles.billLabel}>Escrow Protection:</Text>
                    <Text style={[styles.billValue, { color: T.green }]}>
                      {item.escrowStatus === "released" ? "Payment Released" : "Funds Held Safely"}
                    </Text>
                  </View>
                  {item.deliveryAddress && (
                    <View style={styles.billLine}>
                      <Text style={styles.billLabel}>Deliver to:</Text>
                      <Text style={[styles.billValue, { maxWidth: "60%" }]} numberOfLines={1}>
                        {item.deliveryAddress}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.footerRow}>
                  <Text style={styles.dateText}>
                    Date: {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Text style={styles.statusHelper}>View Details →</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  title: { fontSize: 26, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: T.text.secondary, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },

  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.border.color,
    ...T.shadow.card,
  },
  orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  orderTypeBadge: {
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  orderTypeText: { fontSize: 10, fontWeight: "800", color: T.text.secondary, letterSpacing: 0.5 },

  deviceRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  thumbWrap: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  thumb: { width: "100%", height: "100%" },
  deviceName: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  deviceSpec: { fontSize: 11, color: T.text.secondary, marginTop: 2 },
  priceText: { fontSize: 15, fontWeight: "900", color: T.text.primary, marginTop: 4 },

  stepperWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  stepItem: { alignItems: "center", flex: 1 },
  stepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: T.border.color,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  stepLabel: { fontSize: 10, color: T.text.secondary },

  billBox: { backgroundColor: T.bg.secondary, borderRadius: 10, padding: 12, gap: 6, marginBottom: 12 },
  billLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  billLabel: { fontSize: 12, color: T.text.secondary },
  billValue: { fontSize: 12, fontWeight: "700", color: T.text.primary },

  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: T.border.color,
    paddingTop: 10,
  },
  dateText: { fontSize: 11, color: T.text.secondary },
  statusHelper: { fontSize: 11, fontWeight: "700", color: T.primary },
});
