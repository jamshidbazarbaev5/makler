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
import { ChevronDown, SlidersHorizontal, Star } from 'lucide-react-native';
import ListingCard from './ListingCard'
import { useTheme, useFocusEffect } from '@react-navigation/native';
import api from '../services/api';
import { COLORS } from '../constants';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { loadFavoritesAsync, addToFavoritesAsync, removeFromFavoritesAsync } from '../redux/slices/likesSlice';

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

const GAP = 12;
const PADDING = 16;

const AllListingsSection = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
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

      console.log('📋 Announcements response (page ' + page + '):', JSON.stringify(announcementsRes, null, 2));
      if (featuredRes) {
        console.log('⭐ Featured response:', JSON.stringify(featuredRes, null, 2));
      }

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
      setError('Failed to load listings');
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
    const isFavorited = likedIds.includes(announcementId);
    if (isFavorited) {
      const favoriteId = favoriteMap[announcementId];
      if (favoriteId) {
        dispatch(removeFromFavoritesAsync({ announcementId, favoriteId }));
      }
    } else {
      dispatch(addToFavoritesAsync({ id: announcementId } as any));
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
    return `${num.toLocaleString()} so'm`;
  };

  const renderListingCard = ({ item }: { item: Announcement }) => (
    <View style={{ width: itemWidth }}>
      <ListingCard
        listing={formatListing(item)}
        isFavorited={likedIds.includes(item.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.section, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.section, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity onPress={() => fetchData(1)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const FEATURED_CARD_WIDTH = 260;

  return (
    <View style={styles.section}>
      {/* Featured Carousel */}
      {featuredListings.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Star size={16} color="#fbbf24" fill="#fbbf24" />
            <Text style={[styles.featuredTitle, { color: colors.text }]}>Tavsiya etilgan</Text>
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
                  isFavorited={likedIds.includes(item.id)}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            So'nggi e'lonlar
          </Text>
          <Text style={styles.countBadge}>{totalCount}</Text>
        </View>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterChip} activeOpacity={0.7}>
            <SlidersHorizontal size={14} color="#334155" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sortChip} activeOpacity={0.7}>
            <Text style={styles.sortText}>Saralash</Text>
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
              tintColor={colors.primary}
            />
          }
        />

        {hasNextPage && (
          <TouchableOpacity
            style={[styles.loadMoreButton, { borderColor: colors.border }]}
            onPress={handleLoadMore}
            disabled={loadingMore}
            activeOpacity={0.7}
          >
            {loadingMore ? (
              <ActivityIndicator size="small" color={COLORS.purple} />
            ) : (
              <Text style={[styles.loadMoreText, { color: colors.text }]}>Yana yuklash</Text>
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
  sectionPadded: {
    paddingHorizontal: PADDING,
  },
  // Featured Carousel
  featuredSection: {
    marginBottom: 20,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: PADDING,
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featuredScrollContent: {
    paddingHorizontal: PADDING,
    gap: 12,
    paddingBottom: 4,
  },
  loadingContainer: {
    paddingVertical: 40,
    paddingHorizontal: PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Header
  headerContainer: {
    marginBottom: 16,
    paddingHorizontal: PADDING,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  countBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  },
  // Load More
  loadMoreButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 12,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AllListingsSection;
