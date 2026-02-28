import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { Grid, List, Heart, Search, SlidersHorizontal, ChevronDown } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';
import ListingCard from '../components/ListingCardForLiked';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { loadFavoritesAsync, removeFromFavoritesAsync } from '../redux/slices/likesSlice';
import api from '../services/api';
import { useLanguage } from '../localization';
import { COLORS } from '../constants';

interface Listing {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  area: number;
  imageUrl: string;
  badge?: string;
  username: string;
  views_count?: number;
  floor?: number | null;
  total_floors?: number | null;
  area_unit?: string;
}

interface Announcement {
  id: string;
  title: string;
  price: string;
  currency: string;
  area: string;
  area_unit: string;
  district: {
    translations: { ru: { name: string } };
  };
  rooms: number | null;
  floor: number | null;
  total_floors: number | null;
  main_image: string | null;
  images?: { id: number; image_url: string; image_medium_url: string }[];
  seller_name: string;
  views_count?: number;
}

const LikedPostsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const favoriteMap = useAppSelector(state => state.likes.favoriteMap);

  const [likedListings, setLikedListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area'>('price-asc');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const result = await dispatch(loadFavoritesAsync() as any);
      if (result.payload?.announcementIds && result.payload.announcementIds.length > 0) {
        await fetchAnnouncementsForIds(result.payload.announcementIds);
      } else {
        setLikedListings([]);
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setLikedListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnouncementsForIds = async (ids: string[]) => {
    try {
      const announcements = await Promise.all(
        ids.map(id => api.getAnnouncementById(id).catch(() => null))
      );
      const formattedListings = announcements
        .filter((ann): ann is Announcement => ann !== null)
        .map(ann => formatAnnouncement(ann));
      setLikedListings(formattedListings);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  const formatAnnouncement = (ann: Announcement): Listing => {
    const price = ann.price ? parseFloat(ann.price) : 0;
    const formattedPrice = !isNaN(price) && price > 0
      ? (ann.currency === 'usd'
          ? `$${price.toLocaleString()}`
          : `${price.toLocaleString()} so'm`)
      : (t?.likedPosts?.noPrice || 'No price');

    // Use main_image first, then first image from images array
    let imageUrl = ann.main_image || '';
    if (!imageUrl && ann.images && ann.images.length > 0) {
      imageUrl = ann.images[0].image_url || ann.images[0].image_medium_url || '';
    }

    return {
      id: String(ann.id),
      title: ann.title || 'Untitled',
      price: formattedPrice,
      location: ann.district?.translations?.ru?.name || '',
      bedrooms: ann.rooms ? Math.max(0, Math.min(10, ann.rooms)) : 0,
      area: ann.area ? Math.max(0, parseInt(ann.area)) : 0,
      imageUrl,
      username: ann.seller_name || 'Unknown',
      views_count: ann.views_count,
      floor: ann.floor,
      total_floors: ann.total_floors,
      area_unit: ann.area_unit === 'sqm' ? 'm²' : ann.area_unit, // unit conversion handled by card component as well
    };
  };

  const handleRemoveLike = (announcementId: string) => {
    Alert.alert(
      t?.likedPosts?.removeTitle || "Sevimlilardan o'chirish",
      t?.likedPosts?.removeConfirm || "Bu e'lonni sevimlilardan o'chirasizmi?",
      [
        { text: t?.common?.cancel || 'Bekor qilish', style: 'cancel' },
        {
          text: t?.likedPosts?.removeButton || "O'chirish",
          onPress: () => {
            const id = String(announcementId);
            const favoriteId = favoriteMap[id];
            if (favoriteId) {
              dispatch(removeFromFavoritesAsync({ announcementId: id, favoriteId }) as any)
                .then(() => {
                  setLikedListings(prev => prev.filter(item => String(item.id) !== id));
                });
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleOpenListing = (listing: Listing) => {
    (navigation as any).navigate('HomeTab', {
      screen: 'ListingDetail',
      params: { listingId: listing.id },
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites().finally(() => setRefreshing(false));
  }, []);

  const filteredListings = likedListings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedListings = [...filteredListings].sort((a, b) => {
    const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
    const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'area') return b.area - a.area;
    return 0;
  });

  const numColumns = viewMode === 'grid' ? 2 : 1;

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Heart size={40} color={COLORS.purple} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>{t?.likedPosts?.emptyTitle || "Sevimlilar bo'sh"}</Text>
      <Text style={styles.emptySubtitle}>
        {t?.likedPosts?.emptySubtitle || "Yoqtirgan e'lonlaringiz shu yerda ko'rinadi"}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => (navigation as any).navigate('HomeTab')}
      >
        <Text style={styles.emptyButtonText}>{t?.likedPosts?.browseListing || "E'lonlarni ko'rish"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t?.likedPosts?.title || "Sevimlilar"}</Text>
          {likedListings.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{likedListings.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
            onPress={() => setViewMode('grid')}
          >
            <Grid size={16} color={viewMode === 'grid' ? COLORS.purple : '#94a3b8'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
            onPress={() => setViewMode('list')}
          >
            <List size={16} color={viewMode === 'list' ? COLORS.purple : '#94a3b8'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + Sort */}
      {likedListings.length > 0 && (
        <View style={styles.controlsBar}>
          <View style={styles.searchContainer}>
            <Search size={16} color="#94a3b8" />
            <TextInput
              style={styles.searchInput}
              placeholder={t?.likedPosts?.searchPlaceholder || "Qidirish..."}
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.sortRow}>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'price-asc' && styles.sortChipActive]}
              onPress={() => setSortBy('price-asc')}
            >
              <Text style={[styles.sortChipText, sortBy === 'price-asc' && styles.sortChipTextActive]}>
                {t?.likedPosts?.priceAsc || "Arzon"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'price-desc' && styles.sortChipActive]}
              onPress={() => setSortBy('price-desc')}
            >
              <Text style={[styles.sortChipText, sortBy === 'price-desc' && styles.sortChipTextActive]}>
                {t?.likedPosts?.priceDesc || "Qimmat"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'area' && styles.sortChipActive]}
              onPress={() => setSortBy('area')}
            >
              <Text style={[styles.sortChipText, sortBy === 'area' && styles.sortChipTextActive]}>
                {t?.likedPosts?.sortArea || "Maydon"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>{t?.common?.loading || "Yuklanmoqda..."}</Text>
        </View>
      ) : likedListings.length === 0 ? (
        <EmptyState />
      ) : sortedListings.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>{t?.likedPosts?.noResults || "Natija topilmadi"}</Text>
          <Text style={styles.noResultsSubtitle}>
            "{searchQuery}" {t?.likedPosts?.noResultsFor || "bo'yicha natija yo'q"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedListings}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={numColumns === 2 ? styles.columnWrapper : undefined}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />
          }
          renderItem={({ item }) => (
            <View style={numColumns === 2 ? styles.gridItem : styles.listItem}>
              <ListingCard
                {...item}
                isLiked={true}
                onToggleLike={handleRemoveLike}
                onClick={() => handleOpenListing(item)}
              />
            </View>
          )}
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
    backgroundColor: '#f8fafc',
  },
  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
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
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  viewModeButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  activeViewMode: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  // Controls
  controlsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    padding: 0,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  sortChipActive: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#e9e5ff',
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  sortChipTextActive: {
    color: COLORS.purple,
  },
  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 10,
  },
  columnWrapper: {
    gap: 10,
    alignItems: 'stretch',
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
  },
  listItem: {
    flex: 1,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // No results
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default LikedPostsScreen;
