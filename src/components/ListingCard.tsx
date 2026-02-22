import React from 'react';
import { TouchableOpacity, Image, Text, View, StyleSheet } from 'react-native';
import { ImageIcon, Eye, Heart, MapPin, Maximize2 } from 'lucide-react-native';
import { Listing } from '../data/mockData';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '../localization/LanguageContext';

interface ListingCardProps {
  listing: Listing;
  size?: 'normal' | 'large';
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const formatTimeAgo = (dateStr: string | null | undefined, t: any) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} ${t.listingCard.minAgo}`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} ${t.listingCard.hoursAgo}`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ${t.listingCard.daysAgo}`;
  return `${Math.floor(diffDays / 30)} ${t.listingCard.monthsAgo}`;
};

const ListingCard = ({ listing, size = 'normal', isFavorited, onToggleFavorite }: ListingCardProps) => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { listingId: listing.id })}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {listing.hasImage && listing.imageUrl ? (
          <Image
            source={{ uri: listing.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <ImageIcon size={28} color="#cbd5e1" />
            <Text style={styles.placeholderText}>{t.listingCard.noImage}</Text>
          </View>
        )}

        {/* Gradient overlay at bottom of image */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageGradient}
        />

        {/* Badge */}
        {listing.badge && (
          <View style={[
            styles.badgeContainer,
            listing.badge === 'TOP' && styles.badgeTop,
            listing.badge === 'VIP' && styles.badgeVip,
          ]}>
            <Text style={styles.badgeText}>{listing.badge}</Text>
          </View>
        )}

        {/* Favorite button */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleFavorite(listing.id);
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={18}
              color={isFavorited ? '#ef4444' : '#fff'}
              fill={isFavorited ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
        )}

        {/* Price on image */}
        <View style={styles.priceOnImage}>
          <Text style={styles.priceText}>{listing.price}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>

        {/* Details row */}
        <View style={styles.detailsRow}>
          {listing.rooms ? (
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{listing.rooms} {t.listingCard.rooms}</Text>
            </View>
          ) : null}
          {listing.area ? (
            <View style={styles.detailChip}>
              <Maximize2 size={10} color="#64748b" />
              <Text style={styles.detailText}>{listing.area} {listing.area_unit || 'm²'}</Text>
            </View>
          ) : null}
          {listing.floor ? (
            <View style={styles.detailChip}>
              <Text style={styles.detailText}>{listing.floor}/{listing.total_floors || '?'}</Text>
            </View>
          ) : null}
        </View>

        {/* Spacer to push footer to bottom */}
        <View style={styles.contentSpacer} />

        {/* Location */}
        <View style={styles.locationRow}>
          <MapPin size={12} color="#94a3b8" />
          <Text style={styles.locationText} numberOfLines={1}>
            {listing.location || ' '}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statRow}>
            {listing.views_count != null ? (
              <>
                <Eye size={12} color="#94a3b8" />
                <Text style={styles.statText}>{listing.views_count}</Text>
              </>
            ) : <View />}
          </View>
          <Text style={styles.timeText}>
            {listing.posted_at ? formatTimeAgo(listing.posted_at, t) : ' '}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListingCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 4,
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
  placeholderContainer: {
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
  content: {
    padding: 12,
    gap: 6,
    flex: 1,
  },
  contentSpacer: {
    flex: 1,
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
    justifyContent: 'space-between',
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
  timeText: {
    fontSize: 10,
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
  },
  badgeTop: {
    backgroundColor: '#6366f1',
  },
  badgeVip: {
    backgroundColor: '#f59e0b',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
