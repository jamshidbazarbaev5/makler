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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { ArrowLeft, MapPin, Camera, ImageIcon, X } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import BottomNav from '../components/BottomNav';
import ApiClient from '../services/api';

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

const listingTypeMap: { [key: string]: string } = {
  'daily-rent': 'Kunlik Ijara',
  'monthly-rent': 'Oylik Ijara',
  'sell': 'Sotish',
  'daily-rent-buy': 'Ijara Qidirish',
  'buy': 'Sotib Olish',
};

const PropertyFormScreen = () => {
  const route = useRoute();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const params = route.params as (RouteParams & {propertyType?: string}) | undefined;
  const listingType = params?.listingType || 'sell';
  const propertyType = params?.propertyType || 'kvartira';
  const headerTitle = listingTypeMap[listingType] || 'Kvartira';

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
    renovation: 'Ta\'mirlash tanlang',
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
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  const renovationMap: Record<string, string> = {
    'Yangi ta\'mirlab qo\'yilgan': 'euro_repair',
    'Eskilangan': 'needs_repair',
    'Yaxshi holatda': 'cosmetic',
    'Ta\'mir talab': 'needs_repair',
    'Yevroremont': 'euro_repair',
    'Kapital ta\'mir': 'capital',
    'Ta\'mirsiz': 'no_repair',
    'Dizaynerlik': 'design'
  };

  const renovationOptions = [
    'Ta\'mirlash tanlang',
    'Yangi ta\'mirlab qo\'yilgan',
    'Eskilangan',
    'Yaxshi holatda',
    'Yevroremont',
    'Kapital ta\'mir',
    'Ta\'mirsiz',
    'Dizaynerlik'
  ];

  const currencyOptions = ['USD', 'UZS', 'EUR'];
  const countryOptions = ['Каракалпакистан'];

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
          Alert.alert('Xato', 'Kamera xatosi: ' + response.errorMessage);
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
          Alert.alert('Xato', 'Galereya xatosi: ' + response.errorMessage);
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

  const handleSubmit = async () => {
    try {
      // Validation based on property type
      if (!formData.title || !formData.price) {
        Alert.alert('Xato', 'Sarlavha va narx majburiy');
        return;
      }

      // For apartment/house, rooms are required
      if ((normalizedPropertyType === 'apartment' || normalizedPropertyType === 'house') && !formData.roomsCount) {
        Alert.alert('Xato', 'Xonalar soni majburiy');
        return;
      }

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

        building_type: formData.apartmentType === 'secondary' ? 'old' : 'new',
        condition: renovationMap[formData.renovation] || 'cosmetic',

        // Mock district ID since we don't have the full map here yet
        district_id: 3,
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

      Alert.alert('Muvaffaqiyat', 'E\'lon muvaffaqiyatli yaratildi!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Submission Error:', error);
      Alert.alert('Xato', 'E\'lon yaratishda xatolik yuz berdi: ' + (error.message || ''));
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rasmlar</Text>
          <Text style={styles.sectionSubtitle}>Birinchi rasm asosiy bo'ladi va e'lonlarda ko'rsatiladi</Text>
          
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
              <Text style={styles.addImageButtonText}>+ Rasm qo'shish ({formData.images.length}/10)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>E'lon sarlavhasi</Text>
          <TextInput
            style={styles.input}
            placeholder="Sarlavhani kiriting"
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tavsif</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tavsifni kiriting"
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
            <Text style={styles.sectionTitle}>Kim joylashti</Text>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.propertyOwner === 'owner' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('propertyOwner', 'owner')}
              >
                <Text style={styles.optionButtonText}>Egasi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.propertyOwner === 'realtor' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('propertyOwner', 'realtor')}
              >
                <Text style={[styles.optionButtonText, { color: '#999' }]}>
                  Rieltor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Apartment Type */}
        {visibleFields.apartmentType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kvartira turi</Text>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.apartmentType === 'new' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('apartmentType', 'new')}
              >
                <Text style={styles.optionButtonText}>Yangi bino</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  formData.apartmentType === 'secondary' && styles.selectedOption,
                ]}
                onPress={() => handleInputChange('apartmentType', 'secondary')}
              >
                <Text style={[styles.optionButtonText, { color: '#999' }]}>
                  Ikkilamchi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rooms & Area */}
        {visibleFields.roomsCount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Xonalar soni</Text>
            <TextInput
              style={styles.input}
              placeholder="Xonalar sonini kiriting"
              value={formData.roomsCount}
              onChangeText={(text) => handleInputChange('roomsCount', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>
        )}

        {visibleFields.totalArea && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Maydon, {normalizedPropertyType === 'land' ? 'sotix' : 'm²'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Maydonni kiriting"
              value={formData.totalArea}
              onChangeText={(text) => handleInputChange('totalArea', text)}
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        )}

        {/* Floor Details */}
        {visibleFields.floor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qavat</Text>
            <TextInput
              style={styles.input}
              placeholder="Qavat raqamini kiriting"
              value={formData.floor}
              onChangeText={(text) => handleInputChange('floor', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>
        )}

        {visibleFields.totalFloors && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Uyning qavatlari soni</Text>
            <TextInput
              style={styles.input}
              placeholder="Jami qavatlari"
              value={formData.totalFloors}
              onChangeText={(text) => handleInputChange('totalFloors', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Renovation */}
        {visibleFields.renovation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ta'mirlash</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(dropdownOpen === 'renovation' ? null : 'renovation')}
            >
              <Text style={styles.dropdownButtonText}>{formData.renovation}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            {dropdownOpen === 'renovation' && (
              <View style={styles.dropdownMenu}>
                {renovationOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => {
                      handleInputChange('renovation', option);
                      setDropdownOpen(null);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Price Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Narx</Text>
          <View style={styles.priceContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder="Narx kiriting"
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
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

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Davlat</Text>
          <TouchableOpacity style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>{formData.country}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Viloyat</Text>
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
          <Text style={styles.sectionTitle}>Joylashuv</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() => setShowLocationModal(true)}
          >
            <View style={styles.mapContent}>
              <MapPin size={24} color="#999" />
              <Text style={styles.mapPlaceholder}>
                {formData.latitude && formData.longitude
                  ? `Tanlangan: ${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)}`
                  : 'Xaritada joylashuvni tanlang'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phone Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Telefon raqami</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.flagContainer}>
              <Text style={styles.flagEmoji}>🇺🇿</Text>
              <Text style={styles.phoneCode}>+998</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="Telefon raqamini kiriting"
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Tayyor</Text>
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
              <Text style={styles.modalTitle}>Rasm qo'shish</Text>
              <TouchableOpacity onPress={() => setShowImageSourceModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleCameraPress}
            >
              <Camera size={24} color="#000" />
              <Text style={styles.modalOptionText}>Kamera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={handleGalleryPress}
            >
              <ImageIcon size={24} color="#000" />
              <Text style={styles.modalOptionText}>Galereya</Text>
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
            <Text style={styles.locationModalTitle}>Joylashuvni tanlang</Text>
            <View style={{ width: 24 }} />
          </View>

          <SafeAreaView style={styles.locationSearchContainer}>
            <Text style={styles.locationLabel}>Tashkent shahrining ba'zi joylari:</Text>
            <ScrollView style={styles.locationList}>
              {[
                { lat: 41.2995, lon: 69.2401, name: 'Tashkent Markazi' },
                { lat: 41.3193, lon: 69.2806, name: 'Nukus ko\'chasi' },
                { lat: 41.3156, lon: 69.1877, name: 'Sergeli tumani' },
                { lat: 41.2871, lon: 69.2080, name: 'Yunusabad tumani' },
                { lat: 41.3386, lon: 69.2808, name: 'Mirzo Ulug\'bek tumani' },
              ].map((location, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.locationOption}
                  onPress={() => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: location.lat,
                      longitude: location.lon,
                    }));
                    setShowLocationModal(false);
                  }}
                >
                  <MapPin size={20} color="#000" />
                  <Text style={styles.locationOptionText}>{location.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SafeAreaView>

          <View style={styles.manualLocationContainer}>
            <Text style={styles.locationLabel}>Yoki koordinatalarni kiriting:</Text>
            <View style={styles.coordinateInputs}>
              <TextInput
                style={styles.coordinateInput}
                placeholder="Kenglik (Latitude)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={formData.latitude?.toString() || ''}
                onChangeText={(text) => {
                  const lat = parseFloat(text);
                  if (!isNaN(lat)) {
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                    }));
                  }
                }}
              />
              <TextInput
                style={styles.coordinateInput}
                placeholder="Uzunlik (Longitude)"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                value={formData.longitude?.toString() || ''}
                onChangeText={(text) => {
                  const lon = parseFloat(text);
                  if (!isNaN(lon)) {
                    setFormData(prev => ({
                      ...prev,
                      longitude: lon,
                    }));
                  }
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.confirmLocationButtonText}>Tayyor</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
    marginBottom: 8,
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
  locationSearchContainer: {
    flex: 1,
    // paddingHorizontal: -120,
    // paddingVertical: ,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  locationList: {
    marginBottom: 20,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  locationOptionText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  manualLocationContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  coordinateInputs: {
    gap: 8,
    marginBottom: 16,
  },
  coordinateInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f8f8f8',
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
});

export default PropertyFormScreen;