import React, { useContext, useEffect, useState } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, AuthContext } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import { WishlistProvider } from "./src/context/WishlistContext";
import { CompareProvider } from "./src/context/CompareContext";
import T from "./src/styles/theme";
import AppSplashScreen from "./src/components/AppSplashScreen";

// Auth Screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import SignupScreen from "./src/screens/auth/SignupScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";

// Main Screens
import HomeScreen from "./src/screens/main/HomeScreen";
import MarketplaceScreen from "./src/screens/main/MarketplaceScreen";
import PartsScreen from "./src/screens/main/PartsScreen";
import ListingDetailScreen from "./src/screens/main/ListingDetailScreen";
import CartScreen from "./src/screens/main/CartScreen";
import CheckoutScreen from "./src/screens/main/CheckoutScreen";
import RepairScreen from "./src/screens/main/RepairScreen";
import AIAdvisorScreen from "./src/screens/main/AIAdvisorScreen";
import PricingAgentScreen from "./src/screens/main/PricingAgentScreen";
import SellScreen from "./src/screens/main/SellScreen";
import IMEICheckScreen from "./src/screens/main/IMEICheckScreen";
import DashboardScreen from "./src/screens/main/DashboardScreen";
import ProfileScreen from "./src/screens/main/ProfileScreen";
import MyListingsScreen from "./src/screens/main/MyListingsScreen";
import MyOrdersScreen from "./src/screens/main/MyOrdersScreen";
import SubscriptionScreen from "./src/screens/main/SubscriptionScreen";
import AboutScreen from "./src/screens/main/AboutScreen";
import WishlistScreen from "./src/screens/main/WishlistScreen";
import NotificationsScreen from "./src/screens/main/NotificationsScreen";
import OrderDetailScreen from "./src/screens/main/OrderDetailScreen";
import AddressesScreen from "./src/screens/main/AddressesScreen";
import SupportScreen from "./src/screens/main/SupportScreen";
import CompareScreen from "./src/screens/main/CompareScreen";
import SellerScreen from "./src/screens/main/SellerScreen";
import RepairTicketsScreen from "./src/screens/main/RepairTicketsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

const SCREEN_OPT = {
  headerStyle: { backgroundColor: "#FFFFFF" },
  headerTintColor: T.primary,
  headerTitleStyle: { fontWeight: "700", color: T.text.primary, fontSize: 16 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: "#FFFFFF" },
};

// Common E-Commerce Stacks accessible everywhere
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IMEICheck" component={IMEICheckScreen} options={{ title: "IMEI Verification" }} />
      <Stack.Screen name="Advisor" component={AIAdvisorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PricingAgent" component={PricingAgentScreen} options={{ title: "AI Price Check" }} />
    </Stack.Navigator>
  );
}

function MarketStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Parts" component={PartsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function RepairStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="RepairMain" component={RepairScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function SellStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="SellMain" component={SellScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: "Subscription Plans" }} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: "My Listings" }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={SCREEN_OPT}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Edit Profile" }} />
      <Stack.Screen name="MyListings" component={MyListingsScreen} options={{ title: "My Listings" }} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ title: "Subscription Plans" }} />
      <Stack.Screen name="Advisor" component={AIAdvisorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PricingAgent" component={PricingAgentScreen} options={{ title: "AI Price Check" }} />
      <Stack.Screen name="IMEICheck" component={IMEICheckScreen} options={{ title: "IMEI Check" }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: "About ZYPHOR" }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: "Wishlist" }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "My Addresses" }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Compare" component={CompareScreen} options={{ title: "Compare Devices" }} />
      <Stack.Screen name="Seller" component={SellerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RepairTickets" component={RepairTicketsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: T.border.color,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: -2 },
        tabBarIcon: ({ color, size, focused }) => {
          const icons = {
            Home: focused ? "home" : "home-outline",
            Browse: focused ? "grid" : "grid-outline",
            Repair: focused ? "construct" : "construct-outline",
            Sell: focused ? "add-circle" : "add-circle-outline",
            Account: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name] || "ellipse"} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Browse" component={MarketStack} />
      <Tab.Screen name="Repair" component={RepairStack} />
      <Tab.Screen name="Sell" component={SellStack} />
      <Tab.Screen name="Account" component={AccountStack} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, loading, needsSubscription, clearNeedsSubscription } = useContext(AuthContext);

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

  const [showSplash, setShowSplash] = useState(true);

  if (loading || showSplash) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {user ? <TabNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <CompareProvider>
            <RootNavigator />
          </CompareProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
