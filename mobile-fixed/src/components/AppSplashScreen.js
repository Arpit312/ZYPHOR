import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import T from "../styles/theme";

const { width } = Dimensions.get("window");

export default function AppSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const exitFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1-second Luxury Motion Sequence
    Animated.sequence([
      // 1. Logo Scale & Fade in (0 - 550ms)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Tagline Fade in (550 - 850ms)
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // 3. Graceful Exit Fade (850 - 1100ms)
      Animated.timing(exitFade, {
        toValue: 0,
        duration: 250,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) onFinish();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: exitFade }]}>
      <Animated.View
        style={[
          styles.logoWrap,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/symbol-dark.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>ZYPHOR</Text>
      </Animated.View>

      <Animated.View style={[styles.taglineWrap, { opacity: taglineFade }]}>
        <Text style={styles.taglineText}>CERTIFIED ELECTRONICS • RECOMMERCE</Text>
        <View style={styles.accentBar} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#181818",
    letterSpacing: 6,
  },
  taglineWrap: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
  },
  taglineText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#787878",
    letterSpacing: 2.5,
  },
  accentBar: {
    width: 36,
    height: 2,
    backgroundColor: "#181818",
    marginTop: 8,
    borderRadius: 1,
  },
});
