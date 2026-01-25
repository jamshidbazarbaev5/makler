import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  StyleSheet,
} from 'react-native';
import { ChevronDown, ArrowLeft, Clock, Home, Check } from 'lucide-react-native';
import { FilterState } from '../types';
import { SelectBox, ToggleChip, NumberInput } from './UiComponent';
import { COLORS, REGIONS, COUNTRIES, CATEGORIES, PROPERTY_TYPES } from '../constants';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

const { height: screenHeight } = Dimensions.get('window');
const COLLAPSED_HEIGHT = 280;
const EXPANDED_HEIGHT = screenHeight * 0.85;

const INITIAL_STATE: FilterState = {
  category: 'Kunlik',
  propertyType: 'Kvartira',
  country: "O'zbekiston",
  region: "",
  apartmentType: 'Ikkilamchi',
  roomCountStart: 2,
  roomCountEnd: 3,
  renovation: "O'rtacha",
  priceMin: "100",
  priceMax: "200",
  currency: 'UZS',
  postedBy: 'Rieltor',
};

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(INITIAL_STATE);
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerData, setPickerData] = useState<{
    title: string;
    items: { label: string; value: string }[];
    key: string;
  }>({
    title: '',
    items: [],
    key: '',
  });

  const toggleExpand = () => {
    const toValue = !isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT;
    Animated.timing(sheetHeight, {
      toValue,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
    setIsExpanded(false);
  };

  const handleClose = () => {
    onClose();
    setIsExpanded(false);
  };

  const openPicker = (
    key: keyof FilterState,
    title: string,
    items: string[],
  ) => {
    setPickerData({
      title,
      items: items.map(item => ({ label: item, value: item })),
      key,
    });
    setPickerVisible(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            { height: sheetHeight },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {!isExpanded ? (
            // COLLAPSED STATE
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Filtrlar</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={styles.cancelButton}>Bekor qilish</Text>
                </TouchableOpacity>
              </View>

              {/* Short Content */}
              <ScrollView 
                style={styles.shortContent}
                scrollEnabled={false}
              >
                {/* Category Field */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Toifasi</Text>
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => openPicker('category', 'Toifasi', CATEGORIES)}
                  >
                    <Text style={styles.selectText}>{filters.category}</Text>
                    <ChevronDown size={20} color={COLORS.gray400} />
                  </TouchableOpacity>
                </View>

                {/* Property Type Field */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Ko'chmas mulk turi</Text>
                  <TouchableOpacity
                    style={styles.selectBox}
                    onPress={() => openPicker('propertyType', 'Ko\'chmas mulk turi', PROPERTY_TYPES)}
                  >
                    <Text style={styles.selectText}>{filters.propertyType}</Text>
                    <ChevronDown size={20} color={COLORS.gray400} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={toggleExpand}
                >
                  <Text style={styles.moreButtonText}>Ko'proq</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Qo'llash</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // EXPANDED STATE
            <>
              {/* Expanded Header */}
              <View style={styles.expandedHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={toggleExpand}
                >
                  <ArrowLeft size={24} color={COLORS.gray900} />
                </TouchableOpacity>
                <Text style={styles.backTitle}>Orqaga</Text>
                <TouchableOpacity onPress={() => setFilters(INITIAL_STATE)}>
                  <Text style={styles.clearButton}>Tozalash</Text>
                </TouchableOpacity>
              </View>

              {/* Breadcrumbs */}
              <View style={styles.breadcrumbs}>
                <View style={styles.breadcrumbItem}>
                  <Clock size={16} color={COLORS.gray400} />
                  <Text style={styles.breadcrumbText}>{filters.category}</Text>
                </View>
                <Text style={styles.breadcrumbSeparator}>/</Text>
                <View style={styles.breadcrumbItem}>
                  <Home size={16} color={COLORS.gray400} />
                  <Text style={styles.breadcrumbText}>{filters.propertyType}</Text>
                </View>
              </View>

              {/* Expanded Content */}
              <ScrollView 
                style={styles.expandedContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Country */}
                <SelectBox
                  label="Davlat"
                  value={filters.country}
                  onPress={() => openPicker('country', 'Davlat', COUNTRIES)}
                />

                {/* Region */}
                <SelectBox
                  label="Viloyat"
                  value={filters.region}
                  placeholder="Tanlang"
                  onPress={() => openPicker('region', 'Viloyat', REGIONS)}
                />

                {/* Apartment Type */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Kvartira turi</Text>
                  <View style={styles.toggleRow}>
                    <ToggleChip
                      label="Ikkilamchi"
                      isActive={filters.apartmentType === 'Ikkilamchi'}
                      onPress={() => updateFilter('apartmentType', 'Ikkilamchi')}
                      fullWidth
                    />
                    <ToggleChip
                      label="Yangi bino"
                      isActive={filters.apartmentType === 'Yangi bino'}
                      onPress={() => updateFilter('apartmentType', 'Yangi bino')}
                      fullWidth
                    />
                  </View>
                </View>

                {/* Room Count */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Xonalar soni</Text>
                  <View style={styles.numberRow}>
                    <NumberInput
                      style={{ flex: 1 }}
                      value={String(filters.roomCountStart)}
                      onChangeText={(v) => updateFilter('roomCountStart', parseInt(v) || 0)}
                      placeholder="dan"
                    />
                    <NumberInput
                      style={{ flex: 1 }}
                      value={String(filters.roomCountEnd)}
                      onChangeText={(v) => updateFilter('roomCountEnd', parseInt(v) || 0)}
                      placeholder="gacha"
                    />
                  </View>
                </View>

                {/* Renovation */}
                <SelectBox
                  label="Ta'mirlash"
                  value={filters.renovation}
                  onPress={() => openPicker('renovation', "Ta'mirlash", [
                    "O'rtacha",
                    "Yaxshi",
                    "Yangi remont",
                  ])}
                />

                {/* Price */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Narx</Text>
                  <View style={styles.numberRow}>
                    <NumberInput
                      style={{ flex: 1 }}
                      value={filters.priceMin}
                      onChangeText={(v) => updateFilter('priceMin', v)}
                      placeholder="dan"
                    />
                    <NumberInput
                      style={{ flex: 1 }}
                      value={filters.priceMax}
                      onChangeText={(v) => updateFilter('priceMax', v)}
                      placeholder="gacha"
                    />
                  </View>
                  
                  {/* Currency Toggle */}
                  <View style={styles.currencyToggle}>
                    <TouchableOpacity
                      style={[
                        styles.currencyButton,
                        filters.currency === 'UZS' && styles.currencyButtonActive,
                      ]}
                      onPress={() => updateFilter('currency', 'UZS')}
                    >
                      <Text
                        style={[
                          styles.currencyButtonText,
                          filters.currency === 'UZS' && styles.currencyButtonTextActive,
                        ]}
                      >
                        UZS
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.currencyButton,
                        filters.currency === 'Y.E' && styles.currencyButtonActive,
                      ]}
                      onPress={() => updateFilter('currency', 'Y.E')}
                    >
                      <Text
                        style={[
                          styles.currencyButtonText,
                          filters.currency === 'Y.E' && styles.currencyButtonTextActive,
                        ]}
                      >
                        Y.E
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Posted By */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Kim joylashtirdi</Text>
                  <View style={styles.toggleRow}>
                    <ToggleChip
                      label="Rieltor"
                      isActive={filters.postedBy === 'Rieltor'}
                      onPress={() => updateFilter('postedBy', 'Rieltor')}
                      fullWidth
                    />
                    <ToggleChip
                      label="Egasi"
                      isActive={filters.postedBy === 'Egasi'}
                      onPress={() => updateFilter('postedBy', 'Egasi')}
                      fullWidth
                    />
                  </View>
                </View>

                {/* Bottom Padding */}
                <View style={styles.bottomPadding} />
              </ScrollView>

              {/* Sticky Apply Button */}
              <View style={styles.stickyBottom}>
                <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                  <Text style={styles.applyButtonText}>Qo'llash</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </Modal>

      {/* Picker Modal */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={styles.pickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>{pickerData.title}</Text>
            <View style={styles.placeholder} />
          </View>
          <ScrollView style={styles.pickerScroll}>
            {pickerData.items.map(item => (
              <TouchableOpacity
                key={item.value}
                style={styles.pickerItem}
                onPress={() => {
                  updateFilter(pickerData.key as keyof FilterState, item.value as any);
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.pickerItemText}>{item.label}</Text>
                {filters[pickerData.key as keyof FilterState] === item.value && (
                  <Check size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    zIndex: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 8,
  },

  // COLLAPSED STATE STYLES
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  cancelButton: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 14,
  },
  shortContent: {
    marginBottom: 24,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  selectBox: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  moreButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.gray100,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  applyButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },

  // EXPANDED STATE STYLES
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  clearButton: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 14,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray400,
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: COLORS.gray300,
    fontWeight: 'bold',
  },
  expandedContent: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  numberRow: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    padding: 4,
    borderRadius: 12,
    marginTop: 12,
    gap: 4,
  },
  currencyButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  currencyButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currencyButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray500,
  },
  currencyButtonTextActive: {
    color: COLORS.gray900,
  },
  bottomPadding: {
    height: 20,
  },
  stickyBottom: {
    paddingHorizontal: 4,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    backgroundColor: COLORS.white,
  },

  // PICKER STYLES
  pickerContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  pickerCancel: {
    fontSize: 16,
    color: COLORS.error,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  placeholder: {
    width: 50,
  },
  pickerScroll: {
    flex: 1,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.gray700,
  },
});

export default FilterModal;
