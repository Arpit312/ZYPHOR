import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import { repairAPI } from "../../api/api";
import { Input, Btn } from "../../components/UI";

const SERVICES = [
  { id: "screen", title: "Screen Replacement", price: "₹1,499", icon: "phone-portrait-outline", color: T.primary, desc: "Original & high-grade OLED/LCD screens with warranty" },
  { id: "battery", title: "Battery Replacement", price: "₹899", icon: "battery-charging-outline", color: T.green, desc: "100% genuine health battery packs installed at doorstep" },
  { id: "motherboard", title: "Motherboard & IC Repair", price: "₹1,999", icon: "hardware-chip-outline", color: "#3B82F6", desc: "Expert micro-soldering for dead or water-damaged phones" },
  { id: "camera", title: "Camera & Lens Repair", price: "₹999", icon: "camera-outline", color: T.amber, desc: "Fix blurry focus, broken glass, or sensor errors" },
];

const BRANDS = ["Apple", "Samsung", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google", "Motorola"];

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
      const activeService = SERVICES.find(s => s.id === selectedService);
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
          <Ionicons name="checkmark-done" size={48} color={T.green} />
        </View>
        <Text style={styles.confirmedTitle}>Doorstep Repair Booked!</Text>
        <Text style={styles.confirmedSub}>
          A certified ZYPHOR Technician will arrive at your address with genuine replacement parts.
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
            <Text style={styles.ticketVal}>{SERVICES.find(s => s.id === selectedService)?.title}</Text>
          </View>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Estimated Charge</Text>
            <Text style={[styles.ticketVal, { color: T.green }]}>₹{confirmedTicket.estimatedPrice}</Text>
          </View>
        </View>

        <Btn
          title="Done / Back to Home"
          onPress={() => { setConfirmedTicket(null); navigation.navigate("Home"); }}
          style={{ width: "100%", marginTop: 24 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Doorstep Phone Repair</Text>
          <Text style={styles.headerSub}>Certified technicians at your home/office</Text>
        </View>
        <View style={styles.badgePill}>
          <Ionicons name="shield-checkmark" size={12} color={T.green} />
          <Text style={styles.badgeText}>6-Month Warranty</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
                  <View style={[styles.serviceIcon, { backgroundColor: s.color + "20" }]}>
                    <Ionicons name={s.icon} size={22} color={s.color} />
                  </View>
                  <Text style={[styles.serviceTitle, active && { color: "#fff" }]}>{s.title}</Text>
                  <Text style={styles.servicePrice}>From {s.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Brand Selector */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionHeading}>2. Device Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
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
          <Text style={styles.sectionHeading}>3. Address & Details</Text>

          <Input
            label="Exact Phone Model"
            placeholder="e.g. iPhone 13 Pro, Galaxy S23"
            value={model}
            onChangeText={setModel}
          />

          <Input
            label="Service Address"
            placeholder="House/Office Address, Landmark"
            value={address}
            onChangeText={setAddress}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Pincode"
                placeholder="400001"
                keyboardType="numeric"
                value={pincode}
                onChangeText={setPincode}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Contact Phone"
                placeholder="9876543210"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <Input
            label="Issue Remarks (Optional)"
            placeholder="e.g. Glass cracked, touch is responsive"
            value={notes}
            onChangeText={setNotes}
          />

          <Btn
            title={loading ? "Scheduling Technician..." : "Book Doorstep Repair"}
            loading={loading}
            onPress={handleBook}
            icon="construct"
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg.primary },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: T.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: T.text.primary },
  headerSub: { fontSize: 11, color: T.text.muted, marginTop: 2 },
  badgePill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: T.green + "20", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: "700", color: T.green },

  sectionWrap: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeading: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginBottom: 10 },

  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceCard: {
    width: "48%",
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  serviceCardActive: { borderColor: T.primary, backgroundColor: T.primary + "12" },
  serviceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  serviceTitle: { fontSize: 13, fontWeight: "700", color: T.text.secondary, marginBottom: 4 },
  servicePrice: { fontSize: 11, fontWeight: "700", color: T.primary },

  brandChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: T.bg.card, marginRight: 8, borderWidth: 1, borderColor: T.border.color },
  brandChipActive: { backgroundColor: T.primary, borderColor: T.primary },
  brandText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  brandTextActive: { color: "#fff" },

  formCard: {
    backgroundColor: T.bg.card,
    borderRadius: T.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: T.border.color,
  },

  confirmedWrap: { flex: 1, backgroundColor: T.bg.primary, padding: 24, alignItems: "center", justifyContent: "center" },
  successCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: T.green + "20", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  confirmedTitle: { fontSize: 22, fontWeight: "900", color: T.text.primary, textAlign: "center", marginBottom: 8 },
  confirmedSub: { fontSize: 13, color: T.text.muted, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  ticketCard: { width: "100%", backgroundColor: T.bg.card, borderRadius: T.radius.lg, padding: 16, borderWidth: 1, borderColor: T.border.color, gap: 10 },
  ticketRow: { flexDirection: "row", justifyContent: "space-between" },
  ticketLabel: { fontSize: 12, color: T.text.muted },
  ticketVal: { fontSize: 13, fontWeight: "700", color: T.text.primary },
});
