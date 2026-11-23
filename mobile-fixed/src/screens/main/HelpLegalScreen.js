import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { HeaderBar, Accordion } from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";

export default function HelpLegalScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />
      <HeaderBar title="Help Centre & Legal" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Support Contact Pill */}
        <View style={styles.supportCard}>
          <View style={styles.supportIcon}>
            <Ionicons name="headset" size={24} color={tokens.colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>ZYPHOR Concierge Support</Text>
            <Text style={styles.supportSub}>Mon - Sun • 9:00 AM to 9:00 PM IST</Text>
            <Text style={styles.supportContact}>support@zyphor.store • 1800-889-ZYPHOR</Text>
          </View>
        </View>

        {/* FAQs */}
        <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>

        <Accordion title="How does the 48-Hour Approval Window work?" defaultOpen>
          <Text style={styles.accordionContent}>
            When your order is delivered, your payment is held safely in ZYPHOR Escrow. You have a full 48 hours to insert your SIM, check touch latency, test cameras, and inspect battery drain. If you accept, the warranty begins. If you find any undisclosed defect, you can request an instant 100% refund.
          </Text>
        </Accordion>

        <Accordion title="What is covered under the 6-Month Warranty?">
          <Text style={styles.accordionContent}>
            Our comprehensive 6-month warranty covers all internal hardware: motherboard failures, display touch unresponsive defects, camera sensor issues, and unexpected battery degradation. Physical drops and water submersion are excluded.
          </Text>
        </Accordion>

        <Accordion title="How does ZYPHOR's 45-Point Inspection work?">
          <Text style={styles.accordionContent}>
            Every device entering our hub is tested with diagnostic hardware: screen pixel response, biometric sensors (FaceID/TouchID), speaker decibels, microphones, 5G modems, and OEM battery purity. Only devices passing all 45 checks receive the ZYPHOR Certified badge.
          </Text>
        </Accordion>

        <Accordion title="How do I receive payment when selling my device?">
          <Text style={styles.accordionContent}>
            When our doorstep technician verifies your device matches your condition quiz, funds are transferred immediately to your verified UPI ID or bank account before the technician departs.
          </Text>
        </Accordion>

        {/* Legal Policies */}
        <Text style={styles.sectionHeading}>Legal & Compliance</Text>

        <Accordion title="Terms of Service & Escrow Agreement">
          <Text style={styles.accordionContent}>
            ZYPHOR operates as a verified recommerce intermediary. All marketplace payments are processed through RBI-authorized payment aggregators and held in an escrow mechanism until delivery confirmation and inspection expiry.
          </Text>
        </Accordion>

        <Accordion title="Privacy Policy & DPDP Compliance">
          <Text style={styles.accordionContent}>
            In compliance with the Digital Personal Data Protection Act (DPDPA), user data is encrypted at rest and in transit. Device data is securely wiped following NIST 800-88 sanitization standards upon trade-in.
          </Text>
        </Accordion>

        {/* Mandatory Grievance Officer Notice */}
        <Text style={styles.sectionHeading}>Statutory Grievance Officer</Text>
        <View style={styles.grievanceCard}>
          <Text style={styles.grievanceIntro}>
            In accordance with the Information Technology Act 2000 and the Consumer Protection (E-Commerce) Rules:
          </Text>
          <View style={styles.grievanceTable}>
            <View style={styles.grievanceRow}>
              <Text style={styles.gKey}>Officer Name:</Text>
              <Text style={styles.gVal}>Arpit Pathak</Text>
            </View>
            <View style={styles.grievanceRow}>
              <Text style={styles.gKey}>Designation:</Text>
              <Text style={styles.gVal}>Head of Trust & Grievance Redressal</Text>
            </View>
            <View style={styles.grievanceRow}>
              <Text style={styles.gKey}>Email:</Text>
              <Text style={styles.gVal}>grievance@zyphor.store</Text>
            </View>
            <View style={styles.grievanceRow}>
              <Text style={styles.gKey}>Resolution SLA:</Text>
              <Text style={styles.gVal}>Acknowledgment within 24h, resolution within 15 days</Text>
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
  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: tokens.colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 16,
    ...tokens.shadow.subtle,
  },
  supportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: tokens.colors.ink,
  },
  supportSub: {
    fontSize: 11.5,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  supportContact: {
    fontSize: 11,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 8,
  },
  accordionContent: {
    fontSize: 12.5,
    lineHeight: 19,
    color: tokens.colors.textSecondary,
    paddingVertical: 8,
  },
  grievanceCard: {
    backgroundColor: tokens.colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginTop: 4,
    marginBottom: 20,
  },
  grievanceIntro: {
    fontSize: 11.5,
    color: tokens.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  grievanceTable: {
    gap: 6,
  },
  grievanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gKey: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
    flex: 1,
  },
  gVal: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
    flex: 1.5,
    textAlign: "right",
  },
});
