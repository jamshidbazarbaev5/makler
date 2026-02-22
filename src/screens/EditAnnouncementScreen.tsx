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
import { ArrowLeft, MapPin, Camera, ImageIcon, X, CheckCircle, XCircle, Trash2 } from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import MapPicker from '../components/MapPicker';
import ApiClient from '../services/api';
import { useLanguage } from '../localization';
import { COLORS } from '../constants';

interface RouteParams {
  listingId: string;
}

interface ExistingImage {
  id: number;
  image_url: string;
  image_medium_url: string;
}

interface FormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  roomsCount: string;
  totalArea: string;
  floor: string;
  totalFloors: string;
  renovation: string;
  phone: string;
  newImages: string[]; // local URIs for new images
  existingImages: ExistingImage[]; // images already on server
  imagesToDelete: number[]; // IDs of images to remove
  propertyOwner: string;
  apartmentType: string;
  latitude?: number;
  longitude?: number;
}

const EditAnnouncementScreen = () => {
  const route = useRoute();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const params = route.params as RouteParams;
  const listingId = params.listingId;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [propertyType, setPropertyType] = useState('apartment');
  const [listingType, setListingType] = useState('sale');
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [resultModal, setResultModal] = useState<{ visible: boolean; success: boolean; message: string }>({
    visible: false,
    success: false,
    message: '',
  });

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

  const currencyOptions = ['USD', 'UZS', 'EUR'];

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    roomsCount: '',
    totalArea: '',
    floor: '',
    totalFloors: '',
    renovation: renovationItems[0].label,
    phone: '',
    newImages: [],
    existingImages: [],
    imagesToDelete: [],
    propertyOwner: 'owner',
    apartmentType: 'new',
  });

  // Fetch the existing announcement data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [data, districts] = await Promise.all([
          ApiClient.getAnnouncementById(listingId),
          ApiClient.getDistricts(),
        ]);

        setPropertyType(data.property_type || 'apartment');
        setListingType(data.listing_type || 'sale');

        // Map condition value back to label
        const conditionLabel = renovationItems.find(r => r.value === data.condition)?.label || renovationItems[0].label;

        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price ? parseFloat(data.price).toString() : '',
          currency: (data.currency || 'usd').toUpperCase(),
          roomsCount: data.rooms ? data.rooms.toString() : '',
          totalArea: data.area || '',
          floor: data.floor ? data.floor.toString() : '',
          totalFloors: data.total_floors ? data.total_floors.toString() : '',
          renovation: conditionLabel,
          phone: data.phone || '',
          newImages: [],
          existingImages: data.images || [],
          imagesToDelete: [],
          propertyOwner: data.building_type === 'old' ? 'owner' : 'owner',
          apartmentType: data.building_type === 'old' ? 'secondary' : 'new',
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
        });

        const districtNames = districts
          .map((district: any) => district.translations?.uz?.name || district.translations?.ru?.name || '')
          .filter((name: string) => name.length > 0)
          .sort((a: string, b: string) => a.localeCompare(b, 'uz'));
        setRegionOptions(districtNames);
      } catch (err) {
        console.error('Failed to load announcement:', err);
        Alert.alert(t?.common?.error || 'Error', "E'lonni yuklashda xatolik yuz berdi");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [listingId]);

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
      apartment: {
        ...baseFields,
        propertyOwner: true,
        apartmentType: true,
        roomsCount: true,
        totalArea: true,
        floor: true,
        totalFloors: true,
        renovation: true,
      },
      house: {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRemoveExistingImage = (imageId: number) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter(img => img.id !== imageId),
      imagesToDelete: [...prev.imagesToDelete, imageId],
    }));
  };

  const handleRemoveNewImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index),
    }));
  };

  const totalImageCount = formData.existingImages.length + formData.newImages.length;

  const handleAddImage = () => {
    if (totalImageCount >= 10) return;
    setShowImageSourceModal(true);
  };

  const handleCameraPress = () => {
    setShowImageSourceModal(false);
    launchCamera({ mediaType: 'photo', cameraType: 'back' }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert(t?.propertyForm?.validationError || 'Error', (t?.propertyForm?.cameraError || 'Camera error') + ': ' + response.errorMessage);
        return;
      }
      if (response.assets?.[0]?.uri && totalImageCount < 10) {
        setFormData(prev => ({
          ...prev,
          newImages: [...prev.newImages, response.assets![0].uri!],
        }));
      }
    });
  };

  const handleGalleryPress = () => {
    setShowImageSourceModal(false);
    launchImageLibrary({ mediaType: 'photo', selectionLimit: 10 - totalImageCount }, (response) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert(t?.propertyForm?.validationError || 'Error', (t?.propertyForm?.galleryError || 'Gallery error') + ': ' + response.errorMessage);
        return;
      }
      if (response.assets) {
        const uris = response.assets.map(a => a.uri).filter((u): u is string => !!u);
        setFormData(prev => ({
          ...prev,
          newImages: [...prev.newImages, ...uris].slice(0, 10 - prev.existingImages.length),
        }));
      }
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.price) {
        setResultModal({ visible: true, success: false, message: t?.propertyForm?.titlePriceRequired || 'Title and price are required' });
        return;
      }

      if ((propertyType === 'apartment' || propertyType === 'house') && !formData.roomsCount) {
        setResultModal({ visible: true, success: false, message: t?.propertyForm?.roomsRequired || 'Number of rooms is required' });
        return;
      }

      setSubmitting(true);

      // Build update payload
      const payload: any = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price).toFixed(2),
        currency: formData.currency.toLowerCase(),
        rooms: formData.roomsCount ? parseInt(formData.roomsCount) : null,
        area: formData.totalArea || null,
        phone: formData.phone,
      };

      if (propertyType === 'apartment') {
        payload.floor = formData.floor ? parseInt(formData.floor) : null;
        payload.total_floors = formData.totalFloors ? parseInt(formData.totalFloors) : null;
        payload.area_unit = 'sqm';
      }

      if (propertyType !== 'land') {
        payload.building_type = formData.apartmentType === 'secondary' ? 'old' : 'new';
        payload.condition = renovationItems.find(r => r.label === formData.renovation)?.value || 'cosmetic';
      }

      if (formData.latitude) payload.latitude = parseFloat(Number(formData.latitude).toFixed(6));
      if (formData.longitude) payload.longitude = parseFloat(Number(formData.longitude).toFixed(6));

      // 1. Update the announcement
      await ApiClient.updateAnnouncement(listingId, payload);

      // 2. Delete removed images
      if (formData.imagesToDelete.length > 0) {
        await Promise.all(
          formData.imagesToDelete.map(imageId =>
            ApiClient.deleteAnnouncementImage(listingId, imageId).catch(err => {
              console.warn('Failed to delete image', imageId, err);
            })
          )
        );
      }

      // 3. Upload new images
      if (formData.newImages.length > 0) {
        await Promise.all(
          formData.newImages.map(uri => ApiClient.uploadAnnouncementImage(listingId, uri))
        );
      }

      setSubmitting(false);
      setResultModal({
        visible: true,
        success: true,
        message: t?.propertyForm?.successMessage || "E'lon muvaffaqiyatli yangilandi!",
      });
    } catch (error: any) {
      console.error('Update Error:', error);
      console.error('Error Response:', error.response?.data);
      setSubmitting(false);
      const errorData = error.response?.data;
      let errorMsg = "E'lonni yangilashda xatolik";
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Yuklanmoqda...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t?.myListings?.edit || "E'lonni tahrirlash"}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.images || 'Rasmlar'}</Text>
          <Text style={styles.sectionSubtitle}>{t?.propertyForm?.imagesHint || 'Birinchi rasm asosiy rasm bo\'ladi'}</Text>

          {/* Existing Images */}
          {formData.existingImages.length > 0 && (
            <View style={styles.imagesGrid}>
              {formData.existingImages.map((img) => (
                <View key={img.id} style={styles.imageWrapper}>
                  <Image source={{ uri: img.image_medium_url || img.image_url }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveExistingImage(img.id)}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* New Images */}
          {formData.newImages.length > 0 && (
            <View style={styles.imagesGrid}>
              {formData.newImages.map((uri, index) => (
                <View key={`new-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: '#f59e0b' }]}
                    onPress={() => handleRemoveNewImage(index)}
                  >
                    <X size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {totalImageCount < 10 && (
            <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
              <Text style={styles.addImageButtonText}>
                + {t?.propertyForm?.addImage || 'Rasm qo\'shish'} ({totalImageCount}/10)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.listingTitle || 'Sarlavha'}</Text>
          <TextInput
            style={styles.input}
            placeholder={t?.propertyForm?.titlePlaceholder || 'Sarlavhani kiriting'}
            value={formData.title}
            onChangeText={(text) => handleInputChange('title', text)}
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.description || 'Tavsif'}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t?.propertyForm?.descriptionPlaceholder || 'Tavsifni kiriting'}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Apartment Type */}
        {visibleFields.apartmentType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.apartmentType || 'Kvartira turi'}</Text>
            <View style={styles.rowContainer}>
              <TouchableOpacity
                style={[styles.optionButton, formData.apartmentType === 'new' && styles.selectedOption]}
                onPress={() => handleInputChange('apartmentType', 'new')}
              >
                <Text style={styles.optionButtonText}>{t?.propertyForm?.newBuilding || 'Yangi bino'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, formData.apartmentType === 'secondary' && styles.selectedOption]}
                onPress={() => handleInputChange('apartmentType', 'secondary')}
              >
                <Text style={[styles.optionButtonText, { color: '#999' }]}>
                  {t?.propertyForm?.secondary || 'Ikkilamchi'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Rooms */}
        {visibleFields.roomsCount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.roomsCount || 'Xonalar soni'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.roomsPlaceholder || 'Xonalar sonini kiriting'}
              value={formData.roomsCount}
              onChangeText={(text) => handleInputChange('roomsCount', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Area */}
        {visibleFields.totalArea && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t?.propertyForm?.area || 'Maydon'}, {propertyType === 'land' ? 'sotix' : 'm²'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.areaPlaceholder || 'Maydonni kiriting'}
              value={formData.totalArea}
              onChangeText={(text) => handleInputChange('totalArea', text)}
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        )}

        {/* Floor */}
        {visibleFields.floor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.floor || 'Qavat'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.floorPlaceholder || 'Qavatni kiriting'}
              value={formData.floor}
              onChangeText={(text) => handleInputChange('floor', text)}
              placeholderTextColor="#999"
              keyboardType="number-pad"
            />
          </View>
        )}

        {/* Total Floors */}
        {visibleFields.totalFloors && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t?.propertyForm?.totalFloors || 'Jami qavatlar'}</Text>
            <TextInput
              style={styles.input}
              placeholder={t?.propertyForm?.totalFloorsPlaceholder || 'Jami qavatlar'}
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
            <Text style={styles.sectionTitle}>{t?.propertyForm?.renovation || "Ta'mir"}</Text>
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

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.price || 'Narx'}</Text>
          <View style={styles.priceContainer}>
            <TextInput
              style={styles.priceInput}
              placeholder={t?.propertyForm?.pricePlaceholder || 'Narxni kiriting'}
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

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.location || 'Joylashuv'}</Text>
          <TouchableOpacity
            style={styles.mapContainer}
            onPress={() => setShowLocationModal(true)}
          >
            <View style={styles.mapContent}>
              <MapPin size={24} color="#999" />
              <Text style={styles.mapPlaceholder}>
                {formData.latitude && formData.longitude
                  ? `${t?.propertyForm?.selected || 'Tanlangan'}: ${Number(formData.latitude).toFixed(4)}, ${Number(formData.longitude).toFixed(4)}`
                  : t?.propertyForm?.selectOnMap || 'Xaritadan tanlang'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Phone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t?.propertyForm?.phone || 'Telefon raqam'}</Text>
          <View style={styles.phoneContainer}>
            <View style={styles.flagContainer}>
              <Text style={styles.flagEmoji}>🇺🇿</Text>
              <Text style={styles.phoneCode}>+998</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder={t?.propertyForm?.phonePlaceholder || 'Telefon raqamini kiriting'}
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>{t?.propertyForm?.submit || 'Saqlash'}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Image Source Modal */}
      <Modal
        visible={showImageSourceModal}
        transparent
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
              <Text style={styles.modalTitle}>{t?.propertyForm?.addImageModal || 'Rasm qo\'shish'}</Text>
              <TouchableOpacity onPress={() => setShowImageSourceModal(false)}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalOption} onPress={handleCameraPress}>
              <Camera size={24} color="#000" />
              <Text style={styles.modalOptionText}>{t?.propertyForm?.camera || 'Kamera'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleGalleryPress}>
              <ImageIcon size={24} color="#000" />
              <Text style={styles.modalOptionText}>{t?.propertyForm?.gallery || 'Galereya'}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <SafeAreaView style={styles.locationModalContainer}>
          <View style={styles.locationModalHeader}>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.locationModalTitle}>{t?.propertyForm?.selectLocation || 'Joylashuvni tanlang'}</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.mapContainer2}>
            <MapPicker
              initialLatitude={formData.latitude || 42.4602}
              initialLongitude={formData.longitude || 59.6034}
              onLocationSelect={(lat, lng) => {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />
          </View>
          <View style={styles.selectedLocationInfo}>
            {formData.latitude && formData.longitude ? (
              <Text style={styles.selectedLocationText}>
                {t?.propertyForm?.selected || 'Tanlangan'}: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
              </Text>
            ) : (
              <Text style={styles.selectedLocationText}>
                {t?.propertyForm?.selectOnMap || 'Xaritadan tanlang'}
              </Text>
            )}
          </View>
          <View style={styles.confirmLocationButtonContainer}>
            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={() => setShowLocationModal(false)}
            >
              <Text style={styles.confirmLocationButtonText}>{t?.propertyForm?.submit || 'Tayyor'}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Submitting Overlay */}
      {submitting && (
        <View style={styles.submittingOverlay}>
          <View style={styles.submittingCard}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.submittingText}>{(t?.propertyForm as any)?.submitting || "Saqlanmoqda..."}</Text>
          </View>
        </View>
      )}

      {/* Result Modal */}
      <Modal
        visible={resultModal.visible}
        transparent
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
              style={[styles.resultButton, { backgroundColor: resultModal.success ? '#22c55e' : COLORS.purple }]}
              onPress={() => {
                setResultModal(prev => ({ ...prev, visible: false }));
                if (resultModal.success) navigation.goBack();
              }}
            >
              <Text style={styles.resultButtonText}>
                {t?.common?.ok || 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
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
  // Images
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
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
  // Dropdowns
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
  // Price
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
  // Map
  mapPlaceholder: {
    fontSize: 12,
    color: '#999',
  },
  mapContainer: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  // Phone
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
  // Submit
  submitButton: {
    backgroundColor: COLORS.purple,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  // Modals
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
  // Location Modal
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
    backgroundColor: COLORS.purple,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmLocationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Submitting
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

export default EditAnnouncementScreen;
