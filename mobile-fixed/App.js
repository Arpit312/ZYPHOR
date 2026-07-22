import React, { useContext, useEffect } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import T from "./src/styles/theme";

import LoginScreen       from "./src/screens/auth/LoginScreen";
import SignupScreen      from "./src/screens/auth/SignupScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import HomeScreen        from "./src/screens/main/HomeScreen";
import MarketplaceScreen from "./src/screens/main/MarketplaceScreen";
import PartsScreen       from "./src/screens/main/PartsScreen";
import ListingDetailScreen from "./src/screens/main/ListingDetailScreen";
import AIAdvisorScreen   from "./src/screens/main/AIAdvisorScreen";
import PricingAgentScreen from "./src/screens/main/PricingAgentScreen";
import SellScreen        from "./src/screens/main/SellScreen";
import IMEICheckScreen   from "./src/screens/main/IMEICheckScreen";
import DashboardScreen   from "./src/screens/main/DashboardScreen";
import ProfileScreen     from "./src/screens/main/ProfileScreen";
import MyListingsScreen  from "./src/screens/main/MyListingsScreen";
import MyOrdersScreen    from "./src/screens/main/MyOrdersScreen";
import SubscriptionScreen from "./src/screens/main/SubscriptionScreen";
import AboutScreen       from "./src/screens/main/AboutScreen";

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

const SCREEN_OPT = {
  headerStyle: { backgroundColor: T.bg.secondary },
  headerTintColor: T.primary,
  headerTitleStyle: { fontWeight: "700", color: T.text.primary },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: T.bg.primary },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="HomeMain"       component={HomeScreen}          options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail"  component={ListingDetailScreen} options={{ title: "Device Details", headerShown: false }} />
      <Stack.Screen name="IMEICheck"      component={IMEICheckScreen}     options={{ title: "IMEI Verification" }} />
    </Stack.Navigator>
  );
}

function MarketStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="Marketplace"    component={MarketplaceScreen}   options={{ headerShown: false }} />
      <Stack.Screen name="Parts"          component={PartsScreen}         options={{ title: "Parts Market" }} />
      <Stack.Screen name="ListingDetail"  component={ListingDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AIStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="Advisor"       component={AIAdvisorScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="PricingAgent"  component={PricingAgentScreen} options={{ title: "AI Price Check" }} />
      <Stack.Screen name="IMEICheck"     component={IMEICheckScreen}    options={{ title: "IMEI Verify" }} />
    </Stack.Navigator>
  );
}

function SellStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="SellMain"      component={SellScreen}          options={{ headerShown: false }} />
      <Stack.Screen name="Subscription"  component={SubscriptionScreen}  options={{ title: "Subscription Plans" }} />
      <Stack.Screen name="MyListings"    component={MyListingsScreen}    options={{ title: "My Listings" }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="Dashboard"     component={DashboardScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="Profile"       component={ProfileScreen}      options={{ title: "Edit Profile" }} />
      <Stack.Screen name="MyListings"    component={MyListingsScreen}   options={{ title: "My Listings" }} />
      <Stack.Screen name="MyOrders"      component={MyOrdersScreen}     options={{ title: "My Orders" }} />
      <Stack.Screen name="Subscription"  component={SubscriptionScreen} options={{ title: "Subscription Plans" }} />
      <Stack.Screen name="IMEICheck"     component={IMEICheckScreen}    options={{ title: "IMEI Check" }} />
      <Stack.Screen name="About"         component={AboutScreen}        options={{ title: "About ZYPHOR" }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.text.muted,
        tabBarStyle: {
          backgroundColor: T.bg.secondary,
          borderTopColor: T.border.color,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home:        focused ? "home"        : "home-outline",
            Browse:      focused ? "list"         : "list-outline",
            "AI Tools":  focused ? "sparkles"     : "sparkles-outline",
            Sell:        focused ? "add-circle"   : "add-circle-outline",
            Account:     focused ? "person"       : "person-outline",
          };
          return <Ionicons name={icons[route.name] || "ellipse"} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"      component={HomeStack} />
      <Tab.Screen name="Browse"    component={MarketStack} />
      <Tab.Screen name="AI Tools"  component={AIStack} />
      <Tab.Screen name="Sell"      component={SellStack} />
      <Tab.Screen name="Account"   component={AccountStack} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"  component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, needsSubscription, clearNeedsSubscription } = useContext(AuthContext);

  // Right after a retailer/wholesaler/technician signs up, the Tab navigator
  // mounts fresh (AuthStack unmounts). Imperatively hop to the Subscription
  // screen once navigation is ready, instead of relying on a stale `navigation`
  // reference from the just-unmounted AuthStack (that used to silently fail).
  useEffect(() => {
    if (!user || !needsSubscription) return;
    let cancelled = false;
    const tryNavigate = () => {
      if (cancelled) return;
      if (navigationRef.isReady()) {
        navigationRef.navigate("Account", { screen: "Subscription" });
        clearNeedsSubscription();
      } else {
        setTimeout(tryNavigate, 100);
      }
    };
    tryNavigate();
    return () => { cancelled = true; };
  }, [user, needsSubscription]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bg.primary }}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg.primary} />
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
