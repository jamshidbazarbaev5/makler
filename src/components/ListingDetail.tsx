import React, { useState, useRef, useCallback } from 'react';
import {
    ScrollView,
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
    ActivityIndicator,
    Linking,
    Platform,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { ArrowLeft, MapPin, Heart, MessageCircle, Send, ImageIcon, Navigation } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import SimilarListingsSection from './SimilarListingSection';
import BottomNav from './BottomNav';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToFavoritesAsync, removeFromFavoritesAsync } from '../redux/slices/likesSlice';
import api from '../services/api';
import { useLanguage } from '../localization/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 350;

interface AnnouncementImage {
    id: number;
    image_url: string;
    image_medium_url: string;
}

interface AnnouncementDetail {
    id: string;
    title: string;
    description: string;
    property_type: string;
    listing_type: string;
    building_type: string | null;
    condition: string | null;
    district: {
        id: number;
        translations: { ru: { name: string } };
    };
    price: string;
    currency: string;
    area: string;
    area_unit: string;
    rooms: number | null;
    floor: number | null;
    total_floors: number | null;
    phone: string | null;
    images: AnnouncementImage[];
    seller_name: string;
    seller_avatar: string | null;
    is_owner: boolean;
    views_count: number;
    favorites_count: number;
    created_at: string;
    latitude: number | null;
    longitude: number | null;
}

