import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Share2, Edit, Menu, Home, Handshake, Heart } from 'lucide-react-native';
import { COLORS } from '../constants';
import BottomSheetMenu from './BottomSheetMenu';
import LanguageModal from './LanguageModal';
import BottomNav from './BottomNav';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../redux/store';
import {fetchProfile, logout} from '../redux/slices/authSlice';
import api from '../services/api';

type Props = NativeStackScreenProps<any, 'Profile'>;

const tabs = [
  { id: 'listings', icon: 'Home', activeIcon: 'Home' },
  { id: 'favorites', icon: 'Heart', activeIcon: 'Heart' },
];

const iconMap: any = {
  Home,
  Handshake,
  Heart,
};

const filters = [
  ['Status', 'Saralash'],
  ["E'lon maqsadi", 'Mulk toifasi'],
];

export default function Profile({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {user} = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState('listings');
  const [menuVisible, setMenuVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'uz' | 'ru' | 'en'>('uz');

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const handleLogout = () => {
    Alert.alert('Chiqish', 'Siz hisobingizdan chiqdingiz', [
      {
        text: 'Bekor qilish',
        style: 'cancel',
      },
      {
        text: 'Chiqish',
        onPress: () => {
          dispatch(logout() as any);
        },
        style: 'destructive',
      },
    ]);
  };

  const handleLanguageSelect = (language: 'uz' | 'ru' | 'en') => {
    setCurrentLanguage(language);
    Alert.alert(
      'Til o\'zgartirildi',
      `Tanlangan til: ${language === 'uz' ? "O'zbek" : language === 'ru' ? 'Русский' : 'English'}`
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Hisobni o\'chirish',
      'Hisobingizni o\'chirmoqchimisiz? Bu amalni ortga qaytarib bo\'lmaydi.',
      [
        {
          text: 'Bekor qilish',
          style: 'cancel',
        },
        {
          text: 'O\'chirish',
          onPress: async () => {
            try {
              await api.deleteAccount();
              Alert.alert('Muvaffaqiyatli', 'Hisobingiz muvaffaqiyatli o\'chirildi');
              dispatch(logout() as any);
              navigation.navigate('Login');
            } catch (error: any) {
              console.error('Account deletion failed:', error);
              Alert.alert('Xatolik', 'Hisobni o\'chirishda xatolik yuz berdi');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getInitials = () => {
      if (user?.full_name) {
          return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
      }
      if (user?.first_name) {
          return user.first_name[0].toUpperCase();
      }
      if (user?.username) {
          return user.username[0].toUpperCase();
      }
      return 'U';
  };

  const displayName = user?.full_name || user?.first_name || user?.username || 'Foydalanuvchi';
  const displayUsername = user?.username ? `@${user.username}` : '';
  const photoUrl = user?.photo_url || user?.avatar;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.username}>{displayUsername}</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Share2 size={20} color={COLORS.gray700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('ProfileEdit')}
              >
                <Edit size={20} color={COLORS.gray700} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setMenuVisible(true)}
              >
                <Menu size={20} color={COLORS.gray700} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {photoUrl ? (
                    <Image source={{uri: photoUrl}} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarGradient}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                )}
                {/* Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.properties_count || 0}</Text>
                    <Text style={styles.statLabel}>E'lonlar</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user?.views_count || 0}</Text>
                    <Text style={styles.statLabel}>Ko'rishlar</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.name}>{displayName}</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const IconComponent = iconMap[tab.icon];
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[
                      styles.tabButton,
                      isActive && styles.activeTab,
                    ]}
                  >
                    <IconComponent
                      size={24}
                      color={isActive ? COLORS.primary : COLORS.gray500}
                    />
                    {isActive && (
                      <View style={styles.activeTabIndicator} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filtersContainer}>
            {filters.map((row, i) => (
              <View key={i} style={styles.filterRow}>
                {row.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={styles.filterChip}
                  >
                    <Text style={styles.filterText}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Empty State */}
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Home size={40} color={COLORS.accent} />
              <View style={[styles.dot, styles.dotTopRight]} />
              <View style={[styles.dot, styles.dotBottomLeft]} />
              <View style={[styles.dot, styles.dotTopLeft]} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheet Menu */}
      <BottomSheetMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLogout={handleLogout}
        onDeleteAccount={handleDeleteAccount}
        onLanguagePress={() => {
          setMenuVisible(false);
          setLanguageModalVisible(true);
        }}
      />

      {/* Language Modal */}
      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        currentLanguage={currentLanguage}
        onLanguageSelect={handleLanguageSelect}
      />
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    paddingHorizontal: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  statsContainer: {
    display:"flex",
    flexDirection: 'row',
    justifyContent:'center',
    alignItems:"center",
    alignContent:"center",
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginTop: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
    marginTop: 12,
  },
  balanceSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  balanceCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    color: COLORS.gray500,
    fontSize: 14,
  },
  balanceValue: {
    fontWeight: '600',
    color: COLORS.gray900,
    fontSize: 16,
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.purpleDark,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  tabButton: {
    paddingBottom: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.purple,
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: '100%',
    height: 2,
    backgroundColor: COLORS.purple,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterText: {
    color: COLORS.gray700,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.purpleLight,
  },
  dotTopRight: {
    top: -4,
    right: -4,
  },
  dotBottomLeft: {
    bottom: -8,
    left: -8,
  },
  dotTopLeft: {
    top: 0,
    left: -16,
  },
});
