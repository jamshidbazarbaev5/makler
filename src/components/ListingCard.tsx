import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import { ImageIcon, Eye } from 'lucide-react-native';
import { Listing } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

interface ListingCardProps {
  listing: Listing;
  size?: 'normal' | 'large';
}

const ListingCard = ({ listing, size = 'normal' }: ListingCardProps) => {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
      activeOpacity={0.8}
    >
      {/* Image Area */}
      <View style={styles.imageContainer}>
        {listing.hasImage && listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <ImageIcon size={24} color="#94a3b8" />
          </View>
        )}

        {/* Status/Badge - if needed */}
        {listing.badge && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{listing.badge}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.price}>{listing.price}</Text>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        {listing.location && (
          <Text style={styles.location} numberOfLines={1}>{listing.location}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ListingCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
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
  imageContainer: {
    height: 120,
    backgroundColor: COLORS.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  content: {
    padding: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: COLORS.gray700,
    lineHeight: 16,
    marginBottom: 4,
  },
  location: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.purple,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
});
