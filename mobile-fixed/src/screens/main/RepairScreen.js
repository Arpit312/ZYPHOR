import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { repairAPI } from "../../api/api";
import { Input, Btn } from "../../components/UI";

const SERVICES = [
  { id: "screen", title: "Screen Replacement", price: "₹1,499", icon: "phone-portrait-outline", desc: "Original OEM OLED/LCD with touch calibration" },
  { id: "battery", title: "Battery Replacement", price: "₹899", icon: "battery-charging-outline", desc: "100% factory health pack installed at doorstep" },
  { id: "motherboard", title: "Motherboard & IC", price: "₹1,999", icon: "hardware-chip-outline", desc: "Micro-soldering & diagnostics for complex faults" },
  { id: "camera", title: "Camera & Optical Lens", price: "₹999", icon: "camera-outline", desc: "Original sensor module & sapphire glass repair" },
];

const BRANDS = ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Realme", "Vivo", "Oppo"];

export default function RepairScreen({ navigation }) {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState("screen");
  const [brand, setBrand] = useState("Apple");
  const [model, setModel] = useState("");
  const [address, setAddress] = useState(user?.city || "");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  const handleBook = async () => {
    if (!model.trim() || !pincode.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Required Fields", "Please provide Phone Model, Address, Pincode and Contact Phone.");
      return;
    }

    setLoading(true);
    try {
      const activeService = SERVICES.find((s) => s.id === selectedService);
      const res = await repairAPI.book({
        brand,
        model: model.trim(),
        issue: `${activeService?.title}: ${notes || "Doorstep inspection"}`,
        pincode: pincode.trim(),
        address: address.trim(),
        contactPhone: phone.trim(),
        estimatedPrice: parseInt(activeService?.price.replace(/[^0-9]/g, "") || "999", 10),
      });

      if (res.data.success && res.data.ticket) {
        setConfirmedTicket(res.data.ticket);
      } else {
        Alert.alert("Booking Error", "Could not schedule repair.");
      }
    } catch (err) {
      Alert.alert("Booking Failed", err.response?.data?.error || "Server connection issue.");
    } finally {
      setLoading(false);
    }
  };

  if (confirmedTicket) {
    return (
      <View style={styles.confirmedWrap}>
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-sharp" size={36} color="#FFFFFF" />
        </View>
        <Text style={styles.confirmedTitle}>Repair Scheduled</Text>
        <Text style={styles.confirmedSub}>
          A certified ZYPHOR Technician will arrive at your location with genuine OEM replacement parts.
        </Text>

        <View style={styles.ticketCard}>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Ticket ID</Text>
            <Text style={styles.ticketVal}>{confirmedTicket.ticketNumber}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Device</Text>
            <Text style={styles.ticketVal}>{confirmedTicket.brand} {confirmedTicket.model}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Service</Text>
            <Text style={styles.ticketVal}>{SERVICES.find((s) => s.id === selectedService)?.title}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Estimated Price</Text>
            <Text style={[styles.ticketVal, { color: T.primary, fontWeight: "900" }]}>₹{confirmedTicket.estimatedPrice}</Text>
          </View>
        </View>

        <Btn
          title="Back to Home →"
          onPress={() => {
            setConfirmedTicket(null);
            navigation.navigate("Home");
          }}
          style={{ width: "100%", marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Doorstep Repair</Text>
          <Text style={styles.headerSub}>Certified engineers arrive at your home or office</Text>
        </View>
        <View style={styles.badgePill}>
          <Text style={styles.badgeText}>6M WARRANTY</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Service Type Selection */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>1. Select Repair Service</Text>
          <View style={styles.serviceGrid}>
            {SERVICES.map((s) => {
              const active = selectedService === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedService(s.id)}
                  style={[styles.serviceCard, active && styles.serviceCardActive]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.serviceIcon, active && styles.serviceIconActive]}>
                    <Ionicons name={s.icon} size={20} color={active ? "#FFFFFF" : T.primary} />
                  </View>
                  <Text style={[styles.serviceTitle, active && { color: T.text.primary, fontWeight: "700" }]}>
                    {s.title}
                  </Text>
                  <Text style={styles.servicePrice}>From {s.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Brand Selector */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>2. Device Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 8 }}>
            {BRANDS.map((b) => (
              <TouchableOpacity
                key={b}
                onPress={() => setBrand(b)}
                style={[styles.brandChip, brand === b && styles.brandChipActive]}
              >
                <Text style={[styles.brandText, brand === b && styles.brandTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Booking Details Form */}
        <View style={[styles.sectionWrap, styles.formCard]}>
          <Text style={styles.sectionHeading}>3. Address & Model</Text>

          <Input
            label="Phone Model *"
            placeholder="e.g. iPhone 14 Pro, Galaxy S23"
            value={model}
            onChangeText={setModel}
            icon="hardware-chip-outline"
          />

          <Input
            label="Service Location *"
            placeholder="Home/Office address with landmark"
            value={address}
            onChangeText={setAddress}
            icon="home-outline"
          />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="PIN Code *"
                placeholder="400001"
                keyboardType="numeric"
                value={pincode}
                onChangeText={setPincode}
                icon="pin-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Contact Phone *"
                placeholder="10-digit number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                icon="call-outline"
              />
            </View>
          </View>

          <Input
            label="Fault Remarks (Optional)"
            placeholder="e.g. Glass shattered, display working"
            value={notes}
            onChangeText={setNotes}
            icon="document-text-outline"
          />

          <Btn
            title={loading ? "Scheduling Service..." : "Schedule Doorstep Engineer →"}
            onPress={handleBook}
            loading={loading}
            style={{ marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: T.text.primary, letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },
  badgePill: {
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: T.text.primary, letterSpacing: 0.5 },

  sectionWrap: { paddingHorizontal: 20, marginTop: 22 },
  sectionHeading: { fontSize: 14, fontWeight: "800", color: T.text.primary, letterSpacing: 0.2, marginBottom: 10 },

  serviceGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  serviceCard: {
    width: "48%",
    backgroundColor: T.bg.secondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: T.border.color,
  },
  serviceCardActive: {
    backgroundColor: "#FFFFFF",
    borderColor: T.primary,
    ...T.shadow.card,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  serviceIconActive: { backgroundColor: T.primary, borderColor: T.primary },
  serviceTitle: { fontSize: 13, fontWeight: "600", color: T.text.secondary, marginBottom: 3 },
  servicePrice: { fontSize: 12, fontWeight: "800", color: T.text.primary },

  brandChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  brandChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  brandText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  brandTextActive: { color: "#FFFFFF" },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: T.border.color,
    marginTop: 22,
    marginHorizontal: 20,
    ...T.shadow.card,
  },

  confirmedWrap: { flex: 1, backgroundColor: "#FFFFFF", padding: 24, justifyContent: "center", alignItems: "center" },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  confirmedTitle: { fontSize: 24, fontWeight: "900", color: T.text.primary, textAlign: "center" },
  confirmedSub: { fontSize: 13, color: T.text.secondary, textAlign: "center", marginTop: 8, lineHeight: 20, marginBottom: 24 },
  ticketCard: {
    width: "100%",
    backgroundColor: T.bg.secondary,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: T.border.color,
    gap: 12,
  },
  ticketRow: { flexDirection: "row", justifyContent: "space-between" },
  ticketLabel: { fontSize: 13, color: T.text.secondary },
  ticketVal: { fontSize: 13, fontWeight: "700", color: T.text.primary },
});
