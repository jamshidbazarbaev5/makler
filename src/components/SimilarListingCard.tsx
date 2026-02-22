import React, { useState } from 'react';
import { Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { ImageIcon, MapPin, Bed, Maximize2 } from 'lucide-react-native';
import { useLanguage } from '../localization/LanguageContext';

export interface RelatedListing {
    id: string;
    title: string;
    price: string;
    currency: string;
    listing_type?: string;
    property_type?: string;
    seller_name: string;
    seller_avatar: string | null;
    main_image: string | null;
    images?: { image_url: string }[];
    rooms?: number | null;
    area?: string | null;
    area_unit?: string;
    district?: { translations?: { ru?: { name?: string } } } | null;
    location?: string;
}

interface SimilarListingCardProps {
    listing: RelatedListing;
    onPress?: () => void;
}

const SimilarListingCard = ({ listing, onPress }: SimilarListingCardProps) => {
    const { t } = useLanguage();
    const imageUrl = listing.main_image || listing.images?.[0]?.image_url;

    const formatPrice = (price: string, currency: string) => {
        const num = parseFloat(price);
        if (isNaN(num)) return price;
        if (currency === 'usd') return `$${num.toLocaleString()}`;
        return `${num.toLocaleString()} ${t.listingCard.sum}`;
    };

    const getListingTypeLabel = (type?: string) => {
        const map: Record<string, string> = { sale: t.listingCard.sale, rent: t.listingCard.rent, rent_daily: t.listingCard.rentDaily };
        return map[type || ''] || '';
    };

    const getListingTypeBg = (type?: string) => {
        if (type === 'sale') return '#3b82f6';
        return '#10b981';
    };

    const districtName = listing.district?.translations?.ru?.name || listing.location || '';

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {/* Image */}
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <ImageIcon size={28} color="#cbd5e1" strokeWidth={1.5} />
                    </View>
                )}

                {/* Listing type badge */}
                {listing.listing_type && (
                    <View style={[styles.typeBadge, { backgroundColor: getListingTypeBg(listing.listing_type) }]}>
                        <Text style={styles.typeBadgeText}>{getListingTypeLabel(listing.listing_type)}</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>
                <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>

                {/* Details row */}
                <View style={styles.detailsRow}>
                    {listing.rooms ? (
                        <View style={styles.detailItem}>
                            <Bed size={12} color="#94a3b8" />
                            <Text style={styles.detailText}>{listing.rooms}</Text>
                        </View>
                    ) : null}
                    {listing.area ? (
                        <View style={styles.detailItem}>
                            <Maximize2 size={12} color="#94a3b8" />
                            <Text style={styles.detailText}>
                                {parseFloat(listing.area)} {listing.area_unit === 'sqm' ? 'm²' : t.listingCard.sotix}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Location */}
                {districtName ? (
                    <View style={styles.locationRow}>
                        <MapPin size={11} color="#94a3b8" />
                        <Text style={styles.locationText} numberOfLines={1}>{districtName}</Text>
                    </View>
                ) : null}
            </View>
        </TouchableOpacity>
    );
};

export default SimilarListingCard;

const styles = StyleSheet.create({
    card: {
        width: 160,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    imageContainer: {
        height: 110,
        position: 'relative',
        backgroundColor: '#f1f5f9',
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
    typeBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    content: {
        padding: 10,
        gap: 3,
    },
    price: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.3,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        color: '#475569',
        lineHeight: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 4,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    detailText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '500',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 4,
    },
    locationText: {
        fontSize: 11,
        color: '#94a3b8',
        flex: 1,
    },
});
