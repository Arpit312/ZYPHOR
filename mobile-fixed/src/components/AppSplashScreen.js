import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { tokens } from "../theme/tokens";

const { width, height } = Dimensions.get("window");

export default function AppSplashScreen({ onFinish }) {
  // Master Exit Animation
  const exitFade = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // Staged Choreography Values
  const bgFade = useRef(new Animated.Value(0)).current;

  // Concentric Gold Rings
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  // Monogram & Emblem Card
  const emblemY = useRef(new Animated.Value(30)).current;
  const emblemScale = useRef(new Animated.Value(0.8)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const goldGlow = useRef(new Animated.Value(0)).current;

  // Shimmer Sweep
  const shimmerTranslate = useRef(new Animated.Value(-120)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;

  // Wordmark & Tracking
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(18)).current;
  const titleTracking = useRef(new Animated.Value(2)).current;

  // Laser Divider & Subtitle
  const dividerScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Bottom Telemetry & Progress Indicator
  const telemetryOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ambient Continuous Ring Rotation
    const ringLoop = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    ringLoop.start();

    // Pulse ambient gold glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(goldGlow, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(goldGlow, {
          toValue: 0.3,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // High-End Luxury Orchestration Sequence (~1650ms total)
    Animated.sequence([
      // Stage 1: Velvet Canvas & Orbital Gold Ring Entry (0 - 320ms)
      Animated.parallel([
        Animated.timing(bgFade, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Stage 2: Monogram Plinth Reveal with Champagne Accent (320 - 700ms)
      Animated.parallel([
        Animated.timing(emblemOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(emblemY, {
          toValue: 0,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.spring(emblemScale, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
      ]),

      // Stage 3: Light Sweep across Monogram & Sora Wordmark Reveal (700 - 1050ms)
      Animated.parallel([
        // Shimmer light beam sweep
        Animated.sequence([
          Animated.timing(shimmerOpacity, {
            toValue: 0.9,
            duration: 140,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerTranslate, {
            toValue: 130,
            duration: 420,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerOpacity, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ]),
        // Wordmark Glide & Kerning Expansion
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(titleTracking, {
          toValue: 8,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        // Champagne Laser Hairline Divider
        Animated.timing(dividerScale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Stage 4: Recommerce Tagline & Trust Telemetry Ticker (1050 - 1350ms)
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(telemetryOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),

      // Stage 5: Cinematic Velvet Dissolve (1350 - 1650ms)
      Animated.delay(220),
      Animated.parallel([
        Animated.timing(exitFade, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.05,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      ringLoop.stop();
      if (onFinish) onFinish();
    });
  }, []);

  const spin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitFade,
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#121110" translucent />

      {/* ── Top Architectural Header ── */}
      <Animated.View style={[styles.topHeader, { opacity: bgFade }]}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CERTIFIED RECOMMERCE</Text>
        </View>
        <Text style={styles.serialText}>45-PT HARDWARE VAULT</Text>
      </Animated.View>

      {/* ── Center Stage: Concentric Gold Rings & Sculpted Plinth ── */}
      <View style={styles.centerStage}>
        {/* Outer Champagne Orbital Ring */}
        <Animated.View
          style={[
            styles.orbitalRingOuter,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }, { rotate: spin }],
            },
          ]}
        />

        {/* Inner Solid Platinum Ring */}
        <Animated.View
          style={[
            styles.orbitalRingInner,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Ambient Gold Halo Glow */}
        <Animated.View
          style={[
            styles.haloGlow,
            {
              opacity: goldGlow,
            },
          ]}
        />

        {/* Sculpted Monogram Plinth */}
        <Animated.View
          style={[
            styles.pedestalCard,
            {
              opacity: emblemOpacity,
              transform: [{ translateY: emblemY }, { scale: emblemScale }],
            },
          ]}
        >
          <View style={styles.pedestalInner}>
            <Image
              source={require("../../assets/symbol-white.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* Shimmer Light Ray */}
            <Animated.View
              style={[
                styles.shimmerRay,
                {
                  opacity: shimmerOpacity,
                  transform: [{ translateX: shimmerTranslate }, { rotate: "25deg" }],
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Wordmark Typography */}
        <Animated.View
          style={[
            styles.titleWrap,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.brandTitle,
              {
                letterSpacing: titleTracking,
              },
            ]}
          >
            ZYPHOR
          </Animated.Text>
        </Animated.View>

        {/* Champagne Laser Hairline Divider */}
        <Animated.View
          style={[
            styles.laserDivider,
            {
              transform: [{ scaleX: dividerScale }],
            },
          ]}
        />

        {/* Recommerce Atelier Tagline */}
        <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
          <Text style={styles.taglineText}>
            CERTIFIED PRE-OWNED SMARTPHONES & PRECISION ELECTRONICS
          </Text>
        </Animated.View>
      </View>

      {/* ── Bottom Telemetry & Calibration Progress ── */}
      <View style={styles.bottomDock}>
        <Animated.View style={[styles.tickerRow, { opacity: telemetryOpacity }]}>
          <Text style={styles.tickerPill}>45-POINT AUDIT</Text>
          <View style={styles.tickerDivider} />
          <Text style={styles.tickerPill}>48-HR ESCROW</Text>
          <View style={styles.tickerDivider} />
          <Text style={styles.tickerPill}>6-MO WARRANTY</Text>
        </Animated.View>

        {/* Precision Champagne Progress Bar */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressInterpolate,
              },
            ]}
          />
        </View>

        <Text style={styles.footerVersion}>ZYPHOR OS • 2.0 LUXURY EDITION</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121110", // Deep velvet luxury ink
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 999999,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) + 20 : 54,
    paddingBottom: 42,
    paddingHorizontal: 24,
  },

  // Top Architectural Header
  topHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#1C1B19",
    borderWidth: 1,
    borderColor: "#34312D",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C5A880", // Champagne gold dot
  },
  liveText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#F4F1EC",
    letterSpacing: 1.3,
  },
  serialText: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#7C756D",
    letterSpacing: 1.2,
  },

  // Center Stage
  centerStage: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },

  // Halo Glow
  haloGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(197, 168, 128, 0.12)",
  },

  // Orbital Rings
  orbitalRingOuter: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: "rgba(197, 168, 128, 0.35)",
    borderStyle: "dashed",
  },
  orbitalRingInner: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: "#262421",
  },

  // Monogram Pedestal
  pedestalCard: {
    width: 104,
    height: 104,
    borderRadius: 26,
    backgroundColor: "#1C1B19",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#C5A880",
    shadowColor: "#C5A880",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
    overflow: "hidden",
    marginBottom: 26,
  },
  pedestalInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1C1B19",
  },
  logoImage: {
    width: 52,
    height: 52,
  },
  shimmerRay: {
    position: "absolute",
    width: 28,
    height: 160,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },

  // Wordmark Typography
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#F4F1EC",
    textAlign: "center",
  },
  laserDivider: {
    width: 48,
    height: 2,
    backgroundColor: "#C5A880", // Champagne gold hairline
    borderRadius: 1,
    marginVertical: 14,
  },
  taglineWrap: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  taglineText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#B3AAA0",
    letterSpacing: 2.2,
    textAlign: "center",
    lineHeight: 16,
  },

  // Bottom Telemetry Dock
  bottomDock: {
    width: "100%",
    alignItems: "center",
  },
  tickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  tickerPill: {
    fontSize: 9,
    fontWeight: "800",
    color: "#F4F1EC",
    letterSpacing: 1.1,
  },
  tickerDivider: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#C5A880",
  },
  progressTrack: {
    width: width * 0.46,
    height: 2.5,
    backgroundColor: "#262421",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#C5A880", // Champagne gold progress
  },
  footerVersion: {
    fontSize: 9,
    fontWeight: "700",
    color: "#7C756D",
    letterSpacing: 1.8,
  },
});
