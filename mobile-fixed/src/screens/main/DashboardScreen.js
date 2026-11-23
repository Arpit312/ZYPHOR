import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { StatCard, Badge } from "../../components/UI";
import { listingsAPI, ordersAPI, subAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ listings: 0, orders: 0, earnings: 0 });
  const [sub, setSub] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role || "customer";
  const isCustomer = role === "customer";
  const isTechnician = role === "technician";
  const isRetailer = role === "retailer";
  const isWholesaler = role === "wholesaler";

  const load = useCallback(async () => {
    try {
      const [lRes, oRes, sRes] = await Promise.allSettled([
        listingsAPI.getAll({ seller: user?.id, limit: 100 }),
        ordersAPI.getAll(),
        subAPI.get(),
      ]);
      if (lRes.status === "fulfilled") {
        setStats((s) => ({ ...s, listings: lRes.value.data.count || lRes.value.data.listings?.length || 0 }));
      }
      if (oRes.status === "fulfilled") {
        const orders = oRes.value.data.orders || [];
        const sold = orders.filter((o) => (o.seller?._id || o.seller) === user?.id && o.orderStatus === "delivered");
        const earnings = sold.reduce((sum, o) => sum + (o.bill?.sellerReceives || o.amount || 0), 0);
        setStats((s) => ({ ...s, orders: orders.length, earnings }));
      }
      if (sRes.status === "fulfilled") setSub(sRes.value.data.subscription);
    } catch {}
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of your account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={T.primary} />}
    >
      {/* ── EDITORIAL PROFILE HEADER ── */}
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "Z"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || "Member"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
              <Badge label={role.toUpperCase()} color={T.primary} />
              {sub?.status === "active" && <Badge label={`${sub.plan?.toUpperCase()} PLAN`} color={T.green} icon="star" />}
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.editBtn} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={18} color={T.primary} />
          </TouchableOpacity>
        </View>

        {/* Universal Action Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Sell")}
          style={styles.universalSellBtn}
          activeOpacity={0.88}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.universalSellText}>
              {isCustomer ? "Sell Your Smartphone (Instant Quote)" : "Add New Listing to Store"}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Statistics Row */}
        <View style={styles.statsRow}>
          <StatCard icon="cube-outline" value={stats.listings} label="Listed Products" color={T.primary} />
          <StatCard icon="receipt-outline" value={stats.orders} label="Orders" color={T.primary} />
          {!isCustomer && (
            <StatCard icon="wallet-outline" value={`₹${stats.earnings > 999 ? Math.round(stats.earnings / 1000) + "K" : stats.earnings}`} label="Earnings" color={T.green} />
          )}
        </View>

        {/* Subscription banner for merchants */}
        {!isCustomer && sub?.status !== "active" && (
          <TouchableOpacity onPress={() => navigation.navigate("Subscription")} style={styles.subBanner} activeOpacity={0.8}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subBannerTitle}>Activate Merchant Plan</Text>
              <Text style={styles.subBannerSub}>List unlimited phones & spare parts on ZYPHOR</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={T.primary} />
          </TouchableOpacity>
        )}

        {/* Navigation Menu Card */}
        <View style={styles.menuCard}>
          {(!isCustomer || stats.listings > 0) && (
            <TouchableOpacity onPress={() => navigation.navigate("MyListings")} style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuIcon}>
                <Ionicons name="grid-outline" size={18} color={T.primary} />
              </View>
              <Text style={styles.menuLabel}>
                {isCustomer ? "My Listed Devices" : "Store Inventory"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("OrderTracking")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="time-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Active Orders & 48h Escrow Window</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="settings-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Settings (Language & Preferences)</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("HelpLegal")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="shield-checkmark-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Help Centre, Warranties & Grievance</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("MyOrders")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="bag-check-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>{isCustomer ? "My Purchases & Invoices" : "Orders Received"}</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Wishlist")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="heart-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>My Wishlist</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Notifications")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Compare")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="git-compare-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Compare Devices</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("RepairTickets")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="construct-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>My Repair Tickets</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Addresses")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="location-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Saved Addresses</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Support")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          {isTechnician && (
            <TouchableOpacity onPress={() => navigation.navigate("Repair")} style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuIcon}>
                <Ionicons name="construct-outline" size={18} color={T.primary} />
              </View>
              <Text style={styles.menuLabel}>Repair Workbench</Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="person-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>Account & Address Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          {!isCustomer && (
            <TouchableOpacity onPress={() => navigation.navigate("Subscription")} style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={styles.menuIcon}>
                <Ionicons name="card-outline" size={18} color={T.primary} />
              </View>
              <Text style={styles.menuLabel}>Subscription & Billing</Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("IMEICheck")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={styles.menuIcon}>
              <Ionicons name="scan-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>IMEI & Hardware Diagnostic Tool</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("About")} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="information-circle-outline" size={18} color={T.primary} />
            </View>
            <Text style={styles.menuLabel}>About ZYPHOR & Escrow Protocol</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={18} color={T.primary} />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ZYPHOR Certified Suite • Edition 2.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 22,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  avatarRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: T.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 24, fontWeight: "900", color: "#FFFFFF" },
  name: { fontSize: 20, fontWeight: "900", color: T.text.primary, letterSpacing: -0.3 },
  email: { fontSize: 13, color: T.text.secondary, marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  universalSellBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: T.primary,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginTop: 20,
  },
  universalSellText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },

  body: { padding: 20, paddingBottom: 60 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },

  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  subBannerTitle: { fontSize: 14, fontWeight: "700", color: T.text.primary },
  subBannerSub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 20,
    ...T.shadow.card,
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: T.border.color },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: T.bg.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: T.text.primary },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.bg.secondary,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 20,
  },
  logoutText: { fontSize: 13, fontWeight: "700", color: T.text.primary },
  version: { textAlign: "center", fontSize: 11, color: T.text.secondary },
});
