import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import ListingCard from './ListingCard'
import { useTheme } from '@react-navigation/native';
import api from '../services/api';
import { COLORS } from '../constants';

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
  main_image: string | null;
  seller_name: string;
  views_count: number;
  created_at: string;
}

const AllListingsSection = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [listings, setListings] = useState<Announcement[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const numColumns = 2;
  const columnWidth = useMemo(() => (width - 48) / numColumns, [width]);

  useEffect(() => {
    fetchAnnouncements(1);
  }, []);

  const fetchAnnouncements = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await api.getAnnouncements(page);

      if (page === 1) {
        setListings(response.results || []);
      } else {
        setListings(prev => [...prev, ...(response.results || [])]);
      }

      setTotalCount(response.count || 0);
      setHasNextPage(!!response.next);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load listings');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchAnnouncements(currentPage + 1);
    }
  };

  const formatListing = (item: Announcement) => ({
    id: item.id,
    username: item.seller_name || 'Unknown',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.seller_name || 'default'}`,
    price: formatPrice(item.price, item.currency),
    title: item.title,
    badge: null,
    hasImage: !!item.main_image,
    imageUrl: item.main_image || undefined,
    location: item.district?.translations?.ru?.name || '',
  });

  const formatPrice = (price: string, currency: string) => {
    const num = parseFloat(price);
    if (currency === 'usd') {
      return `$${num.toLocaleString()}`;
    }
    return `${num.toLocaleString()} so'm`;
  };

  const renderListingCard = ({ item }: { item: Announcement }) => (
    <View
      style={[
        styles.cardContainer,
        { width: columnWidth },
      ]}
    >
      <ListingCard listing={formatListing(item)} />
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
        <TouchableOpacity onPress={() => fetchAnnouncements(1)} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Barcha e'lonlar {totalCount.toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.sortButton, { borderBottomColor: colors.border }]}
        activeOpacity={0.6}
      >
        <ChevronDown
          size={16}
          color={colors.text}
          style={{ opacity: 0.6 }}
        />
        <Text
          style={[
            styles.sortText,
            { color: colors.text },
          ]}
        >
          Saralash: Standart bo'yicha
        </Text>
      </TouchableOpacity>

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
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    paddingVertical: 40,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  gridContainer: {
    gap: 12,
    paddingTop: 12,
  },
  columnWrapper: {
    gap: 12,
    marginHorizontal: 0,
  },
  cardContainer: {
    flex: 1,
  },
  loadMoreButton: {
    marginTop: 24,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    borderRadius: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9333ea',
  },
});

export default AllListingsSection;
