import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (item: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchBar({
  placeholder = 'Search processes, offices...',
  onSearch,
  onChangeText,
  suggestions = [],
  onSelectSuggestion,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions =
    query.trim().length > 0
      ? suggestions.filter((item) =>
          item.toLowerCase().includes(query.trim().toLowerCase())
        )
      : [];

  const showDropdown = isFocused && filteredSuggestions.length > 0;

  const handleChange = (text: string) => {
    setQuery(text);
    onChangeText?.(text);
  };

  const handleSelect = (item: string) => {
    setQuery(item);
    setIsFocused(false);
    onChangeText?.(item);
    onSelectSuggestion?.(item);
    onSearch?.(item);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.iconWrapper}>
          <Ionicons name="search" size={18} color="#3A2EA2" />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8883A5"
          value={query}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          onSubmitEditing={() => onSearch?.(query)}
          returnKeyType="search"
          autoCorrect={false}
        />
      </View>

      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredSuggestions}
            keyExtractor={(item, index) => `${item}-${index}`}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.suggestionRow,
                  pressed && styles.suggestionRowPressed,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons name="search" size={14} color="#8883A5" style={styles.suggestionIcon} />
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ── Wrapper ────────────────────────────────────────────────────────────────
  wrapper: {
    marginHorizontal: 16,
    marginTop: 30,
    zIndex: 10,
  },

  // ── Container ──────────────────────────────────────────────────────────────
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#DFE1FF',
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
    color: '#3A2EA2',
    // Removes the default browser focus ring/box on web
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },

  // ── Dropdown ───────────────────────────────────────────────────────────────
  dropdown: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  suggestionRowPressed: {
    backgroundColor: '#F2F1FF',
  },
  suggestionIcon: {
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#3A2EA2',
  },

});