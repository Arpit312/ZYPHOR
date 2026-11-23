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
import { Btn, Input } from "../../components/UI";

const COUPONS = [
  { code: "ZYPHORFIRST", discount: "Flat ₹1,000 OFF", desc: "Valid on your first certified smartphone purchase above ₹15,000", min: "₹15,000", validTill: "30 Nov 2026" },
  { code: "APPLEVAULT", discount: "5% Extra Discount", desc: "Applicable on all certified iPhone 14 & 15 models up to ₹2,500", min: "₹30,000", validTill: "15 Dec 2026" },
  { code: "ESCROWSAFE", discount: "Free Insured Express Delivery", desc: "Complimentary zero-fee doorstep air express delivery", min: "₹0", validTill: "Ongoing" },
];

const BANK_OFFERS = [
  { bank: "HDFC Bank Credit Cards", offer: "₹2,000 Instant Discount on 6M/12M No-Cost EMI", icon: "card-outline" },
  { bank: "ICICI Bank Net Banking", offer: "Flat ₹750 Cashback credited within 48h escrow window", icon: "business-outline" },
  { bank: "OneCard & Federal Bank", offer: "Instant 10% instant off up to ₹1,500 on checkout", icon: "flash-outline" },
];

export default function OffersScreen({ navigation }) {
  const [promoCode, setPromoCode] = useState("");
  const [applied, setApplied] = useState(null);

  const applyCode = (code) => {
    setApplied(code);
    Alert.alert("✓ Coupon Applied", `Promo code "${code}" has been attached to your checkout session.`);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers, Coupons & EMI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Promo Code Input Card */}
        <View style={styles.inputCard}>
          <Text style={styles.inputCardHeading}>Have a Voucher or Promo Code?</Text>
          <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Input
                placeholder="Enter coupon code"
                autoCapitalize="characters"
                value={promoCode}
                onChangeText={setPromoCode}
              />
            </View>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => {
                if (!promoCode.trim()) {
                  Alert.alert("Required", "Please enter a valid coupon code.");
                  return;
                }
                applyCode(promoCode.trim().toUpperCase());
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Available Coupons */}
        <Text style={styles.sectionHeader}>Verified Marketplace Coupons</Text>
        <View style={styles.couponsList}>
          {COUPONS.map((c) => (
            <View key={c.code} style={styles.couponCard}>
              <View style={styles.couponTop}>
                <View style={styles.codeWrap}>
                  <Text style={styles.codeText}>{c.code}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => applyCode(c.code)}
                  style={styles.couponApplyBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.couponApplyText}>
                    {applied === c.code ? "APPLIED ✓" : "APPLY"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.discountText}>{c.discount}</Text>
              <Text style={styles.descText}>{c.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.metaText}>Min Order: {c.min}</Text>
                <Text style={styles.metaText}>Valid till: {c.validTill}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Bank & EMI Partners */}
        <Text style={styles.sectionHeader}>Bank Offers & No-Cost EMI</Text>
        <View style={styles.bankList}>
          {BANK_OFFERS.map((b, i) => (
            <View key={i} style={styles.bankCard}>
              <View style={styles.bankIconWrap}>
                <Ionicons name={b.icon} size={20} color={tokens.colors.accentStrong} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bankTitle}>{b.bank}</Text>
                <Text style={styles.bankOffer}>{b.offer}</Text>
              </View>
            </View>
          ))}
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

  inputCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 20,
    ...tokens.shadow.card,
  },
  inputCardHeading: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink, marginBottom: 10 },
  inputRow: { flexDirection: "row", alignItems: "center" },
  applyBtn: {
    backgroundColor: tokens.colors.ink,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  applyBtnText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  couponsList: { gap: 12, marginBottom: 24 },
  couponCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "60",
    borderStyle: "dashed",
    ...tokens.shadow.card,
  },
  couponTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  codeWrap: {
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.colors.accent,
  },
  codeText: { fontSize: 12, fontWeight: "900", color: tokens.colors.accentStrong, letterSpacing: 0.8 },
  couponApplyBtn: { padding: 4 },
  couponApplyText: { fontSize: 12, fontWeight: "800", color: tokens.colors.ink },
  discountText: { fontSize: 15, fontWeight: "900", color: tokens.colors.ink, marginBottom: 4 },
  descText: { fontSize: 11.5, color: tokens.colors.textSecondary, lineHeight: 16, marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: tokens.colors.borderLight,
    paddingTop: 8,
  },
  metaText: { fontSize: 10, color: tokens.colors.textMuted },

  bankList: { gap: 10 },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: 12,
  },
  bankIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  bankTitle: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink },
  bankOffer: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },
});
