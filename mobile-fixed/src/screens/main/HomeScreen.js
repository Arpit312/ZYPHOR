import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import {
  ListingCard,
  SecHeader,
  Empty,
  CategoryBubble,
  CartHeaderBtn,
  TrustStrip,
  Btn,
  PriceTag,
  GradeBadge,
} from "../../components/UI";
import { listingsAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "../../i18n/I18nContext";

const { width: W } = Dimensions.get("window");

const CATEGORIES = [
  { id: "phones", label: "Flagships", icon: "phone-portrait-outline", tab: "Marketplace" },
  { id: "repair", label: "Doorstep Lab", icon: "construct-outline", tab: "Repair" },
  { id: "sell", label: "Sell Device", icon: "cash-outline", tab: "Sell" },
  { id: "advisor", label: "AI Advisor", icon: "sparkles-outline", tab: "Advisor" },
  { id: "imei", label: "IMEI Scan", icon: "scan-outline", tab: "IMEICheck" },
  { id: "parts", label: "OEM Parts", icon: "hardware-chip-outline", tab: "Parts" },
];

const BRANDS = [
  { name: "Apple", count: "140+ Devices", icon: "logo-apple" },
  { name: "Samsung", count: "98+ Devices", icon: "phone-portrait" },
  { name: "OnePlus", count: "45+ Devices", icon: "flash" },
  { name: "Google", count: "32+ Devices", icon: "logo-google" },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { t, locale, toggleLocale } = useTranslation();
  const [deviceListings, setDeviceListings] = useState([]);
  const [dealOfTheDay, setDealOfTheDay] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const r = await listingsAPI.getAll({ type: "device", limit: 8 });
      const items = r.data.listings || [];
      setDeviceListings(items);
      if (items.length > 0) {
        setDealOfTheDay(items[0]);
      }
    } catch (err) {
      console.warn("Home data fetch warning:", err?.message);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleQuickAdd = (item) => {
    addToCart(item);
    Alert.alert("✓ Added to Bag", `${item.brand} ${item.model} has been added to your bag.`, [
      { text: "Continue Shopping" },
      { text: "View Bag", onPress: () => navigation.navigate("Cart") },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      {/* ─── Top Branded Navigation Bar ─── */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLeft}>
            <View style={styles.brandLogoBox}>
              <Image
                source={require("../../../assets/symbol-white.png")}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.brandTitle}>ZYPHOR</Text>
                <View style={styles.certifiedTag}>
                  <Text style={styles.certifiedTagText}>CERTIFIED</Text>
                </View>
              </View>
              <Text style={styles.deliveryLocation} numberOfLines={1}>
                {user?.city ? `Delivering to ${user.city}` : "Pan-India Express Delivery"}
              </Text>
            </View>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity onPress={toggleLocale} style={styles.langPill} activeOpacity={0.75}>
              <Text style={styles.langText}>{locale === "en" ? "EN" : "HI"}</Text>
            </TouchableOpacity>
            <CartHeaderBtn onPress={() => navigation.navigate("Cart")} />
          </View>
        </View>

        {/* Search Input Trigger */}
        <TouchableOpacity
          style={styles.searchTrigger}
          onPress={() => navigation.navigate("SearchFilter")}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={17} color={tokens.colors.textMuted} />
          <Text style={styles.searchTriggerText}>Search iPhone, Galaxy, Pixel, OEM parts...</Text>
          <View style={styles.filterMiniPill}>
            <Ionicons name="options-outline" size={15} color={tokens.colors.ink} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.colors.accent}
          />
        }
      >
        {/* ─── 4-Pillar Recommerce Trust Strip ─── */}
        <TrustStrip />

        {/* ─── Category Bubbles ─── */}
        <View style={styles.catSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <CategoryBubble
                key={cat.id}
                icon={cat.icon}
                label={cat.label}
                onPress={() => {
                  if (cat.tab === "Marketplace") navigation.navigate("Marketplace");
                  else if (cat.tab === "Repair") navigation.navigate("RepairMain");
                  else if (cat.tab === "Sell") navigation.navigate("SellMain");
                  else if (cat.tab === "Advisor") navigation.navigate("Advisor");
                  else if (cat.tab === "IMEICheck") navigation.navigate("IMEICheck");
                  else if (cat.tab === "Parts") navigation.navigate("Parts");
                }}
              />
            ))}
          </ScrollView>
        </View>

        {/* ─── Deal of the Day Plinth ─── */}
        {dealOfTheDay && (
          <View style={styles.dealPlinthCard}>
            <View style={styles.dealTopRow}>
              <View style={styles.dealTimerBadge}>
                <Ionicons name="flame" size={12} color="#FFFFFF" />
                <Text style={styles.dealTimerText}>DEAL OF THE DAY</Text>
              </View>
              <GradeBadge grade={dealOfTheDay.conditionGrade || "Pristine"} />
            </View>

            <TouchableOpacity
              style={styles.dealBody}
              activeOpacity={0.88}
              onPress={() =>
                navigation.navigate("ListingDetail", {
                  id: dealOfTheDay._id,
                  item: dealOfTheDay,
                })
              }
            >
              <View style={styles.dealImgWrap}>
                {dealOfTheDay.images?.[0] ? (
                  <Image
                    source={{ uri: dealOfTheDay.images[0] }}
                    style={styles.dealImg}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons name="phone-portrait-outline" size={48} color={tokens.colors.textMuted} />
                )}
              </View>

              <View style={styles.dealInfo}>
                <Text style={styles.dealBrand}>{dealOfTheDay.brand}</Text>
                <Text style={styles.dealModel} numberOfLines={1}>
                  {dealOfTheDay.model || dealOfTheDay.name}
                </Text>
                <Text style={styles.dealSpecs}>
                  {[dealOfTheDay.storage, dealOfTheDay.ram, "Battery: 92%"].filter(Boolean).join(" • ")}
                </Text>

                <PriceTag
                  price={dealOfTheDay.price}
                  originalPrice={dealOfTheDay.originalPrice}
                  size="lg"
                />

                <View style={styles.dealGuaranteeRow}>
                  <Ionicons name="shield-checkmark" size={13} color={tokens.colors.accent} />
                  <Text style={styles.dealGuaranteeText}>Includes 6M Warranty + 48h Inspection</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Brand Spotlight Rail ─── */}
        <View style={styles.brandRailSection}>
          <SecHeader
            index="01"
            title={t("brand_spotlight")}
            sub="Inspected flagships by certified manufacturers"
            action={() => navigation.navigate("Marketplace")}
            actionLabel="View all"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
            {BRANDS.map((b) => (
              <TouchableOpacity
                key={b.name}
                style={styles.brandPillCard}
                activeOpacity={0.75}
                onPress={() => navigation.navigate("SearchFilter", { initialQuery: b.name })}
              >
                <View style={styles.brandIconWrap}>
                  <Ionicons name={b.icon} size={20} color={tokens.colors.ink} />
                </View>
                <Text style={styles.brandPillName}>{b.name}</Text>
                <Text style={styles.brandPillCount}>{b.count}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ─── Recommerce Instant Sell Banner ─── */}
        <View style={styles.sellBanner}>
          <View style={styles.sellBannerContent}>
            <View style={styles.sellBadge}>
              <Text style={styles.sellBadgeText}>INSTANT RECOMMERCE</Text>
            </View>
            <Text style={styles.sellTitle}>{t("sell_banner_title")}</Text>
            <Text style={styles.sellSub}>{t("sell_banner_sub")}</Text>

            <Btn
              title="Get AI Price Quote"
              onPress={() => navigation.navigate("SellMain")}
              variant="gold"
              small
              rightIcon="arrow-forward"
              style={{ alignSelf: "flex-start", marginTop: 12 }}
            />
          </View>

          <View style={styles.sellBannerRight}>
            <Ionicons name="hardware-chip-outline" size={48} color={tokens.colors.accent} />
          </View>
        </View>

        {/* ─── Verified Certified Devices Grid ─── */}
        <View style={{ marginTop: 20 }}>
          <SecHeader
            index="02"
            title={t("featured_collection")}
            sub="Certified pristine phones ready for dispatch"
            action={() => navigation.navigate("Marketplace")}
            actionLabel="Browse all"
          />

          {deviceListings.length === 0 ? (
            <Empty
              title="No devices currently listed"
              sub="Check back shortly or refresh the feed."
              action={loadData}
              actionLabel="Refresh Feed"
            />
          ) : (
            <View style={styles.grid}>
              {deviceListings.map((item) => (
                <ListingCard
                  key={item._id || item.id}
                  item={item}
                  onPress={() => navigation.navigate("ListingDetail", { id: item._id, item })}
                  onAddToCart={() => handleQuickAdd(item)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  topBar: {
    backgroundColor: tokens.colors.surface,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    ...tokens.shadow.subtle,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.accent,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: tokens.colors.ink,
  },
  certifiedTag: {
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  certifiedTagText: {
    fontSize: 8,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    letterSpacing: 0.5,
  },
  deliveryLocation: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginTop: 1,
    maxWidth: 180,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  langText: {
    fontSize: 11,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  searchTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  searchTriggerText: {
    flex: 1,
    fontSize: 13,
    color: tokens.colors.textMuted,
    marginLeft: 8,
  },
  filterMiniPill: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  catSection: {
    marginVertical: 12,
  },
  catScroll: {
    paddingVertical: 4,
    gap: 4,
  },
  dealPlinthCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    padding: 16,
    marginVertical: 12,
    ...tokens.shadow.card,
  },
  dealTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dealTimerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tokens.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  dealTimerText: {
    fontSize: 9.5,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  dealBody: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  dealImgWrap: {
    width: 110,
    height: 120,
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.borderLight,
  },
  dealImg: {
    width: "85%",
    height: "85%",
  },
  dealInfo: {
    flex: 1,
  },
  dealBrand: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
  },
  dealModel: {
    fontSize: 16,
    fontWeight: "800",
    color: tokens.colors.ink,
    marginTop: 1,
  },
  dealSpecs: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
    marginVertical: 4,
  },
  dealGuaranteeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  dealGuaranteeText: {
    fontSize: 10,
    color: tokens.colors.textSecondary,
    fontWeight: "600",
  },
  brandRailSection: {
    marginVertical: 14,
  },
  brandScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  brandPillCard: {
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    minWidth: 96,
    ...tokens.shadow.subtle,
  },
  brandIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  brandPillName: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  brandPillCount: {
    fontSize: 9.5,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  sellBanner: {
    backgroundColor: tokens.colors.ink,
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
    borderWidth: 1,
    borderColor: tokens.colors.accentStrong,
    ...tokens.shadow.card,
  },
  sellBannerContent: {
    flex: 1,
    paddingRight: 10,
  },
  sellBadge: {
    backgroundColor: tokens.colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  sellBadgeText: {
    fontSize: 8.5,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  sellTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  sellSub: {
    fontSize: 11.5,
    color: "#CCCCCC",
    marginTop: 3,
    lineHeight: 16,
  },
  sellBannerRight: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
