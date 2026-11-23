import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { ListingCard, Empty } from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useCart } from "../../context/CartContext";

const GRADES = ["All Grades", "Pristine", "Excellent", "Good"];

export default function CategoryBrandScreen({ route, navigation }) {
  const brandName = route.params?.brand || "Apple";
  const { addToCart } = useCart();
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { brand: brandName, type: "device" };
      if (selectedGrade !== "All Grades") {
        params.condition = selectedGrade;
      }
      const r = await listingsAPI.getAll(params);
      setListings(r.data.listings || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [brandName, selectedGrade]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{brandName} Certified Vault</Text>
          <Text style={styles.headerSub}>45-Point Verified Pre-Owned Collection</Text>
        </View>
      </View>

      {/* Brand Hero Banner */}
      <View style={styles.brandHero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroPre}>AUTHENTICATED SHOWCASE</Text>
          <Text style={styles.heroTitle}>{brandName} Flagships</Text>
          <Text style={styles.heroDesc}>
            Every device carries genuine parts, >85% battery health guarantee, and 6 months comprehensive warranty.
          </Text>
        </View>
      </View>

      {/* Grade Selector Tabs */}
      <View style={styles.tabsRow}>
        {GRADES.map((g) => {
          const active = selectedGrade === g;
          return (
            <TouchableOpacity
              key={g}
              onPress={() => setSelectedGrade(g)}
              style={[styles.tabChip, active && styles.tabChipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{g}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Listings Grid */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
        </View>
      ) : listings.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="phone-portrait-outline"
            title={`No ${brandName} devices found`}
            sub="Check back soon as new certified stock arrives daily at our hub."
            action={() => setSelectedGrade("All Grades")}
            actionLabel="View All Grades"
          />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.navigate("ListingDetail", { id: item._id })}
              onAddToCart={() => addToCart(item)}
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

  brandHero: {
    backgroundColor: tokens.colors.ink,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    ...tokens.shadow.elevated,
  },
  heroContent: { gap: 4 },
  heroPre: { fontSize: 9.5, fontWeight: "800", color: tokens.colors.accent, letterSpacing: 1.2 },
  heroTitle: { fontSize: 22, fontWeight: "900", color: "#FFFFFF" },
  heroDesc: { fontSize: 12, color: tokens.colors.textSecondary, lineHeight: 17, marginTop: 4 },

  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  tabChipActive: {
    backgroundColor: tokens.colors.ink,
    borderColor: tokens.colors.ink,
  },
  tabText: { fontSize: 12, fontWeight: "600", color: tokens.colors.textSecondary },
  tabTextActive: { color: "#FFFFFF", fontWeight: "700" },

  gridContainer: { padding: 16, paddingBottom: 60 },
});
