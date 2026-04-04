import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

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

  const handleChange = (text: string) => {
    setQuery(text);
    onChangeText?.(text);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="search" size={18} color="#5D429D" />
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#B0A8C8"
        value={query}
        onChangeText={handleChange}
        onSubmitEditing={() => onSearch?.(query)}
        returnKeyType="search"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE8F7',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  iconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: '#6B4FA8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#4b2170',
    paddingVertical: 0,
  },
});