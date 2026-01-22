import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { Listing } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';

interface ListingCardProps {
  listing: Listing;
  size?: 'normal' | 'large';
}

const ListingCard = ({ listing, size = 'normal' }: ListingCardProps) => {
  const navigation = useNavigation<any>();
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      style={[styles.card, isLarge && styles.largeCard]}
      onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
      activeOpacity={0.7}
    >
      {/* Badge */}
      {listing.badge && (
        <View style={styles.badgeContainer}>
          <View style={styles.badgeCorner} />
          <Text style={styles.badgeText}>{listing.badge}</Text>
        </View>
      )}

      {/* Image Area */}
      <View style={[styles.imageContainer, isLarge && styles.largeImageContainer]}>
        {listing.hasImage && listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="image" size={24} color="#94a3b8" />
          </View>
        )}

        {/* User Badge */}
        <View style={styles.userBadge}>
          <Image source={{ uri: listing.avatar }} style={styles.userAvatar} />
          <Text style={styles.userText} numberOfLines={1}>{listing.username}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={isLarge ? styles.largeContent : styles.content}>
        <Text style={styles.price}>{listing.price}</Text>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ListingCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  largeCard: {
    minWidth: 200,
  },
  imageContainer: {
    height: 128,
    overflow: 'hidden',
  },
  largeImageContainer: {
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
  },
  badgeCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 40,
    borderTopWidth: 40,
    borderRightColor: 'transparent',
    borderTopColor: '#6366f1',
    position: 'absolute',
    top: 0,
    right: 0,
  },
  badgeText: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  userBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  userText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: 100,
  },
  content: {
    padding: 12,
    backgroundColor: '#f1f5f9',
  },
  largeContent: {
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    color: '#64748b',
  },
});
