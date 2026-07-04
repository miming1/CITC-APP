import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, useColorScheme, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({
  placeholder = 'Search...',
  onSearch,
  onChangeText,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const handleChange = (text: string) => {
    setQuery(text);
    onChangeText?.(text);
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#2A2040' : '#EDE8F7' },
    ]}>
      <View style={styles.iconWrapper}>
        <Ionicons name="search" size={18} color={isDark ? '#B0A8C8' : '#5D429D'} />
      </View>
      <TextInput
        style={[styles.input, { color: isDark ? '#E8E0FF' : '#4b2170' }]}
        placeholder={placeholder}
        placeholderTextColor={isDark ? '#6B6485' : '#B0A8C8'}
        value={query}
        onChangeText={handleChange}
        onSubmitEditing={() => onSearch?.(query)}
        returnKeyType="search"
        autoCorrect={false}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Container ──────────────────────────────────────────────────────────────
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,

    marginHorizontal: 16,
    marginTop: 30,
  },

  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },

});