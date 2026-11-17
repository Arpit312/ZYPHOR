import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  const ROLE_CONFIG = {
    customer: { title: "Customer Account", label: "CUSTOMER", color: T.green, icon: "person-outline" },
    technician: { title: "Technician Service Portal", label: "TECHNICIAN", color: "#8B5CF6", icon: "construct-outline" },
    retailer: { title: "Retailer Store Portal", label: "RETAILER", color: T.primary, icon: "storefront-outline" },
    wholesaler: { title: "Wholesale B2B Hub", label: "WHOLESALER", color: T.amber, icon: "cube-outline" },
  };

  const curConfig = ROLE_CONFIG[role] || ROLE_CONFIG.customer;

  return (
    <ScrollView
      style={styles.root}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={T.primary} />}
    >
      {/* ── HEADER ── */}
      <LinearGradient colors={["#0B1220", "#16233D"]} style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { backgroundColor: curConfig.color }]}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || "U"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name || "User"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <Badge label={curConfig.label} color={curConfig.color} />
              {sub?.status === "active" && <Badge label={`${sub.plan?.toUpperCase()} PLAN`} color="#8B5CF6" icon="star" />}
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.editBtn}>
            <Ionicons name="pencil" size={16} color={T.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* UNIVERSAL SELL BUTTON (DIRECT TO SELL SCREEN) */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Sell")}
          style={styles.universalSellBtn}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.universalSellText}>
            {isCustomer ? "Sell Your Old Phone (+ Cash In)" : "+ List & Sell Item"}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.body}>
        {/* ── ROLE-SPECIFIC VIEWS ── */}

        {/* 1. CUSTOMER VIEW: Buyer by default, unlocks Seller hub if listings > 0 */}
        {isCustomer && (
          <View style={styles.sectionContainer}>
            {stats.listings === 0 ? (
              /* Pure Buyer Welcome Card */
              <View style={styles.buyerCard}>
                <View style={styles.buyerHeader}>
                  <Ionicons name="shield-checkmark" size={24} color={T.green} />
                  <Text style={styles.buyerTitle}>Verified Buyer Account</Text>
                </View>
                <Text style={styles.buyerDesc}>
                  You are registered to buy AI-verified phones and spare parts with 24-hr IMEI blacklist protection.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Sell")}
                  style={styles.sellNowBanner}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sellBannerTitle}>Want to cash in?</Text>
                    <Text style={styles.sellBannerSub}>Sell your used phone in 60s with AI valuation &rarr;</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#FF6F61" />
                </TouchableOpacity>
              </View>
            ) : (
              /* Seller Hub Unlocked for Customer */
              <View style={styles.statsRow}>
                <StatCard icon="list" value={stats.listings} label="My Listed Devices" color={T.primary} />
                <StatCard icon="receipt" value={stats.orders} label="My Orders" color={T.green} />
              </View>
            )}
          </View>
        )}

        {/* 2. TECHNICIAN VIEW */}
        {isTechnician && (
          <View style={styles.sectionContainer}>
            <View style={styles.statsRow}>
              <StatCard icon="construct" value={stats.orders} label="Repair Jobs" color="#8B5CF6" />
              <StatCard icon="list" value={stats.listings} label="Parts Listed" color={T.primary} />
              <StatCard icon="cash" value={`₹${stats.earnings > 999 ? Math.round(stats.earnings / 1000) + "K" : stats.earnings}`} label="Earnings" color={T.green} />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate("Repair")}
              style={[styles.roleActionBanner, { borderColor: "#8B5CF640", backgroundColor: "#8B5CF615" }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleBannerTitle, { color: "#8B5CF6" }]}>Doorstep Repairs Workbench</Text>
                <Text style={styles.roleBannerSub}>View assigned customer device repair tickets &amp; updates</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
        )}

        {/* 3. RETAILER VIEW */}
        {isRetailer && (
          <View style={styles.sectionContainer}>
            <View style={styles.statsRow}>
              <StatCard icon="list" value={stats.listings} label="Store Stock" color={T.primary} />
              <StatCard icon="receipt" value={stats.orders} label="Orders" color={T.amber} />
              <StatCard icon="cash" value={`₹${stats.earnings > 999 ? Math.round(stats.earnings / 1000) + "K" : stats.earnings}`} label="Revenue" color={T.green} />
            </View>
          </View>
        )}

        {/* 4. WHOLESALER VIEW */}
        {isWholesaler && (
          <View style={styles.sectionContainer}>
            <View style={styles.statsRow}>
              <StatCard icon="cube" value={stats.listings} label="Bulk Lots" color={T.amber} />
              <StatCard icon="receipt" value={stats.orders} label="B2B Orders" color={T.green} />
              <StatCard icon="cash" value={`₹${stats.earnings > 999 ? Math.round(stats.earnings / 1000) + "K" : stats.earnings}`} label="Volume" color={T.primary} />
            </View>
          </View>
        )}

        {/* Subscription banner for businesses */}
        {!isCustomer && sub?.status !== "active" && (
          <TouchableOpacity onPress={() => navigation.navigate("Subscription")} style={styles.subBanner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.subBannerTitle}>Activate Subscription</Text>
              <Text style={styles.subBannerSub}>Start listing your products · Plans from ₹299/mo</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={T.amber} />
          </TouchableOpacity>
        )}

        {/* Dynamic Navigation Menu */}
        <View style={styles.menuCard}>
          {/* My Listings: for sellers or customers with listings */}
          {(!isCustomer || stats.listings > 0) && (
            <TouchableOpacity onPress={() => navigation.navigate("MyListings")} style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: T.primary + "15" }]}>
                <Ionicons name="list-outline" size={18} color={T.primary} />
              </View>
              <Text style={styles.menuLabel}>
                {isCustomer ? "My Listed Devices (Seller Hub)" : "Manage Inventory"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
            </TouchableOpacity>
          )}

          {/* Orders */}
          <TouchableOpacity onPress={() => navigation.navigate("MyOrders")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: T.amber + "15" }]}>
              <Ionicons name="receipt-outline" size={18} color={T.amber} />
            </View>
            <Text style={styles.menuLabel}>{isCustomer ? "My Purchases & Orders" : "Orders Received"}</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
          </TouchableOpacity>

          {/* Repair Screen for Technician */}
          {isTechnician && (
            <TouchableOpacity onPress={() => navigation.navigate("Repair")} style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: "#8B5CF615" }]}>
                <Ionicons name="construct-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.menuLabel}>Repair Workbench</Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
            </TouchableOpacity>
          )}

          {/* Edit Profile */}
          <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: T.green + "15" }]}>
              <Ionicons name="person-outline" size={18} color={T.green} />
            </View>
            <Text style={styles.menuLabel}>Profile &amp; Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
          </TouchableOpacity>

          {/* Subscription for Sellers */}
          {!isCustomer && (
            <TouchableOpacity onPress={() => navigation.navigate("Subscription")} style={[styles.menuItem, styles.menuItemBorder]}>
              <View style={[styles.menuIcon, { backgroundColor: "#8B5CF615" }]}>
                <Ionicons name="star-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.menuLabel}>Seller Subscription</Text>
              <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
            </TouchableOpacity>
          )}

          {/* IMEI Check */}
          <TouchableOpacity onPress={() => navigation.navigate("IMEICheck")} style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: "#06B6D415" }]}>
              <Ionicons name="scan-outline" size={18} color="#06B6D4" />
            </View>
            <Text style={styles.menuLabel}>IMEI Verification Tool</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity onPress={() => navigation.navigate("About")} style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: T.text.muted + "15" }]}>
              <Ionicons name="information-circle-outline" size={18} color={T.text.muted} />
            </View>
            <Text style={styles.menuLabel}>About ZYPHOR</Text>
            <Ionicons name="chevron-forward" size={16} color={T.text.muted} />
          </TouchableOpacity>
        </View>

        {/* Log Out */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={18} color={T.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ZYPHOR v2.0 • Made in India 🇮🇳</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  header: { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  avatarRow: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 24, fontWeight: "800", color: "#fff" },
  name: { fontSize: 17, fontWeight: "800", color: "#fff" },
  email: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  editBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.1)", justifyContent: "center", alignItems: "center" },
  universalSellBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FF6F61",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 18,
    shadowColor: "#FF6F61",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  universalSellText: { fontSize: 13, fontWeight: "800", color: "#fff", flex: 1, marginLeft: 8 },
  body: { padding: 16 },
  sectionContainer: { marginBottom: 16 },
  buyerCard: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border.color
  },
  buyerHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  buyerTitle: { fontSize: 15, fontWeight: "800", color: T.text.primary },
  buyerDesc: { fontSize: 12, color: T.text.muted, lineHeight: 18, marginBottom: 14 },
  sellNowBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6F6115",
    borderWidth: 1,
    borderColor: "#FF6F6130",
    padding: 12,
    borderRadius: 12
  },
  sellBannerTitle: { fontSize: 13, fontWeight: "800", color: "#FF6F61" },
  sellBannerSub: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  roleActionBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: T.radius.lg,
    borderWidth: 1,
    marginTop: 10
  },
  roleBannerTitle: { fontSize: 13, fontWeight: "800" },
  roleBannerSub: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10 },
  subBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.amber + "15",
    borderRadius: T.radius.lg,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: T.amber + "30"
  },
  subBannerTitle: { fontSize: 13, fontWeight: "700", color: T.amber },
  subBannerSub: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  menuCard: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 16
  },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: T.border.color },
  menuIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: T.text.primary },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: T.red + "10",
    borderRadius: T.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: T.red + "25",
    marginBottom: 16
  },
  logoutText: { fontSize: 13, fontWeight: "700", color: T.red },
  version: { textAlign: "center", fontSize: 11, color: T.text.muted }
});
