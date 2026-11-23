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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");

export default function AppSplashScreen({ onFinish }) {
  // Master Exit Fade
  const exitOpacity = useRef(new Animated.Value(1)).current;

  // Staged Choreography Values
  const emblemScale = useRef(new Animated.Value(0.85)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const haloOpacity = useRef(new Animated.Value(0)).current;
  const haloScale = useRef(new Animated.Value(0.7)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(14)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fluid staged entrance
    Animated.parallel([
      // Emblem Spring & Fade
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(emblemScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Ambient Halo Breathing
      Animated.timing(haloOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(haloScale, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // Title Reveal
      Animated.sequence([
        Animated.delay(250),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(titleY, {
            toValue: 0,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        // Subtitle Fade
        Animated.timing(tagOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Hairline Progress Bar
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    // 2. Smooth Exit after 1450ms
    const timer = setTimeout(() => {
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 1450);

    return () => clearTimeout(timer);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_WIDTH * 0.42],
  });

  return (
    <Animated.View style={[styles.screen, { opacity: exitOpacity }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0E0D0C"
        translucent
      />

      {/* Ambient Breathing Gold Halo */}
      <Animated.View
        style={[
          styles.haloGlow,
          {
            opacity: haloOpacity,
            transform: [{ scale: haloScale }],
          },
        ]}
      />

      {/* Center Stage */}
      <View style={styles.centerStage}>
        {/* Monogram Pedestal */}
        <Animated.View
          style={[
            styles.emblemCard,
            {
              opacity: emblemOpacity,
              transform: [{ scale: emblemScale }],
            },
          ]}
        >
          <Image
            source={require("../../assets/symbol-white.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Wordmark Typography */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          <Text style={styles.brandTitle}>ZYPHOR</Text>
        </Animated.View>

        {/* Laser Hairline Divider */}
        <Animated.View style={[styles.laserLine, { opacity: tagOpacity }]} />

        {/* Tagline */}
        <Animated.Text style={[styles.brandTagline, { opacity: tagOpacity }]}>
          CERTIFIED HARDWARE VAULT
        </Animated.Text>
      </View>

      {/* Bottom Progress Bar & Edition */}
      <View style={styles.bottomDock}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
        <Text style={styles.footerVersion}>ZYPHOR OS • 2.0 LUXURY EDITION</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    minHeight: SCREEN_HEIGHT,
    backgroundColor: "#0E0D0C", // Rich deep obsidian
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
  },
  haloGlow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(197, 168, 128, 0.08)",
  },
  centerStage: {
    alignItems: "center",
    justifyContent: "center",
  },
  emblemCard: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: "#181715",
    borderWidth: 1.5,
    borderColor: "#C5A880", // Champagne Gold
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C5A880",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 24,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  titleContainer: {
    alignItems: "center",
  },
  brandTitle: {
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
    fontSize: 32,
    fontWeight: "900",
    color: "#FAF8F5",
    letterSpacing: 8,
  },
  laserLine: {
    width: 44,
    height: 2,
    backgroundColor: "#C5A880",
    borderRadius: 1,
    marginTop: 14,
    marginBottom: 12,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: "800",
    color: "#A39E96",
    letterSpacing: 3,
    textAlign: "center",
  },
  bottomDock: {
    position: "absolute",
    bottom: 48,
    alignItems: "center",
  },
  progressTrack: {
    width: SCREEN_WIDTH * 0.42,
    height: 2,
    backgroundColor: "#252422",
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#C5A880",
  },
  footerVersion: {
    fontSize: 9.5,
    fontWeight: "700",
    color: "#6E6862",
    letterSpacing: 2,
  },
});
