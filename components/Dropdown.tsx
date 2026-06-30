import React, { useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";

import { Colors } from "../constants/theme";

type DropdownItem = string | { label: string; value: string };

type DropdownProps = {
  label?: string;
  data: DropdownItem[];
  value: string;
  onSelect: (value: string) => void;
  buttonText?: string;
};

const Dropdown = ({
  label,
  data,
  value,
  onSelect,
  buttonText = "Select an option",
}: DropdownProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [visible, setVisible] = useState(false);

  const handleSelect = (item: DropdownItem) => {
    const selected =
      typeof item === "object" ? item.value : item;

    onSelect(selected);
    setVisible(false);
  };

  const getDisplayText = () => {
    if (!value) return buttonText;

    if (typeof data[0] === "object") {
      const match = data.find(
        (item): item is { label: string; value: string } =>
          typeof item === "object" &&
          item.value === value
      );

      return match?.label ?? buttonText;
    }

    return value;
  };

  const getItemLabel = (item: DropdownItem) =>
    typeof item === "object" ? item.label : item;

  const getItemValue = (item: DropdownItem) =>
    typeof item === "object" ? item.value : item;

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: colors.text },
          ]}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: visible
              ? "#2563EB"
              : colors.icon,
            backgroundColor:
              colors.background,
          },
        ]}
        onPress={() => setVisible(true)}
      >
        <Text
          style={[
            styles.buttonText,
            {
              color: value
                ? colors.text
                : colors.icon,
            },
          ]}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>

        <Text
          style={[
            styles.arrow,
            { color: colors.icon },
          ]}
        >
          {visible ? "▲" : "▼"}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
        >
          <Pressable
            style={[
              styles.modal,
              {
                backgroundColor:
                  colors.background,
              },
            ]}
          >
            <FlatList
              data={data}
              keyExtractor={(item, index) =>
                typeof item === "object"
                  ? item.value
                  : `${item}-${index}`
              }
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const selected =
                  getItemValue(item) === value;

                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      selected &&
                        styles.selectedOption,
                    ]}
                    onPress={() =>
                      handleSelect(item)
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      {getItemLabel(item)}
                    </Text>

                    {selected && (
                      <Text
                        style={
                          styles.check
                        }
                      >
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1,
    borderRadius: 10,

    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  buttonText: {
    flex: 1,
    fontSize: 15,
  },

  arrow: {
    marginLeft: 10,
    fontSize: 14,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  modal: {
    borderRadius: 12,
    maxHeight: 320,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#DDD",
  },

  selectedOption: {
    backgroundColor: "#EFF6FF",
  },

  optionText: {
    fontSize: 15,
  },

  check: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default Dropdown;