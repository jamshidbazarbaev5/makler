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
    Alert,
} from 'react-native';
import { ArrowLeft, MapPin, Eye, Heart, Edit2, Trash2, Share2, ImageIcon, Power, CheckCircle } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants';
import api from '../services/api';

const IMAGE_HEIGHT = 350;

interface AnnouncementImage {
    id: number;
    image_url: string;
    image_medium_url: string;
}

interface MyAnnouncementDetail {
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
    latitude: number | null;
    longitude: number | null;
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
    status: string;
    payment_status: string;
    promotion_type: string;
    rejection_reason: string;
    created_at: string;
    updated_at: string;
    posted_at: string | null;
    expires_at: string | null;
    days_until_expiration: number | null;
}

const MyListingDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoading, setImageLoading] = useState(true);
    const [listing, setListing] = useState<MyAnnouncementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const panResponder = useRef<any>(null);

    const listingId = route.params?.listingId;

    useEffect(() => {
        if (listingId) {
            fetchListing();
        }
    }, [listingId]);

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

    const images = listing?.images?.map(img => img.image_url) || [];

    useEffect(() => {
        if (images.length === 0) return;

        setImageLoading(true);
        panResponder.current = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderRelease: (_evt, gestureState) => {
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

    const getStatusLabel = (status: string) => {
        const statuses: Record<string, string> = {
            draft: 'Qoralama',
            active: 'Faol',
            pending: 'Tekshiruvda',
            inactive: 'Faol emas',
            rejected: 'Rad etilgan',
            sold: 'Sotilgan',
            rented: 'Ijaraga berilgan',
        };
        return statuses[status] || status;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#22c55e';
            case 'draft': return '#94a3b8';
            case 'pending': return '#f59e0b';
            case 'rejected': return '#ef4444';
            case 'inactive': return '#6b7280';
            case 'sold':
            case 'rented': return '#3b82f6';
            default: return '#64748b';
        }
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
                cosmetic: 'Kosmetik',
            };
            details.push({ label: 'Holati', value: conditions[listing.condition] || listing.condition });
        }
        return details;
    };

    const handleEdit = () => {
        navigation.navigate('PropertyForm', {
            listingId: listing?.id,
            editMode: true,
        });
    };

    const handleDelete = () => {
        Alert.alert(
            "E'lonni o'chirish",
            "Haqiqatan ham bu e'lonni o'chirmoqchimisiz?",
            [
                { text: 'Bekor qilish', style: 'cancel' },
                {
                    text: "O'chirish",
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (listing?.id) {
                                await api.deleteAnnouncement(listing.id);
                            }
                            Alert.alert('Muvaffaqiyatli', "E'lon o'chirildi");
                            navigation.goBack();
                        } catch (err) {
                            console.error('Delete error:', err);
                            Alert.alert('Xatolik', "E'lonni o'chirishda xatolik yuz berdi");
                        }
                    },
                },
            ]
        );
    };

    const handleDeactivate = () => {
        Alert.alert(
            "E'lonni deaktivatsiya qilish",
            "Bu e'lonni faolsizlantirmoqchimisiz?",
            [
                { text: 'Bekor qilish', style: 'cancel' },
                {
                    text: 'Deaktivatsiya',
                    onPress: async () => {
                        try {
                            if (listing?.id) {
                                await api.deactivateAnnouncement(listing.id);
                            }
                            Alert.alert('Muvaffaqiyatli', "E'lon deaktivatsiya qilindi");
                            fetchListing(); // Refresh to show updated status
                        } catch (err) {
                            console.error('Deactivate error:', err);
                            Alert.alert('Xatolik', "E'lonni deaktivatsiya qilishda xatolik yuz berdi");
                        }
                    },
                },
            ]
        );
    };

    const handleMarkSold = () => {
        const isSale = listing?.listing_type === 'sale';
        const title = isSale ? "Sotilgan deb belgilash" : "Ijaraga berilgan deb belgilash";
        const message = isSale
            ? "Bu mulk sotilganini tasdiqlaysizmi?"
            : "Bu mulk ijaraga berilganini tasdiqlaysizmi?";
        const successMessage = isSale ? "Sotilgan deb belgilandi" : "Ijaraga berilgan deb belgilandi";

        Alert.alert(
            title,
            message,
            [
                { text: 'Bekor qilish', style: 'cancel' },
                {
                    text: 'Tasdiqlash',
                    onPress: async () => {
                        try {
                            if (listing?.id) {
                                if (isSale) {
                                    await api.markAnnouncementSold(listing.id);
                                } else {
                                    await api.markAnnouncementRented(listing.id);
                                }
                            }
                            Alert.alert('Muvaffaqiyatli', successMessage);
                            fetchListing(); // Refresh to show updated status
                        } catch (err: any) {
                            console.error('Mark sold error details:', err.response?.data || err.message);
                            Alert.alert('Xatolik', err.response?.data?.detail || "Xatolik yuz berdi");
                        }
                    },
                },
            ]
        );
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
                            <ImageIcon size={48} color="#94a3b8" />
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

                    {/* Status Badge */}
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(listing.status) }]}>
                        <Text style={styles.statusBadgeText}>{getStatusLabel(listing.status)}</Text>
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
                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Eye size={16} color="#64748b" />
                            <Text style={styles.statText}>{listing.views_count} ko'rishlar</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Heart size={16} color="#64748b" />
                            <Text style={styles.statText}>{listing.favorites_count} sevimlilar</Text>
                        </View>
                    </View>

                    {/* Tags Row */}
                    <View style={styles.tagsContainer}>
                        <View style={styles.tagOutline}>
                            <Text style={styles.tagOutlineText}>{getPropertyTypeLabel(listing.property_type)}</Text>
                        </View>
                        <View style={styles.tagPrimary}>
                            <Text style={styles.tagPrimaryText}>{getListingTypeLabel(listing.listing_type)}</Text>
                        </View>
                    </View>

                    {/* Rejection Reason */}
                    {listing.status === 'rejected' && listing.rejection_reason && (
                        <View style={styles.rejectionBox}>
                            <Text style={styles.rejectionTitle}>Rad etilish sababi:</Text>
                            <Text style={styles.rejectionText}>{listing.rejection_reason}</Text>
                        </View>
                    )}

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
                            <Text style={styles.locationText}>
                                {listing.district?.translations?.ru?.name || "Noma'lum"}
                            </Text>
                        </View>
                    </View>

                    {/* Payment & Promotion Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>E'lon ma'lumotlari</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>To'lov holati</Text>
                            <View style={[
                                styles.infoBadge,
                                { backgroundColor: listing.payment_status === 'paid' ? '#dcfce7' : '#fef3c7' }
                            ]}>
                                <Text style={[
                                    styles.infoBadgeText,
                                    { color: listing.payment_status === 'paid' ? '#166534' : '#92400e' }
                                ]}>
                                    {listing.payment_status === 'paid' ? "To'langan" : "To'lanmagan"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Reklama turi</Text>
                            <Text style={styles.infoValue}>
                                {listing.promotion_type === 'standard' ? 'Standart' : listing.promotion_type}
                            </Text>
                        </View>
                        {listing.expires_at && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Amal qilish muddati</Text>
                                <Text style={styles.infoValue}>
                                    {listing.days_until_expiration} kun qoldi
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Bottom Spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Fixed Bottom Actions */}
            <View style={styles.bottomActionsContainer}>
                {/* Action Buttons Row */}
                {listing.status === 'active' && (
                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.deactivateButton}
                            activeOpacity={0.7}
                            onPress={handleDeactivate}
                        >
                            <Power size={18} color="#f59e0b" />
                            <Text style={styles.deactivateButtonText}>Deaktivatsiya</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.markSoldButton}
                            activeOpacity={0.7}
                            onPress={handleMarkSold}
                        >
                            <CheckCircle size={18} color="#22c55e" />
                            <Text style={styles.markSoldButtonText}>
                                {listing.listing_type === 'sale' ? 'Sotildi' : 'Ijaraga berildi'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Main Actions Row */}
                <View style={styles.mainActionsRow}>
                    <TouchableOpacity
                        style={styles.editButton}
                        activeOpacity={0.7}
                        onPress={handleEdit}
                    >
                        <Edit2 size={20} color="#fff" />
                        <Text style={styles.editButtonText}>Tahrirlash</Text>
                    </TouchableOpacity>
                    <View style={styles.bottomButtonsRow}>
                        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
                            <Share2 size={20} color={COLORS.gray700} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            activeOpacity={0.7}
                            onPress={handleDelete}
                        >
                            <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default MyListingDetailScreen;

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
        fontWeight: '600',
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
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 8,
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
        zIndex: 100,
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
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
    statsRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 14,
        color: '#64748b',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
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
    rejectionBox: {
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
    },
    rejectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#dc2626',
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 14,
        color: '#7f1d1d',
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
    },
    locationText: {
        color: '#64748b',
        fontSize: 16,
    },
    infoSection: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    infoSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#0f172a',
    },
    infoBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    infoBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    bottomSpacer: {
        height: 160,
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
        gap: 12,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    deactivateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fef3c7',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#f59e0b',
    },
    deactivateButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400e',
    },
    markSoldButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#dcfce7',
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#22c55e',
    },
    markSoldButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#166534',
    },
    mainActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    editButton: {
        flex: 1,
        backgroundColor: COLORS.purple,
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    editButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    shareButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
