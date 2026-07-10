import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../../constants/theme";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (item: string) => void;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  onChangeText,
  suggestions = [],
  onSelectSuggestion,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const isDark = colorScheme === "dark";

  const handleChange = (text: string) => {
    setQuery(text);
    onChangeText?.(text);
  };

  const clearSearch = () => {
    setQuery("");
    onChangeText?.("");
    onSearch?.("");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "#1F2937"
            : "#F8FAFC",
          borderColor: colors.border,
        },
      ]}
    >
      {/* Search Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? "#172554"
              : "#DBEAFE",
          },
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={isDark ? "#93C5FD" : colors.tint}
        />
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        value={query}
        onChangeText={handleChange}
        onSubmitEditing={() => onSearch?.(query)}
        returnKeyType="search"
        autoCorrect={false}
      />

      {/* Clear Button */}
      {query.length > 0 && (
        <TouchableOpacity
          onPress={clearSearch}
          activeOpacity={0.7}
          style={styles.clearButton}
        >
          <Ionicons
            name="close-circle"
            size={22}
            color={isDark ? "#93C5FD" : colors.icon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 5,

    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },

  clearButton: {
    marginLeft: 8,
  },
});