import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const isSecureAvailable = Platform.OS !== "web";

export const storage = {
  async getItem(key) {
    try {
      if (isSecureAvailable && key === "token") {
        const val = await SecureStore.getItemAsync(key);
        if (val) return val;
      }
      return await AsyncStorage.getItem(key);
    } catch {
      return await AsyncStorage.getItem(key);
    }
  },

  async setItem(key, value) {
    try {
      if (isSecureAvailable && key === "token") {
        await SecureStore.setItemAsync(key, value);
      }
      await AsyncStorage.setItem(key, value);
    } catch {
      await AsyncStorage.setItem(key, value);
    }
  },

  async removeItem(key) {
    try {
      if (isSecureAvailable && key === "token") {
        await SecureStore.deleteItemAsync(key);
      }
      await AsyncStorage.removeItem(key);
    } catch {
      await AsyncStorage.removeItem(key);
    }
  },

  async multiRemove(keys) {
    for (const k of keys) {
      await this.removeItem(k);
    }
  },
};

export default storage;
