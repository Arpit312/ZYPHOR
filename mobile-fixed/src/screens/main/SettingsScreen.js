import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { HeaderBar, Btn } from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen({ navigation }) {
  const { t, locale, setLocale } = useTranslation();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account & Personal Data",
      "Are you sure you want to permanently delete your ZYPHOR account? All device passports, order histories, and personal identifiers will be permanently erased in compliance with the Digital Personal Data Protection Act (DPDPA).",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Permanently Delete",
          style: "destructive",
          onPress: async () => {
            await logout();
            Alert.alert("Account Deleted", "Your account and data have been queued for permanent erasure.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />
      <HeaderBar title={t("settings")} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <Text style={styles.sectionHeading}>{t("language")}</Text>
        <View style={styles.settingGroup}>
          <TouchableOpacity
            style={[styles.settingRow, locale === "en" && styles.settingRowActive]}
            onPress={() => setLocale("en")}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="text-outline" size={18} color={tokens.colors.ink} />
              <Text style={styles.rowTitle}>English</Text>
            </View>
            {locale === "en" && <Ionicons name="checkmark" size={18} color={tokens.colors.accent} />}
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.settingRow, locale === "hi" && styles.settingRowActive]}
            onPress={() => setLocale("hi")}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="language-outline" size={18} color={tokens.colors.ink} />
              <Text style={styles.rowTitle}>हिंदी (Hindi)</Text>
            </View>
            {locale === "hi" && <Ionicons name="checkmark" size={18} color={tokens.colors.accent} />}
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionHeading}>App Preferences</Text>
        <View style={styles.settingGroup}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={18} color={tokens.colors.ink} />
              <Text style={styles.rowTitle}>Order & Escrow Alerts</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: tokens.colors.border, true: tokens.colors.accent }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="moon-outline" size={18} color={tokens.colors.ink} />
              <Text style={styles.rowTitle}>Dark Appearance</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: tokens.colors.border, true: tokens.colors.accent }}
            />
          </View>
        </View>

        {/* Privacy & Legal */}
        <Text style={styles.sectionHeading}>Privacy & Compliance</Text>
        <View style={styles.settingGroup}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("HelpLegal")}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="shield-outline" size={18} color={tokens.colors.ink} />
              <Text style={styles.rowTitle}>Terms of Service & Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={tokens.colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate("HelpLegal")}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="business-outline" size={18} color={tokens.colors.ink} />
              <Text style={styles.rowTitle}>Grievance Officer Contact</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={tokens.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <Text style={[styles.sectionHeading, { color: tokens.colors.error }]}>Danger Zone</Text>
        <View style={[styles.settingGroup, { borderColor: tokens.colors.error + "40" }]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={18} color={tokens.colors.error} />
              <Text style={[styles.rowTitle, { color: tokens.colors.error }]}>{t("delete_account")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={tokens.colors.error} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionHeading: {
    fontSize: 12,
    fontWeight: "800",
    color: tokens.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 8,
  },
  settingGroup: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    overflow: "hidden",
    ...tokens.shadow.subtle,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingRowActive: {
    backgroundColor: tokens.colors.accentSoft,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.borderLight,
    marginLeft: 46,
  },
});
