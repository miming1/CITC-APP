import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { Colors } from "../../constants/theme";

interface SearchBarProps {
  placeholder?: string;
  // Optional controlled value. Pass this when a page needs to reset or
  // otherwise control the box from outside (see UserDashboard). If omitted,
  // the component manages its own text exactly like before.
  value?: string;
  onSearch?: (query: string) => void;
  onChangeText?: (text: string) => void;
  suggestions?: string[];
  onSelectSuggestion?: (item: string) => void;
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onSearch,
  onChangeText,
  suggestions = [],
  onSelectSuggestion,
}: SearchBarProps) {
  const [internalQuery, setInternalQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const isControlled = value !== undefined;
  const query = isControlled ? value : internalQuery;

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isDark = colorScheme === "dark";

  const handleChange = (text: string) => {
    if (!isControlled) setInternalQuery(text);
    onChangeText?.(text);
  };

  const clearSearch = () => {
    if (!isControlled) setInternalQuery("");
    onChangeText?.("");
    // Deliberately NOT calling onSearch here. Clearing the box should only
    // clear it — it shouldn't resubmit/navigate as if Enter was pressed,
    // which is what was causing the X button to jump to Search Results.
  };

  const matches =
    query.length > 0
      ? suggestions
          .filter((s) => s.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 6)
      : [];

  const showDropdown = isFocused && matches.length > 0;

  const selectSuggestion = (item: string) => {
    handleChange(item);
    setIsFocused(false);
    if (onSelectSuggestion) {
      onSelectSuggestion(item);
    } else {
      // No dedicated handler wired up — fall back to behaving like the
      // user typed it and hit search, so this still works without any
      // extra plumbing on the caller's side.
      onSearch?.(item);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? "#1F2937" : "#F8FAFC",
            borderColor: colors.border,
          },
        ]}
      >
        {/* Search Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark ? "#172554" : "#DBEAFE",
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
            { color: colors.text },
            // Removes the browser's default focus outline/box on web —
            // the native blinking caret is left as the only focus cue.
            Platform.OS === "web" && ({ outlineStyle: "none" } as any),
          ]}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          value={query}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Short delay so a tap on a suggestion below has a chance to
            // register before the dropdown disappears out from under it.
            setTimeout(() => setIsFocused(false), 150);
          }}
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

      {/* Autosuggest Dropdown */}
      {showDropdown && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {matches.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[
                styles.suggestionRow,
                index < matches.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={() => selectSuggestion(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={14} color={colors.icon} />
              <Text
                style={[styles.suggestionText, { color: colors.text }]}
                numberOfLines={1}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // NOTE: no marginTop / marginHorizontal / marginBottom here anymore.
  // Positioning is now the calling page's responsibility (via its own
  // container style) instead of being baked into this component — that
  // mismatch was why the bar sat differently on every screen.
  wrapper: {
    position: "relative",
    zIndex: 20,
  },

  container: {
    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1,
    borderRadius: 18,

    paddingHorizontal: 14,
    paddingVertical: 5,

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

  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});