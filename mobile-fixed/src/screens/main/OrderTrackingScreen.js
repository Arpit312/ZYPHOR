import React, { useState, useEffect } from "react";
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
import { HeaderBar, OrderTimeline, Btn } from "../../components/UI";
import { ordersAPI } from "../../api/api";
import { useTranslation } from "../../i18n/I18nContext";

export default function OrderTrackingScreen({ route, navigation }) {
  const { orderId = "ORD-94821", order } = route.params || {};
  const [activeStep, setActiveStep] = useState(4); // 4 = Delivered & In 48h Inspection Window
  const [hoursLeft, setHoursLeft] = useState(41);
  const [minsLeft, setMinsLeft] = useState(24);
  const { t } = useTranslation();

  const TRACKING_STEPS = [
    { title: "Order Placed & Escrow Secured", description: "Payment held safely in ZYPHOR Escrow", time: "Nov 22, 10:30 AM" },
    { title: "45-Point Diagnostic Verified", description: "Hardware, display & battery certified at Hub", time: "Nov 22, 02:15 PM" },
    { title: "Dispatched via Express Courier", description: "Tracking #ZY-88392190 with BlueDart", time: "Nov 23, 09:00 AM" },
    { title: "Out for Doorstep Delivery", description: "Agent arriving at your location", time: "Nov 23, 01:45 PM" },
    { title: "Delivered • 48-Hour Approval Window", description: "Test display, cameras & SIM freely", time: "Active Now" },
  ];

  const handleAcceptDevice = () => {
    Alert.alert(
      "Accept Device & Release Escrow",
      "Are you satisfied with this device? Accepting releases payment to the seller and activates your official 6-Month ZYPHOR Warranty.",
      [
        { text: "Keep Testing" },
        {
          text: "Accept & Activate Warranty",
          onPress: () => {
            Alert.alert("✓ Device Accepted", "Your 6-Month Warranty is now active. You can view your Digital Device Passport anytime in your Profile.");
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleRaiseDispute = () => {
    navigation.navigate("ReturnDispute", { orderId });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />
      <HeaderBar
        title="Track Order"
        subtitle={`Order #${orderId}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 48-Hour Inspection Window Card */}
        <View style={styles.escrowCard}>
          <View style={styles.escrowHeader}>
            <View style={styles.timerBadge}>
              <Ionicons name="time" size={13} color="#FFFFFF" />
              <Text style={styles.timerBadgeText}>48-HOUR INSPECTION WINDOW</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownText}>{hoursLeft}h {minsLeft}m left</Text>
            </View>
          </View>

          <Text style={styles.escrowTitle}>Test your device freely.</Text>
          <Text style={styles.escrowSub}>
            Your payment is protected in escrow. Test screen response, cameras, battery drain, and your 5G SIM. If anything doesn't match the listing description, return for a 100% full refund.
          </Text>

          <View style={styles.escrowActionRow}>
            <Btn
              title="Return or Report Issue"
              onPress={handleRaiseDispute}
              variant="outline"
              small
              style={{ flex: 1 }}
            />
            <Btn
              title="Accept Device"
              onPress={handleAcceptDevice}
              variant="gold"
              small
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Vertical Order Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Delivery & Inspection Progress</Text>
          <OrderTimeline steps={TRACKING_STEPS} activeIndex={activeStep} />
        </View>

        {/* Courier Details */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="cube-outline" size={18} color={tokens.colors.ink} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoKey}>Courier Partner</Text>
              <Text style={styles.infoVal}>BlueDart Air Express (AWB: 88392190)</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={tokens.colors.success} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoKey}>Warranty Status</Text>
              <Text style={styles.infoVal}>6-Month Free Replacement (Activates upon acceptance)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: { padding: 16, paddingBottom: 40 },
  escrowCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: tokens.colors.accent,
    marginBottom: 16,
    ...tokens.shadow.card,
  },
  escrowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: tokens.colors.accentStrong,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timerBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  countdownBox: {
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  escrowSub: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.textSecondary,
    marginVertical: 8,
  },
  escrowActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  timelineCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 16,
    ...tokens.shadow.subtle,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.2,
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoKey: {
    fontSize: 11,
    color: tokens.colors.textSecondary,
  },
  infoVal: {
    fontSize: 12.5,
    fontWeight: "700",
    color: tokens.colors.ink,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
    marginVertical: 10,
  },
});
