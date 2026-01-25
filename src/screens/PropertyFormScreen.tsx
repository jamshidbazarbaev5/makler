import React, { useState, useMemo } from 'react';
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
import BottomNav from '../components/BottomNav';

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
}

interface RouteParams {
  listingType?: string;
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
  const navigation = useNavigation();
  const params = route.params as RouteParams | undefined;
  const listingType = params?.listingType || 'sell';
  const headerTitle = listingTypeMap[listingType] || 'Kvartira';

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
    country: 'O\'zbekiston',
    region: 'Tashkent',
    district: '',
    address: '',
    phone: '',
    images: [],
  });

  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const renovationOptions = [
    'Ta\'mirlash tanlang',
    'Yangi ta\'mirlab qo\'yilgan',
    'Eskilangan',
    'Yaxshi holatda',
  ];

  const currencyOptions = ['USD', 'UZS', 'EUR'];
  const countryOptions = ['O\'zbekiston'];
  const regionOptions = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan'];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddImage = () => {
    Alert.alert('Rasm qo\'shish', 'Kamera yoki galereyadan rasm tanlang');
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.price || !formData.bedrooms) {
      Alert.alert('Xato', 'Barcha maydon to\'ldirilsin');
      return;
    }
    Alert.alert('Muvaffaqiyat', 'E\'lon yuborildi!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
        </View>

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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kim joylashti</Text>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={[styles.optionButton, styles.selectedOption]}
            >
              <Text style={styles.optionButtonText}>Egasi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={[styles.optionButtonText, { color: '#999' }]}>
                Rieltor
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Apartment Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kvartira turi</Text>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={[styles.optionButton, styles.selectedOption]}
            >
              <Text style={styles.optionButtonText}>Yangi bino</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={[styles.optionButtonText, { color: '#999' }]}>
                Ikkilamchi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rooms & Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xonalar soni</Text>
          <TextInput
            style={styles.input}
            placeholder="Xonalar sonini kiriting"
            value={formData.bedrooms}
            onChangeText={(text) => handleInputChange('bedrooms', text)}
            placeholderTextColor="#999"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maydon, m²</Text>
          <TextInput
            style={styles.input}
            placeholder="Maydonni kiriting"
            value={formData.area}
            onChangeText={(text) => handleInputChange('area', text)}
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Floor Details */}
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

        {/* Renovation */}
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
          <Text style={styles.mapPlaceholder}>Xaritada joylashuvni tanlang</Text>
          <View style={styles.mapContainer} />
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
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 28,
    color: '#000',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
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
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    marginBottom: 8,
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
});

export default PropertyFormScreen;