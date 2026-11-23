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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Empty, Badge } from "../../components/UI";
import { ordersAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";

const STATUS_COLOR = {
  placed: tokens.colors.accentStrong,
  confirmed: tokens.colors.ink,
  shipped: tokens.colors.accentStrong,
  delivered: tokens.colors.success,
  cancelled: tokens.colors.error,
  disputed: tokens.colors.warning,
};

export default function MyOrdersScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useTranslation();
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
        <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("orders") || "Orders & Invoices"}</Text>
          <Text style={styles.sub}>{orders.length} transaction records</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn} activeOpacity={0.7}>
          <Ionicons name="refresh" size={18} color={tokens.colors.ink} />
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="receipt-outline"
            title="No orders yet"
            sub="Your purchased certified smartphones, spare parts, and invoices will appear here."
            action={() => navigation.navigate("Browse")}
            actionLabel="Browse Marketplace"
          />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(i, idx) => i._id || String(idx)}
          contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tokens.colors.accentStrong}
            />
          }
          renderItem={({ item }) => {
            const isBuyer = (item.buyer?._id || item.buyer) === user?.id;
            const currentStatus = item.orderStatus || "placed";
            const color = STATUS_COLOR[currentStatus] || tokens.colors.ink;
            const billNumber = item.bill?.billNumber || "ZYP-" + item._id?.slice(-6);

            return (
              <View style={styles.orderCard}>
                {/* Header Row */}
                <View style={styles.orderHeader}>
                  <View style={styles.refWrap}>
                    <Text style={styles.orderRefText}>{billNumber}</Text>
                    <Text style={styles.orderTypeText}>
                      {isBuyer ? "BUYER ORDER" : "MERCHANT SALE"}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: color }]}>
                    <Text style={[styles.statusBadgeText, { color }]}>
                      {currentStatus.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Device Title & Image */}
                <TouchableOpacity
                  style={styles.deviceRow}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate("OrderDetail", { id: item._id })}
                >
                  <View style={styles.thumbWrap}>
                    {item.listing?.images?.[0] ? (
                      <Image
                        source={{ uri: item.listing.images[0] }}
                        style={styles.thumb}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name="phone-portrait-outline"
                        size={26}
                        color={tokens.colors.textMuted}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.deviceName} numberOfLines={1}>
                      {item.listing?.brand} {item.listing?.model || "Certified Device"}
                    </Text>
                    <Text style={styles.deviceSpec}>
                      {[item.listing?.storage, item.listing?.conditionGrade || "Grade A"]
                        .filter(Boolean)
                        .join(" • ")}
                    </Text>
                    <Text style={styles.priceText}>
                      ₹{Number(item.amount || item.bill?.listingPrice || 0).toLocaleString("en-IN")}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Escrow Guarantee Pill */}
                <View style={styles.escrowNoticeRow}>
                  <Ionicons name="shield-checkmark" size={13} color={tokens.colors.accentStrong} />
                  <Text style={styles.escrowNoticeText}>
                    {currentStatus === "delivered"
                      ? "48h Inspection Window Active"
                      : "Payment Protected by ZYPHOR Escrow"}
                  </Text>
                </View>

                {/* Card Action Buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.trackBtn}
                    onPress={() => navigation.navigate("OrderTracking", { orderId: item._id })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.trackBtnText}>Live Track & Escrow</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => navigation.navigate("OrderDetail", { id: item._id })}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailsBtnText}>View Invoice</Text>
                  </TouchableOpacity>
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
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  title: { fontSize: 24, fontWeight: "900", color: tokens.colors.ink },
  sub: { fontSize: 11.5, color: tokens.colors.textSecondary, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },

  orderCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 14,
    ...tokens.shadow.card,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    paddingBottom: 12,
    marginBottom: 12,
  },
  refWrap: { flex: 1 },
  orderRefText: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  orderTypeText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: tokens.colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  thumbWrap: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  thumb: {
    width: 50,
    height: 50,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  deviceSpec: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginVertical: 2,
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: "900",
    color: tokens.colors.ink,
  },

  escrowNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  escrowNoticeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  trackBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: tokens.colors.ink,
    borderRadius: 12,
    paddingVertical: 10,
  },
  trackBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  detailsBtn: {
    flex: 0.8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    paddingVertical: 10,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
});
