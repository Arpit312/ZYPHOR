import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn, Input } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

export default function MerchantKYCScreen({ navigation }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessName: user?.businessName || "",
    panNumber: "",
    gstNumber: user?.gstNumber || "",
    bankAccount: "",
    ifscCode: "",
    accountHolder: user?.name || "",
  });
  const [loading, setLoading] = useState(false);
  const [kycStatus, setKycStatus] = useState("VERIFIED"); // DEMO VERIFIED

  const handleSubmit = () => {
    if (!form.panNumber.trim() || !form.bankAccount.trim() || !form.ifscCode.trim()) {
      Alert.alert("Missing Fields", "Please provide PAN, Bank Account Number, and IFSC code.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setKycStatus("SUBMITTED");
      Alert.alert(
        "✓ KYC Submitted",
        "Your business credentials and bank details have been submitted for verification. Payouts will be enabled once approved.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 900);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Merchant KYC & Bank Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Compliance & RBI Escrow Notice */}
        <View style={styles.complianceCard}>
          <View style={styles.shieldWrap}>
            <Ionicons name="shield-checkmark" size={22} color={tokens.colors.accentStrong} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.compTitle}>Statutory Merchant Compliance</Text>
            <Text style={styles.compDesc}>
              In accordance with Indian tax regulations (TDS u/s 194-O) and RBI Escrow guidelines, verified KYC is mandatory for automated bank payouts.
            </Text>
          </View>
        </View>

        {/* Verification Status Pill */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current Verification Status</Text>
          <View style={styles.statusPillRow}>
            <Ionicons
              name={kycStatus === "VERIFIED" ? "checkmark-circle" : "time-outline"}
              size={18}
              color={kycStatus === "VERIFIED" ? tokens.colors.success : tokens.colors.warning}
            />
            <Text
              style={[
                styles.statusText,
                { color: kycStatus === "VERIFIED" ? tokens.colors.success : tokens.colors.warning },
              ]}
            >
              {kycStatus === "VERIFIED" ? "PRO MERCHANT • KYC ACTIVE" : "UNDER VERIFICATION"}
            </Text>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeader}>Business & Tax Credentials</Text>

          <Input
            label="Business Legal Name"
            placeholder="Apex Telecom Solutions LLP"
            value={form.businessName}
            onChangeText={(v) => setForm((p) => ({ ...p, businessName: v }))}
          />
          <Input
            label="Business PAN Number *"
            placeholder="ABCDE1234F"
            autoCapitalize="characters"
            maxLength={10}
            value={form.panNumber}
            onChangeText={(v) => setForm((p) => ({ ...p, panNumber: v }))}
          />
          <Input
            label="GSTIN (Optional for small sellers)"
            placeholder="27ABCDE1234F1Z5"
            autoCapitalize="characters"
            maxLength={15}
            value={form.gstNumber}
            onChangeText={(v) => setForm((p) => ({ ...p, gstNumber: v }))}
          />

          <View style={styles.divider} />
          <Text style={styles.sectionHeader}>Direct Nodal Bank Payouts</Text>

          <Input
            label="Account Holder Name"
            placeholder="Rahul Sharma"
            value={form.accountHolder}
            onChangeText={(v) => setForm((p) => ({ ...p, accountHolder: v }))}
          />
          <Input
            label="Bank Account Number *"
            placeholder="50100294829104"
            keyboardType="number-pad"
            value={form.bankAccount}
            onChangeText={(v) => setForm((p) => ({ ...p, bankAccount: v }))}
          />
          <Input
            label="Bank IFSC Code *"
            placeholder="HDFC0000123"
            autoCapitalize="characters"
            maxLength={11}
            value={form.ifscCode}
            onChangeText={(v) => setForm((p) => ({ ...p, ifscCode: v }))}
          />

          <Btn
            title={loading ? "Verifying with NSDL / NPCI..." : "Submit for Instant Verification"}
            onPress={handleSubmit}
            loading={loading}
            variant="gold"
            style={{ marginTop: 14 }}
          />
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

  complianceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.accentSoft,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "50",
    marginBottom: 16,
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
  compTitle: { fontSize: 13, fontWeight: "800", color: tokens.colors.accentStrong },
  compDesc: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2, lineHeight: 16 },

  statusCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 16,
    ...tokens.shadow.card,
  },
  statusLabel: { fontSize: 11, fontWeight: "700", color: tokens.colors.textSecondary, marginBottom: 6 },
  statusPillRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusText: { fontSize: 13, fontWeight: "900", letterSpacing: 0.5 },

  formCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
    marginVertical: 14,
  },
});