const ListingDetail = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [listing, setListing] = useState<AnnouncementDetail | null>(null);
    const [relatedListings, setRelatedListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const imageListRef = useRef<FlatList>(null);
    const likedIds = useAppSelector(state => state.likes.likedIds);
    const favoriteMap = useAppSelector(state => state.likes.favoriteMap);
    const { t } = useLanguage();
    const [isPhoneVisible, setIsPhoneVisible] = useState(false);

    const listingId = route.params?.listingId;

    useFocusEffect(
        React.useCallback(() => {
            if (listingId) {
                fetchListing();
            }
        }, [listingId])
    );

    const fetchListing = async () => {
        try {
            setLoading(true);
            setError(null);
            const [data, related] = await Promise.all([
                api.getAnnouncementById(listingId),
                api.getRelatedAnnouncements(listingId).catch(() => []),
            ]);
            setListing(data);
            setRelatedListings(related);
        } catch (err: any) {
            console.error('Error fetching listing:', err);
            setError('Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    const isLiked = listing ? likedIds.includes(listing.id) : false;

    const images = listing?.images?.map(img => img.image_url) || [];

    const onImageScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentImageIndex(index);
    }, []);

    const formatPrice = (price: string, currency: string) => {
        const num = parseFloat(price);
        if (currency === 'usd') {
            return `$${num.toLocaleString()}`;
        }
        return `${num.toLocaleString()} ${t.listingCard.sum}`;
    };

    const getPropertyTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            apartment: t.listingCard.apartment,
            house: t.listingCard.house,
            land: t.listingCard.land,
            commercial: t.listingCard.commercial,
        };
        return types[type] || type;
    };

    const getListingTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            sale: t.listingCard.sale,
            rent: t.listingCard.rent,
            rent_daily: t.listingCard.rentDaily,
        };
        return types[type] || type;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t.listingCard.today;
        if (diffDays === 1) return t.listingCard.yesterday;
        if (diffDays < 7) return `${diffDays} ${t.listingCard.daysAgo}`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t.listingCard.weeksAgo}`;
        return `${Math.floor(diffDays / 30)} ${t.listingCard.monthsAgo}`;
    };

    const buildDetails = () => {
        if (!listing) return [];
        const details: { label: string; value: string }[] = [];

        if (listing.area) {
            const unit = listing.area_unit === 'sqm' ? 'm²' : t.listingCard.sotix;
            details.push({ label: t.listingCard.area, value: `${listing.area} ${unit}` });
        }
        if (listing.rooms) {
            details.push({ label: t.listingCard.roomsLabel, value: `${listing.rooms}` });
        }
        if (listing.floor && listing.total_floors) {
            details.push({ label: t.listingCard.floor, value: `${listing.floor}/${listing.total_floors}` });
        }
        if (listing.building_type) {
            const buildingTypes: Record<string, string> = {
                new: t.listingCard.buildingNew,
                old: t.listingCard.buildingOld,
            };
            details.push({ label: t.listingCard.buildingType, value: buildingTypes[listing.building_type] || listing.building_type });
        }
        if (listing.condition) {
            const conditions: Record<string, string> = {
                euro_repair: t.listingCard.conditionEuro,
                cosmetic: t.listingCard.conditionCosmetic,
                needs_repair: t.listingCard.conditionRepair,
                capital: t.listingCard.conditionCapital,
                no_repair: t.listingCard.conditionNoRepair,
                design: t.listingCard.conditionDesign,
                euro: t.listingCard.conditionEuro,
                good: t.listingCard.conditionGood,
            };
            details.push({ label: t.listingCard.condition, value: conditions[listing.condition] || listing.condition });
        }
        return details;
    };

    const formatPhone = (phone: string) => {
        // Remove any non-digit chars except leading +
        const digits = phone.replace(/\D/g, '');
        // Format as +998 XX XXX XX XX
        if (digits.length === 12) {
            return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
        }
        // Fallback: just add + prefix
        return `+${digits}`;
    };

    const handleCall = () => {
        if (listing?.phone) {
            Linking.openURL(`tel:${listing.phone}`);
        }
    };

    const handlePhonePress = () => {
        if (!listing?.phone) return;

        if (!isPhoneVisible) {
            setIsPhoneVisible(true);
            return;
        }

        handleCall();
    };

    const getMapHtml = (lat: number, lng: number) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { width: 100%; height: 100%; overflow: hidden; }
                #map { width: 100%; height: 100%; }
                .leaflet-control-attribution { display: none !important; }
                .leaflet-control-zoom { display: none !important; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', {
                    zoomControl: false,
                    attributionControl: false,
                    dragging: false,
                    touchZoom: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false
                }).setView([${lat}, ${lng}], 15);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                }).addTo(map);

                var markerIcon = L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background: #dc2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                L.marker([${lat}, ${lng}], { icon: markerIcon }).addTo(map);
            </script>
        </body>
        </html>
    `;

    const openInMaps = (lat: number, lng: number) => {
        const label = listing?.title || 'Location';
        const scheme = Platform.select({
            ios: `maps:0,0?q=${label}@${lat},${lng}`,
            android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
        });

        if (scheme) {
            Linking.openURL(scheme).catch(() => {
                // Fallback to Google Maps web
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
            });
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color={COLORS.purple} />
            </View>
        );
    }

    if (error || !listing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
                    <Text style={styles.retryText}>Orqaga</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const details = buildDetails();

    const avatarUri = listing.seller_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller_name}`;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    {images.length > 0 ? (
                        <FlatList
                            ref={imageListRef}
                            data={images}
                            keyExtractor={(_, i) => i.toString()}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={onImageScroll}
                            getItemLayout={(_, index) => ({
                                length: SCREEN_WIDTH,
                                offset: SCREEN_WIDTH * index,
                                index,
                            })}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: SCREEN_WIDTH, height: IMAGE_HEIGHT }}
                                    resizeMode="cover"
                                />
                            )}
                        />
                    ) : (
                        <View style={[styles.image, styles.noImagePlaceholder]}>
                            <ImageIcon size={48} color={COLORS.gray400} />
                            <Text style={styles.noImageText}>{t.listingCard.noImage}</Text>
                        </View>
                    )}

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <ArrowLeft size={24} color="#fff" strokeWidth={2.5} />
                    </TouchableOpacity>

                    {/* User Badge */}
                    <View style={styles.userBadge}>
                        <Image source={{ uri: avatarUri }} style={styles.userAvatar} />
                        <Text style={styles.userText} numberOfLines={1}>{listing.seller_name}</Text>
                    </View>

                    {/* Image counter */}
                    {images.length > 1 && (
                        <View style={styles.imageCounter}>
                            <Text style={styles.imageCounterText}>
                                {currentImageIndex + 1}/{images.length}
                            </Text>
                        </View>
                    )}

                    {/* Pagination Dots */}
                    {images.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {images.map((_, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.paginationDot,
                                        index === currentImageIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Tags and Actions Row */}
                    <View style={styles.tagsActionsContainer}>
                        <View style={styles.tagsContainer}>
                            <View style={styles.tagOutline}>
                                <Text style={styles.tagOutlineText}>{getPropertyTypeLabel(listing.property_type)}</Text>
                            </View>
                            <View style={styles.tagPrimary}>
                                <Text style={styles.tagPrimaryText}>{getListingTypeLabel(listing.listing_type)}</Text>
                            </View>
                        </View>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                activeOpacity={0.7}
                                onPress={() => {
                                  if (listing) {
                                    if (isLiked) {
                                      const favoriteId = favoriteMap[listing.id];
                                      setListing(prev => prev ? ({...prev, favorites_count: Math.max(0, prev.favorites_count - 1)}) : null);
                                      dispatch(removeFromFavoritesAsync({ announcementId: listing.id, favoriteId }) as any);
                                    } else {
                                      setListing(prev => prev ? ({...prev, favorites_count: prev.favorites_count + 1}) : null);
                                      dispatch(addToFavoritesAsync(listing as any) as any);
                                    }
                                  }
                                }}
                            >
                                <Heart
                                    size={20}
                                    color={isLiked ? '#dc2626' : '#0f172a'}
                                    fill={isLiked ? '#dc2626' : 'none'}
                                />
                                <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                                    {listing.favorites_count}
                                </Text>
                            </TouchableOpacity>
                            {/*<TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>*/}
                            {/*    <MessageCircle size={20} color="#0f172a" />*/}
                            {/*</TouchableOpacity>*/}
                            {/*<TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>*/}
                            {/*    <Send size={20} color="#0f172a" />*/}
                            {/*</TouchableOpacity>*/}
                        </View>
                    </View>

                    {/* Time Posted */}
                    <Text style={styles.timePosted}>{formatTimeAgo(listing.created_at)}</Text>

                    {/* Title */}
                    <Text style={styles.title}>{listing.title}</Text>

                    {/* Price */}
                    <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>

                    {/* Description */}
                    {listing.description && (
                        <Text style={styles.description}>{listing.description}</Text>
                    )}

                    {/* Details Table */}
                    {details.length > 0 && (
                        <View style={styles.detailsContainer}>
                            {details.map((detail, index) => (
                                <View key={index} style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>{detail.label}</Text>
                                    <View style={styles.detailLine} />
                                    <Text style={styles.detailValue}>{detail.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Location Section */}
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationTitle}>{t.listingCard.location}</Text>
                        <View style={styles.locationAddress}>
                            <MapPin size={16} color="#64748b" />
                            <Text style={styles.locationText}>{listing.district?.translations?.ru?.name || t.listingCard.unknown}</Text>
                        </View>

                        {/* Interactive Map */}
                        {listing.latitude && listing.longitude ? (
                            <TouchableOpacity
                                style={styles.mapContainer}
                                onPress={() => openInMaps(listing.latitude!, listing.longitude!)}
                                activeOpacity={0.9}
                            >
                                <WebView
                                    source={{ html: getMapHtml(listing.latitude, listing.longitude) }}
                                    style={styles.mapWebView}
                                    scrollEnabled={false}
                                    pointerEvents="none"
                                />
                                <View style={styles.mapTapOverlay}>
                                    <Navigation size={20} color="#fff" />
                                    <Text style={styles.mapTapText}>{t.listingCard.openOnMap}</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.mapContainer}>
                                <View style={styles.noLocationPlaceholder}>
                                    <MapPin size={32} color={COLORS.gray400} />
                                    <Text style={styles.noLocationText}>{t.listingCard.noLocation}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Similar Listings */}
                    <SimilarListingsSection listings={relatedListings} />
                </View>

                {/* Bottom Spacer for Fixed Buttons */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Bottom Actions */}
            <View style={styles.bottomActionsContainer}>
                <TouchableOpacity style={styles.messageButton} activeOpacity={0.7} onPress={handlePhonePress}>
                    <Text style={styles.messageButtonText}>
                        {!listing?.phone
                            ? t.listingCard.noPhone
                            : isPhoneVisible
                                ? formatPhone(listing.phone)
                                : (t.listingCard.showNumber || 'Show number')}
                    </Text>
                </TouchableOpacity>
                <View style={styles.bottomButtonsRow}>
                    <TouchableOpacity style={styles.callButton} activeOpacity={0.7} onPress={handleCall}>
                        <Text style={styles.callButtonText}>{t.listingCard.callNow}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.locationButton,
                            !(listing?.latitude && listing?.longitude) && styles.locationButtonDisabled
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                            if (listing?.latitude && listing?.longitude) {
                                openInMaps(listing.latitude, listing.longitude);
                            }
                        }}
                        disabled={!(listing?.latitude && listing?.longitude)}
                    >
                        <Text style={styles.locationButtonText}>{t.listingCard.location}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <BottomNav />
        </View>
    );
};

export default ListingDetail;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: COLORS.purple,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    carouselContainer: {
        height: IMAGE_HEIGHT,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    noImagePlaceholder: {
        height: IMAGE_HEIGHT,
        backgroundColor: COLORS.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    noImageText: {
        color: COLORS.gray500,
        fontSize: 16,
        fontWeight: '500',
    },
    imageCounter: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    imageCounterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 100,
    },
    userBadge: {
        position: 'absolute',
        left: 16,
        bottom: 32,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
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
        maxWidth: 120,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    paginationDot: {
        height: 6,
        borderRadius: 3,
    },
    paginationDotActive: {
        width: 24,
        backgroundColor: COLORS.purple,
    },
    paginationDotInactive: {
        width: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    tagsActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagOutline: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#0f172a',
    },
    tagOutlineText: {
        color: '#0f172a',
        fontSize: 14,
        fontWeight: '500',
    },
    tagPrimary: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#6366f1',
    },
    tagPrimaryText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionText: {
        color: '#0f172a',
        fontSize: 14,
    },
    actionTextActive: {
        color: '#dc2626',
        fontWeight: '600',
    },
    timePosted: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'right',
        marginBottom: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 8,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 24,
        lineHeight: 24,
    },
    detailsContainer: {
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        flex: 1,
        color: '#64748b',
        fontSize: 16,
    },
    detailLine: {
        width: 64,
        height: 2,
        backgroundColor: '#6366f1',
        marginHorizontal: 16,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#0f172a',
    },
    locationContainer: {
        marginBottom: 24,
    },
    locationTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 12,
    },
    locationAddress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    locationText: {
        color: '#64748b',
        fontSize: 16,
    },
    mapContainer: {
        height: 192,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#e2e8f0',
        position: 'relative',
    },
    mapWebView: {
        width: '100%',
        height: '100%',
    },
    mapTapOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    mapTapText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    noLocationPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    noLocationText: {
        color: COLORS.gray500,
        fontSize: 14,
    },
    bottomSpacer: {
        height: 200,
    },
    bottomActionsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        padding: 16,
    },
    messageButton: {
        backgroundColor: '#e2e8f0',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    messageButtonText: {
        color: '#0f172a',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    callButton: {
        flex: 1,
        backgroundColor: '#0f172a',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    callButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    locationButton: {
        flex: 1,
        backgroundColor: '#6366f1',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    locationButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    locationButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
