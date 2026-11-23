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
import { Empty, Badge, ListingCard } from "../../components/UI";
import { listingsAPI } from "../../api/api";

export default function SellerScreen({ route, navigation }) {
  const sellerId = route.params?.sellerId || route.params?.id;
  const [seller, setSeller] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!sellerId) { setLoading(false); return; }
    try {
      const r = await listingsAPI.getSeller(sellerId);
      setSeller(r.data.seller);
      setListings(r.data.listings || []);
    } catch (err) {
      // keep whatever we have; header shows error state below
      setSeller((s) => s || { error: err.response?.data?.error || "Could not load seller." });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sellerId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const name = seller?.businessName || seller?.name || "Seller";
  const memberSince = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : null;

  const header = (
    <View>
      {/* Custom top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={T.primary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Seller</Text>
        <View style={{ width: 36 }} />
      </View>

      {seller && !seller.error ? (
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name?.[0]?.toUpperCase() || "S"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={styles.name} numberOfLines={1}>{name}</Text>
              {seller.verifiedSeller && (
                <Ionicons name="shield-checkmark" size={17} color={T.green} />
              )}
            </View>
            <Text style={styles.meta}>
              {[seller.city, memberSince ? `Member since ${memberSince}` : null].filter(Boolean).join(" • ") || "ZYPHOR seller"}
            </Text>
            <View style={{ flexDirection: "row", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {seller.verifiedSeller && <Badge label="VERIFIED SELLER" color={T.green} icon="shield-checkmark" />}
              {seller.trustRating != null && (
                <Badge label={`Trust ${Number(seller.trustRating).toFixed(1)}/5`} color={T.primary} icon="star" />
              )}
              <Badge label={`${listings.length} live listings`} color={T.secondary} icon="cube-outline" />
              {Number(seller.totalSales || 0) > 0 && (
                <Badge label={`${seller.totalSales} sales`} color={T.primary} icon="cart-outline" />
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.profileCard}>
          <Text style={styles.meta}>{seller?.error || "Seller not found."}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Listings from this seller</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={T.primary} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Seller</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.center}><ActivityIndicator color={T.primary} size="large" /></View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={listings}
        keyExtractor={(i) => String(i._id || i.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 16, paddingHorizontal: 16 }}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
        ListEmptyComponent={
          <View style={{ paddingTop: 30 }}>
            <Empty
              icon="cube-outline"
              title="No live listings"
              sub="This seller has no active listings right now."
              action={() => navigation.navigate("Browse")}
              actionLabel="Browse Marketplace"
            />
          </View>
        }
        renderItem={({ item }) => (
          <ListingCard
            item={item}
            onPress={() => navigation.navigate("ListingDetail", { id: item._id || item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg.secondary,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color,
  },
  topTitle: { fontSize: 17, fontWeight: "800", color: T.text.primary },
  profileCard: {
    flexDirection: "row", gap: 14, alignItems: "center",
    margin: 16, padding: 16, borderRadius: 18,
    backgroundColor: T.bg.secondary, borderWidth: 1, borderColor: T.border.color,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: T.primary,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 22, fontWeight: "900" },
  name: { fontSize: 18, fontWeight: "900", color: T.text.primary, flexShrink: 1, letterSpacing: -0.3 },
  meta: { fontSize: 12, color: T.text.secondary, marginTop: 3 },
  sectionTitle: {
    fontSize: 16, fontWeight: "800", color: T.text.primary,
    paddingHorizontal: 20, marginBottom: 12, letterSpacing: -0.2,
  },
});
