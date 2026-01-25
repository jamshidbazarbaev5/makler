import { Heart, HeartIcon, MapPin, Bed, Maximize2 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 12;

interface ListingCardProps {
  id: string;
  title: string;
  price: string;
  location?: string;
  bedrooms?: number;
  area?: number;
  imageUrl?: string;
  badge?: string;
  username?: string;
  isLiked?: boolean;
  onToggleLike?: (id: string) => void;
  onClick?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  location,
  bedrooms,
  area,
  imageUrl,
  badge,
  username,
  isLiked = true,
  onToggleLike,
  onClick,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [likeScaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onClick?.();
  };

  const handleLike = () => {
    Animated.sequence([
      Animated.timing(likeScaleAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(likeScaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onToggleLike?.(id);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.container}
      >
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}

          {/* Badge */}
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Like Button */}
          <Animated.View
            style={[
              styles.likeButton,
              isLiked && styles.likeButtonActive,
              {
                transform: [{ scale: likeScaleAnim }],
              },
            ]}
          >
            <Pressable
              onPress={handleLike}
              style={({ pressed }) => [
                styles.likeButtonPress,
                pressed && styles.likeButtonPressed,
              ]}
            >
              <HeartIcon/>
            </Pressable>
          </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Title & Price */}
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
            <Text style={styles.price}>{price}</Text>
          </View>

          {/* Location */}
          {location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#666" />
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          )}

          {/* Details */}
          {(bedrooms || area) && (
            <View style={styles.detailsContainer}>
              {bedrooms && (
                <View style={styles.detailItem}>
                  <Bed size={12} color="#666" />
                  <Text style={styles.detailText}>
                    {bedrooms} {bedrooms === 1 ? 'xona' : 'xonalar'}
                  </Text>
                </View>
              )}
              {area && (
                <View style={styles.detailItem}>
                  <Maximize2 size={12} color="#666" />
                  <Text style={styles.detailText}>{area} m²</Text>
                </View>
              )}
            </View>
          )}

          {/* Username */}
          {username && (
            <View style={styles.usernameContainer}>
              <Text style={styles.usernameLabel}>E'lon beruvchi: </Text>
              <Text style={styles.usernameText}>{username}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#e8e8e8',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  likeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  likeButtonActive: {
    backgroundColor: '#ff6b6b',
    borderColor: '#ff5252',
    shadowColor: '#ff6b6b',
    shadowOpacity: 0.4,
  },
  likeButtonPress: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButtonPressed: {
    opacity: 0.7,
  },
  likeIcon: {
    fontSize: 28,
  },
  likeIconActive: {
    color: '#fff',
  },
  content: {
    padding: 12,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    lineHeight: 18,
    marginBottom: 6,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 10,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  detailIcon: {
    fontSize: 12,
  },
  detailText: {
    fontSize: 11,
    color: '#666',
  },
  usernameContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
  },
  usernameLabel: {
    fontSize: 11,
    color: '#999',
  },
  usernameText: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
});

export default ListingCard;
