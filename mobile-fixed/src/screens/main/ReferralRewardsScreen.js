import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

export default function ReferralRewardsScreen({ navigation }) {
  const { user } = useAuth();
  const inviteCode = "ZYPHOR" + (user?.name?.slice(0, 3).toUpperCase() || "VIP") + (user?.phone?.slice(-3) || "789");
  const [balance, setBalance] = useState(1500);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my invite code ${inviteCode} on ZYPHOR to get Flat ₹1,000 OFF on your first 45-point certified smartphone with 48h escrow protection! Download: https://zyphor.store/app`,
      });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={tokens.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Referral & Escrow Rewards</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balancePre}>YOUR ESCROW REWARD BALANCE</Text>
          <Text style={styles.balanceMain}>₹{balance.toLocaleString("en-IN")}</Text>
          <Text style={styles.balanceSub}>Usable directly against any certified smartphone order</Text>
        </View>

        {/* Invite Code Box */}
        <View style={styles.codeCard}>
          <Text style={styles.codeHeading}>Your Exclusive VIP Invite Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => Alert.alert("✓ Copied", "Invite code copied to clipboard!")}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={16} color={tokens.colors.ink} />
              <Text style={styles.copyText}>Copy</Text>
            </TouchableOpacity>
          </View>

          <Btn
            title="Share with Friends & Earn ₹500"
            onPress={handleShare}
            rightIcon="share-social-outline"
            variant="gold"
            style={{ marginTop: 14 }}
          />
        </View>

        {/* How It Works */}
        <Text style={styles.sectionHeader}>How ZYPHOR Rewards Work</Text>
        <View style={styles.stepsCard}>
          {[
            { num: "1", title: "Invite Friends", desc: "Share your code with anyone looking to buy or sell a smartphone." },
            { num: "2", title: "They Get ₹1,000 OFF", desc: "Applied automatically at their first escrow checkout." },
            { num: "3", title: "You Get ₹500 Escrow Credits", desc: "Credited instantly once their 48h approval window closes." },
          ].map((s) => (
            <View key={s.num} style={styles.stepRow}>
              <View style={styles.stepNumWrap}>
                <Text style={styles.stepNum}>{s.num}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
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

  balanceCard: {
    backgroundColor: tokens.colors.ink,
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    ...tokens.shadow.elevated,
  },
  balancePre: { fontSize: 10, fontWeight: "800", color: tokens.colors.accent, letterSpacing: 1.2 },
  balanceMain: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginVertical: 6 },
  balanceSub: { fontSize: 12, color: tokens.colors.textSecondary },

  codeCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 20,
    ...tokens.shadow.card,
  },
  codeHeading: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink, marginBottom: 10 },
  codeBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "60",
    borderStyle: "dashed",
  },
  codeText: { fontSize: 16, fontWeight: "900", color: tokens.colors.ink, letterSpacing: 1.5 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  copyText: { fontSize: 11.5, fontWeight: "800", color: tokens.colors.ink },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  stepsCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    gap: 14,
    ...tokens.shadow.card,
  },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  stepNumWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 12, fontWeight: "800", color: "#FFFFFF" },
  stepTitle: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink },
  stepDesc: { fontSize: 11.5, color: tokens.colors.textSecondary, marginTop: 2, lineHeight: 16 },
});
