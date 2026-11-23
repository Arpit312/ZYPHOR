import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Easing,
} from "react-native";
import T from "../styles/theme";

const { width, height } = Dimensions.get("window");

export default function AppSplashScreen({ onFinish }) {
  // Animation Values
  const masterFade = useRef(new Animated.Value(0)).current;
  const exitFade = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  // Concentric Orbital Ring
  const ringScale = useRef(new Animated.Value(0.75)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  // Pedestal & Emblem
  const emblemY = useRef(new Animated.Value(24)).current;
  const emblemScale = useRef(new Animated.Value(0.85)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;

  // Light Shimmer Sweep
  const shimmerTranslate = useRef(new Animated.Value(-120)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;

  // Typography & Monogram
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(16)).current;
  const titleTracking = useRef(new Animated.Value(2)).current;

  // Boutique Tagline & Divider
  const dividerScale = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const tickerOpacity = useRef(new Animated.Value(0)).current;

  // Precision Loading Progress Bar
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous subtle ring rotation
    Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Choreographed High-End Motion Sequence (~1450ms total)
    Animated.sequence([
      // Stage 1: Atmosphere & Orbital Ring Entry (0 - 300ms)
      Animated.parallel([
        Animated.timing(masterFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          friction: 7,
          tension: 35,
          useNativeDriver: true,
        }),
      ]),

      // Stage 2: Boutique Pedestal & Emblem Spring In (300 - 650ms)
      Animated.parallel([
        Animated.timing(emblemOpacity, {
          toValue: 1,
          duration: 320,
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
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Stage 3: Shimmer Light Sweep & Typography Reveal (650 - 950ms)
      Animated.parallel([
        // Shimmer ray across the emblem
        Animated.sequence([
          Animated.timing(shimmerOpacity, {
            toValue: 0.85,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerTranslate, {
            toValue: 120,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(shimmerOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        // Wordmark Glide & Tracking Expansion
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(titleTracking, {
          toValue: 7,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        // Fine Hairline Laser Divider
        Animated.timing(dividerScale, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),

      // Stage 4: Tagline & Boutique Inspection Ticker (950 - 1200ms)
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(tickerOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(progressWidth, {
          toValue: 1,
          duration: 400,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),

      // Stage 5: Cinematic Velvet Exit Dissolve (1200 - 1500ms)
      Animated.delay(180),
      Animated.parallel([
        Animated.timing(exitFade, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(exitScale, {
          toValue: 1.04,
          duration: 280,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
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
      {/* ── Top Boutique Header Index ── */}
      <Animated.View style={[styles.topHeader, { opacity: masterFade }]}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>FLAGSHIP ATELIER • BOOTH NO. 01</Text>
        </View>
        <Text style={styles.serialText}>REFURBISHED HARDWARE VAULT</Text>
      </Animated.View>

      {/* ── Center Stage: Orbital Rings & Pedestal Emblem ── */}
      <View style={styles.centerStage}>
        {/* Ambient Halo Ring 1 (Dashed Outer) */}
        <Animated.View
          style={[
            styles.orbitalRingOuter,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }, { rotate: spin }],
            },
          ]}
        />

        {/* Ambient Halo Ring 2 (Inner Solid Stone) */}
        <Animated.View
          style={[
            styles.orbitalRingInner,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Sculpted Plinth Pedestal Card */}
        <Animated.View
          style={[
            styles.pedestalCard,
            {
              opacity: emblemOpacity,
              transform: [{ translateY: emblemY }, { scale: emblemScale }],
            },
          ]}
        >
          {/* Subtle Ambient Plinth Shadow */}
          <View style={styles.pedestalPlinthInner}>
            <Image
              source={require("../../assets/symbol-dark.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* Shimmer Light Sweep Reflection */}
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

        {/* Architectural Laser Divider */}
        <Animated.View
          style={[
            styles.laserDivider,
            {
              transform: [{ scaleX: dividerScale }],
            },
          ]}
        />

        {/* Boutique Tagline */}
        <Animated.View style={[styles.taglineWrap, { opacity: taglineOpacity }]}>
          <Text style={styles.taglineText}>
            CERTIFIED ELECTRONICS • RECOMMERCE ATELIER
          </Text>
        </Animated.View>
      </View>

      {/* ── Bottom Telemetry & Progress Indicator ── */}
      <View style={styles.bottomDock}>
        <Animated.View style={[styles.tickerRow, { opacity: tickerOpacity }]}>
          <Text style={styles.tickerPill}>45-PT HARDWARE AUDIT</Text>
          <View style={styles.tickerDivider} />
          <Text style={styles.tickerPill}>ESCROW GUARANTEE</Text>
          <View style={styles.tickerDivider} />
          <Text style={styles.tickerPill}>OEM CERTIFIED</Text>
        </Animated.View>

        {/* Precision Progress Track */}
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

        <Text style={styles.footerVersion}>EDITION 2026 • SCANDINAVIAN LUXURY</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 99999,
    paddingVertical: 56,
    paddingHorizontal: 28,
  },

  // Top Boutique Header
  topHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F6F5F3",
    borderWidth: 1,
    borderColor: "#E9E7E5",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A34A",
  },
  liveText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#181818",
    letterSpacing: 1.2,
  },
  serialText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#787878",
    letterSpacing: 1.1,
  },

  // Center Stage
  centerStage: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },

  // Orbital Rings
  orbitalRingOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "#E9E7E5",
    borderStyle: "dashed",
  },
  orbitalRingInner: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    borderColor: "#F0EFEB",
  },

  // Sculpted Pedestal Card
  pedestalCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9E7E5",
    shadowColor: "#181818",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    overflow: "hidden",
    marginBottom: 26,
  },
  pedestalPlinthInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAF9F7",
  },
  logoImage: {
    width: 54,
    height: 54,
  },
  shimmerRay: {
    position: "absolute",
    width: 26,
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },

  // Typography
  titleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#181818",
    textAlign: "center",
  },
  laserDivider: {
    width: 44,
    height: 2,
    backgroundColor: "#181818",
    borderRadius: 1,
    marginVertical: 12,
  },
  taglineWrap: {
    alignItems: "center",
  },
  taglineText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#787878",
    letterSpacing: 2.2,
    textAlign: "center",
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
    fontWeight: "700",
    color: "#181818",
    letterSpacing: 0.8,
  },
  tickerDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#C5A880",
  },
  progressTrack: {
    width: width * 0.44,
    height: 2,
    backgroundColor: "#E9E7E5",
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#181818",
  },
  footerVersion: {
    fontSize: 9,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 1.5,
  },
});
