import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn } from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";

export default function OrderSuccessScreen({ route, navigation }) {
  const { t } = useTranslation();
  const order = route.params?.order || {};
  const billNo = route.params?.billNo || order.bill?.billNumber || "ZYP-" + Date.now().toString().slice(-6);
  const totalAmount = route.params?.amount || order.amount || 0;

  const scaleVal = useRef(new Animated.Value(0)).current;
  const fadeVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleVal, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeVal, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShareInvoice = async () => {
    try {
      await Share.share({
        message: `ZYPHOR Tax Invoice & Escrow Guarantee\nOrder Ref: ${billNo}\nAmount: ₹${Number(totalAmount).toLocaleString("en-IN")}\n48h Escrow Inspection Active.`,
      });
    } catch {}
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.canvas} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Animated Success Badge */}
        <Animated.View
          style={[
            styles.successCircle,
            {
              transform: [{ scale: scaleVal }],
              opacity: fadeVal,
            },
          ]}
        >
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.heading}>Order Placed & Escrow Secured</Text>
        <Text style={styles.subheading}>
          Your payment is held safely in ZYPHOR Escrow. It will be released to the seller only after your 48-hour doorstep inspection window.
        </Text>

        {/* Order Reference Plinth */}
        <View style={styles.plinthCard}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Invoice Reference</Text>
            <Text style={styles.rowValueBold}>{billNo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Amount Paid</Text>
            <Text style={styles.priceGold}>₹{Number(totalAmount).toLocaleString("en-IN")}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Escrow Protection</Text>
            <View style={styles.activePill}>
              <View style={styles.greenDot} />
              <Text style={styles.activeText}>LOCKED IN ESCROW</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Inspection Window</Text>
            <Text style={styles.rowValue}>48 Hours Post-Delivery</Text>
          </View>
        </View>

        {/* 4-Pillar Trust Grid */}
        <View style={styles.trustGrid}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color={tokens.colors.accentStrong} />
            <Text style={styles.trustTitle}>45-Point Audited</Text>
            <Text style={styles.trustSub}>Hardware verified</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="time-outline" size={20} color={tokens.colors.accentStrong} />
            <Text style={styles.trustTitle}>48h Approval</Text>
            <Text style={styles.trustSub}>Zero-risk trial</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="ribbon-outline" size={20} color={tokens.colors.accentStrong} />
            <Text style={styles.trustTitle}>6M Warranty</Text>
            <Text style={styles.trustSub}>Comprehensive cover</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="car-outline" size={20} color={tokens.colors.accentStrong} />
            <Text style={styles.trustTitle}>Free Return</Text>
            <Text style={styles.trustSub}>Doorstep reverse pickup</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Btn
            title="Track Order & Escrow →"
            onPress={() => {
              if (order._id) {
                navigation.navigate("OrderTracking", { orderId: order._id });
              } else {
                navigation.navigate("Account", { screen: "MyOrders" });
              }
            }}
            variant="primary"
            style={{ marginBottom: 12 }}
          />

          <TouchableOpacity
            style={styles.shareBtn}
            onPress={handleShareInvoice}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={16} color={tokens.colors.ink} />
            <Text style={styles.shareBtnText}>Share Tax Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.7}
          >
            <Text style={styles.homeBtnText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: {
    padding: 24,
    paddingTop: 64,
    alignItems: "center",
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: tokens.colors.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: tokens.colors.accent,
    ...tokens.shadow.elevated,
  },
  heading: {
    fontSize: 22,
    fontWeight: "900",
    color: tokens.colors.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  subheading: {
    fontSize: 13,
    color: tokens.colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  plinthCard: {
    width: "100%",
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 20,
    ...tokens.shadow.card,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  rowLabel: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
  },
  rowValue: {
    fontSize: 12.5,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  rowValueBold: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  priceGold: {
    fontSize: 15,
    fontWeight: "900",
    color: tokens.colors.ink,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.success,
  },
  activeText: {
    fontSize: 10,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
  },

  trustGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 28,
  },
  trustItem: {
    width: "48%",
    backgroundColor: tokens.colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    alignItems: "center",
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.ink,
    marginTop: 6,
  },
  trustSub: {
    fontSize: 10,
    color: tokens.colors.textMuted,
    marginTop: 2,
  },

  actions: {
    width: "100%",
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 10,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  homeBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  homeBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: tokens.colors.textSecondary,
  },
});
