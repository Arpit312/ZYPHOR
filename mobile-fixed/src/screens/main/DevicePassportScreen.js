import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn } from "../../components/UI";

export default function DevicePassportScreen({ route, navigation }) {
  const device = route.params?.device || {
    brand: "Apple",
    model: "iPhone 15 Pro",
    storage: "256GB",
    imei: "354928110948291",
    conditionGrade: "Pristine",
    batteryHealth: "94%",
    inspectionDate: "18 Nov 2026",
    hub: "Delhi Verification Vault (Booth #01)",
    inspector: "ZYPHOR Master Tech #104",
    warrantyValidTill: "18 May 2027",
  };

  const handleSharePassport = async () => {
    try {
      await Share.share({
        message: `ZYPHOR Device Passport (Digital Hardware Certificate)\nDevice: ${device.brand} ${device.model} (${device.storage})\nIMEI: ${device.imei}\nGrade: ${device.conditionGrade} • Battery Health: ${device.batteryHealth}\n45-Point Audit Passed • 6M Warranty: Valid till ${device.warrantyValidTill}`,
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
        <Text style={styles.headerTitle}>Digital Device Passport</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Gold Seal Header Card */}
        <View style={styles.passportCard}>
          <View style={styles.sealRow}>
            <View style={styles.sealBadge}>
              <Ionicons name="shield-checkmark" size={20} color={tokens.colors.accent} />
              <Text style={styles.sealText}>ZYPHOR DIGITAL CERTIFICATE</Text>
            </View>
            <Text style={styles.passportId}>PASSPORT #{device.imei?.slice(-6) || "849201"}</Text>
          </View>

          <Text style={styles.deviceTitle}>{device.brand} {device.model}</Text>
          <Text style={styles.deviceSpec}>{device.storage} • {device.conditionGrade} Grade</Text>

          {/* Key Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Battery Health</Text>
              <Text style={styles.metricValueGold}>{device.batteryHealth}</Text>
              <Text style={styles.metricSub}>OEM Verified</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Audit Check</Text>
              <Text style={styles.metricValue}>45 / 45</Text>
              <Text style={styles.metricSub}>Passed 100%</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Warranty</Text>
              <Text style={styles.metricValue}>6 Months</Text>
              <Text style={styles.metricSub}>Hardware Vault</Text>
            </View>
          </View>
        </View>

        {/* Diagnostic Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>45-Point Diagnostic Verification</Text>

          {[
            { cat: "Screen & OLED Panel", tests: "Touch latency, dead pixels, TrueTone, 120Hz ProMotion", status: "PASS" },
            { cat: "Battery & Power Subsystem", tests: "Cycle count < 400, thermal sensor, fast charging", status: "PASS" },
            { cat: "Cameras & Optical Sensors", tests: "Main 48MP sensor, LiDAR scanner, TrueDepth FaceID", status: "PASS" },
            { cat: "Motherboard & Cellular", tests: "5G bands, dual-eSIM, Wi-Fi 6E, Bluetooth 5.3", status: "PASS" },
            { cat: "Biometrics & Security", tests: "Secure Enclave integrity, factory Knox/iCloud clean", status: "PASS" },
            { cat: "Acoustics & Microphones", tests: "Stereo speaker balance, 3-mic beamforming noise cancel", status: "PASS" },
          ].map((item, idx) => (
            <View key={idx} style={styles.testRow}>
              <View style={styles.testDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.testCat}>{item.cat}</Text>
                <Text style={styles.testSub}>{item.tests}</Text>
              </View>
              <View style={styles.passBadge}>
                <Ionicons name="checkmark" size={11} color={tokens.colors.success} />
                <Text style={styles.passText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Provenance & Ownership */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Hardware Provenance & Traceability</Text>

          <View style={styles.propRow}>
            <Text style={styles.propLabel}>Verified IMEI / Serial</Text>
            <Text style={styles.propValBold}>{device.imei}</Text>
          </View>
          <View style={styles.propRow}>
            <Text style={styles.propLabel}>Verification Hub</Text>
            <Text style={styles.propVal}>{device.hub}</Text>
          </View>
          <View style={styles.propRow}>
            <Text style={styles.propLabel}>Certified Inspector</Text>
            <Text style={styles.propVal}>{device.inspector}</Text>
          </View>
          <View style={styles.propRow}>
            <Text style={styles.propLabel}>Warranty Cover Till</Text>
            <Text style={styles.propValBold}>{device.warrantyValidTill}</Text>
          </View>
        </View>

        <Btn
          title="Share Digital Passport →"
          onPress={handleSharePassport}
          variant="gold"
          style={{ marginTop: 10, marginBottom: 20 }}
        />
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

  passportCard: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: tokens.colors.accent,
    marginBottom: 20,
    ...tokens.shadow.elevated,
  },
  sealRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sealBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: tokens.colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sealText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: tokens.colors.accentStrong,
    letterSpacing: 0.8,
  },
  passportId: {
    fontSize: 10,
    fontWeight: "800",
    color: tokens.colors.textMuted,
    letterSpacing: 0.5,
  },
  deviceTitle: { fontSize: 22, fontWeight: "900", color: tokens.colors.ink, marginBottom: 2 },
  deviceSpec: { fontSize: 12.5, color: tokens.colors.textSecondary, marginBottom: 18 },

  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: tokens.colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  metricItem: { flex: 1, alignItems: "center" },
  metricLabel: { fontSize: 10, color: tokens.colors.textSecondary, fontWeight: "700", marginBottom: 3 },
  metricValueGold: { fontSize: 18, fontWeight: "900", color: tokens.colors.accentStrong },
  metricValue: { fontSize: 18, fontWeight: "900", color: tokens.colors.ink },
  metricSub: { fontSize: 9.5, color: tokens.colors.textMuted, marginTop: 2 },
  metricDivider: { width: 1, height: 32, backgroundColor: tokens.colors.border },

  section: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 16,
    ...tokens.shadow.card,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: tokens.colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  testRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
    gap: 10,
  },
  testDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: tokens.colors.accent,
  },
  testCat: { fontSize: 13, fontWeight: "800", color: tokens.colors.ink },
  testSub: { fontSize: 11, color: tokens.colors.textSecondary, marginTop: 2 },
  passBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: tokens.colors.success + "15",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  passText: { fontSize: 9.5, fontWeight: "800", color: tokens.colors.success },

  propRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  propLabel: { fontSize: 12, color: tokens.colors.textSecondary },
  propVal: { fontSize: 12, color: tokens.colors.ink, fontWeight: "600" },
  propValBold: { fontSize: 12, color: tokens.colors.ink, fontWeight: "800" },
});
