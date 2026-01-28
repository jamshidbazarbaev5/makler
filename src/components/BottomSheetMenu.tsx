import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { Globe, Settings, HelpCircle, Info, LogOut, ChevronRight, Trash2 } from 'lucide-react-native';
import { COLORS } from '../constants';

interface BottomSheetMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onLanguagePress: () => void;
  onDeleteAccount: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export default function BottomSheetMenu({
  visible,
  onClose,
  onLogout,
  onLanguagePress,
  onDeleteAccount,
}: BottomSheetMenuProps) {
  const [pan] = useState(new Animated.ValueXY());

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        pan.y.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobs\x27dan chiqmoqchimisiz?',
      [
        {
          text: 'Bekor qilish',
          style: 'cancel',
        },
        {
          text: 'Chiqish',
          onPress: () => {
            onClose();
            onLogout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleLanguage = () => {
    onClose();
    onLanguagePress();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <View style={styles.overlayContent} />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Menu Title */}
          <Text style={styles.menuTitle}>Sozlamalar</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLanguage}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E8F5FF' }]}>
                <Globe size={20} color={COLORS.purple} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Til</Text>
                <Text style={styles.menuItemSubtitle}>O'zbek, Rus, English</Text>
              </View>
            </View>
            <ChevronRight
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFF4E6' }]}>
                <Settings size={20} color={COLORS.warning} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Sozlamalar</Text>
                <Text style={styles.menuItemSubtitle}>Xabarlar, Privatlik</Text>
              </View>
            </View>
            <ChevronRight
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#F0E6FF' }]}>
                <HelpCircle  size={20} color={COLORS.purple} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Yordam va qo'llab-quvvatlash</Text>
                <Text style={styles.menuItemSubtitle}>FAQ, Muammoni xabar qilish</Text>
              </View>
            </View>
            <ChevronRight
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>

          {/* About */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#E6F7F0' }]}>
                <Info size={20} color={COLORS.success} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>Ilovamiz haqida</Text>
                <Text style={styles.menuItemSubtitle}>Versiya 1.0.0</Text>
              </View>
            </View>
            <ChevronRight
              size={20}
              color={COLORS.gray400}
            />
          </TouchableOpacity>

          {/* Delete Account */}
          <TouchableOpacity
            style={[styles.menuItem, { marginTop: 8 }]}
            onPress={() => {
              onClose();
              onDeleteAccount();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FFE6E6' }]}>
                <Trash2 size={20} color={COLORS.error} />
              </View>
              <View>
                <Text style={[styles.menuItemTitle, { color: COLORS.error }]}>Hisobni o'chirish</Text>
                <Text style={styles.menuItemSubtitle}>Bu amalni ortga qaytarib bo'lmaydi</Text>
              </View>
            </View>
            <ChevronRight
              size={20}
              color={COLORS.error}
            />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={20} color={COLORS.white} />
            <Text style={styles.logoutButtonText}>Chiqish</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContent: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.75,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray200,
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  menuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
