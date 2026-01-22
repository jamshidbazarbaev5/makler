import React, { useState, useEffect, useRef } from 'react';
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
import Icon from 'react-native-vector-icons/Ionicons';
import { FilterState } from '../types';
import { SelectBox, ToggleChip, NumberInput } from './UiComponent';
import { COLORS, REGIONS, COUNTRIES, CATEGORIES, PROPERTY_TYPES } from '../constants';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

const { height: screenHeight } = Dimensions.get('window');

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
  const modalY = useRef(new Animated.Value(screenHeight)).current;
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

  useEffect(() => {
    if (isOpen) {
      // ensure sheet starts below the screen before animating up
      modalY.setValue(screenHeight);
      Animated.timing(modalY, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalY, {
        toValue: screenHeight,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setIsExpanded(false);
      });
    }
  }, [isOpen]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
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
  if (!isExpanded) {
    return (
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.bottomSheetContainer,
            { transform: [{ translateY: modalY }] },
          ]}
        >
          <View style={styles.handleBar} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtrlar</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Bekor qilish</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shortContent}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Toifasi</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => {
                  setIsExpanded(true);
                }}
              >
                <Text style={styles.selectText}>{filters.category}</Text>
                <Icon name="chevron-down" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Ko'chmas mulk turi</Text>
              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => {
                  setIsExpanded(true);
                }}
              >
                <Text style={styles.selectText}>{filters.propertyType}</Text>
                <Icon name="chevron-down" size={20} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => setIsExpanded(true)}
            >
              <Text style={styles.moreButtonText}>Ko'proq</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Qo'llash</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Modal
          visible={pickerVisible}
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
                    <Icon name="checkmark" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      <Animated.View
        style={[
          styles.expandedHeader,
          { transform: [{ translateY: modalY }] },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setIsExpanded(false)}
        >
          <Icon name="arrow-back" size={24} color={COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.backTitle}>Orqaga</Text>
        <TouchableOpacity onPress={() => setFilters(INITIAL_STATE)}>
          <Text style={styles.clearButton}>Tozalash</Text>
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.handleBarContainer}>
        <View style={styles.handleBar} />
      </View>

      <ScrollView style={styles.expandedContent}>
        <View style={styles.breadcrumbs}>
          <View style={styles.breadcrumbItem}>
            <Icon name="time-outline" size={16} color={COLORS.gray400} />
            <Text style={styles.breadcrumbText}>{filters.category}</Text>
          </View>
          <Text style={styles.breadcrumbSeparator}>/</Text>
          <View style={styles.breadcrumbItem}>
            <Icon name="home-outline" size={16} color={COLORS.gray400} />
            <Text style={styles.breadcrumbText}>{filters.propertyType}</Text>
          </View>
        </View>

        <SelectBox
          label="Davlat"
          value={filters.country}
          onPress={() => openPicker('country', 'Davlat', COUNTRIES)}
        />

        <SelectBox
          label="Viloyat"
          value={filters.region}
          placeholder="Tanlang"
          onPress={() => openPicker('region', 'Viloyat', REGIONS)}
        />

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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Xonalar soni</Text>
          <View style={styles.numberRow}>
            <NumberInput
              style={{ flex: 1 }}
              value={filters.roomCountStart}
              onChangeText={(v) => updateFilter('roomCountStart', parseInt(v) || 0)}
              placeholder="Min"
            />
            <NumberInput
              style={{ flex: 1 }}
              value={filters.roomCountEnd}
              onChangeText={(v) => updateFilter('roomCountEnd', parseInt(v) || 0)}
              placeholder="Max"
            />
          </View>
        </View>

        <SelectBox
          label="Ta'mirlash"
          value={filters.renovation}
          onPress={() => openPicker('renovation', 'Ta\'mirlash', [
            "O'rtacha",
            "Yaxshi",
            "Yangi remont",
          ])}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Narx</Text>
          <View style={styles.numberRow}>
            <NumberInput
              style={{ flex: 1 }}
              value={filters.priceMin}
              onChangeText={(v) => updateFilter('priceMin', v)}
              placeholder="Min"
            />
            <NumberInput
              style={{ flex: 1 }}
              value={filters.priceMax}
              onChangeText={(v) => updateFilter('priceMax', v)}
              placeholder="Max"
            />
          </View>
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

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.stickyBottom}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Qo'llash</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={pickerVisible}
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
                  <Icon name="checkmark" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
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
    justifyContent: 'flex-end',
    paddingBottom: 44,
  },
  backdropTouch: {
    flex: 1,
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: '100%',
    maxHeight: '100%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 18,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 5,
    overflow: 'hidden',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
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
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  moreButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.gray100,
    borderRadius: 20,
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
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  expandedContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  clearButton: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 14,
  },
  handleBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 8,
    pointerEvents: 'none',
  },
  expandedContent: {
    flex: 1,
    padding: 20,
    paddingBottom: 32,
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
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
  },
  currencyButton: {
    flex: 1,
    height: 32,
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
    height: 80,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 5,
  },
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
