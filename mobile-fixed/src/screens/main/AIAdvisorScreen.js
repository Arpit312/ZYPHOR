import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import T from "../../styles/theme";
import { aiAPI } from "../../api/api";

const SUGGESTIONS = [
  "Best certified iPhone under ₹40,000?",
  "What does Pristine condition grade mean?",
  "How does ZYPHOR Escrow buyer protection work?",
  "Fair resale value for iPhone 13 128GB?",
];

export default function AIAdvisorScreen() {
  const [messages, setMessages] = useState([
    {
      id: "0",
      role: "assistant",
      text: "Welcome to ZYPHOR Concierge.\n\nI can assist you in finding precision-verified smartphones, evaluating fair market resale prices, or guiding you through our escrow warranty protection.\n\nHow may I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { id: Date.now().toString(), role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const r = await aiAPI.advisor(msg);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", text: r.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", text: "I encountered a connection delay. Please try asking again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.headerTitle}>ZYPHOR Advisor</Text>
          <Text style={styles.headerSub}>AI Concierge & Hardware Specialist</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 10 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isUser = item.role === "user";
          return (
            <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
              {!isUser && (
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={13} color="#FFFFFF" />
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, isUser && { color: "#FFFFFF" }]}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          loading ? (
            <View style={styles.msgRow}>
              <View style={styles.botAvatar}>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              </View>
              <View style={styles.bubbleBot}>
                <ActivityIndicator size="small" color={T.primary} />
              </View>
            </View>
          ) : null
        }
      />

      {/* Suggestion Chips */}
      {messages.length <= 2 && (
        <View style={styles.suggWrap}>
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={(i) => i}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => send(item)} style={styles.suggestion} activeOpacity={0.7}>
                <Text style={styles.suggText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about models, pricing or specs…"
          placeholderTextColor="#9CA3AF"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={300}
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity
          onPress={() => send()}
          disabled={!input.trim() || loading}
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.35 }]}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: T.border.color,
  },
  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 17, fontWeight: "800", color: T.text.primary },
  headerSub: { fontSize: 12, color: T.text.secondary },

  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 16 },
  msgRowUser: { justifyContent: "flex-end" },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: T.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bubble: { maxWidth: "80%", borderRadius: 18, padding: 14 },
  bubbleBot: {
    backgroundColor: T.bg.secondary,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  bubbleUser: {
    backgroundColor: T.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14, color: T.text.primary, lineHeight: 21 },

  suggWrap: { paddingBottom: 6 },
  suggestion: {
    backgroundColor: T.bg.secondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  suggText: { fontSize: 12, color: T.text.secondary, fontWeight: "500" },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: T.border.color,
  },
  input: {
    flex: 1,
    backgroundColor: T.bg.input,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: T.text.primary,
    borderWidth: 1,
    borderColor: T.border.color,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: T.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
