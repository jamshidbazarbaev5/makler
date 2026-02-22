import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    ScrollView,
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    ActivityIndicator,
    Alert,
    Platform,
    Linking,
    Modal,
    Animated,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { ArrowLeft, MapPin, Eye, Heart, Edit2, Trash2, Share2, ImageIcon, Navigation, CreditCard, MoreHorizontal, Power, CheckCircle, TrendingUp, X } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants';
import api from '../services/api';
import { useLanguage } from '../localization';

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

interface PaymentSettings {
    payment_enabled: boolean;
    featured_enabled: boolean;
    post_price: string;
    featured_price: string;
    post_duration_days: number;
    featured_duration_days: number;
}

const MyListingDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { t } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [listing, setListing] = useState<MyAnnouncementDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
    const [moreModalVisible, setMoreModalVisible] = useState(false);
    const imageListRef = useRef<FlatList>(null);

    const listingId = route.params?.listingId;

    useFocusEffect(
        useCallback(() => {
            if (listingId) {
                fetchListing();
                fetchPaymentSettings();
            }
        }, [listingId])
    );

    const fetchPaymentSettings = async () => {
        try {
            const settings = await api.getPaymentSettings();
            setPaymentSettings(settings);
        } catch (err) {
            console.error('Error fetching payment settings:', err);
        }
    };

    const fetchListing = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAnnouncementById(listingId);
            console.log('Listing data:', JSON.stringify(data, null, 2));
            console.log('Status:', data.status);
            console.log('Payment status:', data.payment_status);
            setListing(data);
        } catch (err: any) {
            console.error('Error fetching listing:', err);
            setError('Failed to load listing');
        } finally {
            setLoading(false);
        }
    };

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
            sale: t.categories.sale,
            rent: t.categories.rent,
            rent_daily: t.categories.daily,
        };
        return types[type] || type;
    };

    const getStatusLabel = (status: string) => {
        const statuses: Record<string, string> = {
            draft: t.myListings.draft,
            active: t.myListings.active,
            pending: t.myListings.processing,
            inactive: t.myListings.inactive,
            rejected: t.myListings.rejected,
            sold: t.myListings.markAsSold,
            rented: t.myListings.markAsRented,
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
        if (listing?.id) {
            navigation.navigate('EditAnnouncement', {
                listingId: listing.id,
            });
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t.myListings.delete,
            t.myListings.deleteConfirm,
            [
                { text: t.common.cancel, style: 'cancel' },
                {
                    text: t.common.delete,
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (listing?.id) {
                                await api.deleteAnnouncement(listing.id);
                            }
                            Alert.alert(t.common.done, t.success.deleted);
                            navigation.goBack();
                        } catch (err) {
                            console.error('Delete error:', err);
                            Alert.alert(t.common.error, t.errors.somethingWentWrong);
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
        const title = isSale ? t.myListings.markAsSold : t.myListings.markAsRented;
        const message = t.common.confirm;
        const successMessage = t.success.updated;

        Alert.alert(
            title,
            message,
            [
                { text: t.common.cancel, style: 'cancel' },
                {
                    text: t.common.confirm,
                    onPress: async () => {
                        try {
                            if (listing?.id) {
                                if (isSale) {
                                    await api.markAnnouncementSold(listing.id);
                                } else {
                                    await api.markAnnouncementRented(listing.id);
                                }
                            }
                            Alert.alert(t.common.done, successMessage);
                            fetchListing(); // Refresh to show updated status
                        } catch (err: any) {
                            console.error('Mark sold error details:', err.response?.data || err.message);
                            Alert.alert(t.common.error, err.response?.data?.detail || t.errors.somethingWentWrong);
                        }
                    },
                },
            ]
        );
    };

    // Navigate to payment screen for posting fee
    const handlePayForPost = () => {
        if (listing?.id && paymentSettings?.payment_enabled && (listing.status === 'draft' || listing.status === 'inactive')) {
            navigation.navigate('Payment', {
                announcementId: listing.id,
                paymentType: 'post',
                amount: parseFloat(paymentSettings.post_price),
                durationDays: paymentSettings.post_duration_days,
            });
        }
    };

    // Navigate to payment screen for featuring/promoting
    // Only available when announcement is active
    const handlePromoteListing = () => {
        if (listing?.id && paymentSettings?.featured_enabled && listing.status === 'active') {
            navigation.navigate('Payment', {
                announcementId: listing.id,
                paymentType: 'featured',
                amount: parseFloat(paymentSettings.featured_price),
                durationDays: paymentSettings.featured_duration_days,
            });
        }
    };

    // Check if payment button should be shown
    const canPayForPost = (listing?.status === 'draft' || listing?.status === 'inactive') && paymentSettings?.payment_enabled;
    const canPromote = listing?.status === 'active' && paymentSettings?.featured_enabled;

    const handleMoreActions = () => {
        setMoreModalVisible(true);
    };

    const hasMoreActions = listing?.status === 'active' || (canPromote && listing?.promotion_type === 'standard');

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
                            <ImageIcon size={48} color="#94a3b8" />
                            <Text style={styles.noImageText}>Rasm yo'q</Text>
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

                    {/* Image Counter */}
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

                        {/* Map View */}
                        {listing.latitude && listing.longitude && (
                            <View style={styles.mapViewContainer}>
                                <WebView
                                    style={styles.mapWebView}
                                    scrollEnabled={false}
                                    source={{
                                        html: `
                                            <!DOCTYPE html>
                                            <html>
                                            <head>
                                                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                                                <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                                                <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                                                <style>
                                                    * { margin: 0; padding: 0; }
                                                    html, body, #map { width: 100%; height: 100%; }
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
                                                        doubleClickZoom: false,
                                                        scrollWheelZoom: false
                                                    }).setView([${listing.latitude}, ${listing.longitude}], 15);

                                                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                                                    var markerIcon = L.divIcon({
                                                        html: '<div style="background-color: #6366f1; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                                                        className: 'custom-marker',
                                                        iconSize: [24, 24],
                                                        iconAnchor: [12, 12]
                                                    });

                                                    L.marker([${listing.latitude}, ${listing.longitude}], { icon: markerIcon }).addTo(map);
                                                </script>
                                            </body>
                                            </html>
                                        `
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.openMapsButton}
                                    onPress={() => {
                                        const url = Platform.OS === 'ios'
                                            ? `maps:?q=${listing.latitude},${listing.longitude}`
                                            : `geo:${listing.latitude},${listing.longitude}?q=${listing.latitude},${listing.longitude}`;
                                        Linking.openURL(url).catch(() => {
                                            Linking.openURL(`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`);
                                        });
                                    }}
                                >
                                    <Navigation size={16} color="#fff" />
                                    <Text style={styles.openMapsButtonText}>Xaritada ochish</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Payment & Promotion Info */}
                    <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>{t?.profileFilters?.listingInfo || "E'lon ma'lumotlari"}</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t?.profileFilters?.paymentStatus || "To'lov holati"}</Text>
                            <View style={[
                                styles.infoBadge,
                                { backgroundColor: listing.payment_status === 'paid' ? '#dcfce7' : '#fef3c7' }
                            ]}>
                                <Text style={[
                                    styles.infoBadgeText,
                                    { color: listing.payment_status === 'paid' ? '#166534' : '#92400e' }
                                ]}>
                                    {listing.payment_status === 'paid' ? (t?.profileFilters?.paid || "To'langan") : (t?.profileFilters?.unpaid || "To'lanmagan")}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{t?.profileFilters?.promotionType || "Reklama turi"}</Text>
                            <Text style={styles.infoValue}>
                                {listing.promotion_type === 'standard' ? (t?.profileFilters?.standard || 'Standart') : listing.promotion_type}
                            </Text>
                        </View>
                        {listing.expires_at && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{t?.profileFilters?.validity || "Amal qilish muddati"}</Text>
                                <Text style={styles.infoValue}>
                                    {listing.days_until_expiration} {t?.profileFilters?.daysLeft || "kun qoldi"}
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
                {/* Payment Button - Show for draft/inactive */}
                {canPayForPost && (
                    <TouchableOpacity
                        style={styles.paymentButton}
                        activeOpacity={0.7}
                        onPress={handlePayForPost}
                    >
                        <CreditCard size={20} color="#fff" />
                        <Text style={styles.paymentButtonText}>
                            {t?.payment?.payNow || "To'lov qilish"}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Compact Actions Row */}
                <View style={styles.mainActionsRow}>
                    {listing?.status !== 'active' && (
                        <TouchableOpacity
                            style={styles.editButton}
                            activeOpacity={0.7}
                            onPress={handleEdit}
                        >
                            <Edit2 size={20} color="#fff" />
                            <Text style={styles.editButtonText}>{t.myListings.edit}</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.bottomButtonsRow}>
                        <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
                            <Share2 size={20} color={COLORS.gray700} />
                        </TouchableOpacity>
                        {hasMoreActions && (
                            <TouchableOpacity
                                style={styles.moreButton}
                                activeOpacity={0.7}
                                onPress={handleMoreActions}
                            >
                                <MoreHorizontal size={20} color={COLORS.gray700} />
                            </TouchableOpacity>
                        )}
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

            {/* More Actions Bottom Sheet Modal */}
            <Modal
                transparent
                visible={moreModalVisible}
                animationType="fade"
                onRequestClose={() => setMoreModalVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalOverlay}
                    onPress={() => setMoreModalVisible(false)}
                >
                    <View />
                </TouchableOpacity>

                <View style={styles.modalSheet}>
                    {/* Handle Bar */}
                    <View style={styles.modalHandle}>
                        <View style={styles.modalHandleBar} />
                    </View>

                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Amallar</Text>
                        <TouchableOpacity onPress={() => setMoreModalVisible(false)}>
                            <X size={22} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Action Items */}
                    <View style={styles.modalContent}>
                        {listing?.status === 'active' && (
                            <>
                                <TouchableOpacity
                                    style={styles.modalActionItem}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setMoreModalVisible(false);
                                        handleMarkSold();
                                    }}
                                >
                                    <View style={[styles.modalIconBox, { backgroundColor: '#dcfce7' }]}>
                                        <CheckCircle size={20} color="#22c55e" />
                                    </View>
                                    <View style={styles.modalActionTextContainer}>
                                        <Text style={styles.modalActionTitle}>
                                            {listing.listing_type === 'sale' ? t.myListings.markAsSold : t.myListings.markAsRented}
                                        </Text>
                                        <Text style={styles.modalActionSubtitle}>
                                            {listing.listing_type === 'sale'
                                                ? "E'lonni sotilgan deb belgilash"
                                                : "E'lonni ijaraga berilgan deb belgilash"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalActionItem}
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        setMoreModalVisible(false);
                                        handleDeactivate();
                                    }}
                                >
                                    <View style={[styles.modalIconBox, { backgroundColor: '#fef3c7' }]}>
                                        <Power size={20} color="#f59e0b" />
                                    </View>
                                    <View style={styles.modalActionTextContainer}>
                                        <Text style={styles.modalActionTitle}>Deaktivatsiya</Text>
                                        <Text style={styles.modalActionSubtitle}>E'lonni vaqtincha to'xtatish</Text>
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}

                        {canPromote && listing?.promotion_type === 'standard' && (
                            <TouchableOpacity
                                style={styles.modalActionItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    setMoreModalVisible(false);
                                    handlePromoteListing();
                                }}
                            >
                                <View style={[styles.modalIconBox, { backgroundColor: '#fef3c7' }]}>
                                    <TrendingUp size={20} color="#f59e0b" />
                                </View>
                                <View style={styles.modalActionTextContainer}>
                                    <Text style={styles.modalActionTitle}>
                                        {t?.payment?.promoteListing || "E'lonni ko'tarish"}
                                    </Text>
                                    <Text style={styles.modalActionSubtitle}>E'lonni yuqoriga chiqarish</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
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
    imageCounter: {
        position: 'absolute',
        top: 16,
        right: 70,
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
    mapViewContainer: {
        marginTop: 16,
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    mapWebView: {
        flex: 1,
        borderRadius: 12,
    },
    openMapsButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: COLORS.purple,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    openMapsButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
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
        height: 120,
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
    moreButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainActionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
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
    paymentButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    paymentButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHandle: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalHandleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#d1d5db',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    modalContent: {
        paddingHorizontal: 16,
        paddingBottom: 36,
    },
    modalActionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 14,
    },
    modalIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalActionTextContainer: {
        flex: 1,
    },
    modalActionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 2,
    },
    modalActionSubtitle: {
        fontSize: 13,
        color: '#94a3b8',
    },
});
