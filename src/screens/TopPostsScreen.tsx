import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';
import ListingCard from '../components/ListingCard';
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
  is_featured_active?: boolean;
}

const formatPrice = (price: string, currency: string) => {
  const num = parseFloat(price);
  if (currency === 'usd') {
    return `$${num.toLocaleString()}`;
  }
  return `${num.toLocaleString()} so'm`;
};

const formatListing = (item: Announcement) => ({
  id: item.id,
  username: item.seller_name || 'Unknown',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller_name || 'default'}`,
  price: formatPrice(item.price, item.currency),
  title: item.title,
  badge: 'TOP' as const,
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
  is_featured_active: true,
});

const TopPostsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const likedIds = useAppSelector(state => state.likes.likedIds);
  const favoriteMap = useAppSelector(state => state.likes.favoriteMap);
  const [listings, setListings] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const numColumns = 2;
  const columnWidth = useMemo(() => (width - 48) / numColumns, [width]);

  useFocusEffect(
    useCallback(() => {
      fetchFeatured();
      dispatch(loadFavoritesAsync());
    }, [])
  );

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

  const fetchFeatured = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getFeaturedAnnouncements();
      setListings(response.results || []);
    } catch (err: any) {
      console.error('Error fetching featured announcements:', err);
      setError('Failed to load TOP listings');
    } finally {
      setLoading(false);
    }
  };

  const renderListingCard = ({ item }: { item: Announcement }) => (
    <View style={[styles.cardContainer, { width: columnWidth }]}>
      <ListingCard
        listing={formatListing(item)}
        isFavorited={likedIds.includes(item.id)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            TOP E'lonlar
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.text }]}>
            {listings.length} e'lon
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity onPress={fetchFeatured} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Yuqori e'lonlar yo'q
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text }]}>
            Hozircha TOP e'lonlar mavjud emas
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.columnWrapper}
          scrollIndicatorInsets={Platform.OS === 'android' ? { right: 1 } : {}}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 12,
    marginHorizontal: 0,
  },
  cardContainer: {},
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default TopPostsScreen;
