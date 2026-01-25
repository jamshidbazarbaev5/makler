import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';
import ListingCard from '../components/ListingCardForLiked';

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
  const [likedListings, setLikedListings] = useState<Listing[]>(initialListings);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleRemoveLike = (id: string) => {
    setLikedListings((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenListing = (listing: Listing) => {
    navigation.navigate('ListingDetail', { id: listing.id, listing });
  };

  const numColumns = viewMode === 'grid' ? 2 : 1;


  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sevimli e'lonlar yo'q</Text>
      <Text style={styles.emptySubtitle}>Sevimli mulklarni saqlashni boshlang</Text>
      <TouchableOpacity 
        style={styles.emptyButton}
        // onPress={() => navigation.navigate('HomeTab')}
      >
        <Text style={styles.emptyButtonText}>E'lonlarni ko'ring</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sevimli</Text>
          <Text style={styles.headerSubtitle}>
            {likedListings.length} {likedListings.length === 1 ? 'e\'lon' : 'e\'lon'}
          </Text>
        </View>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.activeViewMode]}
            onPress={() => setViewMode('grid')}
          >
            <Text style={styles.viewModeIcon}>⊞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.activeViewMode]}
            onPress={() => setViewMode('list')}
          >
            <Text style={styles.viewModeIcon}>≡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {likedListings.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={likedListings}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={[styles.cardWrapper, numColumns === 2 && styles.gridItem]}>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LikedPostsScreen;
