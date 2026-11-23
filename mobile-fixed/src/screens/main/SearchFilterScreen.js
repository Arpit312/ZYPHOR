import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { ListingCard, FilterPill, BottomSheetModal, Btn } from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useTranslation } from "../../i18n/I18nContext";

const QUICK_TAGS = ["iPhone 15 Pro", "Samsung S24 Ultra", "Pixel 8 Pro", "OnePlus 12", "Under ₹30,000"];
const BRANDS = ["All", "Apple", "Samsung", "OnePlus", "Google", "Xiaomi"];
const GRADES = ["All", "Pristine", "Excellent", "Good"];
const STORAGES = ["All", "128GB", "256GB", "512GB", "1TB"];

export default function SearchFilterScreen({ navigation, route }) {
  const [query, setQuery] = useState(route.params?.initialQuery || "");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedStorage, setSelectedStorage] = useState("All");
  const [priceMax, setPriceMax] = useState(150000);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (query.trim()) params.search = query.trim();
      if (selectedBrand !== "All") params.brand = selectedBrand;
      if (selectedGrade !== "All") params.grade = selectedGrade;
      const res = await listingsAPI.getAll(params);
      let list = res.data?.listings || [];

      // Filter locally by storage & priceMax if applicable
      if (selectedStorage !== "All") {
        list = list.filter((item) =>
          String(item.storage || "").toLowerCase().includes(selectedStorage.toLowerCase())
        );
      }
      list = list.filter((item) => Number(item.price || 0) <= priceMax);
      setResults(list);
    } catch (e) {
      console.warn("Search error:", e);
    } finally {
      setLoading(false);
    }
  }, [query, selectedBrand, selectedGrade, selectedStorage, priceMax]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const activeFilterCount =
    (selectedBrand !== "All" ? 1 : 0) +
    (selectedGrade !== "All" ? 1 : 0) +
    (selectedStorage !== "All" ? 1 : 0) +
    (priceMax < 150000 ? 1 : 0);

  const resetFilters = () => {
    setSelectedBrand("All");
    setSelectedGrade("All");
    setSelectedStorage("All");
    setPriceMax(150000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* Top Search Input Bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={tokens.colors.ink} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={tokens.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search verified models, storage, grades..."
            placeholderTextColor={tokens.colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={performSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={tokens.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setFilterModalOpen(true)}
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFilterCount > 0 ? "#FFFFFF" : tokens.colors.ink}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Search Tag Pills */}
      <View style={styles.tagsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsScroll}>
          {QUICK_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tagPill}
              onPress={() => {
                if (tag === "Under ₹30,000") {
                  setPriceMax(30000);
                } else {
                  setQuery(tag);
                }
              }}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Brand Horizontal Filter Bar */}
      <View style={styles.brandRail}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandRailScroll}>
          {BRANDS.map((b) => (
            <FilterPill
              key={b}
              label={b}
              active={selectedBrand === b}
              onPress={() => setSelectedBrand(b)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results List */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={tokens.colors.accent} />
          <Text style={styles.loadingText}>Searching certified devices...</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="search-outline" size={48} color={tokens.colors.textMuted} />
          <Text style={styles.emptyTitle}>No matching devices found</Text>
          <Text style={styles.emptySub}>Try adjusting your keywords, price cap, or grade filters.</Text>
          {activeFilterCount > 0 && (
            <Btn
              title="Reset All Filters"
              onPress={resetFilters}
              variant="outline"
              small
              style={{ marginTop: 14 }}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item._id || item.id)}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                Showing <Text style={{ color: tokens.colors.ink, fontWeight: "800" }}>{results.length}</Text> verified devices
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={() => navigation.navigate("ListingDetail", { id: item._id, item })}
            />
          )}
        />
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheetModal
        visible={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Refine Search"
      >
        {/* Grade Selection */}
        <Text style={styles.filterSectionTitle}>Condition Grade</Text>
        <View style={styles.filterPillsGroup}>
          {GRADES.map((g) => (
            <FilterPill
              key={g}
              label={g}
              active={selectedGrade === g}
              onPress={() => setSelectedGrade(g)}
            />
          ))}
        </View>

        {/* Storage Selection */}
        <Text style={styles.filterSectionTitle}>Storage Capacity</Text>
        <View style={styles.filterPillsGroup}>
          {STORAGES.map((s) => (
            <FilterPill
              key={s}
              label={s}
              active={selectedStorage === s}
              onPress={() => setSelectedStorage(s)}
            />
          ))}
        </View>

        {/* Max Price Range */}
        <Text style={styles.filterSectionTitle}>
          Max Price: ₹{priceMax.toLocaleString("en-IN")}
        </Text>
        <View style={styles.priceButtonsRow}>
          {[20000, 40000, 60000, 90000, 150000].map((val) => (
            <TouchableOpacity
              key={val}
              style={[
                styles.pricePill,
                priceMax === val && styles.pricePillActive,
              ]}
              onPress={() => setPriceMax(val)}
            >
              <Text
                style={[
                  styles.pricePillText,
                  priceMax === val && styles.pricePillTextActive,
                ]}
              >
                ₹{val >= 100000 ? `${val / 1000}k` : `${val / 1000}k`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.filterActionsRow}>
          <Btn
            title="Reset"
            onPress={resetFilters}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Btn
            title="Apply Filters"
            onPress={() => setFilterModalOpen(false)}
            variant="gold"
            style={{ flex: 2 }}
          />
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  backBtn: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: tokens.colors.ink,
  },
  clearBtn: {
    padding: 2,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    position: "relative",
  },
  filterBtnActive: {
    backgroundColor: tokens.colors.ink,
    borderColor: tokens.colors.ink,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: tokens.colors.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
  tagsContainer: {
    backgroundColor: tokens.colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  tagsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagPill: {
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
  },
  brandRail: {
    backgroundColor: tokens.colors.surface,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
  },
  brandRailScroll: {
    paddingHorizontal: 16,
  },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: tokens.colors.ink,
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  gridContainer: {
    padding: 16,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  resultsHeader: {
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 14,
    marginBottom: 8,
  },
  filterPillsGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  priceButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 6,
  },
  pricePill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  pricePillActive: {
    backgroundColor: tokens.colors.ink,
    borderColor: tokens.colors.ink,
  },
  pricePillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
  },
  pricePillTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  filterActionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    marginBottom: 24,
  },
});
