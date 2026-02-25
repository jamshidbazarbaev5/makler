import React, { useState, useEffect } from 'react';
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
  Linking,
  ScrollView,
} from 'react-native';
import { Globe, HelpCircle, Code2, LogOut, ChevronRight, ChevronLeft, Trash2, Phone, Send, Mail, Settings } from 'lucide-react-native';
import { COLORS } from '../constants';
import { useLanguage } from '../localization/LanguageContext';
import { AppSettings } from '../services/api';

interface BottomSheetMenuProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onLanguagePress: () => void;
  onDeleteAccount: () => void;
  appSettings?: AppSettings | null;
}

const { height: screenHeight } = Dimensions.get('window');

type Screen = 'menu' | 'help' | 'settings';

export default function BottomSheetMenu({
  visible,
  onClose,
  onLogout,
  onLanguagePress,
  onDeleteAccount,
  appSettings,
}: BottomSheetMenuProps) {
  const { t } = useLanguage();
  const [pan] = useState(new Animated.ValueXY());
  const [screen, setScreen] = useState<Screen>('menu');

  // Reset to menu when modal opens
  useEffect(() => {
    if (visible) {
      setScreen('menu');
    }
  }, [visible]);

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
      t.bottomSheet.logout,
      t.bottomSheet.logoutConfirm,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.bottomSheet.logout,
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

  const handleDevelopers = () => {
    onClose();
    Linking.openURL('https://softium.uz');
  };

  const phone = appSettings?.admin_phone || '+998970953905';

  const formatPhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.length === 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
    }
    return p;
  };

  const handleCall = () => {
    onClose();
    Linking.openURL(`tel:${phone}`);
  };

  const handleTelegram = () => {
    onClose();
    Linking.openURL(`https://t.me/${phone.replace(/\D/g, '')}`);
  };

  const handleEmail = () => {
    onClose();
    Linking.openURL('mailto:support@softium.uz');
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
          { transform: [{ translateY: pan.y }] },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Handle Bar */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {screen === 'menu' ? (
            <>
              <Text style={styles.menuTitle}>{t.bottomSheet.menu}</Text>
              <View style={styles.divider} />

              {/* Language */}
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
                    <Text style={styles.menuItemTitle}>{t.bottomSheet.language}</Text>
                    <Text style={styles.menuItemSubtitle}>{t.bottomSheet.languageOptions}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              {/* Help */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setScreen('help')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#F0E6FF' }]}>
                    <HelpCircle size={20} color={COLORS.purple} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>{t.bottomSheet.help}</Text>
                    <Text style={styles.menuItemSubtitle}>{t.bottomSheet.helpSubtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              {/* Settings */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setScreen('settings')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFF4E6' }]}>
                    <Settings size={20} color={COLORS.warning} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>Settings</Text>
                    <Text style={styles.menuItemSubtitle}>App settings</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              {/* Developers */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleDevelopers}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#E6F7F0' }]}>
                    <Code2 size={20} color={COLORS.success} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>{t.bottomSheet.developers}</Text>
                    <Text style={styles.menuItemSubtitle}>softium.uz</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
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
                    <Text style={[styles.menuItemTitle, { color: COLORS.error }]}>{t.bottomSheet.deleteAccount}</Text>
                    <Text style={styles.menuItemSubtitle}>{t.bottomSheet.deleteAccountWarning}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.error} />
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Logout */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <LogOut size={20} color={COLORS.white} />
                <Text style={styles.logoutButtonText}>{t.bottomSheet.logout}</Text>
              </TouchableOpacity>
            </>
          ) : screen === 'help' ? (
            <>
              {/* Help Screen */}
              <View style={styles.helpHeader}>
                <TouchableOpacity onPress={() => setScreen('menu')} style={styles.backButton}>
                  <ChevronLeft size={24} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.menuTitle}>{t.bottomSheet.help}</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={styles.divider} />

              {/* Phone */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCall}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#E6F7F0' }]}>
                    <Phone size={20} color={COLORS.success} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>{t.bottomSheet.phone}</Text>
                    <Text style={styles.menuItemSubtitle}>{formatPhone(phone)}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              {/* Telegram */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleTelegram}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#E8F5FF' }]}>
                    <Send size={20} color="#0088cc" />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>Telegram</Text>
                    <Text style={styles.menuItemSubtitle}>{formatPhone(phone)}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleEmail}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFF4E6' }]}>
                    <Mail size={20} color={COLORS.warning} />
                  </View>
                  <View>
                    <Text style={styles.menuItemTitle}>Email</Text>
                    <Text style={styles.menuItemSubtitle}>support@softium.uz</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            </>
          ) : screen === 'settings' ? (
            <>
              {/* Settings Screen */}
              <View style={styles.helpHeader}>
                <TouchableOpacity onPress={() => setScreen('menu')} style={styles.backButton}>
                  <ChevronLeft size={24} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.menuTitle}>Settings</Text>
                <View style={{ width: 24 }} />
              </View>
              <View style={styles.divider} />

              {appSettings ? (
                <>
                  {/* Admin Phone */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Admin Phone</Text>
                    <Text style={styles.settingValue}>{formatPhone(appSettings.admin_phone)}</Text>
                  </View>

                  {/* Payment Settings */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Payment</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Payment Enabled</Text>
                      <Text style={styles.settingValue}>{appSettings.payment_enabled ? 'Yes' : 'No'}</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Post Price</Text>
                      <Text style={styles.settingValue}>{appSettings.post_price} UZS</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Featured Price</Text>
                      <Text style={styles.settingValue}>{appSettings.featured_price} UZS</Text>
                    </View>
                  </View>

                  {/* Duration & Featured */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Duration</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Featured Enabled</Text>
                      <Text style={styles.settingValue}>{appSettings.featured_enabled ? 'Yes' : 'No'}</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Post Duration</Text>
                      <Text style={styles.settingValue}>{appSettings.post_duration_days} days</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Featured Duration</Text>
                      <Text style={styles.settingValue}>{appSettings.featured_duration_days} days</Text>
                    </View>
                  </View>

                  {/* General Settings */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>General</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Max Images Per Post</Text>
                      <Text style={styles.settingValue}>{appSettings.max_images_per_post}</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Max Draft Announcements</Text>
                      <Text style={styles.settingValue}>{appSettings.max_draft_announcements}</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Require Moderation</Text>
                      <Text style={styles.settingValue}>{appSettings.require_moderation ? 'Yes' : 'No'}</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Auto Deactivate Expired</Text>
                      <Text style={styles.settingValue}>{appSettings.auto_deactivate_expired ? 'Yes' : 'No'}</Text>
                    </View>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Notify Expiring Days</Text>
                      <Text style={styles.settingValue}>{appSettings.notify_expiring_days}</Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={styles.settingsSection}>
                    <Text style={styles.sectionTitle}>Info</Text>
                    <View style={styles.settingItem}>
                      <Text style={styles.settingLabel}>Last Updated</Text>
                      <Text style={styles.settingValue}>{new Date(appSettings.updated_at).toLocaleString()}</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.noSettingsText}>Loading settings...</Text>
              )}
            </>
          ) : null}
        </ScrollView>
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
    paddingBottom: 36,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  helpSubtitle: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 4,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray600,
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  settingsSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
    marginLeft: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noSettingsText: {
    fontSize: 14,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 24,
  },
});
