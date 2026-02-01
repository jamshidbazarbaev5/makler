import React, { useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';
import ListingCard from '../components/ListingCard';
import { allListings } from '../data/mockData';
import { Listing } from '../data/mockData';

const TopPostsScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const handleBack = () => {
    navigation.goBack();
  };

  // Filter only TOP posts
  const topListings = useMemo(() => {
    return allListings.filter((listing) => listing.badge === 'TOP');
  }, []);

  const numColumns = 2;
  const columnWidth = useMemo(() => (width - 48) / numColumns, [width]);

  const handleOpenListing = (listing: Listing) => {
    navigation.navigate('ListingDetail', { id: listing.id, listing });
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <View
      style={[
        styles.cardContainer,
        { width: columnWidth },
      ]}
    >
      <ListingCard listing={item} onPress={() => handleOpenListing(item)} />
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        Yuqori e'lonlar yo'q
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text }]}>
        Hozircha TOP e'lonlar mavjud emas
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            TOP E'lonlar
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.text }]}>
            {topListings.length} e'lon
          </Text>
        </View>
      </View>

      {topListings.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={topListings}
          renderItem={renderListingCard}
          keyExtractor={(item) => item.id.toString()}
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
  cardContainer: {
    flex: 1,
  },
  emptyContainer: {
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
});

export default TopPostsScreen;
