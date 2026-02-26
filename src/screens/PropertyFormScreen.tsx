import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { ArrowLeft, MapPin, Camera, ImageIcon, X, CheckCircle, XCircle } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BottomNav from '../components/BottomNav';
import MapPicker from '../components/MapPicker';
import ApiClient from '../services/api';
import { useLanguage } from '../localization';

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  renovation: string;
  country: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  images: string[];
  propertyOwner: string; // 'owner' or 'realtor'
  apartmentType: string; // 'new' or 'secondary'
  roomsCount: string;
  totalArea: string;
  latitude?: number;
  longitude?: number;
}

interface RouteParams {
  listingType?: string;
  propertyType?: string;
}

const PropertyFormScreen = () => {
  const route = useRoute();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { t } = useLanguage();
  const params = route.params as (RouteParams & {propertyType?: string}) | undefined;
  const listingType = params?.listingType || 'sell';
  const propertyType = params?.propertyType || 'kvartira';

  const listingTypeMap: { [key: string]: string } = {
    'daily-rent': t?.propertyForm?.dailyRent || 'Daily Rent',
    'monthly-rent': t?.propertyForm?.monthlyRent || 'Monthly Rent',
    'sell': t?.propertyForm?.sell || 'Sell',
    'daily-rent-buy': t?.propertyForm?.searchRent || 'Search Rent',
    'buy': t?.propertyForm?.buy || 'Buy',
  };
  const headerTitle = listingTypeMap[listingType] || t?.propertyTypeScreen?.apartment || 'Apartment';

  // Properly map incoming listing types to API values
  const normalizedListingType = useMemo(() => {
    switch(listingType) {
      case 'daily-rent': return 'rent_daily';
      case 'monthly-rent': return 'rent';
      case 'sell': return 'sale';
      case 'buy': return 'sale'; // Buying is technically searching for sales
      default: return 'sale';
    }
  }, [listingType]);

  // Map property types to API values
  const normalizedPropertyType = useMemo(() => {
    switch(propertyType) {
      case 'kvartira': return 'apartment';
      case 'hovli-kottej-dacha': return 'house';
      case 'land': return 'land';
      case 'commercial': return 'commercial';
      default: return 'apartment';
    }
  }, [propertyType]);

  const renovationItems = [
    { label: t?.propertyForm?.renovationSelect || 'Select renovation', value: 'select' },
    { label: t?.propertyForm?.renovationNew || 'Freshly renovated', value: 'euro_repair' },
    { label: t?.propertyForm?.renovationOld || 'Old renovation', value: 'needs_repair' },
    { label: t?.propertyForm?.renovationGood || 'Good condition', value: 'cosmetic' },
    { label: t?.propertyForm?.renovationEuro || 'Euro renovation', value: 'euro_repair' },
    { label: t?.propertyForm?.renovationCapital || 'Capital renovation', value: 'capital' },
    { label: t?.propertyForm?.renovationNone || 'No renovation', value: 'no_repair' },
    { label: t?.propertyForm?.renovationDesign || 'Designer', value: 'design' },
  ];

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    bedrooms: '',
    bathrooms: '',
    area: '',
    floor: '',
    totalFloors: '',
    renovation: renovationItems[0].label,
    country: 'Каракалпакистан',
    region: '',
    district: '',
    address: '',
    phone: '',
    images: [],
    propertyOwner: 'owner',
    apartmentType: 'new',
    roomsCount: '',
    totalArea: '',
  });

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [useMapPreviewFallback, setUseMapPreviewFallback] = useState(false);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<{ visible: boolean; success: boolean; message: string }>({
    visible: false,
    success: false,
    message: '',
  });
  const [paymentSettings, setPaymentSettings] = useState<{
    payment_enabled: boolean;
    featured_enabled: boolean;
    post_price: string;
    featured_price: string;
    post_duration_days: number;
    featured_duration_days: number;
  } | null>(null);

  const currencyOptions = ['USD', 'UZS', 'EUR'];

  const hasLocation = formData.latitude != null && formData.longitude != null;

  // Fetch districts on component mount (cached)
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const districts = await ApiClient.getDistricts();
        const districtNames = districts
          .map((district: any) => {
            // Try to get Uzbek translation first, then Russian
            return district.translations?.uz?.name || district.translations?.ru?.name || '';
          })
          .filter((name: string) => name.length > 0)
          .sort((a: string, b: string) => a.localeCompare(b, 'uz'));
        setRegionOptions(districtNames);
      } catch (error) {
        console.error('Failed to fetch districts:', error);
        // Fallback to empty array if fetch fails
        setRegionOptions([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, []);

  // Fetch payment settings on mount
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const settings = await ApiClient.getPaymentSettings();
        setPaymentSettings(settings);
      } catch (err) {
        console.error('Error fetching payment settings:', err);
      }
    };
    fetchPaymentSettings();
  }, []);

  // Property type specific field configurations
  const getFieldsForPropertyType = () => {
    const baseFields = {
      images: true,
      title: true,
      description: true,
      price: true,
      location: true,
      phone: true,
    };

    const propertyTypeConfigs: Record<string, Record<string, boolean>> = {
      kvartira: {
        ...baseFields,
        propertyOwner: true,
        apartmentType: true,
        roomsCount: true,
        totalArea: true,
        floor: true,
        totalFloors: true,
        renovation: true,
      },
      'hovli-kottej-dacha': {
        ...baseFields,
        propertyOwner: true,
        totalArea: true,
        floor: false,
        totalFloors: false,
        renovation: true,
        roomsCount: true,
      },
      land: {
        ...baseFields,
        propertyOwner: false,
        totalArea: true,
        floor: false,
        totalFloors: false,
        renovation: false,
        roomsCount: false,
        apartmentType: false,
      },
      commercial: {
        ...baseFields,
        propertyOwner: false,
        totalArea: true,
        floor: false,
        totalFloors: false,
        renovation: false,
        roomsCount: false,
        apartmentType: false,
      },
    };

    return propertyTypeConfigs[propertyType] || baseFields;
  };

  const visibleFields = getFieldsForPropertyType();

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddImage = () => {
    setShowImageSourceModal(true);
  };

  const handleCameraPress = () => {
    setShowImageSourceModal(false);
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
      },
      (response) => {
        if (response.didCancel) {
          console.log('Camera cancelled');
        } else if (response.errorCode) {
          Alert.alert(t?.propertyForm?.validationError || 'Error', (t?.propertyForm?.cameraError || 'Camera error') + ': ' + response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const imageUri = response.assets[0].uri;
          if (imageUri && formData.images.length < 10) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, imageUri],
            }));
          }
        }
      }
    );
  };

  const handleGalleryPress = () => {
    setShowImageSourceModal(false);
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 10 - formData.images.length,
      },
      (response) => {
        if (response.didCancel) {
          console.log('Gallery cancelled');
        } else if (response.errorCode) {
          Alert.alert(t?.propertyForm?.validationError || 'Error', (t?.propertyForm?.galleryError || 'Gallery error') + ': ' + response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const newImages = response.assets
            .map(asset => asset.uri)
            .filter((uri): uri is string => !!uri);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages].slice(0, 10),
          }));
        }
      }
    );
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getLocationPreviewImageUrl = (lat: number, lng: number, fallback = false) => {
    if (fallback) {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&markers=color:red|${lat},${lng}`;
    }
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=15&size=600x300&maptype=mapnik&markers=${lat},${lng},red-pushpin`;
  };

  const handleSubmit = async () => {
    try {
      // Validation based on property type
      if (!formData.title || !formData.price) {
        setResultModal({ visible: true, success: false, message: t?.propertyForm?.titlePriceRequired || 'Title and price are required' });
        return;
      }

      // For apartment/house, rooms are required
      if ((normalizedPropertyType === 'apartment' || normalizedPropertyType === 'house') && !formData.roomsCount) {
        setResultModal({ visible: true, success: false, message: t?.propertyForm?.roomsRequired || 'Number of rooms is required' });
        return;
      }

      setSubmitting(true);

      // Find district ID
      // This logic assumes we have the full district object or can map the name back to ID
      // Ideally regionOptions should store {id, name} objects
      // For now, we'll try to find it from the API call if we had stored the full list,
      // but since we only stored names, this part might need adjustment in a real app.
      // Let's assume for this mock that we send a static ID or we need to look it up.
      // Ideally, update the district fetching to store a map of name -> id.

      const payload: any = {
        title: formData.title,
        description: formData.description,
        property_type: normalizedPropertyType,
        listing_type: normalizedListingType,
        price: parseFloat(formData.price).toFixed(2),
        currency: formData.currency.toLowerCase(),
        // Map common fields
        rooms: formData.roomsCount ? parseInt(formData.roomsCount) : null,
        area: formData.totalArea ? formData.totalArea : (formData.area || null),
        phone: formData.phone,

        // Handle specific fields based on property type
        ...(normalizedPropertyType === 'apartment' && {
          floor: formData.floor ? parseInt(formData.floor) : null,
          total_floors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
          area_unit: 'sqm',
        }),

        ...(normalizedPropertyType === 'house' && {
          area_unit: 'sqm',
        }),

        ...(normalizedPropertyType === 'land' && {
          area_unit: 'sotix'
        }),

        ...(normalizedPropertyType === 'commercial' && {
          area_unit: 'sqm'
        }),

        ...(normalizedPropertyType !== 'land' && {
          building_type: formData.apartmentType === 'secondary' ? 'old' : 'new',
          condition: renovationItems.find(r => r.label === formData.renovation)?.value || 'cosmetic',
        }),

        // Mock district ID since we don't have the full map here yet
        district_id: 3,

        // Location coordinates (limited to 6 decimal places to stay within 9 digit limit)
        ...(formData.latitude != null && { latitude: parseFloat(formData.latitude.toFixed(6)) }),
        ...(formData.longitude != null && { longitude: parseFloat(formData.longitude.toFixed(6)) }),
      };

      console.log('Submitting Payload:', JSON.stringify(payload, null, 2));

      // 1. Create the announcement first
      const createdAnnouncement = await ApiClient.createProperty(payload);
      const announcementId = createdAnnouncement.id;

      if (!announcementId) {
        throw new Error('No announcement ID returned');
      }

      console.log(`Announcement created with ID: ${announcementId}`);

      // 2. Upload images if any
      if (formData.images.length > 0) {
        console.log(`Uploading ${formData.images.length} images...`);
        // Upload images one by one or in parallel
        await Promise.all(formData.images.map(imageUri =>
          ApiClient.uploadAnnouncementImage(announcementId, imageUri)
        ));
      }

      setSubmitting(false);

      // If payment is enabled, navigate to PaymentScreen instead of showing success modal
      if (paymentSettings?.payment_enabled) {
        (navigation as any).navigate('Payment', {
          announcementId,
          paymentType: 'post',
          amount: parseFloat(paymentSettings.post_price),
          durationDays: paymentSettings.post_duration_days,
        });
      } else {
        setResultModal({
          visible: true,
          success: true,
          message: t?.propertyForm?.successMessage || 'Listing created successfully!',
        });
      }
    } catch (error: any) {
      console.error('Submission Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      setSubmitting(false);
      const errorData = error.response?.data;
      let errorMsg = t?.propertyForm?.submitError || 'Error creating listing';
      if (errorData && typeof errorData === 'object') {
        const details = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        if (details) errorMsg += '\n\n' + details;
      } else if (error.message) {
        errorMsg += '\n\n' + error.message;
      }
      setResultModal({ visible: true, success: false, message: errorMsg });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{headerTitle}</Text>
      </View>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.images || 'Photos'}</Text>
          <Text style={styles.sectionSubtitle}>{t?.propertyForm?.imagesHint || 'First photo will be the main one shown in listings'}</Text>
          
          <View style={styles.imagesContainer}>
            <FlatList
              data={formData.images}
              keyExtractor={(_, index) => index.toString()}
              numColumns={5}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {formData.images.length < 10 && (
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <Text style={styles.addImageButtonText}>+ {t?.propertyForm?.addImage || 'Add Photo'} ({formData.images.length}/10)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.listingTitle || 'Listing Title'}</Text>
          <TextInput
            style={styles.input}
            placeholder={t?.propertyForm?.titlePlaceholder || 'Enter title'}
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.description || 'Description'}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t?.propertyForm?.descriptionPlaceholder || 'Enter description'}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Property Details */}
        {visibleFields.propertyOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.postedBy || 'Posted By'}</Text>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.propertyOwner === 'owner' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('propertyOwner', 'owner')}
              >
                <Text style={styles.optionButtonText}>{t?.propertyForm?.owner || 'Owner'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.propertyOwner === 'realtor' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('propertyOwner', 'realtor')}
              >
                <Text style={[styles.optionButtonText, { color: '#999' }]}>
                  {t?.propertyForm?.realtor || 'Realtor'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Apartment Type */}
        {visibleFields.apartmentType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.apartmentType || 'Apartment Type'}</Text>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.apartmentType === 'new' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('apartmentType', 'new')}
              >
                <Text style={styles.optionButtonText}>{t?.propertyForm?.newBuilding || 'New Building'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.apartmentType === 'secondary' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('apartmentType', 'secondary')}
              >
                <Text style={[styles.optionButtonText, { color: '#999' }]}>
                  {t?.propertyForm?.secondary || 'Secondary'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rooms & Area */}
        {visibleFields.roomsCount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.roomsCount || 'Number of Rooms'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.roomsPlaceholder || 'Enter number of rooms'}
              value={formData.roomsCount}
              onChangeText={(text) => handleInputChange('roomsCount', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
              blurOnSubmit={false}
            />
          </View>
        )}

        {visibleFields.totalArea && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t?.propertyForm?.area || 'Area'}, {normalizedPropertyType === 'land' ? 'sotix' : 'm²'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.areaPlaceholder || 'Enter area'}
              value={formData.totalArea}
              onChangeText={(text) => handleInputChange('totalArea', text)}
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
              blurOnSubmit={false}
            />
          </View>
        )}

        {/* Floor Details */}
        {visibleFields.floor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.floor || 'Floor'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.floorPlaceholder || 'Enter floor number'}
              value={formData.floor}
              onChangeText={(text) => handleInputChange('floor', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
              blurOnSubmit={false}
            />
          </View>
        )}

        {visibleFields.totalFloors && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.totalFloors || 'Total Floors'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.totalFloorsPlaceholder || 'Total floors'}
              value={formData.totalFloors}
              onChangeText={(text) => handleInputChange('totalFloors', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
              blurOnSubmit={false}
            />
          </View>
        )}

        {/* Renovation */}
        {visibleFields.renovation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.renovation || 'Renovation'}</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(dropdownOpen === 'renovation' ? null : 'renovation')}
            >
              <Text style={styles.dropdownButtonText}>{formData.renovation}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {dropdownOpen === 'renovation' && (
              <View style={styles.dropdownMenu}>
                {renovationItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('renovation', item.label);
                      setDropdownOpen(null);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.price || 'Price'}</Text>
          <View style={styles.priceContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder={t?.propertyForm?.pricePlaceholder || 'Enter price'}
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={styles.currencyButton}
              onPress={() => setDropdownOpen(dropdownOpen === 'currency' ? null : 'currency')}
            >
              <Text style={styles.currencyButtonText}>{formData.currency}</Text>
            </TouchableOpacity>
          </View>
          {dropdownOpen === 'currency' && (
            <View style={styles.dropdownMenu}>
              {currencyOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('currency', option);
                    setDropdownOpen(null);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/*/!* Location Section *!/*/}
        {/*<View style={styles.section}>*/}
        {/*  <Text style={styles.sectionTitle}>{t?.propertyForm?.country || 'Country'}</Text>*/}
        {/*  <TouchableOpacity style={styles.dropdownButton}>*/}
        {/*    <Text style={styles.dropdownButtonText}>{formData.country}</Text>*/}
        {/*    <Text style={styles.dropdownArrow}>▼</Text>*/}
        {/*  </TouchableOpacity>*/}
        {/*</View>*/}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.region || 'District'}</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(dropdownOpen === 'region' ? null : 'region')}
          >
            <Text style={styles.dropdownButtonText}>{formData.region}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          {dropdownOpen === 'region' && (
            <View style={styles.dropdownMenu}>
              {regionOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    handleInputChange('region', option);
                    setDropdownOpen(null);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.location || 'Location'}</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() => setShowLocationModal(true)}
            activeOpacity={0.85}
          >
            {hasLocation ? (
              <>
                <Image
                  source={{ uri: getLocationPreviewImageUrl(formData.latitude!, formData.longitude!, useMapPreviewFallback) }}
                  style={styles.mapWebView}
                  resizeMode="cover"
                  onError={() => {
                    if (!useMapPreviewFallback) {
                      setUseMapPreviewFallback(true);
                    }
                  }}
                />
                <View style={styles.mapOverlayBadge}>
                  <MapPin size={14} color="#fff" />
                  <Text style={styles.mapOverlayText}>
                    {t?.propertyForm?.changeLocation || 'Change location'}
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.mapContent}>
                <MapPin size={24} color="#999" />
                <Text style={styles.mapPlaceholder}>
                  {t?.propertyForm?.selectOnMap || 'Select location on map'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.phone || 'Phone Number'}</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.flagContainer}>
              <Text style={styles.flagEmoji}>🇺🇿</Text>
              <Text style={styles.phoneCode}>+998</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder={t?.propertyForm?.phonePlaceholder || 'Enter phone number'}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t?.propertyForm?.submit || 'Done'}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Image Source Selection Modal */}
      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageSourceModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t?.propertyForm?.addImageModal || 'Add Photo'}</Text>
              <TouchableOpacity onPress={() => setShowImageSourceModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCameraPress}
            >
              <Camera size={24} color="#000" />
              <Text style={styles.modalOptionText}>{t?.propertyForm?.camera || 'Camera'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGalleryPress}
            >
              <ImageIcon size={24} color="#000" />
              <Text style={styles.modalOptionText}>{t?.propertyForm?.gallery || 'Gallery'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <SafeAreaView style={styles.locationModalContainer}>
          <View style={styles.locationModalHeader}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.locationModalTitle}>{t?.propertyForm?.selectLocation || 'Select Location'}</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.mapContainer2}>
            <MapPicker
              initialLatitude={formData.latitude || 42.4602}
              initialLongitude={formData.longitude || 59.6034}
              onLocationSelect={(lat, lng) => {
                setUseMapPreviewFallback(false);
                setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }));
              }}
            />
          </View>

          <View style={styles.selectedLocationInfo}>
            {hasLocation ? (
              <Text style={styles.selectedLocationText}>
                {t?.propertyForm?.selected || 'Selected'}: {formData.latitude!.toFixed(6)}, {formData.longitude!.toFixed(6)}
              </Text>
            ) : (
              <Text style={styles.selectedLocationText}>
                {t?.propertyForm?.selectOnMap || 'Select location on map'}
              </Text>
            )}
          </View>

          <View style={styles.confirmLocationButtonContainer}>
            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.confirmLocationButtonText}>{t?.propertyForm?.submit || 'Done'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Submitting Overlay */}
      {submitting && (
        <View style={styles.submittingOverlay}>
          <View style={styles.submittingCard}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.submittingText}>{t?.propertyForm?.submitting || "E'lon yuklanmoqda..."}</Text>
          </View>
        </View>
      )}

      {/* Result Modal */}
      <Modal
        visible={resultModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setResultModal(prev => ({ ...prev, visible: false }));
          if (resultModal.success) navigation.goBack();
        }}
      >
        <View style={styles.resultOverlay}>
          <View style={styles.resultCard}>
            <View style={[styles.resultIconCircle, { backgroundColor: resultModal.success ? '#ecfdf5' : '#fef2f2' }]}>
              {resultModal.success ? (
                <CheckCircle size={48} color="#22c55e" />
              ) : (
                <XCircle size={48} color="#ef4444" />
              )}
            </View>
            <Text style={styles.resultTitle}>
              {resultModal.success
                ? (t?.propertyForm?.successTitle || 'Muvaffaqiyatli!')
                : (t?.propertyForm?.validationError || 'Xatolik')}
            </Text>
            <Text style={styles.resultMessage}>{resultModal.message}</Text>
            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: resultModal.success ? '#22c55e' : '#6366f1' }]}
              onPress={() => {
                setResultModal(prev => ({ ...prev, visible: false }));
                if (resultModal.success) navigation.goBack();
              }}
            >
              <Text style={styles.resultButtonText}>
                {resultModal.success ? (t?.common?.ok || 'OK') : (t?.common?.ok || 'OK')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f8f8f8',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#000',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#999',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f8f8f8',
  },
  currencyButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  mapPlaceholder: {
    fontSize: 12,
    color: '#999',
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mapWebView: {
    width: '100%',
    height: '100%',
  },
  mapOverlayBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  mapOverlayText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  phoneContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
  },
  flagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    gap: 6,
  },
  flagEmoji: {
    fontSize: 16,
  },
  phoneCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#000',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
    margin: 4,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  addImageButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  addImageButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  // Location Modal Styles
  locationModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  mapContainer2: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedLocationInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  confirmLocationButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  confirmLocationButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmLocationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  // Submitting Overlay
  submittingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  submittingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  submittingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  // Result Modal
  resultOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  resultIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resultButton: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default PropertyFormScreen;