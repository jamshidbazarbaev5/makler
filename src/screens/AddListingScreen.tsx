import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNav from '../components/BottomNav';

interface NavigationProp {
  navigate: (screen: string, params?: object) => void;
}

const AddListingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const sotuvchiSifatida = [
    {
      id: 'daily-rent',
      icon: '⏰',
      title: 'Kunlik ijaraga beraman',
      description: 'Kunlik ijaraga berish',
    },
    {
      id: 'monthly-rent',
      icon: '📋',
      title: 'Ijaraga beraman',
      description: 'Oylik ijaraga berish',
    },
    {
      id: 'sell',
      icon: '🤝',
      title: 'Sotaman',
      description: 'Mulkni sotish',
    },
  ];

  const xaridorSifatida = [
    {
      id: 'daily-rent-buy',
      icon: '📅',
      title: 'Ijaraga olaman',
      description: 'Kunlik ijara qidirish',
    },
    {
      id: 'buy',
      icon: '🤝',
      title: 'Sotib olaman',
      description: 'Mulk sotib olish',
    },
  ];

  const handleSelectOption = (optionId: string) => {
    navigation.navigate('PropertyForm', { listingType: optionId });
  };

  const OptionCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.optionCard}
      onPress={() => handleSelectOption(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionIcon}>{item.icon}</Text>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>{item.title}</Text>
        </View>
        <Text style={styles.optionArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>E'lon Qo'shish</Text>
        </View>

        {/* Sotuvchi Sifatida Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SOTUVCHI SIFATIDA</Text>
          <View style={styles.optionsContainer}>
            {sotuvchiSifatida.map((item) => (
              <OptionCard key={item.id} item={item} />
            ))}
          </View>
        </View>

        {/* Xaridor Sifatida Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>XARIDOR SIFATIDA</Text>
          <View style={styles.optionsContainer}>
            {xaridorSifatida.map((item) => (
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
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
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
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

export default AddListingScreen;
