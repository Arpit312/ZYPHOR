import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Empty, ListingCard } from "../../components/UI";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

export default function WishlistScreen({ navigation }) {
  const { items, loading, refresh, remove } = useWishlist();
  const { addToCart } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const moveToCart = (item) => {
    const id = item._id || item.id;
    addToCart(item);
    remove(id);
    Alert.alert("Moved to Cart", `${item.brand || ""} ${item.model || "Device"} added to your cart.`, [
      { text: "Continue" },
      { text: "View Cart", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <View style={styles.root}>
      {/* Sub-header (native stack header already shows "Wishlist") */}
      <View style={styles.subHeader}>
        <Text style={styles.countText}>
          {items.length} saved {items.length === 1 ? "device" : "devices"}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {items.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("Compare")}
              style={styles.compareBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="git-compare-outline" size={15} color={T.primary} />
              <Text style={styles.compareText}>Compare</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn} activeOpacity={0.7}>
            <Ionicons name="refresh" size={17} color={T.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i._id || i.id)}
          numColumns={2}
          columnWrapperStyle={{ gap: 16, paddingHorizontal: 16 }}
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Empty
                icon="heart-outline"
                title="Your wishlist is empty"
                sub="Tap the heart on any listing to save it here for later."
                action={() => navigation.navigate("Browse")}
                actionLabel="Browse Marketplace"
              />
            </View>
          }
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.navigate("ListingDetail", { id: item._id || item.id })}
              onAddToCart={() => moveToCart(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  countText: { fontSize: 13, color: T.text.secondary, fontWeight: "600" },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  compareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  compareText: { fontSize: 12, fontWeight: "700", color: T.text.primary },
});
