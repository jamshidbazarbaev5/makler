import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, List, AlertCircle } from 'lucide-react-native';
import { COLORS } from '../constants';
import api from '../services/api';
import BottomNav from '../components/BottomNav';
import { useLanguage } from '../localization';

interface Announcement {
    id: string;
    title: string;
    price: string;
    currency: string;
    latitude: number | null;
    longitude: number | null;
    property_type: string;
    listing_type: string;
    main_image: string | null;
    images?: { image_url: string }[];
}

const MapScreen = () => {
    const navigation = useNavigation<any>();
    const { t } = useLanguage();
    const webViewRef = useRef<WebView>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all pages
            let allResults: any[] = [];
            let page = 1;
            const limit = 100;
            let totalCount = 0;

            console.log('📍 Fetching all announcements...');

            while (true) {
                const data = await api.getAnnouncements(page, limit);
                const results = data.results || [];
                totalCount = data.count || 0;

                allResults = [...allResults, ...results];
                console.log(`📍 Page ${page}: got ${results.length}, total so far: ${allResults.length}/${totalCount}`);

                if (results.length < limit || allResults.length >= totalCount) {
                    break;
                }
                page++;
            }

            setTotalCount(totalCount);

            // TEMPORARY: Fetch details for each to get coordinates
            // TODO: Remove this when backend includes lat/lng in list endpoint
            console.log(`📍 Fetching details for ${allResults.length} announcements...`);

            const detailedResults = await Promise.all(
                allResults.map(async (a: any) => {
                    try {
                        const detail = await api.getAnnouncementById(a.id);
                        return {
                            ...a,
                            latitude: detail.latitude,
                            longitude: detail.longitude,
                            images: detail.images,
                        };
                    } catch (err) {
                        return a;
                    }
                })
            );

            // Filter only announcements with coordinates
            const withCoords = detailedResults.filter(
                (a: any) => a.latitude != null && a.longitude != null
            );

            console.log(`📍 Total: ${allResults.length}, With coords: ${withCoords.length}`);
            setAnnouncements(withCoords);
        } catch (err: any) {
            console.error('Error fetching announcements:', err);
            setError(t.errors.somethingWentWrong);
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerClick') {
                navigation.navigate('ListingDetail', { listingId: data.id });
            }
        } catch (error) {
            console.error('Error parsing map message:', error);
        }
    };

    const formatPrice = (price: string, currency: string) => {
        const num = parseFloat(price);
        if (currency === 'usd') {
            return `$${num.toLocaleString()}`;
        }
        return `${num.toLocaleString()} so'm`;
    };

    const getPropertyTypeColor = (type: string) => {
        switch (type) {
            case 'apartment': return '#6366f1';
            case 'house': return '#22c55e';
            case 'land': return '#f59e0b';
            case 'commercial': return '#ef4444';
            default: return '#6366f1';
        }
    };

    const getImageUrl = (a: Announcement) => {
        if (a.images && a.images.length > 0) {
            return a.images[0].image_url;
        }
        if (a.main_image) {
            return a.main_image;
        }
        return null;
    };

    const markersJson = JSON.stringify(
        announcements.map(a => ({
            id: a.id,
            lat: a.latitude,
            lng: a.longitude,
            title: a.title,
            price: formatPrice(a.price, a.currency),
            color: getPropertyTypeColor(a.property_type),
            propertyType: a.property_type,
            listingType: a.listing_type,
            image: getImageUrl(a),
        }))
    );

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body, #map { width: 100%; height: 100%; }
                .custom-popup {
                    min-width: 200px;
                }
                .custom-popup .image {
                    width: 100%;
                    height: 100px;
                    object-fit: cover;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    background: #f1f5f9;
                }
                .custom-popup .no-image {
                    width: 100%;
                    height: 100px;
                    border-radius: 6px;
                    margin-bottom: 8px;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    font-size: 12px;
                }
                .custom-popup .title {
                    font-weight: 600;
                    font-size: 14px;
                    color: #0f172a;
                    margin-bottom: 4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }
                .custom-popup .price {
                    font-weight: 700;
                    font-size: 16px;
                    color: #6366f1;
                }
                .custom-popup .view-btn {
                    display: block;
                    margin-top: 8px;
                    padding: 8px 12px;
                    background: #6366f1;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var markers = ${markersJson};

                // Default center to Nukus if no markers
                var defaultLat = 42.4602;
                var defaultLng = 59.6034;
                var defaultZoom = 12;

                // Calculate bounds if we have markers
                if (markers.length > 0) {
                    var lats = markers.map(m => m.lat);
                    var lngs = markers.map(m => m.lng);
                    defaultLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                    defaultLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
                }

                var map = L.map('map', {
                    zoomControl: true,
                    attributionControl: false
                }).setView([defaultLat, defaultLng], defaultZoom);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

                // Add markers
                var markerGroup = L.featureGroup();

                markers.forEach(function(m) {
                    var markerIcon = L.divIcon({
                        html: '<div style="background-color: ' + m.color + '; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg></div>',
                        className: 'custom-marker',
                        iconSize: [32, 32],
                        iconAnchor: [16, 16],
                        popupAnchor: [0, -16]
                    });

                    var marker = L.marker([m.lat, m.lng], { icon: markerIcon });

                    var imageHtml = m.image
                        ? '<img class="image" src="' + m.image + '" onerror="this.style.display=\\'none\\'" />'
                        : '<div class="no-image">Rasm yo\\'q</div>';

                    var popupContent = '<div class="custom-popup">' +
                        imageHtml +
                        '<div class="title">' + m.title + '</div>' +
                        '<div class="price">' + m.price + '</div>' +
                        '<button class="view-btn" onclick="viewDetail(\\'' + m.id + '\\')">Ko\\'rish</button>' +
                        '</div>';

                    marker.bindPopup(popupContent);
                    marker.addTo(markerGroup);
                });

                markerGroup.addTo(map);

                // Fit bounds to show all markers
                if (markers.length > 0) {
                    map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
                }

                function viewDetail(id) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'markerClick',
                        id: id
                    }));
                }
            </script>
        </body>
        </html>
    `;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.purple} />
                    <Text style={styles.loadingText}>Xarita yuklanmoqda...</Text>
                </View>
                <BottomNav />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchAnnouncements}>
                        <Text style={styles.retryText}>Qayta urinish</Text>
                    </TouchableOpacity>
                </View>
                <BottomNav />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Xaritada ko'rish</Text>
                <TouchableOpacity
                    style={styles.listButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <List size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Warning if no coordinates */}
            {announcements.length === 0 && totalCount > 0 && (
                <View style={styles.warningBanner}>
                    <AlertCircle size={16} color="#92400e" />
                    <Text style={styles.warningText}>
                        E'lonlarda joylashuv ma'lumoti yo'q. Backend'da latitude/longitude qo'shilishi kerak.
                    </Text>
                </View>
            )}

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#6366f1' }]} />
                    <Text style={styles.legendText}>Kvartira</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                    <Text style={styles.legendText}>Uy</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                    <Text style={styles.legendText}>Yer</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                    <Text style={styles.legendText}>Tijorat</Text>
                </View>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ html: htmlContent }}
                    style={styles.webview}
                    onMessage={handleMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />
            </View>

            {/* Count Badge */}
            <View style={styles.countBadge}>
                <Text style={styles.countText}>
                    {announcements.length} / {totalCount} ta e'lon xaritada
                </Text>
            </View>

            <BottomNav />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    listButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#92400e',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f8fafc',
        gap: 16,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#64748b',
    },
    mapContainer: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    countBadge: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: '#0f172a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    countText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default MapScreen;
