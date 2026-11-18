import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { ListingCard, Empty } from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

export default function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await listingsAPI.getAll({ seller: user?.id });
      setListings(r.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteListing = async (id) => {
    Alert.alert("Remove Listing", "Are you sure you want to delete this listing from marketplace?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await listingsAPI.delete(id);
            setListings((p) => p.filter((l) => l._id !== id));
          } catch (e) {
            Alert.alert("Error", e.response?.data?.error || "Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator color={T.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>My Listings</Text>
          <Text style={styles.sub}>{listings.length} items listed by you</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Sell")} style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="list-outline"
            title="No listings published"
            sub="Publish your smartphone or OEM parts to reach buyers across India."
            action={() => navigation.navigate("Sell")}
            actionLabel="Create First Listing"
          />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
          renderItem={({ item }) => (
            <View style={styles.itemWrap}>
              <ListingCard item={item} onPress={() => navigation.navigate("ListingDetail", { id: item._id })} wide />
              <View style={styles.itemActions}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status?.toUpperCase() || "ACTIVE"}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteListing(item._id)} style={styles.deleteBtn} activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={15} color={T.text.secondary} />
                  <Text style={styles.deleteTxt}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  itemWrap: { marginBottom: 16 },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: -8,
  },
  statusBadge: {
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  statusText: { fontSize: 10, fontWeight: "700", color: T.text.secondary, letterSpacing: 0.5 },
  deleteBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 6, paddingHorizontal: 8 },
  deleteTxt: { fontSize: 12, color: T.text.secondary, fontWeight: "600" },
});
