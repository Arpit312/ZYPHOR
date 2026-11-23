import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn } from "../../components/UI";

const SAVED_METHODS = [
  { id: "upi_gpay", type: "upi", title: "Google Pay UPI", vpa: "user@okhdfcbank", isDefault: true, icon: "logo-google" },
  { id: "upi_phonepe", type: "upi", title: "PhonePe UPI", vpa: "9876543210@ybl", isDefault: false, icon: "phone-portrait-outline" },
  { id: "card_hdfc", type: "card", title: "HDFC Millennia Credit Card", number: "•••• •••• •••• 4022", exp: "08/29", isDefault: false, icon: "card-outline" },
];

export default function PaymentMethodsScreen({ navigation }) {
  const [methods, setMethods] = useState(SAVED_METHODS);

  const setDefault = (id) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
    Alert.alert("Default Updated", "This payment method will be pre-selected at escrow checkout.");
  };

  const removeMethod = (id) => {
    Alert.alert("Remove Method", "Remove this payment option?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setMethods((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods & Escrow</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Escrow Vault Strip */}
        <View style={styles.escrowVaultStrip}>
          <View style={styles.shieldWrap}>
            <Ionicons name="shield-checkmark" size={22} color={tokens.colors.accentStrong} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.escrowTitle}>256-Bit Escrow Protection</Text>
            <Text style={styles.escrowDesc}>
              ZYPHOR never stores complete card details. All transactions are tokenized and protected by RBI-compliant escrow nodal accounts.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Saved Payment Options</Text>

        <View style={styles.list}>
          {methods.map((m) => (
            <View key={m.id} style={styles.methodCard}>
              <View style={styles.methodTop}>
                <View style={styles.iconWrap}>
                  <Ionicons name={m.icon} size={20} color={tokens.colors.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{m.title}</Text>
                  <Text style={styles.methodSubtitle}>
                    {m.type === "upi" ? m.vpa : `${m.number} • Exp ${m.exp}`}
                  </Text>
                </View>
                {m.isDefault ? (
                  <View style={styles.defaultPill}>
                    <Text style={styles.defaultText}>DEFAULT</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setDefault(m.id)} style={styles.setDefaultBtn}>
                    <Text style={styles.setDefaultText}>Set default</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={13} color={tokens.colors.success} />
                  <Text style={styles.verifiedText}>Verified by NPCI / Banking Gateway</Text>
                </View>
                <TouchableOpacity onPress={() => removeMethod(m.id)}>
                  <Ionicons name="trash-outline" size={16} color={tokens.colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Add New Option</Text>

        <View style={styles.addGrid}>
          <TouchableOpacity
            style={styles.addCard}
            onPress={() => Alert.alert("Add UPI", "Enter UPI VPA to verify via ₹1 authorization.")}
            activeOpacity={0.7}
          >
            <Ionicons name="flash-outline" size={22} color={tokens.colors.accentStrong} />
            <Text style={styles.addCardTitle}>Link UPI ID</Text>
            <Text style={styles.addCardSub}>GPay, PhonePe, Paytm, BHIM</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addCard}
            onPress={() => Alert.alert("Add Card", "Add new Credit or Debit Card with 256-bit tokenization.")}
            activeOpacity={0.7}
          >
            <Ionicons name="card-outline" size={22} color={tokens.colors.accentStrong} />
            <Text style={styles.addCardTitle}>Add New Card</Text>
            <Text style={styles.addCardSub}>Visa, Mastercard, RuPay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
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

  scroll: { padding: 18, paddingBottom: 60 },

  escrowVaultStrip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.accentSoft,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "50",
    marginBottom: 20,
    gap: 12,
  },
  shieldWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  escrowTitle: { fontSize: 13.5, fontWeight: "800", color: tokens.colors.accentStrong },
  escrowDesc: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2, lineHeight: 16 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  list: { gap: 12, marginBottom: 24 },
  methodCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  methodTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  methodTitle: { fontSize: 14, fontWeight: "800", color: tokens.colors.ink },
  methodSubtitle: { fontSize: 11.5, color: tokens.colors.textSecondary, marginTop: 2 },
  defaultPill: {
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultText: { fontSize: 10, fontWeight: "800", color: tokens.colors.accentStrong },
  setDefaultBtn: { padding: 4 },
  setDefaultText: { fontSize: 11.5, fontWeight: "700", color: tokens.colors.accentStrong },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
  },
  verifiedRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  verifiedText: { fontSize: 10.5, color: tokens.colors.textSecondary, fontWeight: "600" },

  addGrid: { flexDirection: "row", gap: 12 },
  addCard: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
    ...tokens.shadow.card,
  },
  addCardTitle: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink, marginTop: 8 },
  addCardSub: { fontSize: 10, color: tokens.colors.textMuted, marginTop: 3, textAlign: "center" },
});
