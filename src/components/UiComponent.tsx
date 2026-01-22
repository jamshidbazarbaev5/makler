import React from 'react';
import { View, TouchableOpacity, TextInput, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../constants';

interface SelectBoxProps {
    label?: string;
    value: string;
    placeholder?: string;
    onPress?: () => void;
    icon?: string;
}

export const SelectBox: React.FC<SelectBoxProps> = ({ label, value, placeholder, onPress, icon }) => {
    return (
        <View style={styles.selectContainer}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TouchableOpacity
                onPress={onPress}
                style={styles.selectButton}
                activeOpacity={0.7}
            >
                <View style={styles.selectContent}>
                    {icon && <Icon name={icon} size={20} color={COLORS.gray500} style={styles.icon} />}
                    <Text style={[styles.selectText, !value && styles.placeholderText]}>
                        {value || placeholder}
                    </Text>
                </View>
                <Icon name="chevron-down" size={20} color={COLORS.gray500} />
            </TouchableOpacity>
        </View>
    );
};

interface ToggleChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
    fullWidth?: boolean;
}

export const ToggleChip: React.FC<ToggleChipProps> = ({ label, isActive, onPress, fullWidth = false }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.toggleChip,
                fullWidth && styles.toggleChipFullWidth,
                isActive && styles.toggleChipActive
            ]}
            activeOpacity={0.7}
        >
            <Text style={[styles.toggleChipText, isActive && styles.toggleChipTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

interface NumberInputProps {
    value: string | number;
    onChangeText: (val: string) => void;
    placeholder?: string;
    style?: any;
}

export const NumberInput: React.FC<NumberInputProps> = ({ value, onChangeText, placeholder, style }) => {
    return (
        <TextInput
            keyboardType="numeric"
            value={value.toString()}
            onChangeText={onChangeText}
            placeholder={placeholder}
            style={[styles.numberInput, style]}
            placeholderTextColor={COLORS.gray400}
        />
    );
};

const styles = StyleSheet.create({
    selectContainer: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray900,
        marginBottom: 8,
    },
    selectButton: {
        width: '100%',
        height: 48,
        backgroundColor: COLORS.gray50,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    selectText: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.gray900,
    },
    placeholderText: {
        color: COLORS.gray400,
    },
    toggleChip: {
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
    },
    toggleChipFullWidth: {
        flex: 1,
    },
    toggleChipActive: {
        backgroundColor: COLORS.primary,
    },
    toggleChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.gray500,
    },
    toggleChipTextActive: {
        color: COLORS.white,
    },
    numberInput: {
        height: 48,
        backgroundColor: COLORS.gray50,
        borderRadius: 12,
        paddingHorizontal: 16,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
        color: COLORS.gray900,
    },
});
