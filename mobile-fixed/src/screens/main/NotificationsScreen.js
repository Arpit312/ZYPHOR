import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Empty, Badge } from "../../components/UI";
import { notificationsAPI } from "../../api/api";

const TYPE_ICON = {
  order: "receipt-outline",
  repair: "construct-outline",
  listing: "cube-outline",
  subscription: "star-outline",
  support: "chatbubbles-outline",
  system: "notifications-outline",
};
const TYPE_COLOR = {
  order: T.primary,
  repair: T.amber,
  listing: T.blue,
  subscription: T.green,
  support: T.primary,
  system: T.secondary,
};

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await notificationsAPI.getAll();
      setItems(r.data.notifications || []);
      setUnread(r.data.unread || 0);
    } catch (err) {
      // keep stale list on network error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // live-ish polling every 30s
    return () => clearInterval(t);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const openNotification = async (n) => {
    if (!n.read) {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      notificationsAPI.markRead(n._id).catch(() => {});
    }
    // Deep-link payloads are stored as JSON: { screen: "OrderDetail", id: "..." }
    try {
      const link = n.link ? JSON.parse(n.link) : null;
      if (link?.screen) {
        const params = link.id ? { id: link.id, orderId: link.id, sellerId: link.id } : {};
        navigation.navigate(link.screen, params);
      }
    } catch {}
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnread(0);
    try {
      await notificationsAPI.readAll();
    } catch {}
  };

  const fmtDate = (d) => {
    try {
      return new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={T.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.sub}>{unread > 0 ? `${unread} unread` : "All caught up"}</Text>
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={T.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 60, flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Empty
                icon="notifications-off-outline"
                title="No notifications yet"
                sub="Order updates, repair progress and support replies will appear here in real time."
              />
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.cardUnread]}
              onPress={() => openNotification(item)}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={TYPE_ICON[item.type] || "notifications-outline"}
                  size={20}
                  color={TYPE_COLOR[item.type] || T.secondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read && <View style={styles.dot} />}
                </View>
                {!!item.body && (
                  <Text style={styles.cardBody} numberOfLines={2}>
                    {item.body}
                  </Text>
                )}
                <Text style={styles.time}>{fmtDate(item.createdAt)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={T.text.muted} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  title: { fontSize: 24, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },
  markAll: { fontSize: 12, fontWeight: "700", color: T.primary },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border.color,
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: { backgroundColor: T.bg.secondary, borderColor: T.border.active },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: T.bg.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: T.border.color,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: T.text.primary, flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary },
  cardBody: { fontSize: 12, color: T.text.secondary, marginTop: 3, lineHeight: 16 },
  time: { fontSize: 10, color: T.text.muted, marginTop: 4 },
});
