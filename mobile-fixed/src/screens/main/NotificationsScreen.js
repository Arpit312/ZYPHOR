import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tokens } from "../../theme/tokens";
import { Empty } from "../../components/UI";
import { notificationsAPI } from "../../api/api";

const TYPE_ICON = {
  order: "receipt-outline",
  repair: "construct-outline",
  listing: "cube-outline",
  subscription: "star-outline",
  support: "chatbubbles-outline",
  system: "notifications-outline",
};

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await notificationsAPI.getAll();
      setItems(res.data.notifications || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const markAllRead = async () => {
    try {
      await notificationsAPI.readAll();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.colors.surface} />

      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Activity & Alerts</Text>
          <Text style={styles.sub}>{items.length} notifications</Text>
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.markReadBtn} activeOpacity={0.7}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.colors.accentStrong} size="large" />
        </View>
      ) : items.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <Empty
            icon="notifications-off-outline"
            title="All caught up"
            sub="You'll receive notifications regarding orders, diagnostic audits, and escrow updates here."
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={tokens.colors.accentStrong}
            />
          }
          renderItem={({ item }) => {
            const iconName = TYPE_ICON[item.type] || "notifications-outline";
            return (
              <View style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
                <View style={styles.iconWrap}>
                  <Ionicons name={iconName} size={20} color={tokens.colors.accentStrong} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.topLine}>
                    <Text style={styles.notifTitle}>{item.title || "Alert"}</Text>
                    {!item.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMsg}>{item.message || item.body}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(item.createdAt || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.colors.canvas },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 52,
    paddingBottom: 14,
    backgroundColor: tokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.borderLight,
  },
  title: { fontSize: 24, fontWeight: "900", color: tokens.colors.ink },
  sub: { fontSize: 11.5, color: tokens.colors.textSecondary, marginTop: 2 },
  markReadBtn: { padding: 4 },
  markReadText: { fontSize: 12, fontWeight: "700", color: tokens.colors.accentStrong },

  notifCard: {
    flexDirection: "row",
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.colors.border,
    marginBottom: 10,
    ...tokens.shadow.card,
  },
  notifCardUnread: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.surface,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: tokens.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  topLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  notifTitle: { fontSize: 13.5, fontWeight: "800", color: tokens.colors.ink },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: tokens.colors.accentStrong,
  },
  notifMsg: { fontSize: 12, color: tokens.colors.textSecondary, lineHeight: 17, marginBottom: 4 },
  notifTime: { fontSize: 10, color: tokens.colors.textMuted },
});
