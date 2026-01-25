import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { COLORS } from '../constants';

interface ModalPickerItem {
  label: string;
  value: string;
}

interface ModalPickerProps {
  visible: boolean;
  title: string;
  items: ModalPickerItem[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export const ModalPicker: React.FC<ModalPickerProps> = ({
  visible,
  title,
  items,
  selectedValue,
  onSelect,
  onClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.gray500} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>
        <FlatList
          data={items}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.item,
                item.value === selectedValue && styles.selectedItem,
              ]}
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <Text
                style={[
                  styles.itemText,
                  item.value === selectedValue && styles.selectedItemText,
                ]}
              >
                {item.label}
              </Text>
              {item.value === selectedValue && (
                <Check size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  placeholder: {
    width: 40,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  selectedItem: {
    backgroundColor: COLORS.primaryLight + '20',
  },
  itemText: {
    fontSize: 16,
    color: COLORS.gray700,
  },
  selectedItemText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 16,
  },
});

export default ModalPicker;
