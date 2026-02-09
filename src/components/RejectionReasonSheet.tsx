import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { X, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import { COLORS } from '../constants';
import { useLanguage } from '../localization/LanguageContext';

interface RejectionReasonSheetProps {
  visible: boolean;
  onClose: () => void;
  postTitle: string;
  reason: string;
}

const { height: screenHeight } = Dimensions.get('window');

export default function RejectionReasonSheet({
  visible,
  onClose,
  postTitle,
  reason,
}: RejectionReasonSheetProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
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

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
              <AlertCircle size={24} color="#ef4444" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t.postRejected}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
                "{postTitle}"
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.reasonContainer}>
            <Text style={[styles.reasonLabel, { color: colors.text + '80' }]}>
              {t.rejectionReason}
            </Text>
            <Text style={[styles.reasonText, { color: colors.text }]}>
              {reason}
            </Text>
          </View>

          {/* Info box */}
          <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.infoText, { color: colors.text + 'CC' }]}>
              {t.canEditAndResubmit}
            </Text>
          </View>
        </ScrollView>

        {/* Footer button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{t.understood}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayContent: {
    flex: 1,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.7,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  closeButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  reasonContainer: {
    marginBottom: 16,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  reasonText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
