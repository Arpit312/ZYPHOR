import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Btn, Input } from "../../components/UI";
import { imeiAPI } from "../../api/api";

export default function IMEICheckScreen() {
  const [imei, setImei] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    const clean = imei.replace(/\D/g, "");
    if (clean.length !== 15) {
      setError("IMEI must be exactly 15 digits");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await imeiAPI.check(clean);
      setResult(r.data);
    } catch (e) {
      setError(e.response?.data?.error || "Verification failed. Check network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="scan-outline" size={32} color={T.primary} />
        </View>
        <Text style={styles.title}>IMEI Diagnostic</Text>
        <Text style={styles.sub}>Screen device for blacklist, theft records, and hardware legitimacy</Text>
      </View>

      <View style={styles.body}>
        <Input
          label="Enter 15-Digit IMEI Number"
          placeholder="e.g. 353937093209023"
          value={imei}
          onChangeText={(v) => setImei(v.replace(/\D/g, ""))}
          keyboardType="numeric"
          maxLength={15}
          icon="barcode-outline"
          right={
            <Text style={{ fontSize: 11, color: imei.replace(/\D/g, "").length === 15 ? T.green : T.text.secondary }}>
              {imei.replace(/\D/g, "").length}/15
            </Text>
          }
        />

        <Text style={styles.tip}>Dial *#06# on any phone to display its hardware IMEI.</Text>

        {error ? (
          <View style={styles.errBox}>
            <Ionicons name="alert-circle-outline" size={16} color={T.red} />
            <Text style={styles.errText}>{error}</Text>
          </View>
        ) : null}

        <Btn
          title={loading ? "Screening Hardware Database..." : "Verify IMEI Status →"}
          onPress={check}
          loading={loading}
          icon="shield-checkmark-outline"
          style={{ marginTop: 4, marginBottom: 16 }}
        />

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Ionicons
                name={result.isValid ? "shield-checkmark" : "close-circle"}
                size={32}
                color={result.isValid ? T.green : T.red}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.resultStatus, { color: result.isValid ? T.green : T.red }]}>
                  {result.isValid ? "Verified Legitimate Device" : "Flagged or Invalid IMEI"}
                </Text>
                <Text style={styles.resultMsg}>{result.message}</Text>
              </View>
            </View>

            {result.isValid && (
              <>
                <View style={styles.trustSection}>
                  <Text style={styles.trustLabel}>Hardware Integrity Score: {result.trustScore}%</Text>
                  <View style={styles.trustBar}>
                    <View style={[styles.trustFill, { width: `${result.trustScore}%`, backgroundColor: T.primary }]} />
                  </View>
                </View>

                <View style={styles.detailGrid}>
                  {[
                    { k: "IMEI Number", v: result.imei },
                    { k: "TAC Code", v: result.tac },
                    { k: "CEIR Registry", v: result.blacklistStatus || "Clean" },
                    { k: "Status", v: result.isValid ? "Authorized" : "Flagged" },
                  ].map((d) => (
                    <View key={d.k} style={styles.detailBox}>
                      <Text style={styles.detailKey}>{d.k}</Text>
                      <Text style={styles.detailVal}>{d.v}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Verification Protocol</Text>
          {[
            "Mathematical Luhn algorithm checksum verification",
            "Screened against national GSMA and CEIR blacklist registers",
            "TAC code hardware mapping to manufacturer database",
          ].map((i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <Ionicons name="checkmark-circle-outline" size={15} color={T.primary} style={{ marginTop: 1 }} />
              <Text style={styles.infoText}>{i}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    padding: 24,
    paddingTop: 54,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: T.bg.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  title: { fontSize: 26, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: T.text.secondary, textAlign: "center", marginTop: 4, lineHeight: 18 },

  body: { padding: 20, paddingBottom: 60 },
  tip: { fontSize: 12, color: T.text.secondary, marginBottom: 16 },
  errBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errText: { fontSize: 12, color: T.red },

  resultCard: {
    backgroundColor: T.bg.secondary,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 20,
  },
  resultHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  resultStatus: { fontSize: 15, fontWeight: "800" },
  resultMsg: { fontSize: 12, color: T.text.secondary, marginTop: 2 },

  trustSection: { marginBottom: 14 },
  trustLabel: { fontSize: 12, fontWeight: "700", color: T.text.primary, marginBottom: 6 },
  trustBar: { height: 6, backgroundColor: T.border.color, borderRadius: 3, overflow: "hidden" },
  trustFill: { height: "100%", borderRadius: 3 },

  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  detailBox: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  detailKey: { fontSize: 10, color: T.text.secondary, textTransform: "uppercase", fontWeight: "600" },
  detailVal: { fontSize: 13, fontWeight: "800", color: T.text.primary, marginTop: 2 },

  infoBox: {
    backgroundColor: T.bg.secondary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  infoTitle: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginBottom: 12 },
  infoText: { fontSize: 12, color: T.text.secondary, flex: 1, lineHeight: 18 },
});
