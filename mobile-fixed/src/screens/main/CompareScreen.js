import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Empty, Btn } from "../../components/UI";
import { useCompare, MAX_COMPARE } from "../../context/CompareContext";

const { width: W } = Dimensions.get("window");
const COL_W = Math.min(170, (W - 56) / 2);

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// [label, value-getter]
const ROWS = [
  ["Price", (i) => inr(i.price)],
  ["Original Price", (i) => (i.originalPrice ? inr(i.originalPrice) : "—")],
  ["Brand", (i) => i.brand || "—"],
  ["Model", (i) => i.model || "—"],
  ["Storage", (i) => i.storage || "—"],
  ["RAM", (i) => i.ram || "—"],
  ["Condition", (i) => i.conditionGrade || "—"],
  ["Trust Score", (i) => (i.verification?.trustScore != null ? `${i.verification.trustScore}/100` : "—")],
  ["Category", (i) => i.category || i.partCategory || "—"],
  ["City", (i) => i.city || "—"],
  ["Seller", (i) => i.seller?.businessName || i.seller?.name || (typeof i.seller === "string" ? "Seller" : "—")],
  ["Listed", (i) => (i.createdAt ? new Date(i.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—")],
];

export default function CompareScreen({ navigation }) {
  const { items, remove, clear, max } = useCompare();

  const confirmClear = () =>
    Alert.alert("Clear compare", `Remove all ${items.length} devices from comparison?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: clear },
    ]);

  if (items.length === 0) {
    return (
      <View style={styles.root}>
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
          <Empty
            icon="git-compare-outline"
            title="Nothing to compare yet"
            sub={`Add up to ${max} devices from the listing detail page using the compare icon, then compare them side by side here.`}
            action={() => navigation.navigate("Browse")}
            actionLabel="Browse Marketplace"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.subHeader}>
        <Text style={styles.countText}>
          {items.length}/{max} devices selected
        </Text>
        <TouchableOpacity onPress={confirmClear} activeOpacity={0.7}>
          <Text style={styles.clearText}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}>
        {/* Label column */}
        <View style={{ width: 92, paddingTop: 190 }}>
          {ROWS.map(([label]) => (
            <Text key={label} style={styles.rowLabel} numberOfLines={2}>{label}</Text>
          ))}
        </View>

        {/* Device columns */}
        {items.map((item) => {
          const id = String(item._id || item.id);
          return (
            <View key={id} style={[styles.col, { width: COL_W }]}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation.navigate("ListingDetail", { id: item._id || item.id })}
              >
                <View style={styles.imgWrap}>
                  {item.images?.[0] ? (
                    <Image source={{ uri: item.images[0] }} style={styles.img} resizeMode="contain" />
                  ) : (
                    <Ionicons name="phone-portrait-outline" size={34} color={T.text.muted} />
                  )}
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => remove(id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={22} color={T.red} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.colTitle} numberOfLines={2}>
                  {item.brand} {item.model}
                </Text>
              </TouchableOpacity>
              {ROWS.map(([label, get]) => (
                <Text
                  key={label}
                  style={[
                    styles.rowValue,
                    label === "Price" && { fontWeight: "900", color: T.text.primary, fontSize: 14 },
                  ]}
                  numberOfLines={2}
                >
                  {get(item)}
                </Text>
              ))}
              <Btn
                title="View Listing"
                small
                variant="outline"
                icon="eye-outline"
                style={{ marginTop: 8 }}
                onPress={() => navigation.navigate("ListingDetail", { id: item._id || item.id })}
              />
            </View>
          );
        })}

        {/* Empty slots hint */}
        {items.length < max && (
          <TouchableOpacity
            style={[styles.col, styles.emptySlot, { width: COL_W }]}
            onPress={() => navigation.navigate("Browse")}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={34} color={T.text.muted} />
            <Text style={styles.emptySlotText}>Add another device</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  subHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: T.border.color,
  },
  countText: { fontSize: 13, color: T.text.secondary, fontWeight: "600" },
  clearText: { fontSize: 13, fontWeight: "700", color: T.red },
  col: { marginRight: 14 },
  imgWrap: {
    height: 150, borderRadius: 16, backgroundColor: T.bg.secondary,
    borderWidth: 1, borderColor: T.border.color,
    alignItems: "center", justifyContent: "center", padding: 10,
    position: "relative", marginBottom: 8,
  },
  img: { width: "100%", height: "100%" },
  removeBtn: { position: "absolute", top: 6, right: 6, backgroundColor: "#FFFFFF", borderRadius: 11 },
  colTitle: { fontSize: 13, fontWeight: "800", color: T.text.primary, minHeight: 34, marginBottom: 6 },
  rowLabel: {
    height: 34, fontSize: 11, fontWeight: "600", color: T.text.secondary,
    textAlign: "right", paddingRight: 10, marginBottom: 8,
  },
  rowValue: {
    minHeight: 34, fontSize: 12, color: T.text.primary, marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: T.border.light, paddingBottom: 4,
  },
  emptySlot: {
    height: 150, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed",
    borderColor: T.border.color, alignItems: "center", justifyContent: "center", gap: 6,
  },
  emptySlotText: { fontSize: 11, color: T.text.secondary, fontWeight: "600", textAlign: "center" },
});
