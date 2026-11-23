import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { Empty, Btn, Input, Badge } from "../../components/UI";
import { supportAPI } from "../../api/api";
import { useAuth } from "../../context/AuthContext";

const STATUS_COLOR = { open: T.amber, answered: T.green, closed: T.secondary };

const fmtDate = (d) => {
  try {
    return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

export default function SupportScreen({ navigation }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await supportAPI.getAll();
      setTickets(r.data.tickets || []);
    } catch (err) {
      if (err.response?.status !== 401)
        Alert.alert("Error", err.response?.data?.error || "Could not load tickets.");
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

  const create = async () => {
    if (!subject.trim() || !message.trim()) {
      setCreateError("Subject and message are required.");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const r = await supportAPI.create({ subject: subject.trim(), message: message.trim() });
      setTickets((prev) => [r.data.ticket, ...prev]);
      setModal(false);
      setSubject("");
      setMessage("");
      setOpenId(r.data.ticket._id);
    } catch (err) {
      setCreateError(err.response?.data?.error || "Could not create ticket.");
    } finally {
      setCreating(false);
    }
  };

  const sendReply = async (ticketId) => {
    const text = (replyDrafts[ticketId] || "").trim();
    if (!text) return;
    setSendingId(ticketId);
    try {
      const r = await supportAPI.reply(ticketId, text);
      setTickets((prev) => prev.map((t) => (t._id === ticketId ? r.data.ticket : t)));
      setReplyDrafts((d) => ({ ...d, [ticketId]: "" }));
    } catch (err) {
      Alert.alert("Error", err.response?.data?.error || "Reply not sent.");
    } finally {
      setSendingId(null);
    }
  };

  const renderTicket = ({ item }) => {
    const expanded = openId === item._id;
    const lastReply = item.replies?.[item.replies.length - 1];
    return (
      <View style={styles.ticket}>
        <TouchableOpacity
          style={styles.ticketHead}
          activeOpacity={0.85}
          onPress={() => setOpenId(expanded ? null : item._id)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
            <Text style={styles.ticketMeta} numberOfLines={1}>
              {item.replies?.length || 0} message{(item.replies?.length || 0) === 1 ? "" : "s"} • {fmtDate(item.updatedAt || item.createdAt)}
            </Text>
            {!expanded && !!lastReply && (
              <Text style={styles.lastMsg} numberOfLines={1}>“{lastReply.message}”</Text>
            )}
          </View>
          <Badge label={(item.status || "open").toUpperCase()} color={STATUS_COLOR[item.status] || T.secondary} />
          <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={T.text.secondary} style={{ marginLeft: 6 }} />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.thread}>
            {(item.replies || []).map((r, i) => {
              const isStaff = r.staff || r.from?.role === "admin";
              const mine = String(r.from?._id || r.from) === String(user?.id);
              return (
                <View key={i} style={[styles.bubble, isStaff ? styles.bubbleStaff : styles.bubbleMe]}>
                  <Text style={[styles.bubbleAuthor, isStaff ? { color: T.green } : { color: T.text.secondary }]}>
                    {isStaff ? "ZYPHOR Support" : mine ? "You" : r.from?.name || "You"}
                  </Text>
                  <Text style={styles.bubbleText}>{r.message}</Text>
                  <Text style={styles.bubbleTime}>{fmtDate(r.createdAt)}</Text>
                </View>
              );
            })}
            {item.status !== "closed" && (
              <View style={styles.replyRow}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Type a reply…"
                  placeholderTextColor="#9CA3AF"
                  value={replyDrafts[item._id] || ""}
                  onChangeText={(v) => setReplyDrafts((d) => ({ ...d, [item._id]: v }))}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendBtn, sendingId === item._id && { opacity: 0.6 }]}
                  onPress={() => sendReply(item._id)}
                  disabled={sendingId === item._id}
                  activeOpacity={0.75}
                >
                  {sendingId === item._id ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
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
          <Text style={styles.title}>Support</Text>
          <Text style={styles.sub}>{tickets.length} ticket{tickets.length === 1 ? "" : "s"}</Text>
        </View>
        <TouchableOpacity onPress={() => setModal(true)} style={styles.addBtn} activeOpacity={0.75}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Ticket</Text>
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
                icon="chatbubbles-outline"
                title="No support tickets"
                sub="Questions about orders, repairs or listings? Open a ticket and our team will reply here."
                action={() => setModal(true)}
                actionLabel="Open a Ticket"
              />
            </View>
          }
          renderItem={renderTicket}
        />
      )}

      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView style={styles.modalWrap} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>New Support Ticket</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={styles.iconBtn}>
                <Ionicons name="close" size={20} color={T.text.secondary} />
              </TouchableOpacity>
            </View>
            <Input label="Subject" icon="create-outline" value={subject} onChangeText={setSubject} placeholder="e.g. Refund for order ZYP-..." maxLength={120} />
            <Input
              label="Describe your issue"
              icon="chatbox-outline"
              value={message}
              onChangeText={setMessage}
              placeholder="Tell us what happened…"
              multiline
              style={{ minHeight: 110, textAlignVertical: "top" }}
              maxLength={2000}
            />
            {!!createError && <Text style={styles.errorText}>{createError}</Text>}
            <Btn title="Submit Ticket" onPress={create} loading={creating} icon="send" style={{ marginTop: 6 }} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  ticket: {
    backgroundColor: "#FFFFFF", borderRadius: 16, borderWidth: 1,
    borderColor: T.border.color, marginBottom: 12, overflow: "hidden", ...T.shadow.card,
  },
  ticketHead: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  ticketSubject: { fontSize: 14, fontWeight: "800", color: T.text.primary },
  ticketMeta: { fontSize: 11, color: T.text.secondary, marginTop: 2 },
  lastMsg: { fontSize: 11, color: T.text.muted, marginTop: 4, fontStyle: "italic" },
  thread: { borderTopWidth: 1, borderTopColor: T.border.color, padding: 14, gap: 10, backgroundColor: T.bg.secondary },
  bubble: { borderRadius: 14, padding: 10, maxWidth: "88%" },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: T.primary },
  bubbleStaff: { alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: T.border.color },
  bubbleAuthor: { fontSize: 10, fontWeight: "800", marginBottom: 3 },
  bubbleText: { fontSize: 13, color: T.text.primary, lineHeight: 18 },
  bubbleTime: { fontSize: 9, color: T.text.muted, marginTop: 4 },
  replyRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  replyInput: {
    flex: 1, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: T.border.color,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
    color: T.text.primary, maxHeight: 90,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: T.primary,
    alignItems: "center", justifyContent: "center",
  },
  modalWrap: { flex: 1, backgroundColor: "rgba(24,24,24,0.45)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  modalHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontSize: 19, fontWeight: "900", color: T.text.primary },
  iconBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: T.bg.secondary,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: T.border.color,
  },
  errorText: { fontSize: 12, color: T.red, marginTop: 6 },
});
