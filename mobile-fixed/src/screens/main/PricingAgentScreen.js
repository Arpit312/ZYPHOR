import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Btn, Input } from "../../components/UI";
import { aiAPI } from "../../api/api";

const CONDITIONS = ["Pristine", "Good", "Fair"];
const BRANDS = ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Realme", "Vivo"];

export default function PricingAgentScreen() {
  const [form, setForm] = useState({
    brand: "Apple",
    model: "iPhone 14",
    storage: "128GB",
    ram: "6GB",
    condition: "Pristine",
    batteryHealth: 88,
    city: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const getPrice = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const r = await aiAPI.pricing(form);
      setResult(r.data);
    } catch (err) {
      // No fake fallback — show the real error (quota reached / AI not configured / network).
      const msg = err.response?.data?.error || "AI pricing is unavailable right now. Check your connection and try again.";
      setError(err.response?.data?.limitReached ? `${msg}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Ionicons name="pricetag-outline" size={30} color={T.primary} />
          </View>
          <Text style={styles.title}>AI Price Valuation</Text>
          <Text style={styles.sub}>Calculate algorithmic market value based on live resale sales</Text>
        </View>

        <View style={styles.body}>
          {/* Brand selection */}
          <Text style={styles.label}>Device Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {BRANDS.map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => set("brand")(b)}
                style={[styles.chip, form.brand === b && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.brand === b && styles.chipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Model Name *"
            placeholder="e.g. iPhone 14 Pro, Galaxy S23"
            value={form.model}
            onChangeText={set("model")}
            icon="hardware-chip-outline"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input label="Storage" placeholder="128GB" value={form.storage} onChangeText={set("storage")} />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="RAM" placeholder="8GB" value={form.ram} onChangeText={set("ram")} />
            </View>
          </View>

          <Text style={styles.label}>Condition Grade</Text>
          <View style={styles.condRow}>
            {CONDITIONS.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => set("condition")(c)}
                style={[styles.condBtn, form.condition === c && styles.condBtnActive]}
              >
                <Text style={[styles.condText, form.condition === c && styles.condTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            Battery Health: <Text style={{ color: T.text.primary, fontWeight: "800" }}>{form.batteryHealth}%</Text>
          </Text>
          <View style={styles.sliderRow}>
            {[60, 70, 80, 85, 90, 95, 100].map((v) => (
              <TouchableOpacity
                key={v}
                onPress={() => set("batteryHealth")(v)}
                style={[styles.sliderDot, form.batteryHealth === v && styles.sliderDotActive]}
              >
                <Text style={[styles.sliderText, form.batteryHealth === v && styles.sliderTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Btn
            title={loading ? "Analyzing Indian Market Sales..." : "Calculate Fair Resale Value →"}
            onPress={getPrice}
            loading={loading}
            style={{ marginVertical: 14 }}
          />

          {error && !result && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={22} color={T.red} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={getPrice} style={styles.errorRetry} activeOpacity={0.8}>
                <Text style={styles.errorRetryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {result && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>Benchmark Valuation</Text>

              <View style={styles.priceGrid}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxLabel}>Minimum</Text>
                  <Text style={styles.priceBoxVal}>₹{result.minPrice?.toLocaleString()}</Text>
                </View>
                <View style={[styles.priceBox, styles.priceBoxFeatured]}>
                  <Text style={[styles.priceBoxLabel, { color: T.primary, fontWeight: "700" }]}>Recommended</Text>
                  <Text style={[styles.priceBoxVal, { color: T.primary, fontSize: 22 }]}>
                    ₹{result.recommendedPrice?.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxLabel}>Maximum</Text>
                  <Text style={styles.priceBoxVal}>₹{result.maxPrice?.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.quickSaleBox}>
                <Ionicons name="flash-outline" size={15} color={T.primary} />
                <Text style={styles.quickSaleText}>
                  Quick Liquidation Target:{" "}
                  <Text style={{ fontWeight: "800", color: T.text.primary }}>₹{result.quickSalePrice?.toLocaleString()}</Text>
                </Text>
              </View>

              {result.factors?.map((f, i) => (
                <View key={i} style={styles.factorRow}>
                  <Ionicons name="checkmark-circle-outline" size={14} color={T.primary} />
                  <Text style={styles.factorText}>{f}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    padding: 24,
    paddingTop: 54,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  title: { fontSize: 26, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: T.text.secondary, textAlign: "center", marginTop: 4, lineHeight: 18 },

  body: { padding: 20, paddingBottom: 60 },
  label: { fontSize: 13, fontWeight: "700", color: T.text.secondary, marginBottom: 8 },

  chipsScroll: { gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  chipActive: { backgroundColor: T.primary, borderColor: T.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  chipTextActive: { color: "#FFFFFF" },

  condRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  condBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  condBtnActive: { backgroundColor: T.primary, borderColor: T.primary },
  condText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  condTextActive: { color: "#FFFFFF" },

  sliderRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  sliderDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  sliderDotActive: { backgroundColor: T.primary, borderColor: T.primary },
  sliderText: { fontSize: 11, fontWeight: "600", color: T.text.secondary },
  sliderTextActive: { color: "#FFFFFF", fontWeight: "800" },

  resultCard: {
    backgroundColor: T.bg.secondary,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: T.border.color,
    marginTop: 10,
  },
  resultTitle: { fontSize: 15, fontWeight: "800", color: T.text.primary, marginBottom: 12 },

  priceGrid: { flexDirection: "row", gap: 8, marginBottom: 14 },
  priceBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  priceBoxFeatured: { borderColor: T.primary, borderWidth: 1.5 },
  priceBoxLabel: { fontSize: 10, color: T.text.secondary, textTransform: "uppercase" },
  priceBoxVal: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginTop: 4 },

  quickSaleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  quickSaleText: { fontSize: 12, color: T.text.secondary },

  factorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  factorText: { fontSize: 12, color: T.text.secondary },

  errorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: T.red,
    marginTop: 10,
    alignItems: "center",
    gap: 10,
  },
  errorText: { fontSize: 13, color: T.text.secondary, textAlign: "center", lineHeight: 18 },
  errorRetry: { backgroundColor: T.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 22 },
  errorRetryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
});
