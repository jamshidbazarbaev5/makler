import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import { ArrowLeft, Home, Building2, Users, TreePine, Store } from 'lucide-react-native';
import BottomNav from '../components/BottomNav';

interface NavigationProp {
  navigate: (screen: string, params?: object) => void;
  goBack: () => void;
}

interface RouteParams {
  listingType?: string;
}

const PropertyTypeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { colors } = useTheme();
  const params = route.params as RouteParams | undefined;
  const listingType = params?.listingType;

  const allPropertyTypes = [
    {
      id: 'kvartira',
      icon: Home,
      title: 'Kvartira',
      description: 'Xonali kvartira',
    },
    {
      id: 'hovli-kottej-dacha',
      icon: Building2,
      title: 'Hovli/Kottej/Dacha',
      description: 'Shaxsiy turar joy',
    },
    {
      id: 'land',
      icon: TreePine,
      title: 'Yer',
      description: 'Qurilish uchun yer',
      excludeForListingTypes: ['daily-rent'],
    },
    {
      id: 'commercial',
      icon: Store,
      title: 'Tijorat',
      description: 'Tijorat mulki',
      excludeForListingTypes: ['daily-rent'],
    },
  ];

  // Filter property types based on listing type
  const propertyTypes = allPropertyTypes.filter(type => {
    if (type.excludeForListingTypes && listingType) {
      return !type.excludeForListingTypes.includes(listingType);
    }
    return true;
  });

  const handleSelectPropertyType = (propertyTypeId: string) => {
    navigation.navigate('PropertyForm', { 
      listingType: listingType, 
      propertyType: propertyTypeId 
    });
  };

  const OptionCard = ({ item }: { item: any }) => {
    const IconComponent = item.icon;
    return (
      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => handleSelectPropertyType(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <IconComponent size={32} color="#000" strokeWidth={1.5} />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>{item.title}</Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Mulk turi
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MULK TURINI TANLANG</Text>
          <View style={styles.optionsContainer}>
            {propertyTypes.map((item) => (
              <OptionCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#fff',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  optionCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  optionArrow: {
    fontSize: 24,
    color: '#ccc',
    marginLeft: 8,
  },
});

export default PropertyTypeScreen;
