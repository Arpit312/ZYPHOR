import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Empty, Badge, Btn } from "../../components/UI";
import { repairAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLOR = {
  pending: T.amber,
  assigned: T.blue,
  in_repair: T.primary,
  completed: T.green,
  cancelled: T.red,
};
// Mirrors TECH_TRANSITIONS in repairRoutes.js
const STAFF_NEXT = {
  pending: ["assigned", "cancelled"],
  assigned: ["in_repair", "cancelled"],
  in_repair: ["completed", "cancelled"],
};
const NEXT_LABEL = {
  assigned: "Assign to me",
  in_repair: "Start repair",
  completed: "Mark completed",
  cancelled: "Cancel ticket",
};

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

export default function RepairTicketsScreen({ navigation }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState("");

  const isStaff = user?.role === "technician" || user?.role === "admin";

  const load = useCallback(async () => {
    try {
      const r = await repairAPI.getAll();
      setTickets(r.data.tickets || []);
    } catch (err) {
      if (err.response?.status !== 401)
        Alert.alert("Error", err.response?.data?.error || "Could not load repair tickets.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const changeStatus = (ticket, next) => {
    Alert.alert(NEXT_LABEL[next] || next, `Ticket ${ticket.ticketNumber} → '${next}'?`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: next === "cancelled" ? "destructive" : "default",
        onPress: async () => {
          setBusy(ticket._id + next);
          try {
            const r = await repairAPI.updateStatus(ticket._id, { orderStatus: next, status: next });
            setTickets((prev) => prev.map((t) => (t._id === ticket._id ? r.data.ticket : t)));
          } catch (err) {
            Alert.alert("Could not update", err.response?.data?.error || err.message);
          } finally {
            setBusy("");
          }
        },
      },
    ]);
  };

  const renderTicket = ({ item }) => {
    const expanded = openId === item._id;
    const isOwner = String(item.user?._id || item.user || "") === String(user?.id || "");
    const nexts = isStaff ? STAFF_NEXT[item.status] || [] : [];
    const canOwnerCancel = !isStaff && isOwner && item.status === "pending";

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHead}
          activeOpacity={0.85}
          onPress={() => setOpenId(expanded ? null : item._id)}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.ticketNo}>{item.ticketNumber || "REP-…"}</Text>
              <Badge
                label={(item.status || "pending").replace("_", " ").toUpperCase()}
                color={STATUS_COLOR[item.status] || T.secondary}
              />
            </View>
            <Text style={styles.device} numberOfLines={1}>
              {item.brand} {item.model}
            </Text>
            <Text style={styles.issue} numberOfLines={expanded ? undefined : 1}>
              {item.issue}
            </Text>
          </View>
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={T.text.secondary} />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.detail}>
            <View style={styles.line}>
              <Text style={styles.label}>Estimated price</Text>
              <Text style={styles.value}>{inr(item.estimatedPrice)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Pincode</Text>
              <Text style={styles.value}>{item.pincode}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.label}>Preferred date</Text>
              <Text style={styles.value}>{item.preferredDate ? fmtDate(item.preferredDate) : "Flexible"}</Text>
            </View>
            {!!item.address && (
              <View style={styles.line}>
                <Text style={styles.label}>Address</Text>
                <Text style={[styles.value, { flex: 1, textAlign: "right" }]} numberOfLines={2}>{item.address}</Text>
              </View>
            )}
            {!!item.contactPhone && (
              <View style={styles.line}>
                <Text style={styles.label}>Contact</Text>
                <Text style={styles.value}>{item.contactPhone}</Text>
              </View>
            )}
            {item.assignedTechnician?.name && (
              <View style={styles.line}>
                <Text style={styles.label}>Technician</Text>
                <Text style={styles.value}>{item.assignedTechnician.name}</Text>
              </View>
            )}
            {item.user?.name && isStaff && (
              <View style={styles.line}>
                <Text style={styles.label}>Customer</Text>
                <Text style={styles.value}>{item.user.name}{item.user.phone ? ` • ${item.user.phone}` : ""}</Text>
              </View>
            )}

            {/* Timeline */}
            {(item.statusHistory || []).length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.boxTitle}>Progress</Text>
                {item.statusHistory.map((h, i) => (
                  <View key={i} style={styles.timelineRow}>
                    <View style={styles.timelineDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineStatus}>{String(h.status).replace("_", " ").toUpperCase()}</Text>
                      {!!h.note && <Text style={styles.timelineNote}>{h.note}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            {(nexts.length > 0 || canOwnerCancel) && (
              <View style={{ gap: 8, marginTop: 12 }}>
                {nexts.map((n) => (
                  <Btn
                    key={n}
                    title={NEXT_LABEL[n] || n}
                    small
                    variant={n === "cancelled" ? "danger" : "primary"}
                    loading={busy === item._id + n}
                    onPress={() => changeStatus(item, n)}
                  />
                ))}
                {canOwnerCancel && (
                  <Btn
                    title="Cancel this booking"
                    small
                    variant="danger"
                    icon="close-circle-outline"
                    loading={busy === item._id + "cancelled"}
                    onPress={() => changeStatus(item, "cancelled")}
                  />
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={T.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Repair Tickets</Text>
          <Text style={styles.sub}>{tickets.length} ticket{tickets.length === 1 ? "" : "s"}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Repair")} style={styles.addBtn} activeOpacity={0.75}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Book Repair</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={T.primary} size="large" /></View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t._id}
          contentContainerStyle={{ padding: 20, paddingBottom: 60, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={T.primary} />}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Empty
                icon="construct-outline"
                title="No repair tickets"
                sub="Book a doorstep repair and track its progress here in real time."
                action={() => navigation.navigate("Repair")}
                actionLabel="Book a Repair"
              />
            </View>
          }
          renderItem={renderTicket}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 20, paddingTop: 54, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: T.border.color,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: T.bg.secondary,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color,
  },
  title: { fontSize: 24, fontWeight: "900", color: T.text.primary, letterSpacing: -0.5 },
  sub: { fontSize: 12, color: T.text.secondary, marginTop: 2 },
  addBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: T.primary, borderRadius: 999, paddingHorizontal: 14, height: 34,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1,
    borderColor: T.border.color, marginBottom: 12, overflow: "hidden", ...T.shadow.card,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  ticketNo: { fontSize: 12, fontWeight: "800", color: T.text.secondary, letterSpacing: 0.4 },
  device: { fontSize: 15, fontWeight: "800", color: T.text.primary, marginTop: 4 },
  issue: { fontSize: 12, color: T.text.secondary, marginTop: 2, lineHeight: 16 },
  detail: { borderTopWidth: 1, borderTopColor: T.border.color, padding: 14, backgroundColor: T.bg.secondary },
  boxTitle: { fontSize: 12, fontWeight: "800", color: T.text.primary, marginBottom: 6 },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, gap: 10 },
  label: { fontSize: 12, color: T.text.secondary },
  value: { fontSize: 12, fontWeight: "700", color: T.text.primary },
  timelineRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: T.primary, marginTop: 5 },
  timelineStatus: { fontSize: 11, fontWeight: "800", color: T.text.primary },
  timelineNote: { fontSize: 11, color: T.text.secondary },
});
