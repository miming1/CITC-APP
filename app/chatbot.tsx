import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { Colors } from '../constants/theme';

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
}: {
  message: Message;
  isDark: boolean;
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
        <View style={styles.botAvatar}>
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
            ? [styles.bubbleUser, { backgroundColor: isDark ? '#7C5CBF' : '#9B7FD4' }]
            : [styles.bubbleBot, { backgroundColor: isDark ? '#2A2040' : '#EDE8F7' }],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? '#fff' : isDark ? '#ECEDEE' : '#1E1340' },
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
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme as 'light' | 'dark'];

  const bg       = colors.background;
  const inputBg  = isDark ? '#2A2040' : '#EDE8F7';
  const textPri  = isDark ? '#ECEDEE' : '#1E1340';
  const textSec  = isDark ? '#9BA1A6' : '#6B6485';
  const accent   = isDark ? '#B8A4FF' : '#9B7FD4';

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

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: accent }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBack}
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chat with AI</Text>

        <TouchableOpacity style={styles.headerMenu} activeOpacity={0.75}>
          <MaterialCommunityIcons name="menu" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

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
            <MessageBubble message={item} isDark={isDark} />
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
              borderTopColor: isDark ? '#2A2040' : '#EDE8F7',
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                color: textPri,
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
            style={[styles.sendBtn, { backgroundColor: accent }]}
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

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerBack:  { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerMenu:  { padding: 4 },

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
    backgroundColor: '#9B7FD4',
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