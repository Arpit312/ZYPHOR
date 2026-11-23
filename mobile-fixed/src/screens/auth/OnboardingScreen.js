import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Btn } from "../../components/UI";
import { useTranslation } from "../../i18n/I18nContext";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "shield-checkmark",
    badge: "PRECISION STANDARDS",
    title: "45-Point Certified\nElectronics",
    subtitle:
      "Every device rigorously verified across display, battery health, FaceID, logic board, and 100% genuine OEM components.",
    color: tokens.colors.accent,
  },
  {
    id: "2",
    icon: "lock-closed",
    badge: "ZERO RISK BUYING",
    title: "48-Hour Escrow\nProtection",
    subtitle:
      "Your payment stays locked in secure escrow until you hold, test, and approve your device. Return hassle-free if not delighted.",
    color: tokens.colors.success,
  },
  {
    id: "3",
    icon: "flash",
    badge: "EFFORTLESS UPGRADE",
    title: "Instant AI Valuation\n& Doorstep Pickup",
    subtitle:
      "Sell your old phone in 60 seconds. Guaranteed AI price calculation, free same-day doorstep technician pickup, and instant UPI payout.",
    color: tokens.colors.accentStrong,
  },
];

export default function OnboardingScreen({ navigation, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const { t, locale, toggleLocale } = useTranslation();

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    if (onComplete) {
      onComplete();
    } else if (navigation?.replace) {
      navigation.replace("Login");
    } else if (navigation?.navigate) {
      navigation.navigate("Login");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Visual Plinth Backdrop */}
      <View style={styles.iconPlinth}>
        <View style={styles.iconInner}>
          <Ionicons name={item.icon} size={54} color={tokens.colors.accent} />
        </View>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{item.badge}</Text>
        </View>
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.canvas} />

      {/* Top Bar with Language Toggle & Skip */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={toggleLocale} style={styles.langPill} activeOpacity={0.75}>
          <Ionicons name="globe-outline" size={14} color={tokens.colors.ink} />
          <Text style={styles.langText}>{locale === "en" ? "EN / HI" : "HI / EN"}</Text>
        </TouchableOpacity>

        {currentIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={finishOnboarding} style={styles.skipBtn} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(idx);
        }}
        contentContainerStyle={{ alignItems: "center" }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Pagination Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                currentIndex === i && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Btn
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          variant={currentIndex === SLIDES.length - 1 ? "gold" : "primary"}
          style={styles.ctaBtn}
          rightIcon={currentIndex === SLIDES.length - 1 ? "arrow-forward" : "chevron-forward"}
        />

        <Text style={styles.trustFooter}>
          6-Month Warranty • 48-Hour Approval • Escrow Safe
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 54,
    zIndex: 10,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: tokens.colors.border,
  },
  langText: {
    fontSize: 12,
    fontWeight: "700",
    color: tokens.colors.ink,
  },
  skipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
    color: tokens.colors.textSecondary,
  },
  slide: {
    width: width,
    alignItems: "center",
    paddingHorizontal: 36,
    justifyContent: "center",
  },
  iconPlinth: {
    alignItems: "center",
    marginBottom: 36,
  },
  iconInner: {
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: tokens.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: tokens.colors.border,
    ...tokens.shadow.card,
  },
  badgePill: {
    marginTop: -14,
    backgroundColor: tokens.colors.ink,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.colors.accent,
  },
  badgePillText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: tokens.colors.accent,
    letterSpacing: 1,
  },
  slideTitle: {
    fontFamily: tokens.fonts.displayBold,
    fontSize: 26,
    lineHeight: 34,
    color: tokens.colors.ink,
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontFamily: tokens.fonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: tokens.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: tokens.colors.accent,
  },
  ctaBtn: {
    width: "100%",
    marginBottom: 14,
  },
  trustFooter: {
    fontSize: 11,
    color: tokens.colors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
