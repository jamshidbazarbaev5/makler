import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Share2, Edit, Menu, Home, Handshake, Heart, ChevronDown, ImageIcon, Eye } from 'lucide-react-native';
import { COLORS } from '../constants';
import BottomSheetMenu from './BottomSheetMenu';
import LanguageModal from './LanguageModal';
import BottomNav from './BottomNav';
import SkeletonLoader from './SkeletonLoader';
import {useSelector, useDispatch} from 'react-redux';
import {RootState, AppDispatch} from '../redux/store';
import {fetchProfile, logout} from '../redux/slices/authSlice';
import api from '../services/api';
import { useLanguage } from '../localization/LanguageContext';

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

// Status mapping for API (labels will be resolved dynamically via translations)
const STATUS_KEYS = ['draft', 'active', 'processing', 'inactive', 'rejected', 'completed'] as const;

const filters = [
  ['status', 'saralash'],
  ['elon_maqsadi', 'mulk_toifasi'],
];

interface TabCounts {
  draft: number;
  active: number;
  processing: number;
  inactive: number;
  rejected: number;
  completed: number;
}

export default function Profile({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const {user, loading} = useSelector((state: RootState) => state.auth);
  const { language, setLanguage, t } = useLanguage();

  // Get translated status labels
  const getStatusLabel = (key: string): string => {
    const statusMap: Record<string, string> = {
      draft: t.myListings.draft,
      active: t.myListings.active,
      processing: t.myListings.processing,
      inactive: t.myListings.inactive,
      rejected: t.myListings.rejected,
      completed: t.myListings.completed,
    };
    return statusMap[key] || key;
  };

  const [activeTab, setActiveTab] = useState('listings');
  const [menuVisible, setMenuVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    status: t.myListings?.all || 'All',
    saralash: t.filter?.sortBy?.replace(':', '') || 'Sort',
    elon_maqsadi: t.addListing?.category || 'Category',
    mulk_toifasi: t.addListing?.propertyType || 'Property Type',
  });
  const [tabCounts, setTabCounts] = useState<TabCounts | null>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  const { width } = useWindowDimensions();
  const numColumns = 2;
  const cardWidth = (width - 48) / numColumns;

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Refresh listings and counts when screen comes into focus (after delete/edit)
  useFocusEffect(
    useCallback(() => {
      fetchMyAnnouncements(selectedStatus, 1, false);
      fetchStatusCounts();
    }, [selectedStatus])
  );

  const fetchStatusCounts = async () => {
    try {
      const response = await api.getMyAnnouncementsCounts();
      if (response.tab_counts) {
        setTabCounts(response.tab_counts as TabCounts);
      }
    } catch (err: any) {
      console.error('Error fetching status counts:', err);
    }
  };

  const fetchMyAnnouncements = async (status?: string, page = 1, append = false) => {
    try {
      if (page === 1) {
        setListingsLoading(true);
      } else {
        setLoadingMore(true);
      }

      // selectedStatus already stores the API key directly
      const apiStatus = status || undefined;

      const response = await api.getMyAnnouncements(apiStatus, page, 20);

      if (append) {
        setMyListings(prev => [...prev, ...(response.results || [])]);
      } else {
        setMyListings(response.results || []);
      }

      setTotalCount(response.count || 0);
      setHasNextPage(!!response.next);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching my announcements:', err);
    } finally {
      setListingsLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // statusKey is the API key (e.g. 'draft', 'active') or undefined for all
  const handleStatusChange = (statusKey: string | undefined, displayLabel: string) => {
    setSelectedFilters(prev => ({ ...prev, status: displayLabel }));
    setSelectedStatus(statusKey);
    setCurrentPage(1);
    fetchMyAnnouncements(statusKey, 1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchMyAnnouncements(selectedStatus, currentPage + 1, true);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchMyAnnouncements(selectedStatus, 1, false);
  };

  const getTotalListingsCount = () => {
    if (tabCounts) {
      return Object.values(tabCounts).reduce((sum, count) => sum + count, 0);
    }
    return totalCount;
  };

  const getTotalViewsCount = () => {
    return myListings.reduce((sum, item) => sum + (item.views_count || 0), 0);
  };

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    if (currency === 'usd') {
      return `$${num.toLocaleString()}`;
    }
    return `${num.toLocaleString()} so'm`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'draft': return '#94a3b8';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#64748b';
    }
  };

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

  const handleLanguageSelect = async (lang: 'uz' | 'ru' | 'en') => {
    await setLanguage(lang);
    // Language change message will be shown in the new language after state updates
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      t.profile.deleteAccount,
      t.profile.deleteAccountConfirm,
      [
        {
          text: t.common.cancel,
          style: 'cancel',
        },
        {
          text: t.common.delete,
          onPress: async () => {
            try {
              await api.deleteAccount();
              Alert.alert(t.common.done, t.success.deleted);
              dispatch(logout() as any);
              navigation.navigate('Login');
            } catch (error: any) {
              console.error('Account deletion failed:', error);
              Alert.alert(t.common.error, t.errors.somethingWentWrong);
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
          {loading ? (
            <View style={styles.header}>
              <SkeletonLoader width={100} height={20} borderRadius={4} />
              <View style={styles.headerIcons}>
                <SkeletonLoader width={40} height={40} borderRadius={8} />
                <SkeletonLoader width={40} height={40} borderRadius={8} />
                <SkeletonLoader width={40} height={40} borderRadius={8} />
              </View>
            </View>
          ) : (
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
          )}

          {/* Profile Info */}
          {loading ? (
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <SkeletonLoader width={80} height={80} borderRadius={40} />
                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <SkeletonLoader width={30} height={20} borderRadius={4} />
                      <SkeletonLoader width={60} height={12} borderRadius={4} style={{ marginTop: 8 }} />
                    </View>
                    <View style={styles.statItem}>
                      <SkeletonLoader width={30} height={20} borderRadius={4} />
                      <SkeletonLoader width={60} height={12} borderRadius={4} style={{ marginTop: 8 }} />
                    </View>
                  </View>
                </View>
                <SkeletonLoader width={200} height={16} borderRadius={4} style={{ marginTop: 12 }} />
              </View>

              {/* Tabs Skeleton */}
              <View style={styles.tabsContainer}>
                <SkeletonLoader width={50} height={30} borderRadius={8} />
                <SkeletonLoader width={50} height={30} borderRadius={8} />
              </View>
            </View>
          ) : (
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
                      <Text style={styles.statValue}>{getTotalListingsCount()}</Text>
                      <Text style={styles.statLabel}>{t.profile.totalListings}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{getTotalViewsCount()}</Text>
                      <Text style={styles.statLabel}>{t.profile.totalViews}</Text>
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
          )}

          {/* Filters */}
          {loading ? (
            <View style={styles.filtersContainer}>
              {filters.map((row, i) => (
                <View key={i} style={styles.filterRow}>
                  {row.map((filterKey) => (
                    <SkeletonLoader
                      key={filterKey}
                      width="100%"
                      height={48}
                      borderRadius={8}
                      style={{ flex: 1 }}
                    />
                  ))}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.filtersContainer}>
              {filters.map((row, i) => (
                <View key={i} style={styles.filterRow}>
                  {row.map((filterKey) => (
                    <TouchableOpacity
                      key={filterKey}
                      style={styles.filterChip}
                      onPress={() => setOpenDropdown(openDropdown === filterKey ? null : filterKey)}
                    >
                      <Text style={styles.filterText}>{selectedFilters[filterKey as keyof typeof selectedFilters]}</Text>
                      <ChevronDown size={16} color={COLORS.gray700} />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Dropdown Modal */}
          {!loading && openDropdown && (
            <Modal
              transparent
              visible={true}
              onRequestClose={() => setOpenDropdown(null)}
            >
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={() => setOpenDropdown(null)}
              >
                <View style={styles.dropdownMenu}>
                  {openDropdown === 'status' ? (
                    // Status dropdown with counts
                    <>
                      {/* All option */}
                      <TouchableOpacity
                        style={[
                          styles.dropdownOption,
                          !selectedStatus && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          handleStatusChange(undefined, t.myListings?.all || 'All');
                          setOpenDropdown(null);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          !selectedStatus && styles.dropdownOptionTextActive,
                        ]}>
                          {t.myListings?.all || 'All'}
                        </Text>
                        <View style={styles.countBadge}>
                          <Text style={styles.countBadgeText}>{totalCount}</Text>
                        </View>
                      </TouchableOpacity>
                      {/* Individual status options */}
                      {STATUS_KEYS.map((key) => {
                        const count = tabCounts?.[key as keyof TabCounts] || 0;
                        const label = getStatusLabel(key);
                        return (
                          <TouchableOpacity
                            key={key}
                            style={[
                              styles.dropdownOption,
                              selectedStatus === key && styles.dropdownOptionActive,
                            ]}
                            onPress={() => {
                              handleStatusChange(key, label);
                              setOpenDropdown(null);
                            }}
                          >
                            <Text style={[
                              styles.dropdownOptionText,
                              selectedStatus === key && styles.dropdownOptionTextActive,
                            ]}>
                              {label}
                            </Text>
                            <View style={styles.countBadge}>
                              <Text style={styles.countBadgeText}>{count}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </>
                  ) : openDropdown === 'saralash' ? (
                    [
                      { label: t.profileFilters?.sortNewest || 'Newest', value: 'newest' },
                      { label: t.profileFilters?.sortCheapest || 'Cheapest', value: 'cheapest' },
                      { label: t.profileFilters?.sortExpensive || 'Most Expensive', value: 'expensive' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownOption,
                          selectedFilters.saralash === option.label && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedFilters(prev => ({ ...prev, saralash: option.label }));
                          setOpenDropdown(null);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          selectedFilters.saralash === option.label && styles.dropdownOptionTextActive,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : openDropdown === 'elon_maqsadi' ? (
                    [
                      { label: t.profileFilters?.purposeAll || 'All', value: 'all' },
                      { label: t.profileFilters?.purposeDaily || 'Daily', value: 'daily' },
                      { label: t.profileFilters?.purposeRent || 'Rent', value: 'rent' },
                      { label: t.profileFilters?.purposeSale || 'Sale', value: 'sale' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownOption,
                          selectedFilters.elon_maqsadi === option.label && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedFilters(prev => ({ ...prev, elon_maqsadi: option.label }));
                          setOpenDropdown(null);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          selectedFilters.elon_maqsadi === option.label && styles.dropdownOptionTextActive,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : openDropdown === 'mulk_toifasi' ? (
                    [
                      { label: t.profileFilters?.typeAll || 'All', value: 'all' },
                      { label: t.profileFilters?.typeApartment || 'Apartment', value: 'apartment' },
                      { label: t.profileFilters?.typeHouse || 'House', value: 'house' },
                      { label: t.profileFilters?.typeLand || 'Land', value: 'land' },
                      { label: t.profileFilters?.typeCommercial || 'Commercial', value: 'commercial' },
                    ].map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.dropdownOption,
                          selectedFilters.mulk_toifasi === option.label && styles.dropdownOptionActive,
                        ]}
                        onPress={() => {
                          setSelectedFilters(prev => ({ ...prev, mulk_toifasi: option.label }));
                          setOpenDropdown(null);
                        }}
                      >
                        <Text style={[
                          styles.dropdownOptionText,
                          selectedFilters.mulk_toifasi === option.label && styles.dropdownOptionTextActive,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : null}
                </View>
              </TouchableOpacity>
            </Modal>
          )}

          {/* Listings Grid */}
          {!loading && activeTab === 'listings' && (
            <View style={styles.listingsSection}>
              {listingsLoading ? (
                <View style={styles.listingsGrid}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.listingCard, { width: cardWidth }]}>
                      <SkeletonLoader width="100%" height={120} borderRadius={12} />
                      <View style={{ padding: 8 }}>
                        <SkeletonLoader width="80%" height={14} borderRadius={4} />
                        <SkeletonLoader width="60%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : myListings.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyStateIcon}>
                    <Home size={40} color={COLORS.accent} />
                    <View style={[styles.dot, styles.dotTopRight]} />
                    <View style={[styles.dot, styles.dotBottomLeft]} />
                    <View style={[styles.dot, styles.dotTopLeft]} />
                  </View>
                  <Text style={styles.emptyStateText}>{t.myListings.noListings}</Text>
                </View>
              ) : (
                <>
                  <View style={styles.listingsGrid}>
                    {myListings.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.listingCard, { width: cardWidth }]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('MyListingDetail', { listingId: item.id })}
                      >
                        {/* Image */}
                        <View style={styles.listingImageContainer}>
                          {item.main_image ? (
                            <Image
                              source={{ uri: item.main_image }}
                              style={styles.listingImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.listingImagePlaceholder}>
                              <ImageIcon size={24} color="#94a3b8" />
                            </View>
                          )}
                          {/* Status Badge */}
                          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusBadgeText}>{getStatusLabel(item.status)}</Text>
                          </View>
                          {/* Views */}
                          <View style={styles.viewsBadge}>
                            <Eye size={12} color="#fff" />
                            <Text style={styles.viewsText}>{item.views_count || 0}</Text>
                          </View>
                        </View>

                        {/* Content */}
                        <View style={styles.listingContent}>
                          <Text style={styles.listingPrice}>
                            {formatPrice(item.price, item.currency)}
                          </Text>
                          <Text style={styles.listingTitle} numberOfLines={2}>
                            {item.title}
                          </Text>
                          <Text style={styles.listingLocation} numberOfLines={1}>
                            {item.district?.translations?.ru?.name || ''}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Load More */}
                  {hasNextPage && (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <ActivityIndicator size="small" color={COLORS.purple} />
                      ) : (
                        <Text style={styles.loadMoreText}>Ko'proq yuklash</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          )}

          {/* Favorites Tab - Empty State */}
          {!loading && activeTab === 'favorites' && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Heart size={40} color={COLORS.accent} />
                <View style={[styles.dot, styles.dotTopRight]} />
                <View style={[styles.dot, styles.dotBottomLeft]} />
                <View style={[styles.dot, styles.dotTopLeft]} />
              </View>
              <Text style={styles.emptyStateText}>{t.favorites.noFavorites}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sheet Menu */}
      {!loading && (
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
      )}

      {/* Language Modal */}
      {!loading && (
        <LanguageModal
          visible={languageModalVisible}
          onClose={() => setLanguageModalVisible(false)}
          currentLanguage={language}
          onLanguageSelect={handleLanguageSelect}
        />
      )}
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
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  filterText: {
    color: COLORS.gray700,
    fontSize: 14,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    paddingTop: 12,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownOptionActive: {
    backgroundColor: COLORS.gray100,
  },
  dropdownOptionText: {
    fontSize: 14,
    color: COLORS.gray900,
    fontWeight: '500',
  },
  dropdownOptionTextActive: {
    color: COLORS.purple,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: COLORS.gray200,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: '500',
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
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray500,
    marginTop: 16,
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
  // Listings Grid Styles
  listingsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  listingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  listingImageContainer: {
    height: 120,
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  listingImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewsText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
  },
  listingContent: {
    padding: 10,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 12,
    color: COLORS.gray700,
    lineHeight: 16,
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  loadMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.purple,
  },
});
