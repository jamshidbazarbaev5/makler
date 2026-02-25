import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react-native';
import { COLORS } from '../constants';
import { FilterState, EMPTY_FILTERS } from '../types/filter';
import { useLanguage } from '../localization';
import api from '../services/api';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** fired when user taps Apply (or when modal is closed) */
  onApply: (filters: FilterState) => void;
  /** optional callback invoked on every change; parent can use it to fetch immediately */
  onChange?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

interface District {
  id: number;
  name: string;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onChange,
  initialFilters,
}) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>(initialFilters || EMPTY_FILTERS);
  const [districts, setDistricts] = useState<District[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters || EMPTY_FILTERS);
      api.getDistricts().then(data => {
        setDistricts(data.map((d: any) => ({
          id: d.id,
          name: d.translations?.ru?.name || d.name || `District ${d.id}`,
        })));
      }).catch(() => {});
    }
  }, [isOpen]);

  const set = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const toggle = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: filters[key] === value ? '' : value };
    setFilters(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSection(prev => prev === section ? null : section);
  };

  // previously we auto-applied within the sheet; that's no longer needed
  // because the parent now receives every modification via onChange.
  // the apply button still exists and will call onApply when pressed.

  const handleApply = () => {
    console.log('✅ FilterModal handleApply, filters:', JSON.stringify(filters));
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters(EMPTY_FILTERS);
  };

  const activeCount = Object.values(filters).filter(v => v !== '').length;

  // ---- Option chips ----
  const ChipGroup = ({
    filterKey,
    options,
  }: {
    filterKey: keyof FilterState;
    options: { label: string; value: string }[];
  }) => (
    <View style={styles.chipRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.chip, filters[filterKey] === opt.value && styles.chipActive]}
          onPress={() => toggle(filterKey, opt.value)}
        >
          <Text style={[styles.chipText, filters[filterKey] === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ---- Section header ----
  const Section = ({ id, label, children }: { id: string; label: string; children: React.ReactNode }) => {
    const open = openSection === id;
    return (
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(id)}>
          <Text style={styles.sectionLabel}>{label}</Text>
          {open ? <ChevronUp size={18} color={COLORS.gray500} /> : <ChevronDown size={18} color={COLORS.gray500} />}
        </TouchableOpacity>
        {open && <View style={styles.sectionBody}>{children}</View>}
      </View>
    );
  };

  // ---- Range inputs ----
  const RangeInput = ({
    minKey, maxKey, minPlaceholder, maxPlaceholder,
  }: {
    minKey: keyof FilterState;
    maxKey: keyof FilterState;
    minPlaceholder: string;
    maxPlaceholder: string;
  }) => (
    <View style={styles.rangeRow}>
      <TextInput
        style={styles.rangeInput}
        value={filters[minKey]}
        onChangeText={v => set(minKey, v)}
        placeholder={minPlaceholder}
        placeholderTextColor={COLORS.gray400}
        keyboardType="numeric"
      />
      <View style={styles.rangeDash} />
      <TextInput
        style={styles.rangeInput}
        value={filters[maxKey]}
        onChangeText={v => set(maxKey, v)}
        placeholder={maxPlaceholder}
        placeholderTextColor={COLORS.gray400}
        keyboardType="numeric"
      />
    </View>
  );

  const propertyTypes = [
    { label: t.filter.apartment, value: 'apartment' },
    { label: t.filter.house, value: 'house' },
    { label: t.filter.commercial, value: 'commercial' },
    { label: t.filter.land, value: 'land' },
  ];

  const listingTypes = [
    { label: t.filter.sale, value: 'sale' },
    { label: t.filter.rent, value: 'rent' },
    { label: t.filter.rentDaily, value: 'rent_daily' },
  ];

  const buildingTypes = [
    { label: t.filter.newBuilding, value: 'new' },
    { label: t.filter.oldBuilding, value: 'old' },
  ];

  const conditions = [
    { label: t.filter.conditionNeedsRepair, value: 'needs_repair' },
    { label: t.filter.conditionNoRepair, value: 'no_repair' },
    { label: t.filter.conditionCosmetic, value: 'cosmetic' },
    { label: t.filter.conditionEuro, value: 'euro_repair' },
    { label: t.filter.conditionDesign, value: 'design' },
    { label: t.filter.conditionCapital, value: 'capital' },
  ];

  const orderings = [
    { label: t.filter.orderNewest, value: '-posted_at' },
    { label: t.filter.orderOldest, value: 'posted_at' },
    { label: t.filter.orderPriceAsc, value: 'price' },
    { label: t.filter.orderPriceDesc, value: '-price' },
    { label: t.filter.orderViewsDesc, value: '-views_count' },
  ];

  const currencies = [
    { label: t.filter.usd, value: 'usd' },
    { label: t.filter.uzs, value: 'uzs' },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {t.filter.title}
              {activeCount > 0 && (
                <Text style={styles.headerCount}> ({activeCount})</Text>
              )}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>{t.filter.clearFilters}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={COLORS.gray600} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Property Type */}
            <Section id="property_type" label={t.filter.propertyType}>
              <ChipGroup filterKey="property_type" options={propertyTypes} />
            </Section>

            {/* Listing Type */}
            <Section id="listing_type" label={t.filter.listingType}>
              <ChipGroup filterKey="listing_type" options={listingTypes} />
            </Section>

            {/* Building Type */}
            <Section id="building_type" label={t.filter.buildingType}>
              <ChipGroup filterKey="building_type" options={buildingTypes} />
            </Section>

            {/* Condition */}
            <Section id="condition" label={t.filter.condition}>
              <ChipGroup filterKey="condition" options={conditions} />
            </Section>

            {/* Price */}
            <Section id="price" label={t.filter.priceRange}>
              {/* Currency */}
              <ChipGroup filterKey="currency" options={currencies} />
              <View style={{ height: 10 }} />
              <RangeInput
                minKey="price_min"
                maxKey="price_max"
                minPlaceholder={t.filter.from}
                maxPlaceholder={t.filter.to}
              />
            </Section>

            {/* Area */}
            <Section id="area" label={t.filter.area}>
              <RangeInput
                minKey="area_min"
                maxKey="area_max"
                minPlaceholder={t.filter.minArea}
                maxPlaceholder={t.filter.maxArea}
              />
            </Section>

            {/* Rooms */}
            <Section id="rooms" label={t.filter.rooms}>
              <RangeInput
                minKey="rooms_min"
                maxKey="rooms_max"
                minPlaceholder={t.filter.minRooms}
                maxPlaceholder={t.filter.maxRooms}
              />
            </Section>

            {/* Floor */}
            <Section id="floor" label={t.filter.floor}>
              <RangeInput
                minKey="floor_min"
                maxKey="floor_max"
                minPlaceholder={t.filter.minFloor}
                maxPlaceholder={t.filter.maxFloor}
              />
            </Section>

            {/* District */}
            {districts.length > 0 && (
              <Section id="district" label={t.filter.district}>
                <View style={styles.districtList}>
                  {districts.map(d => (
                    <TouchableOpacity
                      key={d.id}
                      style={styles.districtItem}
                      onPress={() => toggle('district', String(d.id))}
                    >
                      <Text style={[
                        styles.districtText,
                        filters.district === String(d.id) && styles.districtTextActive,
                      ]}>
                        {d.name}
                      </Text>
                      {filters.district === String(d.id) && (
                        <Check size={16} color={COLORS.purple} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </Section>
            )}

            {/* Ordering */}
            <Section id="ordering" label={t.filter.ordering}>
              <ChipGroup filterKey="ordering" options={orderings} />
            </Section>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>{t.filter.applyFilters}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  headerCount: {
    color: COLORS.purple,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearBtnText: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  sectionBody: {
    paddingBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.gray50,
  },
  chipActive: {
    borderColor: COLORS.purple,
    backgroundColor: '#f5f3ff',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  chipTextActive: {
    color: COLORS.purple,
    fontWeight: '600',
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rangeInput: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.gray900,
    backgroundColor: COLORS.gray50,
  },
  rangeDash: {
    width: 12,
    height: 2,
    backgroundColor: COLORS.gray300,
    borderRadius: 1,
  },
  districtList: {
    gap: 2,
  },
  districtItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  districtText: {
    fontSize: 14,
    color: COLORS.gray700,
  },
  districtTextActive: {
    color: COLORS.purple,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  applyBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

export default FilterModal;
