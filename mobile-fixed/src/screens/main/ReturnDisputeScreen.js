import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { tokens } from "../../theme/tokens";
import { HeaderBar, Btn, Input } from "../../components/UI";

const REASONS = [
  "Hardware defect not described in 45-point report",
  "Screen display issue (Lines, touch ghosting, burn-in)",
  "Battery health under 85% or rapid drain",
  "Camera autofocus / sensor blur issue",
  "Incorrect storage / color received",
];

const SLOTS = ["Tomorrow 10 AM - 1 PM", "Tomorrow 2 PM - 6 PM", "Day after tomorrow"];

export default function ReturnDisputeScreen({ route, navigation }) {
  const { orderId = "ORD-94821" } = route.params || {};
  const [selectedReason, setSelectedReason] = useState(REASONS[0]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [pickupSlot, setPickupSlot] = useState(SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotos([...photos, res.assets[0].uri]);
      }
    } catch {
      Alert.alert("Permission", "Please allow photo access to upload inspection proof.");
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert("Details required", "Please describe the defect observed during your 48-hour testing.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        "✓ Return Request Registered",
        "Your escrow payment has been frozen. A technician will visit during your selected slot to verify the device and process an instant 100% refund.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }, 800);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />
      <HeaderBar
        title="Return & Refund"
        subtitle={`Order #${orderId}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Protection Banner */}
        <View style={styles.noticeBanner}>
          <Ionicons name="shield-checkmark" size={18} color={tokens.colors.accentStrong} />
          <Text style={styles.noticeText}>
            You are within the 48-Hour Approval Window. Your funds remain secured in escrow until this return claim is resolved.
          </Text>
        </View>

        {/* Reason Selector */}
        <Text style={styles.sectionHeading}>Select Reason for Return</Text>
        <View style={styles.reasonsList}>
          {REASONS.map((r) => {
            const active = selectedReason === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.reasonCard, active && styles.reasonCardActive]}
                onPress={() => setSelectedReason(r)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={18}
                  color={active ? tokens.colors.accent : tokens.colors.border}
                />
                <Text style={[styles.reasonText, active && styles.reasonTextActive]}>{r}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Defect Description */}
        <Text style={styles.sectionHeading}>Defect Details</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please explain the issue in detail so our hub technician can replicate it..."
          placeholderTextColor={tokens.colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          maxLength={400}
        />

        {/* Photo Evidence Upload */}
        <Text style={styles.sectionHeading}>Photo / Video Evidence (Optional)</Text>
        <View style={styles.photoRow}>
          {photos.map((uri, idx) => (
            <View key={idx} style={styles.photoThumbWrap}>
              <Image source={{ uri }} style={styles.photoThumb} />
              <TouchableOpacity
                onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                style={styles.removePhotoBtn}
              >
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 3 && (
            <TouchableOpacity onPress={handlePickImage} style={styles.addPhotoBtn} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={24} color={tokens.colors.accent} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Doorstep Reverse Pickup Slot */}
        <Text style={styles.sectionHeading}>Select Free Doorstep Pickup Slot</Text>
        <View style={styles.slotsRow}>
          {SLOTS.map((s) => {
            const active = pickupSlot === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.slotPill, active && styles.slotPillActive]}
                onPress={() => setPickupSlot(s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.slotText, active && styles.slotTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit CTA */}
        <Btn
          title="Submit Return Request"
          onPress={handleSubmit}
          loading={submitting}
          variant="gold"
          style={{ marginTop: 24, marginBottom: 20 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  scroll: { padding: 16, paddingBottom: 40 },
  noticeBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: tokens.colors.accentSoft,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.colors.accent + "40",
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.accentStrong,
    fontWeight: "600",
    flex: 1,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: tokens.colors.ink,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 10,
  },
  reasonsList: {
    gap: 8,
    marginBottom: 14,
  },
  reasonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: tokens.colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  reasonCardActive: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.surface,
  },
  reasonText: {
    fontSize: 12.5,
    color: tokens.colors.textSecondary,
    flex: 1,
  },
  reasonTextActive: {
    color: tokens.colors.ink,
    fontWeight: "700",
  },
  textArea: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    minHeight: 80,
    textAlignVertical: "top",
    fontSize: 13,
    color: tokens.colors.ink,
    marginBottom: 14,
  },
  photoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  photoThumbWrap: {
    position: "relative",
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
  },
  photoThumb: { width: "100%", height: "100%" },
  removePhotoBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoBtn: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: tokens.colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: "700",
    color: tokens.colors.accentStrong,
    marginTop: 4,
  },
  slotsRow: {
    gap: 8,
  },
  slotPill: {
    backgroundColor: tokens.colors.surface,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  slotPillActive: {
    borderColor: tokens.colors.ink,
    backgroundColor: tokens.colors.ink,
  },
  slotText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
  },
  slotTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
