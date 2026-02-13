import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { ArrowLeft, Grid, List, Heart, Search, Trash2 } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';
import ListingCard from '../components/ListingCardForLiked';
import { NotificationsLoadingSkeleton } from '../components/SkeletonLoader';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { loadFavoritesAsync, removeFromFavoritesAsync } from '../redux/slices/likesSlice';
import api from '../services/api';
import { useLanguage } from '../localization';

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
  main_image: string | null;
  seller_name: string;
}

const initialListings: Listing[] = [
  {
    id: '1',
    title: 'Modern 3-Bedroom Apartment with City View',
    price: '$245,000',
    location: 'Tashkent, Mirzo Ulugbek',
    bedrooms: 3,
    area: 95,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60',
    badge: 'Premium',
    username: 'Aziz Properties',
  },
  {
    id: '2',
    title: 'Cozy Studio Near Metro Station',
    price: '$78,500',
    location: 'Tashkent, Chilanzar',
    bedrooms: 1,
    area: 42,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60',
    username: 'HomeFinder UZ',
  },
  {
    id: '3',
    title: 'Spacious Family House with Garden',
    price: '$385,000',
    location: 'Tashkent, Sergeli',
    bedrooms: 5,
    area: 180,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=60',
    badge: 'New',
    username: 'Elite Realty',
  },
  {
    id: '4',
    title: 'Renovated 2-Bedroom in Historic Center',
    price: '$165,000',
    location: 'Tashkent, Shaykhontohur',
    bedrooms: 2,
    area: 68,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=60',
    username: 'Central Homes',
  },
  {
    id: '5',
    title: 'Luxury Penthouse with Terrace',
    price: '$520,000',
    location: 'Tashkent, Yunusabad',
    bedrooms: 4,
    area: 220,
    imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=60',
    badge: 'Featured',
    username: 'Prestige Homes',
  },
  {
    id: '6',
    title: 'Bright Corner Unit with Balcony',
    price: '$142,000',
    location: 'Tashkent, Mirabad',
    bedrooms: 2,
    area: 75,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60',
    username: 'SunnyApartments',
  },
];

const LikedPostsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const likedIds = useAppSelector(state => state.likes.likedIds);
  const favoriteMap = useAppSelector(state => state.likes.favoriteMap);
  
  const [likedListings, setLikedListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'area'>('price-asc');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load favorites from API on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Load favorite IDs from API
      const result = await dispatch(loadFavoritesAsync() as any);
      // After IDs are loaded, fetch announcement data
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
        ids.map(id => api.getAnnouncementById(id))
      );
      const formattedListings = announcements.map(ann => formatAnnouncement(ann));
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

    return {
      id: ann.id,
      title: ann.title || 'Untitled',
      price: formattedPrice,
      location: ann.district?.translations?.ru?.name || 'Unknown',
      bedrooms: ann.rooms ? Math.max(0, Math.min(10, ann.rooms)) : 0,
      area: ann.area ? Math.max(0, parseInt(ann.area)) : 0,
      imageUrl: ann.main_image || 'https://via.placeholder.com/300',
      username: ann.seller_name || 'Unknown Seller',
    };
  };

  const handleRemoveLike = (announcementId: string) => {
    // Show confirmation alert before deleting
    Alert.alert(
      t?.likedPosts?.removeTitle || 'Remove from favorites',
      t?.likedPosts?.removeConfirm || 'Remove this listing from favorites?',
      [
        {
          text: t?.common?.cancel || 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: t?.likedPosts?.removeButton || 'Remove',
          onPress: () => {
            setDeletingId(announcementId);
            const favoriteId = favoriteMap[announcementId];
            if (favoriteId) {
              // Dispatch the async action to remove from API
              dispatch(removeFromFavoritesAsync({ announcementId, favoriteId }) as any)
                .then(() => {
                  // Remove from local state after API success
                  setLikedListings((prev) => prev.filter((item) => item.id !== announcementId));
                })
                .finally(() => {
                  setDeletingId(null);
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
    loadFavorites();
    setRefreshing(false);
  }, []);

  // Filter listings based on search
  const filteredListings = likedListings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort listings
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
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
        <Heart size={48} color={colors.text} strokeWidth={1.5} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t?.likedPosts?.emptyTitle || "No favorite listings"}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.border }]}>
        {t?.likedPosts?.emptySubtitle || "Start saving properties you like"}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={() => (navigation as any).navigate('HomeTab')}
      >
        <Text style={styles.emptyButtonText}>{t?.likedPosts?.browseListing || "Browse Listings"}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t?.likedPosts?.title || "Favorites"}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.border }]}>
              {filteredListings.length} {t?.likedPosts?.listings || "listing(s)"}
            </Text>
          </View>
        </View>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
            onPress={() => setViewMode('grid')}
          >
            <Grid size={18} color={viewMode === 'grid' ? colors.primary : colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
            onPress={() => setViewMode('list')}
          >
            <List size={18} color={viewMode === 'list' ? colors.primary : colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Sort Bar */}
      {likedListings.length > 0 && (
        <View style={[styles.controlsBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search size={16} color={colors.text} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t?.likedPosts?.searchPlaceholder || "Search listings..."}
              placeholderTextColor={colors.border}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                {
                  backgroundColor: sortBy === 'price-asc' ? colors.primary : colors.background,
                },
              ]}
              onPress={() => setSortBy('price-asc')}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  { color: sortBy === 'price-asc' ? '#fff' : colors.text },
                ]}
              >
                {t?.likedPosts?.priceAsc || "↑ Price"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sortButton,
                {
                  backgroundColor: sortBy === 'price-desc' ? colors.primary : colors.background,
                },
              ]}
              onPress={() => setSortBy('price-desc')}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  { color: sortBy === 'price-desc' ? '#fff' : colors.text },
                ]}
              >
                {t?.likedPosts?.priceDesc || "↓ Price"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      {loading ? (
        <NotificationsLoadingSkeleton />
      ) : likedListings.length === 0 ? (
        <EmptyState />
      ) : sortedListings.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsTitle, { color: colors.text }]}>{t?.likedPosts?.noResults || "No results found"}</Text>
          <Text style={[styles.noResultsSubtitle, { color: colors.border }]}>
            "{searchQuery}" {t?.likedPosts?.noResultsFor || "no listings found"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedListings}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View style={[styles.cardWrapper, numColumns === 2 && styles.gridItem]}>
              <View style={{ position: 'relative' }}>
                <ListingCard
                  {...item}
                  isLiked={true}
                  onToggleLike={handleRemoveLike}
                  onClick={() => handleOpenListing(item)}
                />
              </View>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  viewModeIcon: {
    fontSize: 16,
    color: '#000',
  },
  // Search and Sort Styles
  controlsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingBottom: 100,
  },
  cardWrapper: {
    flex: 1,
    padding: 8,
  },
  gridItem: {
    maxWidth: '50%',
  },
  deletingIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
    borderRadius: 12,
  },
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // No Results Styles
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  deletingItem: {
    opacity: 0.6,
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LikedPostsScreen;
