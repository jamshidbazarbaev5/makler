import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from 'react-native';
import { ChevronLeft, Info } from 'lucide-react-native';
import { COLORS } from '../constants';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
  // currentLanguage may still be 'en' internally even though we don't show it in the list
  currentLanguage?: 'uz' | 'ru' | 'en' | 'kaa';
  onLanguageSelect: (language: 'uz' | 'ru' | 'kaa') => void;
}

const languages = [
  { id: 'uz', name: 'O\'zbek', flag: '🇺🇿', nativeName: 'O\'zbek' },
  { id: 'ru', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },

  { id: 'kaa', name: 'Qaraqalpaq', flag: '🇺🇿', nativeName: 'Qaraqalpaqsha' },
];

export default function LanguageModal({
  visible,
  onClose,
  currentLanguage = 'uz',
  onLanguageSelect,
}: LanguageModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'uz' | 'ru' | 'kaa'>(
    // if currentLanguage is english or undefined, default to uz
    currentLanguage === 'ru' || currentLanguage === 'kaa' ? currentLanguage : 'uz'
  );
  const [slideAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const handleSelect = (language: 'uz' | 'ru' | 'kaa') => {
    setSelectedLanguage(language);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onLanguageSelect(language);
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <View style={styles.overlayContent} />
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <SafeAreaView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ChevronLeft
                size={28}
                color={COLORS.gray900}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tilni tanlang</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Divider */}
          <View style={styles.headerDivider} />

          {/* Language List */}
          <View style={styles.languageList}>
            {languages.map((language) => {
              const isSelected = selectedLanguage === language.id;
              return (
                <TouchableOpacity
                  key={language.id}
                  style={[
                    styles.languageItem,
                    isSelected && styles.languageItemSelected,
                  ]}
                  onPress={() => handleSelect(language.id as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageContent}>
                    <Text style={styles.languageFlag}>{language.flag}</Text>
                    <View style={styles.languageTextContainer}>
                      <Text style={styles.languageName}>{language.name}</Text>
                      <Text style={styles.languageNative}>
                        {language.nativeName}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Button */}
                  <View
                    style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Info
              size={18}
              color={COLORS.purple}
            />
            <Text style={styles.infoText}>
              Til o'zgartirilsa, ilova qayta yuklanadi
            </Text>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContent: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  headerDivider: {
    height: 1,
    backgroundColor: COLORS.gray200,
  },
  languageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  languageItemSelected: {
    backgroundColor: '#F0E6FF',
    borderColor: COLORS.purple,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  languageFlag: {
    fontSize: 28,
  },
  languageTextContainer: {
    gap: 2,
  },
  languageName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  languageNative: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.purple,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 36,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray700,
    fontWeight: '500',
    lineHeight: 18,
  },
});
