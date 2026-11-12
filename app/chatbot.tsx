import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from "../components/Universal Components/Header";
import { Colors } from "../constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// ─── Placeholder seed messages (remove when backend is ready) ─────────────────

const SEED_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hello! I can help you find information about university processes and requirements. What do you need help with?',
    sender: 'bot',
    timestamp: new Date(),
  },
  {
    id: '2',
    text: 'How do I submit a medical certificate?',
    sender: 'user',
    timestamp: new Date(),
  },
  {
    id: '3',
    text: 'You can submit your medical certificate at the Office of the University Registrar (OUR). Make sure it is signed by a licensed physician and bears the official clinic stamp.',
    sender: 'bot',
    timestamp: new Date(),
  },
];

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({
  message,
  isDark,
  theme,
}: {
  message: Message;
  isDark: boolean;
  theme: typeof Colors.light;
}) {
  const isUser = message.sender === 'user';

  return (
    <View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowBot,
      ]}
    >
      {!isUser && (
        <View style={[styles.botAvatar, { backgroundColor: theme.tint }]}>
          <MaterialCommunityIcons
            name="robot-outline"
            size={16}
            color="#fff"
          />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: theme.tint }]
            : [
                styles.bubbleBot,
                { backgroundColor: isDark ? '#1E293B' : '#EEF0FA' },
              ],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? '#fff' : theme.text },
          ]}
        >
          {message.text}
        </Text>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function chatbot() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme as 'light' | 'dark'];

  const bg = theme.background;
  const inputBg = isDark ? '#1E293B' : '#EEF0FA';
  const textSec = theme.icon;

  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  // Placeholder send — just echoes a dummy reply
  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    // Placeholder bot reply
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "I'm still being set up! Check back soon for full AI responses.",
      sender: 'bot',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');

    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}>

      {/* ── Shared Header (back button, title, hamburger menu) ── */}
      <Header title="Chat with AI" showBack />

      {/* ── Messages ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isDark={isDark} theme={theme} />
          )}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* ── Input Bar ── */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: bg,
              borderTopColor: theme.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                color: theme.text,
              },
            ]}
            placeholder="Input Message.."
            placeholderTextColor={textSec}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.tint }]}
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1 },

  // ── Messages ──────────────────────────────────────────────────────────────
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },

  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot:  { justifyContent: 'flex-start' },

  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // ── Input Bar ─────────────────────────────────────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});