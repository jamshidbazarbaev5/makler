import React, { useState } from 'react';
import {
    ScrollView,
    View,
    Image,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { listingDetail, similarListings } from '../data/mockData';
import SimilarListingsSection from './SimilarListingSection';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 350;

const ListingDetail = () => {
    const navigation = useNavigation<any>();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const listing = listingDetail;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* Image Carousel */}
                <View style={styles.carouselContainer}>
                    <Image
                        source={{ uri: listing.images[currentImageIndex] }}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.7}
                    >
                        <Icon name="arrow-left" size={20} color="#0f172a" />
                    </TouchableOpacity>

                    {/* User Badge */}
                    <View style={styles.userBadge}>
                        <Image source={{ uri: listing.avatar }} style={styles.userAvatar} />
                        <Text style={styles.userText} numberOfLines={1}>{listing.username}</Text>
                    </View>

                    {/* Pagination Dots */}
                    <View style={styles.paginationContainer}>
                        {listing.images.map((_, index) => (
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
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    {/* Tags and Actions Row */}
                    <View style={styles.tagsActionsContainer}>
                        <View style={styles.tagsContainer}>
                            <View style={styles.tagOutline}>
                                <Text style={styles.tagOutlineText}>{listing.category}</Text>
                            </View>
                            <View style={styles.tagPrimary}>
                                <Text style={styles.tagPrimaryText}>{listing.type}</Text>
                            </View>
                        </View>

                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                <Icon name="heart" size={20} color="#0f172a" />
                                <Text style={styles.actionText}>{listing.likesCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                <Icon name="message-circle" size={20} color="#0f172a" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                <Icon name="send" size={20} color="#0f172a" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Time Posted */}
                    <Text style={styles.timePosted}>{listing.timePosted}</Text>

                    {/* Title */}
                    <Text style={styles.title}>{listing.title}</Text>

                    {/* Price */}
                    <Text style={styles.price}>{listing.price}</Text>

                    {/* Description */}
                    <Text style={styles.description}>{listing.description}</Text>

                    {/* Details Table */}
                    <View style={styles.detailsContainer}>
                        {listing.details.map((detail, index) => (
                            <View key={index} style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{detail.label}</Text>
                                <View style={styles.detailLine} />
                                <Text style={styles.detailValue}>{detail.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Location Section */}
                    <View style={styles.locationContainer}>
                        <Text style={styles.locationTitle}>Joylashuv</Text>
                        <View style={styles.locationAddress}>
                            <Icon name="map-pin" size={16} color="#64748b" />
                            <Text style={styles.locationText}>{listing.locationAddress}</Text>
                        </View>

                        {/* Map Placeholder */}
                        <View style={styles.mapContainer}>
                            <Image
                                source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/69.2401,41.3111,14,0/400x200?access_token=pk.placeholder' }}
                                style={styles.mapImage}
                                resizeMode="cover"
                            />
                            <View style={styles.mapOverlay}>
                                <Icon name="map-pin" size={32} color="#dc2626" />
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
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
        height: 140,
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
