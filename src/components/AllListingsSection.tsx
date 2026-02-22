import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ChevronDown, SlidersHorizontal, Star, Flame } from 'lucide-react-native';
import ListingCard from './ListingCard'
import { useTheme, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { COLORS } from '../constants';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { loadFavoritesAsync, addToFavoritesAsync, removeFromFavoritesAsync } from '../redux/slices/likesSlice';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../localization/LanguageContext';

interface Announcement {
  id: string;
  title: string;
  property_type: string;
  listing_type: string;
  district: {
    id: number;
    translations: { ru: { name: string } };
  };
  price: string;
  currency: string;
  area: string;
  area_unit: string;
  rooms: number | null;
  floor: number | null;
  total_floors: number | null;
  main_image: string | null;
  seller_name: string;
  views_count: number;
  favorites_count: number;
  created_at: string;
  posted_at: string | null;
  is_featured?: boolean;
  is_featured_active?: boolean;
  promotion_type?: string;
}

const GAP = 10;
const PADDING = 16;

const AllListingsSection = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const likedIds = useAppSelector(state => state.likes.likedIds);
  const favoriteMap = useAppSelector(state => state.likes.favoriteMap);
  const [listings, setListings] = useState<Announcement[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Announcement[]>([]);
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(new Set());
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const numColumns = 2;
  const itemWidth = useMemo(() => (width - PADDING * 2 - GAP) / numColumns, [width]);

  useFocusEffect(
    useCallback(() => {
      fetchData(1);
      dispatch(loadFavoritesAsync());
    }, [])
  );

  const fetchData = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const requests: [Promise<any>, Promise<any>?] = [api.getAnnouncements(page)];
      if (page === 1) {
        requests.push(api.getFeaturedAnnouncements());
      }

      const [announcementsRes, featuredRes] = await Promise.all(requests);

      if (page === 1) {
        setListings(announcementsRes.results || []);
        if (featuredRes) {
          const featuredResults = featuredRes.results || [];
          const ids = new Set<string>(featuredResults.map((item: Announcement) => item.id));
          setFeaturedIds(ids);
          setFeaturedListings(featuredResults);
        }
      } else {
        setListings(prev => [...prev, ...(announcementsRes.results || [])]);
      }

      setTotalCount(announcementsRes.count || 0);
      setHasNextPage(!!announcementsRes.next);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setError(t.allListings.errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchData(currentPage + 1);
    }
  };

  const handleToggleFavorite = (announcementId: string) => {
    const id = String(announcementId);
    const isFavorited = likedIds.includes(id);
    if (isFavorited) {
      const favoriteId = favoriteMap[id];
      if (favoriteId) {
        dispatch(removeFromFavoritesAsync({ announcementId: id, favoriteId }));
      }
    } else {
      dispatch(addToFavoritesAsync({ id } as any));
    }
  };

  const formatListing = (item: Announcement) => ({
    id: item.id,
    username: item.seller_name || 'Unknown',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller_name || 'default'}`,
    price: formatPrice(item.price, item.currency),
    title: item.title,
    badge: (item.is_featured || featuredIds.has(item.id)) ? 'TOP' as const : null,
    hasImage: !!item.main_image,
    imageUrl: item.main_image || undefined,
    location: item.district?.translations?.ru?.name || '',
    listing_type: item.listing_type,
    rooms: item.rooms,
    area: item.area,
    area_unit: item.area_unit,
    floor: item.floor,
    total_floors: item.total_floors,
    views_count: item.views_count,
    favorites_count: item.favorites_count,
    posted_at: item.posted_at,
    is_featured_active: item.is_featured_active || featuredIds.has(item.id),
  });

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    if (currency === 'usd') {
      return `$${num.toLocaleString()}`;
    }
    return `${num.toLocaleString()} ${t.listingCard.sum}`;
  };

  const renderListingCard = ({ item }: { item: Announcement }) => (
    <View style={{ width: itemWidth, flex: 1 }}>
      <ListingCard
        listing={formatListing(item)}
        isFavorited={likedIds.includes(String(item.id))}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.section, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>{t.allListings.loading}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.section, styles.errorContainer]}>
        <Text style={styles.errorEmoji}>:(</Text>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity onPress={() => fetchData(1)} style={styles.retryButton}>
          <Text style={styles.retryText}>{t.allListings.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const FEATURED_CARD_WIDTH = 240;

  return (
    <View style={styles.section}>
      {/* Featured Carousel */}
      {featuredListings.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <LinearGradient
              colors={['#fbbf24', '#f59e0b']}
              style={styles.featuredIconBg}
            >
              <Star size={14} color="#fff" fill="#fff" />
            </LinearGradient>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>{t.allListings.featuredTitle}</Text>
            <View style={styles.featuredCountBadge}>
              <Text style={styles.featuredCountText}>{featuredListings.length}</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScrollContent}
            decelerationRate="fast"
            snapToInterval={FEATURED_CARD_WIDTH + 12}
            snapToAlignment="start"
          >
            {featuredListings.map((item) => (
              <View key={item.id} style={{ width: FEATURED_CARD_WIDTH }}>
                <ListingCard
                  listing={formatListing(item)}
                  isFavorited={likedIds.includes(String(item.id))}
                  onToggleFavorite={handleToggleFavorite}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Flame size={20} color={COLORS.purple} fill={COLORS.purpleLight} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t.allListings.latestListings}
          </Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{totalCount}</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
            <SlidersHorizontal size={14} color={COLORS.purple} />
            <Text style={styles.filterText}>{t.allListings.filter}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sortChip} activeOpacity={0.7}>
            <Text style={styles.sortText}>{t.allListings.sort}</Text>
            <ChevronDown size={14} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: PADDING }}>
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          scrollEnabled={false}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          scrollIndicatorInsets={Platform.OS === 'android' ? { right: 1 } : {}}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.purple}
            />
          }
        />

        {hasNextPage && (
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleLoadMore}
            disabled={loadingMore}
            activeOpacity={0.7}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.purple} />
            ) : (
              <LinearGradient
                colors={[COLORS.purple, COLORS.purpleDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loadMoreGradient}
              >
                <Text style={styles.loadMoreText}>{t.allListings.loadMore}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingBottom: 40,
  },
  // Featured Carousel
  featuredSection: {
    marginBottom: 24,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: PADDING,
    marginBottom: 14,
  },
  featuredIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  featuredCountBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  featuredCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
  featuredScrollContent: {
    paddingHorizontal: PADDING,
    gap: 12,
    paddingBottom: 6,
  },
  // Loading
  loadingContainer: {
    paddingVertical: 60,
    paddingHorizontal: PADDING,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  // Error
  errorContainer: {
    paddingVertical: 60,
    paddingHorizontal: PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorEmoji: {
    fontSize: 32,
    marginBottom: 8,
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Header
  headerContainer: {
    marginBottom: 16,
    paddingHorizontal: PADDING,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.purple,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e9e5ff',
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.purple,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  // Grid
  gridContainer: {
    gap: GAP,
  },
  columnWrapper: {
    gap: GAP,
    alignItems: 'stretch',
  },
  // Load More
  loadMoreButton: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreGradient: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
});

export default AllListingsSection;
