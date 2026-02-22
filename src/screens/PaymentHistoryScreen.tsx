import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../constants';
import { useLanguage } from '../localization/LanguageContext';
import api from '../services/api';

interface PaymentItem {
  transaction_id: string;
  purpose: string;
  purpose_display: string;
  amount: string;
  amount_uzs: number;
  status: string;
  status_display: string;
  announcement: string | null;
  announcement_title: string | null;
  created_at: string;
  paid_at: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return '#22c55e';
    case 'cancelled': return '#f59e0b';
    case 'failed': return '#ef4444';
    case 'pending': return '#3b82f6';
    default: return '#64748b';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PaymentHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const ph = t.paymentHistory;
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchPayments();
    }, [])
  );

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getPaymentHistory();
      setPayments(response.results || []);
    } catch (err: any) {
      console.error('Error fetching payment history:', err);
      setError(ph?.loadError || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string, fallback: string) => {
    const map: Record<string, string> = {
      paid: ph?.statusPaid || 'Paid',
      cancelled: ph?.statusCancelled || 'Cancelled',
      failed: ph?.statusFailed || 'Failed',
      pending: ph?.statusPending || 'Pending',
    };
    return map[status] || fallback;
  };

  const getPurposeLabel = (purpose: string, fallback: string) => {
    const map: Record<string, string> = {
      featured: ph?.purposeFeatured || 'Featured/TOP',
      post: ph?.purposePost || 'Post Publishing',
    };
    return map[purpose] || fallback;
  };

  const renderPaymentItem = ({ item }: { item: PaymentItem }) => (
    <View style={[styles.paymentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.purposeText, { color: colors.text }]}>
          {getPurposeLabel(item.purpose, item.purpose_display)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status, item.status_display)}</Text>
        </View>
      </View>

      {item.announcement_title && (
        <Text style={[styles.announcementTitle, { color: colors.text }]} numberOfLines={1}>
          {item.announcement_title}
        </Text>
      )}

      <View style={styles.cardDetails}>
        <Text style={styles.amountText}>
          {Math.round(parseFloat(item.amount) / 100).toLocaleString()} {t.payment?.currency || "so'm"}
        </Text>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {formatDate(item.created_at)}
        </Text>
      </View>

      {item.paid_at && (
        <Text style={styles.paidAtText}>
          {ph?.paidAt || 'Paid'}: {formatDate(item.paid_at)}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {ph?.title || 'Payment History'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity onPress={fetchPayments} style={styles.retryButton}>
            <Text style={styles.retryText}>{ph?.retry || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {ph?.noPayments || 'No payments'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.text }]}>
            {ph?.noPaymentsDesc || 'No payments yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.transaction_id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  paymentCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purposeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  announcementTitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.purple,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  paidAtText: {
    fontSize: 11,
    color: '#22c55e',
    marginTop: 8,
  },
});

export default PaymentHistoryScreen;
