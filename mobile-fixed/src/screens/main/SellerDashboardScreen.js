import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { StatCard, Btn } from "../../components/UI";
import { listingsAPI, ordersAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function SellerDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeListings: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    escrowLockedEarnings: 0,
    settledEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [lRes, oRes] = await Promise.allSettled([
        listingsAPI.getAll({ seller: user?.id, limit: 100 }),
        ordersAPI.getAll(),
      ]);

      let activeListings = 0;
      if (lRes.status === "fulfilled") {
        activeListings = lRes.value.data.count || lRes.value.data.listings?.length || 0;
      }

      let pendingOrders = 0;
      let deliveredOrders = 0;
      let escrowLockedEarnings = 0;
      let settledEarnings = 0;

      if (oRes.status === "fulfilled") {
        const orders = oRes.value.data.orders || [];
        const sellerOrders = orders.filter((o) => (o.seller?._id || o.seller) === user?.id);

        sellerOrders.forEach((o) => {
          const amt = Number(o.bill?.sellerReceives || o.amount || 0);
          if (o.orderStatus === "delivered") {
            deliveredOrders += 1;
            settledEarnings += amt;
          } else if (o.orderStatus !== "cancelled") {
            pendingOrders += 1;
            escrowLockedEarnings += amt;
          }
        });
      }

      setStats({
        activeListings,
        pendingOrders,
        deliveredOrders,
        escrowLockedEarnings,
        settledEarnings,
      });
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Seller Command Centre</Text>
          <Text style={styles.headerSub}>Storefront Inventory & Escrow Payouts</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("MerchantKYC")}
          style={styles.kycBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={15} color={tokens.colors.accentStrong} />
          <Text style={styles.kycText}>KYC</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.colors.accentStrong} />}
      >
        {/* Earnings Overview Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsPre}>SETTLED & DISPATCHED REVENUE</Text>
          <Text style={styles.earningsMain}>₹{stats.settledEarnings.toLocaleString("en-IN")}</Text>

          <View style={styles.escrowHoldRow}>
            <View style={styles.escrowHoldDot} />
            <Text style={styles.escrowHoldText}>
              ₹{stats.escrowLockedEarnings.toLocaleString("en-IN")} held in 48h escrow window
            </Text>
          </View>
        </View>

        {/* 4 Stat Bento Tiles */}
        <View style={styles.bentoRow}>
          <View style={styles.bentoTile}>
            <Ionicons name="cube-outline" size={20} color={tokens.colors.accentStrong} />
            <Text style={styles.bentoValue}>{stats.activeListings}</Text>
            <Text style={styles.bentoLabel}>Active Listings</Text>
          </View>
          <View style={styles.bentoTile}>
            <Ionicons name="time-outline" size={20} color={tokens.colors.accentStrong} />
            <Text style={styles.bentoValue}>{stats.pendingOrders}</Text>
            <Text style={styles.bentoLabel}>In Transit / Escrow</Text>
          </View>
        </View>

        <View style={styles.bentoRow}>
          <View style={styles.bentoTile}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color={tokens.colors.success} />
            <Text style={styles.bentoValue}>{stats.deliveredOrders}</Text>
            <Text style={styles.bentoLabel}>Completed Sales</Text>
          </View>
          <View style={styles.bentoTile}>
            <Ionicons name="star-outline" size={20} color="#EAB308" />
            <Text style={styles.bentoValue}>5.0 ★</Text>
            <Text style={styles.bentoLabel}>Merchant Trust</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionHeader}>Merchant Operations</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("Sell")}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="add-circle" size={20} color={tokens.colors.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>List New Certified Device</Text>
            <Text style={styles.actionSub}>Add smartphone or bulk wholesale lot to catalog</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={tokens.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("MyListings")}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="grid-outline" size={20} color={tokens.colors.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Manage Stock & Pricing</Text>
            <Text style={styles.actionSub}>Update active devices, edit prices, or mark out-of-stock</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={tokens.colors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate("MerchantKYC")}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="document-text-outline" size={20} color={tokens.colors.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>Bank & GSTIN Verification (KYC)</Text>
            <Text style={styles.actionSub}>Required for automated T+2 direct nodal bank payouts</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={tokens.colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
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
  headerTitle: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },
  headerSub: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 1 },
  kycBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  kycText: { fontSize: 11, fontWeight: "800", color: tokens.colors.accentStrong },

  scroll: { padding: 18, paddingBottom: 60 },

  earningsCard: {
    backgroundColor: tokens.colors.ink,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    ...tokens.shadow.elevated,
  },
  earningsPre: { fontSize: 10, fontWeight: "800", color: tokens.colors.accent, letterSpacing: 1.2 },
  earningsMain: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginVertical: 6 },
  escrowHoldRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  escrowHoldDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: tokens.colors.accent },
  escrowHoldText: { fontSize: 11.5, color: tokens.colors.textSecondary, fontWeight: "600" },

  bentoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  bentoTile: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  bentoValue: { fontSize: 20, fontWeight: "900", color: tokens.colors.ink, marginTop: 8 },
  bentoLabel: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 10,
    marginBottom: 12,
  },

  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 10,
    gap: 12,
    ...tokens.shadow.card,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: 13.5, fontWeight: "800", color: tokens.colors.ink },
  actionSub: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },
});
