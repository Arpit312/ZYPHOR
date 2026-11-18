import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";

export default function AboutScreen() {
  return (
    <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.symbolBox}>
          <Image
            source={require("../../../assets/symbol-white.png")}
            style={{ width: 26, height: 26 }}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.logo}>ZYPHOR</Text>
        <Text style={styles.tagline}>The standard in certified refurbished smartphones & electronics</Text>
        <Text style={styles.version}>Enterprise Edition 2.0</Text>
      </View>

      <View style={styles.body}>
        {[
          { icon: "shield-checkmark-outline", title: "45-Point Hardware Diagnostics", text: "Every certified smartphone undergoes extensive screen, motherboard, sensor, and battery testing." },
          { icon: "scan-outline", title: "GSMA / CEIR IMEI Registry", text: "Real-time government blacklist and theft database verification for every transaction." },
          { icon: "lock-closed-outline", title: "Buyer & Seller Escrow", text: "Payments are safely held in trust until buyer inspection and confirmation are complete." },
          { icon: "construct-outline", title: "Doorstep Certified Engineers", text: "On-demand original screen, battery, and camera replacements at your home or office." },
        ].map((f) => (
          <View key={f.title} style={styles.feature}>
            <View style={styles.fIcon}>
              <Ionicons name={f.icon} size={20} color={T.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fTitle}>{f.title}</Text>
              <Text style={styles.fText}>{f.text}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={() => Linking.openURL("https://zyphor-wxe3.vercel.app")} style={styles.link} activeOpacity={0.7}>
          <Ionicons name="globe-outline" size={16} color={T.primary} />
          <Text style={styles.linkText}>Visit zyphor.in</Text>
        </TouchableOpacity>

        <Text style={styles.copy}>© 2026 ZYPHOR Platform • All Rights Reserved</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingTop: 64,
    paddingBottom: 28,
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  symbolBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logo: { fontSize: 32, fontWeight: "900", color: T.text.primary, letterSpacing: 1 },
  tagline: { fontSize: 13, color: T.text.secondary, textAlign: "center", marginTop: 4, lineHeight: 18 },
  version: { fontSize: 11, color: T.text.secondary, marginTop: 4 },

  body: { padding: 20, paddingBottom: 60 },
  feature: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
    backgroundColor: T.bg.secondary,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  fIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  fTitle: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginBottom: 4 },
  fText: { fontSize: 12, color: T.text.secondary, lineHeight: 18 },

  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 18,
  },
  linkText: { fontSize: 14, color: T.primary, fontWeight: "700" },
  copy: { textAlign: "center", fontSize: 11, color: T.text.secondary, paddingBottom: 20 },
});
