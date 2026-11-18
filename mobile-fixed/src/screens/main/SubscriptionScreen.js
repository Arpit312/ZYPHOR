import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Btn } from "../../components/UI";
import { subAPI } from "../../api/api";

const PLANS = {
  basic: {
    label: "Merchant Starter",
    monthly: 299,
    yearly: 2990,
    features: ["10 active device listings", "50 AI diagnostics/mo", "Basic storefront profile", "Email support"],
  },
  pro: {
    label: "Professional",
    monthly: 799,
    yearly: 7990,
    features: ["50 active listings", "200 AI diagnostics/mo", "Priority search ranking", "KYC merchant verification badge", "Dedicated support"],
    popular: true,
  },
  enterprise: {
    label: "Wholesale Enterprise",
    monthly: 1999,
    yearly: 19990,
    features: ["Unlimited listings", "Unlimited AI valuation & diagnostics", "Dedicated account manager", "API & ERP bulk upload sync"],
  },
};

export default function SubscriptionScreen({ navigation }) {
  const [cycle, setCycle] = useState("monthly");
  const [loading, setLoading] = useState(null);

  const subscribe = async (plan) => {
    setLoading(plan);
    try {
      const r = await subAPI.subscribe({ plan, billingCycle: cycle });
      Alert.alert("🎉 Plan Activated", r.data.message || "Your merchant subscription is now active.", [
        { text: "Go to Dashboard", onPress: () => navigation.navigate("Account") },
      ]);
    } catch (e) {
      Alert.alert("Error", e.response?.data?.error || "Subscription failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={T.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Merchant Plans</Text>
        <Text style={styles.sub}>Retailers & wholesalers require a merchant plan to list inventory</Text>

        <View style={styles.freePill}>
          <Ionicons name="checkmark-circle-outline" size={14} color={T.green} />
          <Text style={styles.freeText}>Customers always browse & purchase FREE</Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Billing Cycle Selector */}
        <View style={styles.cyclePicker}>
          {["monthly", "yearly"].map((c) => {
            const active = cycle === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCycle(c)}
                style={[styles.cycleBtn, active && styles.cycleBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.cycleTxt, active && styles.cycleTxtActive]}>
                  {c === "monthly" ? "Monthly Billing" : "Annual Billing (Save 17%)"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Plans */}
        {Object.entries(PLANS).map(([key, plan]) => (
          <View key={key} style={[styles.planCard, plan.popular && styles.planCardPopular]}>
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularTxt}>RECOMMENDED</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>{plan.label}</Text>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginTop: 4 }}>
                  <Text style={styles.planPrice}>₹{plan[cycle].toLocaleString("en-IN")}</Text>
                  <Text style={styles.planCycle}>/{cycle === "yearly" ? "yr" : "mo"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.featureList}>
              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={14} color={T.primary} />
                  <Text style={styles.featureTxt}>{f}</Text>
                </View>
              ))}
            </View>

            <Btn
              title={loading === key ? "Activating..." : `Activate ${plan.label} →`}
              onPress={() => subscribe(key)}
              loading={loading === key}
              style={{ marginTop: 14 }}
              variant={plan.popular ? "primary" : "secondary"}
            />
          </View>
        ))}

        <View style={styles.feeInfo}>
          <Ionicons name="information-circle-outline" size={16} color={T.text.secondary} />
          <Text style={styles.feeInfoText}>
            Transparent 3% escrow marketplace commission upon successful sale. Official tax invoice with GST breakdown provided for all business subscriptions.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: T.text.secondary, marginTop: 4, lineHeight: 18 },
  freePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 12,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  freeText: { fontSize: 11, fontWeight: "600", color: T.text.secondary },

  body: { padding: 20, paddingBottom: 60 },

  cyclePicker: {
    flexDirection: "row",
    backgroundColor: T.bg.secondary,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  cycleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
  cycleBtnActive: { backgroundColor: "#FFFFFF", ...T.shadow.sm },
  cycleTxt: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  cycleTxtActive: { color: T.text.primary, fontWeight: "700" },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: T.border.color,
    position: "relative",
    ...T.shadow.card,
  },
  planCardPopular: { borderColor: T.primary },
  popularBadge: {
    position: "absolute",
    top: 14,
    right: 16,
    backgroundColor: T.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  popularTxt: { fontSize: 9, fontWeight: "800", color: "#FFFFFF", letterSpacing: 0.5 },

  planHeader: { marginBottom: 14 },
  planName: { fontSize: 16, fontWeight: "800", color: T.text.primary },
  planPrice: { fontSize: 26, fontWeight: "900", color: T.text.primary },
  planCycle: { fontSize: 12, color: T.text.secondary },

  featureList: { gap: 8, marginVertical: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureTxt: { fontSize: 13, color: T.text.secondary, flex: 1 },

  feeInfo: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: T.bg.secondary,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  feeInfoText: { fontSize: 11, color: T.text.secondary, lineHeight: 16, flex: 1 },
});
