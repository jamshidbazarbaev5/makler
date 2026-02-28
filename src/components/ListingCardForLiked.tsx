import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import { Heart, ImageIcon, Eye, MapPin, Maximize2, Trash2 } from 'lucide-react-native';
import { COLORS } from '../constants';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../localization/LanguageContext';

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
  floor?: number | null;
  total_floors?: number | null;
  area_unit?: string;
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
  isLiked = true,
  onToggleLike,
  onClick,
  views_count,
  floor,
  total_floors,
  area_unit,
}) => {
  const { t } = useLanguage();

  const formatAreaUnit = (unit?: string) => {
    if (unit === 'sqm') return 'm²';
    if (unit === 'sotix') return t.listingCard.sotix;
    return unit || 'm²';
  }
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

  const hasImage = !!imageUrl && imageUrl !== 'https://via.placeholder.com/300';

  return (
    <Animated.View
      style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
    >
      <Pressable onPress={handlePress} style={styles.container}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon size={28} color="#cbd5e1" />
              <Text style={styles.placeholderText}>{t.listingCard.noImage}</Text>
            </View>
          )}

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.45)']}
            style={styles.imageGradient}
          />

          {/* Badge */}
          {badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}

          {/* Remove Button */}
          <Animated.View
            style={[
              styles.removeButton,
              { transform: [{ scale: likeScaleAnim }] },
            ]}
          >
            <Pressable onPress={handleLike} style={styles.removeButtonPress}>
              <Trash2 size={16} color="#fff" />
            </Pressable>
          </Animated.View>

          {/* Price on image */}
          <View style={styles.priceOnImage}>
            <Text style={styles.priceText}>{price || '—'}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{title || 'Untitled'}</Text>

          {/* Details chips */}
          <View style={styles.detailsRow}>
            {bedrooms != null && bedrooms > 0 ? (
              <View style={styles.detailChip}>
                <Text style={styles.detailText}>{bedrooms} {t.listingCard.rooms}</Text>
              </View>
            ) : null}
            {area != null && area > 0 ? (
              <View style={styles.detailChip}>
                <Maximize2 size={10} color="#64748b" />
                <Text style={styles.detailText}>{area} {formatAreaUnit(area_unit)}</Text>
              </View>
            ) : null}
            {floor != null ? (
              <View style={styles.detailChip}>
                <Text style={styles.detailText}>{floor}/{total_floors || '?'}</Text>
              </View>
            ) : null}
          </View>

          {/* Spacer to push footer to bottom */}
          <View style={styles.contentSpacer} />

          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin size={12} color="#94a3b8" />
            <Text style={styles.locationText} numberOfLines={1}>
              {location && location.length > 0 ? location : ' '}
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.statRow}>
              {views_count != null ? (
                <>
                  <Eye size={12} color="#94a3b8" />
                  <Text style={styles.statText}>{views_count}</Text>
                </>
              ) : <View />}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 4,
  },
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#f1f5f9',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  placeholderText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.purple,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonPress: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceOnImage: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    padding: 12,
    gap: 6,
    flex: 1,
  },
  contentSpacer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 18,
    height: 36,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  detailText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
});

export default ListingCard;
