import React, { useState, useRef, useEffect } from 'react';
import {
    ScrollView,
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    PanResponder,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { ArrowLeft, MapPin, Heart, MessageCircle, Send, ImageIcon } from 'lucide-react-native';
import { similarListings } from '../data/mockData';
import SimilarListingsSection from './SimilarListingSection';
import BottomNav from './BottomNav';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addToFavoritesAsync, removeFromFavoritesAsync } from '../redux/slices/likesSlice';
import api from '../services/api';

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
}

const ListingDetail = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useAppDispatch();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [listing, setListing] = useState<AnnouncementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const panResponder = useRef<any>(null);
    const likedIds = useAppSelector(state => state.likes.likedIds);
    const favoriteMap = useAppSelector(state => state.likes.favoriteMap);

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
            const data = await api.getAnnouncementById(listingId);
            setListing(data);
        } catch (err: any) {
            console.error('Error fetching listing:', err);
            setError('Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

    const isLiked = listing ? likedIds.includes(listing.id) : false;

    const images = listing?.images?.map(img => img.image_url) || [];

    useEffect(() => {
        if (images.length === 0) return;

        setImageLoading(true);
        panResponder.current = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                const { dx, vx } = gestureState;
                const SWIPE_THRESHOLD = 50;
                const VELOCITY_THRESHOLD = 0.5;

                if (dx > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
                    setCurrentImageIndex((prevIndex) =>
                        prevIndex === 0 ? images.length - 1 : prevIndex - 1
                    );
                } else if (dx < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
                    setCurrentImageIndex((prevIndex) =>
                        prevIndex === images.length - 1 ? 0 : prevIndex + 1
                    );
                }
            },
        });
    }, [images.length]);

    const formatPrice = (price: string, currency: string) => {
        const num = parseFloat(price);
        if (currency === 'usd') {
            return `$${num.toLocaleString()}`;
        }
        return `${num.toLocaleString()} so'm`;
    };

    const getPropertyTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            apartment: 'Kvartira',
            house: 'Uy',
            land: 'Yer',
            commercial: 'Tijorat',
        };
        return types[type] || type;
    };

    const getListingTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            sale: 'Sotish',
            rent: 'Ijara',
            rent_daily: 'Kunlik ijara',
        };
        return types[type] || type;
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Bugun';
        if (diffDays === 1) return 'Kecha';
        if (diffDays < 7) return `${diffDays} kun oldin`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
        return `${Math.floor(diffDays / 30)} oy oldin`;
    };

    const buildDetails = () => {
        if (!listing) return [];
        const details: { label: string; value: string }[] = [];

        if (listing.area) {
            const unit = listing.area_unit === 'sqm' ? 'm²' : 'sotix';
            details.push({ label: 'Maydon', value: `${listing.area} ${unit}` });
        }
        if (listing.rooms) {
            details.push({ label: 'Xonalar', value: `${listing.rooms}` });
        }
        if (listing.floor && listing.total_floors) {
            details.push({ label: 'Qavat', value: `${listing.floor}/${listing.total_floors}` });
        }
        if (listing.building_type) {
            const buildingTypes: Record<string, string> = {
                new: 'Yangi',
                old: 'Eski',
            };
            details.push({ label: 'Bino turi', value: buildingTypes[listing.building_type] || listing.building_type });
        }
        if (listing.condition) {
            const conditions: Record<string, string> = {
                euro: 'Yevroremont',
                good: 'Yaxshi',
                needs_repair: "Ta'mir talab",
            };
            details.push({ label: 'Holati', value: conditions[listing.condition] || listing.condition });
        }
        return details;
    };

    const handleCall = () => {
        if (listing?.phone) {
            Linking.openURL(`tel:${listing.phone}`);
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
                <View
                    style={styles.carouselContainer}
                    {...panResponder.current?.panHandlers}
                >
                    {images.length > 0 ? (
                        <Image
                            source={{ uri: images[currentImageIndex] }}
                            style={styles.image}
                            resizeMode="cover"
                            onLoadStart={() => setImageLoading(true)}
                            onLoadEnd={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                        />
                    ) : (
                        <View style={[styles.image, styles.noImagePlaceholder]}>
                            <ImageIcon size={48} color={COLORS.gray400} />
                            <Text style={styles.noImageText}>Rasm yo'q</Text>
                        </View>
                    )}

                    {imageLoading && images.length > 0 && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={COLORS.purple} />
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

                    {/* Pagination Dots */}
                    {images.length > 1 && (
                        <View style={styles.paginationContainer}>
                            {images.map((_, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setCurrentImageIndex(index)}
                                    style={[
                                        styles.paginationDot,
                                        index === currentImageIndex ? styles.paginationDotActive : styles.paginationDotInactive,
                                    ]}
                                    activeOpacity={0.7}
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
                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                <MessageCircle size={20} color="#0f172a" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                <Send size={20} color="#0f172a" />
                            </TouchableOpacity>
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
                        <Text style={styles.locationTitle}>Joylashuv</Text>
                        <View style={styles.locationAddress}>
                            <MapPin size={16} color="#64748b" />
                            <Text style={styles.locationText}>{listing.district?.translations?.ru?.name || 'Noma\'lum'}</Text>
                        </View>

                        {/* Map Placeholder */}
                        <View style={styles.mapContainer}>
                            <Image
                                source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/69.2401,41.3111,14,0/400x200?access_token=pk.placeholder' }}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                            <View style={styles.mapOverlay}>
                                <MapPin size={32} color="#dc2626" />
                                <Text style={styles.mapText}>Yandex Maps</Text>
                            </View>
                        </View>
                    </View>

                    {/* Similar Listings */}
                    <SimilarListingsSection listings={similarListings} />
                </View>

                {/* Bottom Spacer for Fixed Buttons */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Bottom Actions */}
            <View style={styles.bottomActionsContainer}>
                <TouchableOpacity style={styles.messageButton} activeOpacity={0.7}>
                    <Text style={styles.messageButtonText}>Sotuvchiga yozing</Text>
                </TouchableOpacity>
                <View style={styles.bottomButtonsRow}>
                    <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
                        <Text style={styles.callButtonText}>Qo'ng'iroq qiling</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.locationButton} activeOpacity={0.7}>
                        <Text style={styles.locationButtonText}>Joylashuv</Text>
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
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
        bottom: 16,
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
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    mapOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
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
    locationButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});
