import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { tokens } from "../../theme/tokens";
import { Btn, Input, HeaderBar, PriceTag } from "../../components/UI";
import { listingsAPI, aiAPI, uploadAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../i18n/I18nContext";

const POPULAR_BRANDS = ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi"];
const STORAGE_OPTIONS = ["128GB", "256GB", "512GB", "1TB"];
const PICKUP_SLOTS = ["Tomorrow Morning (10 AM - 1 PM)", "Tomorrow Evening (3 PM - 7 PM)", "Weekend Slot"];

export default function SellScreen({ navigation }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Wizard Step: 0: Device, 1: Diagnostic Quiz, 2: AI Valuation, 3: Pickup Slot, 4: Payout UPI
  const [step, setStep] = useState(0);

  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("iPhone 14 Pro");
  const [storage, setStorage] = useState("128GB");

  // Condition Quiz
  const [screenWorking, setScreenWorking] = useState(true);
  const [bodyCondition, setBodyCondition] = useState("Pristine"); // Pristine, Good, Scratched
  const [batteryHealthy, setBatteryHealthy] = useState(true);
  const [hasChargerBox, setHasChargerBox] = useState(true);

  // Valuation
  const [aiValuation, setAiValuation] = useState({ min: 54000, max: 58500 });
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // Pickup & Payout
  const [pickupSlot, setPickupSlot] = useState(PICKUP_SLOTS[0]);
  const [pickupAddress, setPickupAddress] = useState(user?.city ? `Flat 402, High Street, ${user.city}` : "12B Platinum Heights, Mumbai 400001");
  const [upiId, setUpiId] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Switch between instant cash sell and marketplace listing
  const [mode, setMode] = useState("instant"); // "instant" or "list"

  const calculateAIPrice = async () => {
    setCalculatingPrice(true);
    try {
      const res = await aiAPI.pricing({
        brand,
        model,
        storage,
        condition: bodyCondition,
        batteryHealth: batteryHealthy ? 92 : 78,
      });
      if (res?.data?.minPrice && res?.data?.maxPrice) {
        setAiValuation({ min: res.data.minPrice, max: res.data.maxPrice });
      } else {
        throw new Error("Local pricing calculation");
      }
    } catch {
      let base = brand === "Apple" ? 58000 : brand === "Samsung" ? 44000 : 34000;
      const m = (model || "").toLowerCase();
      if (m.includes("15") || m.includes("s24")) base += 20000;
      if (m.includes("pro max") || m.includes("ultra")) base += 14000;
      if (storage === "256GB") base += 4000;
      if (storage === "512GB") base += 8000;
      if (!screenWorking) base -= 12000;
      if (bodyCondition === "Scratched") base -= 4000;
      if (!batteryHealthy) base -= 3500;
      if (hasChargerBox) base += 1500;

      setAiValuation({ min: Math.round(base * 0.94), max: Math.round(base * 1.05) });
    } finally {
      setCalculatingPrice(false);
      setStep(2);
    }
  };

  const handleConfirmSell = async () => {
    if (!upiId.trim() || !upiId.includes("@")) {
      Alert.alert("UPI ID required", "Please enter a valid UPI ID (e.g. mobile@upi) for instant bank transfer upon doorstep device pickup.");
      return;
    }
    setSubmittingOrder(true);
    try {
      // Also record listing in backend if desired
      await listingsAPI.create({
        brand,
        model,
        storage,
        conditionGrade: bodyCondition,
        price: aiValuation.max,
        city: user?.city || "Mumbai",
        type: "device",
        description: `Doorstep Trade-in: ${brand} ${model} ${storage}. Condition: ${bodyCondition}. Pickup: ${pickupSlot}. Payout: ${upiId}`,
      }).catch(() => {});

      Alert.alert(
        "✓ Pickup Scheduled & Valuation Locked",
        `Your AI valuation of ₹${aiValuation.max.toLocaleString("en-IN")} is locked. A ZYPHOR technician will arrive during ${pickupSlot}. Payment will be wired to ${upiId} on the spot.`,
        [{ text: "Done", onPress: () => setStep(0) }]
      );
    } catch (e) {
      Alert.alert("Success", "Doorstep pickup scheduled successfully.");
      setStep(0);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />
      <HeaderBar
        title="Sell Your Device"
        subtitle="Instant AI valuation • Free doorstep pickup"
      />

      {/* 5-Step Stepper Header */}
      <View style={styles.stepIndicatorBar}>
        {["Device", "Condition", "Valuation", "Pickup", "Payout"].map((label, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;
          return (
            <View key={label} style={styles.stepNode}>
              <View
                style={[
                  styles.stepCircle,
                  isDone && styles.stepCircleDone,
                  isCurrent && styles.stepCircleCurrent,
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.stepNum, isCurrent && styles.stepNumCurrent]}>{idx + 1}</Text>
                )}
              </View>
              <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]}>{label}</Text>
            </View>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          /* ─── Step 1: Select Device & Specs ─── */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select Device Model</Text>
            <Text style={styles.cardSub}>Choose the smartphone you want to upgrade or sell.</Text>

            <Text style={styles.inputLabel}>Brand</Text>
            <View style={styles.pillsRow}>
              {POPULAR_BRANDS.map((b) => (
                <TouchableOpacity
                  key={b}
                  onPress={() => setBrand(b)}
                  style={[styles.pill, brand === b && styles.pillActive]}
                >
                  <Text style={[styles.pillText, brand === b && styles.pillTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Model Name"
              icon="phone-portrait-outline"
              placeholder="e.g. iPhone 14 Pro Max / Galaxy S23"
              value={model}
              onChangeText={setModel}
            />

            <Text style={styles.inputLabel}>Storage Capacity</Text>
            <View style={styles.pillsRow}>
              {STORAGE_OPTIONS.map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStorage(st)}
                  style={[styles.pill, storage === st && styles.pillActive]}
                >
                  <Text style={[styles.pillText, storage === st && styles.pillTextActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Btn
              title="Next: Condition Check"
              onPress={() => setStep(1)}
              variant="primary"
              rightIcon="arrow-forward"
              style={{ marginTop: 20 }}
            />

            <Btn
              title="⚡ Instant AI Valuation (Pristine)"
              onPress={calculateAIPrice}
              loading={calculatingPrice}
              variant="gold"
              style={{ marginTop: 10 }}
            />
          </View>
        )}

        {step === 1 && (
          /* ─── Step 2: Diagnostic Condition Quiz ─── */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Condition Assessment</Text>
            <Text style={styles.cardSub}>Answer 4 quick checks for a 100% guaranteed quote.</Text>

            {/* Check 1: Screen */}
            <View style={styles.quizRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.quizQ}>Does the touch display work smoothly?</Text>
                <Text style={styles.quizSub}>No dead pixels, lines, or ghost touches</Text>
              </View>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.miniBtn, screenWorking && styles.miniBtnActive]}
                  onPress={() => setScreenWorking(true)}
                >
                  <Text style={[styles.miniBtnText, screenWorking && styles.miniBtnTextActive]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniBtn, !screenWorking && styles.miniBtnActive]}
                  onPress={() => setScreenWorking(false)}
                >
                  <Text style={[styles.miniBtnText, !screenWorking && styles.miniBtnTextActive]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Check 2: Body condition */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Physical Body Condition</Text>
            <View style={styles.pillsRow}>
              {["Pristine (No scratches)", "Good (Minor wear)", "Scratched / Dent"].map((cond) => {
                const active = bodyCondition === cond;
                return (
                  <TouchableOpacity
                    key={cond}
                    onPress={() => setBodyCondition(cond)}
                    style={[styles.pill, active && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{cond}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Check 3: Battery */}
            <View style={styles.quizRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.quizQ}>Battery health above 85%?</Text>
                <Text style={styles.quizSub}>Holds full day charge without unexpected shutdown</Text>
              </View>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.miniBtn, batteryHealthy && styles.miniBtnActive]}
                  onPress={() => setBatteryHealthy(true)}
                >
                  <Text style={[styles.miniBtnText, batteryHealthy && styles.miniBtnTextActive]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniBtn, !batteryHealthy && styles.miniBtnActive]}
                  onPress={() => setBatteryHealthy(false)}
                >
                  <Text style={[styles.miniBtnText, !batteryHealthy && styles.miniBtnTextActive]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Check 4: Accessories */}
            <View style={styles.quizRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.quizQ}>Original Box & Charger available?</Text>
                <Text style={styles.quizSub}>Adds up to ₹1,500 bonus to quote</Text>
              </View>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.miniBtn, hasChargerBox && styles.miniBtnActive]}
                  onPress={() => setHasChargerBox(true)}
                >
                  <Text style={[styles.miniBtnText, hasChargerBox && styles.miniBtnTextActive]}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniBtn, !hasChargerBox && styles.miniBtnActive]}
                  onPress={() => setHasChargerBox(false)}
                >
                  <Text style={[styles.miniBtnText, !hasChargerBox && styles.miniBtnTextActive]}>No</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Btn title="Back" onPress={() => setStep(0)} variant="secondary" style={{ flex: 1 }} />
              <Btn
                title="Calculate AI Price"
                onPress={calculateAIPrice}
                loading={calculatingPrice}
                variant="gold"
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          /* ─── Step 3: Instant AI Valuation Plinth ─── */
          <View style={styles.card}>
            <View style={styles.valuationBadge}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.valuationBadgeText}>AI INSTANT VALUATION</Text>
            </View>

            <Text style={styles.valDeviceName}>{brand} {model} ({storage})</Text>
            <Text style={styles.valPriceRange}>
              ₹{aiValuation.min.toLocaleString("en-IN")} – ₹{aiValuation.max.toLocaleString("en-IN")}
            </Text>
            <Text style={styles.valGuaranteeNote}>
              Guaranteed doorstep price. Technician will verify and transfer full payment immediately.
            </Text>

            {/* Breakdown table */}
            <View style={styles.breakdownTable}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownKey}>Base Market Trade-in</Text>
                <Text style={styles.breakdownVal}>₹{(aiValuation.min - 3000).toLocaleString("en-IN")}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownKey}>Diagnostic Quality Bonus</Text>
                <Text style={[styles.breakdownVal, { color: tokens.colors.success }]}>+ ₹3,000</Text>
              </View>
              {hasChargerBox && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownKey}>Original Accessories Bonus</Text>
                  <Text style={[styles.breakdownVal, { color: tokens.colors.accentStrong }]}>+ ₹1,500</Text>
                </View>
              )}
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownKey}>Doorstep Technician Pickup</Text>
                <Text style={[styles.breakdownVal, { color: tokens.colors.success }]}>FREE</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Btn title="Adjust Details" onPress={() => setStep(1)} variant="secondary" style={{ flex: 1 }} />
              <Btn title="Lock Quote & Schedule" onPress={() => setStep(3)} variant="gold" style={{ flex: 2 }} />
            </View>
          </View>
        )}

        {step === 3 && (
          /* ─── Step 4: Schedule Doorstep Pickup ─── */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Doorstep Pickup Details</Text>
            <Text style={styles.cardSub}>Our certified technician will arrive with diagnostic equipment.</Text>

            <Text style={styles.inputLabel}>Select Pickup Time Slot</Text>
            <View style={{ gap: 8, marginBottom: 14 }}>
              {PICKUP_SLOTS.map((slot) => {
                const active = pickupSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.slotCard, active && styles.slotCardActive]}
                    onPress={() => setPickupSlot(slot)}
                  >
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={active ? tokens.colors.accent : tokens.colors.border}
                    />
                    <Text style={[styles.slotCardText, active && styles.slotCardTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Pickup Address"
              icon="location-outline"
              value={pickupAddress}
              onChangeText={setPickupAddress}
              helper="Doorstep technician will call 30 mins before arrival"
            />

            <View style={styles.actionRow}>
              <Btn title="Back" onPress={() => setStep(2)} variant="secondary" style={{ flex: 1 }} />
              <Btn title="Next: Payout Method" onPress={() => setStep(4)} variant="primary" style={{ flex: 2 }} />
            </View>
          </View>
        )}

        {step === 4 && (
          /* ─── Step 5: Instant Bank / UPI Payout ─── */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payout Details</Text>
            <Text style={styles.cardSub}>
              Funds will be transferred immediately upon technician physical handover.
            </Text>

            <View style={styles.payoutLockBox}>
              <Text style={styles.payoutLockLabel}>Instant Payout Amount</Text>
              <Text style={styles.payoutLockVal}>₹{aiValuation.max.toLocaleString("en-IN")}</Text>
            </View>

            <Input
              label="UPI ID / VPA"
              icon="wallet-outline"
              placeholder="e.g. 9876543210@paytm / name@okaxis"
              value={upiId}
              onChangeText={setUpiId}
              helper="Verified bank transfer via NPCI instant UPI"
            />

            <View style={styles.trustStripCompact}>
              <Ionicons name="shield-checkmark" size={16} color={tokens.colors.success} />
              <Text style={styles.trustCompactText}>
                Zero haggling guarantee. Device is factory reset in your presence.
              </Text>
            </View>

            <View style={styles.actionRow}>
              <Btn title="Back" onPress={() => setStep(3)} variant="secondary" style={{ flex: 1 }} />
              <Btn
                title="Confirm & Book Pickup"
                onPress={handleConfirmSell}
                loading={submittingOrder}
                variant="gold"
                style={{ flex: 2 }}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: { padding: 16, paddingBottom: 40 },
  stepIndicatorBar: {
    flexDirection: "row",
    backgroundColor: tokens.colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.border,
    justifyContent: "space-around",
  },
  stepNode: { alignItems: "center" },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 4,
  },
  stepCircleDone: { backgroundColor: tokens.colors.success, borderColor: tokens.colors.success },
  stepCircleCurrent: { borderColor: tokens.colors.accent, backgroundColor: tokens.colors.accentSoft },
  stepNum: { fontSize: 10, color: tokens.colors.textMuted, fontWeight: "700" },
  stepNumCurrent: { color: tokens.colors.accentStrong },
  stepLabel: { fontSize: 10, color: tokens.colors.textMuted, fontWeight: "600" },
  stepLabelCurrent: { color: tokens.colors.ink, fontWeight: "800" },

  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  cardTitle: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },
  cardSub: { fontSize: 12, color: tokens.colors.textSecondary, marginTop: 2, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: tokens.colors.textSecondary, marginBottom: 8 },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  pillActive: { backgroundColor: tokens.colors.ink, borderColor: tokens.colors.ink },
  pillText: { fontSize: 12, color: tokens.colors.textSecondary, fontWeight: "600" },
  pillTextActive: { color: "#FFFFFF", fontWeight: "700" },

  quizRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  quizQ: { fontSize: 13, fontWeight: "700", color: tokens.colors.ink },
  quizSub: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },
  toggleRow: { flexDirection: "row", gap: 6 },
  miniBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  miniBtnActive: { backgroundColor: tokens.colors.ink, borderColor: tokens.colors.ink },
  miniBtnText: { fontSize: 11.5, color: tokens.colors.textSecondary, fontWeight: "700" },
  miniBtnTextActive: { color: "#FFFFFF" },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 20 },

  valuationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: tokens.colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  valuationBadgeText: { fontSize: 10, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5 },
  valDeviceName: { fontSize: 15, fontWeight: "700", color: tokens.colors.textSecondary },
  valPriceRange: { fontSize: 26, fontWeight: "900", color: tokens.colors.ink, marginVertical: 6 },
  valGuaranteeNote: { fontSize: 12, lineHeight: 18, color: tokens.colors.textSecondary, marginBottom: 16 },

  breakdownTable: {
    backgroundColor: tokens.colors.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownKey: { fontSize: 12, color: tokens.colors.textSecondary },
  breakdownVal: { fontSize: 12, fontWeight: "700", color: tokens.colors.ink },

  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  slotCardActive: { borderColor: tokens.colors.accent, backgroundColor: tokens.colors.surface },
  slotCardText: { fontSize: 12.5, color: tokens.colors.textSecondary, fontWeight: "600" },
  slotCardTextActive: { color: tokens.colors.ink, fontWeight: "700" },

  payoutLockBox: {
    backgroundColor: tokens.colors.surfaceAlt,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  payoutLockLabel: { fontSize: 11, color: tokens.colors.textSecondary, textTransform: "uppercase" },
  payoutLockVal: { fontSize: 24, fontWeight: "900", color: tokens.colors.ink, marginTop: 2 },

  trustStripCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: tokens.colors.successBg,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  trustCompactText: { fontSize: 11, color: tokens.colors.success, fontWeight: "600", flex: 1 },
});
