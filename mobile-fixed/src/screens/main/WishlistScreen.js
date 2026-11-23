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
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
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
    Alert.alert("✓ Added to Bag", `${item.brand || ""} ${item.model || "Device"} moved to your shopping bag.`, [
      { text: "Continue" },
      { text: "View Bag", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Saved Vault</Text>
          <Text style={styles.sub}>{items.length} saved certified devices</Text>
        </View>
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={tokens.colors.ink} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="heart-outline"
            title="Your vault is empty"
            sub="Save certified devices you want to monitor, compare, or purchase later."
            action={() => navigation.navigate("Browse")}
            actionLabel="Discover Devices"
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tokens.colors.accentStrong}
            />
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

  gridContainer: { padding: 16, paddingBottom: 60 },
});
