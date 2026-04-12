import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, } from "react-native";

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
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const toggleDropdown = () => setDropdownVisible(!isDropdownVisible);

    const handleSelect = (item: DropdownItem) => {
        const selected = typeof item === "object" ? item.value : item;
        onSelect(selected);
        setDropdownVisible(false);
    };

    const getDisplayText = (): string => {
        if (!value) return buttonText ?? "Select an option";

        if (data.length > 0 && typeof data[0] === "object") {
            const match = data.find(
                (item): item is { label: string; value: string } =>
                    typeof item === "object" && item.value === value
            );
            return match ? match.label : buttonText ?? "Select an option";
        }

        const match = data.find((item) => item === value);
        return match ? (match as string) : buttonText ?? "Select an option";
    };

    const getItemLabel = (item: DropdownItem): string =>
        typeof item === "object" ? item.label : item;

    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity style={styles.button} onPress={toggleDropdown}>
                <Text
                    style={[styles.buttonText, !value && styles.placeholder]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {getDisplayText()}
                </Text>
                <Text style={styles.arrow}>{isDropdownVisible ? "▲" : "▼"}</Text>
            </TouchableOpacity>

            {isDropdownVisible && (
                <View style={styles.dropdown}>
                    {data.map((item, index) => (
                        <TouchableOpacity
                            key={typeof item === "object" ? item.value : index.toString()}
                            style={[
                                styles.option,
                                index === data.length - 1 && styles.optionLast,
                            ]}
                            onPress={() => handleSelect(item)}
                        >
                            <Text style={styles.optionText}>{getItemLabel(item)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: "#333",
    },
    button: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    buttonText: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        marginRight: 8,
    },
    placeholder: {
        color: "#aaa",
    },
    arrow: {
        fontSize: 12,
        color: "#888",
    },
    dropdown: {
        marginTop: 4,
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 999,
    },
    option: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionLast: {
        borderBottomWidth: 0,
    },
    optionText: {
        fontSize: 14,
        color: "#333",
    },
});

export default Dropdown;