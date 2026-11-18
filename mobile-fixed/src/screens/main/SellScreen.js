import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import T from "../../styles/theme";
import { Btn, Input } from "../../components/UI";
import { listingsAPI, aiAPI, uploadAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const CONDITIONS = ["Pristine", "Excellent", "Good", "Fair"];
const TYPES = [
  { v: "device", l: "Smartphone" },
  { v: "part", l: "OEM Spare Part" },
];
const STORAGE = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const RAM = ["4GB", "6GB", "8GB", "12GB", "16GB"];
const PART_CATEGORIES = ["Screen", "Battery", "Charger", "Camera", "Speaker", "Back Glass", "Motherboard"];

export default function SellScreen({ navigation }) {
  const { user } = useAuth();
  const [type, setType] = useState("device");
  const [partCategory, setPartCategory] = useState(PART_CATEGORIES[0]);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    price: "",
    storage: "128GB",
    ram: "8GB",
    conditionGrade: "Pristine",
    city: user?.city || "",
    description: "",
    imei: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoadingPrice, setAiLoadingPrice] = useState(false);
  const [aiLoadingImei, setAiLoadingImei] = useState(false);
  const [aiPriceHint, setAiPriceHint] = useState(null);
  const [imeiVerification, setImeiVerification] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to photos");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
      aspect: [4, 3],
    });
    if (result.canceled || !result.assets?.length) return;

    setUploadingImages(true);
    try {
      const uploaded = [];
      for (const asset of result.assets.slice(0, 5 - images.length)) {
        const formData = new FormData();
        const uriParts = asset.uri.split(".");
        const ext = uriParts[uriParts.length - 1] || "jpg";
        formData.append("file", {
          uri: asset.uri,
          name: `photo_${Date.now()}.${ext}`,
          type: `image/${ext === "jpg" ? "jpeg" : ext}`,
        });
        const res = await uploadAPI.uploadImage(formData);
        if (res.data?.url) uploaded.push(res.data.url);
      }
      if (uploaded.length) setImages((prev) => [...prev, ...uploaded].slice(0, 5));
    } catch (e) {
      Alert.alert("Upload issue", "Could not upload images. Check connection.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.price) {
      Alert.alert("Missing info", "Please enter Brand, Model, and Price.");
      return;
    }
    if (isNaN(Number(form.price)) || Number(form.price) < 100) {
      Alert.alert("Invalid price", "Please enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      await listingsAPI.create({
        ...form,
        listingType: type,
        price: Number(form.price),
        images,
        city: form.city || user?.city,
        tags: type === "part" ? [partCategory] : [],
      });
      Alert.alert("🎉 Listed Successfully", "Your item is now live in the marketplace.", [
        { text: "View Listings", onPress: () => navigation.navigate("MyListings") },
      ]);
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to create listing";
      if (e.response?.data?.needsSubscription) navigation.navigate("Subscription");
      else Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const getAiPrice = async () => {
    if (!form.brand || !form.model) {
      Alert.alert("Missing info", "Enter Brand and Model first.");
      return;
    }
    setAiLoadingPrice(true);
    try {
      const res = await aiAPI.pricing({
        brand: form.brand,
        model: form.model,
        storage: form.storage,
        ram: form.ram,
        condition: form.conditionGrade,
        city: form.city,
      });
      setAiPriceHint(res.data);
    } catch (e) {
      Alert.alert("Error", "Could not fetch AI price suggestion");
    } finally {
      setAiLoadingPrice(false);
    }
  };

  const verifyImei = async () => {
    if (!form.imei || form.imei.length < 15) {
      Alert.alert("Invalid IMEI", "Enter a 15-digit IMEI number");
      return;
    }
    setAiLoadingImei(true);
    try {
      const res = await aiAPI.verifyImei({ imei: form.imei });
      setImeiVerification(res.data);
    } catch (e) {
      Alert.alert("Error", "Could not verify IMEI");
    } finally {
      setAiLoadingImei(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>List an Item</Text>
        <Text style={styles.sub}>Publish certified smartphones or genuine parts</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Type Toggle Pills */}
        <View style={styles.typeRow}>
          {TYPES.map((t) => {
            const active = type === t.v;
            return (
              <TouchableOpacity
                key={t.v}
                onPress={() => setType(t.v)}
                style={[styles.typeBtn, active && styles.typeBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>{t.l}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Photos Upload Gallery */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Product Photos (Up to 5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, marginTop: 10 }}>
            {images.map((img, i) => (
              <View key={i} style={styles.imgThumb}>
                <Image source={{ uri: img }} style={styles.imgThumbImg} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.imgRemove}
                  onPress={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                >
                  <Ionicons name="close-circle" size={20} color={T.primary} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity style={styles.addImg} onPress={pickImage} disabled={uploadingImages}>
                {uploadingImages ? (
                  <ActivityIndicator size="small" color={T.primary} />
                ) : (
                  <Ionicons name="camera-outline" size={24} color={T.text.secondary} />
                )}
                <Text style={styles.addImgText}>{uploadingImages ? "Uploading..." : "Add Photo"}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Form Details Card */}
        <View style={styles.card}>
          <Input
            label="Brand Name *"
            placeholder="e.g. Apple, Samsung, OnePlus"
            value={form.brand}
            onChangeText={set("brand")}
            icon="business-outline"
          />
          <Input
            label="Model Name *"
            placeholder="e.g. iPhone 15 Pro, Galaxy S24"
            value={form.model}
            onChangeText={set("model")}
            icon="hardware-chip-outline"
          />

          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Asking Price (₹) *"
                placeholder="48000"
                value={form.price}
                onChangeText={set("price")}
                keyboardType="numeric"
                icon="pricetag-outline"
              />
            </View>
            <TouchableOpacity onPress={getAiPrice} style={styles.aiPriceBtn} disabled={aiLoadingPrice}>
              <Ionicons name="sparkles-outline" size={15} color={T.primary} />
              <Text style={styles.aiPriceBtnText}>{aiLoadingPrice ? "Checking..." : "AI Value"}</Text>
            </TouchableOpacity>
          </View>

          {aiPriceHint && (
            <View style={styles.aiHintBox}>
              <Text style={styles.aiHintTitle}>AI Fair Resale Estimate</Text>
              <Text style={styles.aiHintVal}>Recommended: ₹{aiPriceHint.recommendedPrice?.toLocaleString()}</Text>
              <Text style={styles.aiHintRange}>
                Range: ₹{aiPriceHint.minPrice?.toLocaleString()} – ₹{aiPriceHint.maxPrice?.toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => set("price")(String(aiPriceHint.recommendedPrice))}
                style={{ marginTop: 6 }}
              >
                <Text style={styles.usePriceText}>Apply this price →</Text>
              </TouchableOpacity>
            </View>
          )}

          {type === "device" && (
            <>
              <Text style={styles.sectionLabel}>Internal Storage</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {STORAGE.map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => set("storage")(s)}
                    style={[styles.chip, form.storage === s && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, form.storage === s && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>RAM Configuration</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {RAM.map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => set("ram")(r)}
                    style={[styles.chip, form.ram === r && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, form.ram === r && styles.chipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionLabel}>Condition Grade</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {CONDITIONS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => set("conditionGrade")(c)}
                    style={[styles.chip, form.conditionGrade === c && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, form.conditionGrade === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* IMEI Verification */}
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="IMEI Number (Optional)"
                    placeholder="15-digit hardware IMEI"
                    value={form.imei}
                    onChangeText={(v) => set("imei")(v.replace(/\D/g, "").slice(0, 15))}
                    keyboardType="numeric"
                    icon="scan-outline"
                  />
                </View>
                <TouchableOpacity
                  onPress={verifyImei}
                  style={styles.aiPriceBtn}
                  disabled={aiLoadingImei || form.imei.length < 15}
                >
                  <Ionicons name="shield-checkmark-outline" size={15} color={T.primary} />
                  <Text style={styles.aiPriceBtnText}>{aiLoadingImei ? "Verifying..." : "Verify"}</Text>
                </TouchableOpacity>
              </View>

              {imeiVerification && (
                <View style={styles.aiHintBox}>
                  <Text style={[styles.aiHintVal, { color: imeiVerification.valid ? T.green : T.red }]}>
                    {imeiVerification.message}
                  </Text>
                  {imeiVerification.ceirStatus && (
                    <Text style={styles.aiHintRange}>CEIR Registry: {imeiVerification.ceirStatus}</Text>
                  )}
                </View>
              )}
            </>
          )}

          {type === "part" && (
            <>
              <Text style={styles.sectionLabel}>Part Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {PART_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setPartCategory(cat)}
                    style={[styles.chip, partCategory === cat && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, partCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <Input
            label="Condition Details & Notes"
            placeholder="Battery health, original box, accessories included…"
            value={form.description}
            onChangeText={set("description")}
            multiline
            numberOfLines={3}
          />

          <Btn
            title={loading ? "Publishing Listing..." : "Publish Listing to Marketplace →"}
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  title: { fontSize: 28, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 13, color: T.text.secondary, marginTop: 2 },

  scroll: { padding: 20, paddingBottom: 60 },

  typeRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  typeBtnActive: { backgroundColor: T.primary, borderColor: T.primary },
  typeBtnText: { fontSize: 13, fontWeight: "600", color: T.text.secondary },
  typeBtnTextActive: { color: "#FFFFFF" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 18,
    ...T.shadow.card,
  },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: T.text.secondary, marginBottom: 8, marginTop: 4 },

  imgThumb: { width: 76, height: 76, borderRadius: 12, overflow: "hidden", position: "relative" },
  imgThumbImg: { width: "100%", height: "100%" },
  imgRemove: { position: "absolute", top: 2, right: 2, backgroundColor: "#FFFFFF", borderRadius: 10 },
  addImg: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addImgText: { fontSize: 10, color: T.text.secondary, fontWeight: "600" },

  aiPriceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border.color,
    marginBottom: 14,
  },
  aiPriceBtnText: { fontSize: 12, fontWeight: "700", color: T.primary },

  aiHintBox: {
    backgroundColor: T.bg.secondary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  aiHintTitle: { fontSize: 11, fontWeight: "700", color: T.text.secondary, textTransform: "uppercase" },
  aiHintVal: { fontSize: 14, fontWeight: "800", color: T.text.primary, marginTop: 2 },
  aiHintRange: { fontSize: 11, color: T.text.secondary, marginTop: 2 },
  usePriceText: { fontSize: 12, fontWeight: "700", color: T.primary },

  chipsScroll: { gap: 8, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: T.bg.secondary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  chipActive: { backgroundColor: T.primary, borderColor: T.primary },
  chipText: { fontSize: 12, fontWeight: "600", color: T.text.secondary },
  chipTextActive: { color: "#FFFFFF" },
});
