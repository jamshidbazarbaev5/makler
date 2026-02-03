import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { Heart, ImageIcon, Eye, Trash2 } from 'lucide-react-native';
import { COLORS } from '../constants';

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
  views_count?: number;
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
  views_count,
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
      <Pressable
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
            <View style={styles.imagePlaceholder}>
              <ImageIcon size={24} color="#94a3b8" />
            </View>
          )}

          {/* Badge */}
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Views */}
          {views_count !== undefined && (
            <View style={styles.viewsBadge}>
              <Eye size={12} color="#fff" />
              <Text style={styles.viewsText}>{views_count}</Text>
            </View>
          )}

          {/* Like/Remove Button */}
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
              <Trash2 size={16} color={isLiked ? '#fff' : '#999'} />
            </Pressable>
          </Animated.View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <Text style={styles.price}>{price || '—'}</Text>
          <Text style={styles.title} numberOfLines={2}>
            {title || 'Untitled'}
          </Text>
          {location && typeof location === 'string' && location.length > 0 && (
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 4,
  },
  container: {
    overflow: 'hidden',
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
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
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
  viewsBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  viewsText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
  },
  likeButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  likeButtonActive: {
    backgroundColor: '#ff6b6b',
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
});

export default ListingCard;
