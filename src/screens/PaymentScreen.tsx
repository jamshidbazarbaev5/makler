import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, CreditCard, Shield, CheckCircle, RefreshCw } from 'lucide-react-native';
import { COLORS } from '../constants';
import api from '../services/api';
import { useLanguage } from '../localization';

type PaymentType = 'post' | 'featured';

type PaymentStep = 'card_input' | 'verification' | 'processing' | 'success' | 'error';

interface RouteParams {
  announcementId: string;
  paymentType: PaymentType;
  amount?: number;
  durationDays?: number;
}

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();

  const { announcementId, paymentType, amount, durationDays } = route.params as RouteParams;

  // Payment state
  const [step, setStep] = useState<PaymentStep>('card_input');
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Card input state - following Paycom guidelines (no name attribute)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpire, setCardExpire] = useState('');

  // Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for inputs
  const expireInputRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);

  // Timer for resend code
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Format card number with spaces (8600 0691 9540 6311)
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    return cleaned;
  };

  // Get raw card number without spaces
  const getRawCardNumber = () => cardNumber.replace(/\s/g, '');

  // Get expiry in MMYY format for API
  const getExpiryForApi = () => cardExpire.replace('/', '');

  // Validate card input
  const isCardValid = () => {
    const rawNumber = getRawCardNumber();
    const rawExpiry = getExpiryForApi();
    return rawNumber.length === 16 && rawExpiry.length === 4;
  };

  // Handle card number input
  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardNumber(formatted);

    // Auto-focus expiry when card number is complete
    if (formatted.replace(/\s/g, '').length === 16) {
      expireInputRef.current?.focus();
    }
  };

  // Handle expiry input
  const handleExpiryChange = (value: string) => {
    // Handle backspace on slash
    if (value.length < cardExpire.length && cardExpire.endsWith('/')) {
      setCardExpire(value.slice(0, -1));
      return;
    }
    setCardExpire(formatExpiry(value));
  };

  // Step 1: Create payment and submit card
  const handleSubmitCard = async () => {
    if (!isCardValid()) {
      Alert.alert(t?.payment?.error || 'Xatolik', t?.payment?.invalidCard || 'Karta ma\'lumotlari noto\'g\'ri');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // First, create the payment on backend
      const createEndpoint = paymentType === 'featured'
        ? '/payments/featured/'
        : '/payments/post/';

      const createResponse = await api.createPayment(createEndpoint, {
        announcement_id: announcementId,
      });

      const newPaymentId = createResponse.transaction_id || createResponse.id || createResponse.payment_id;
      setPaymentId(newPaymentId);

      // Then, submit card for this payment
      const cardResponse = await api.submitCard(newPaymentId, {
        card_number: getRawCardNumber(),
        card_expire: getExpiryForApi(),
      });

      // Store masked phone for display
      if (cardResponse.phone) {
        setMaskedPhone(cardResponse.phone);
      }

      // Start resend timer (60 seconds as per Paycom docs)
      setResendTimer(60);

      // Move to verification step
      setStep('verification');
    } catch (error: any) {
      console.error('Card submission error:', error);
      console.error('Error response data:', JSON.stringify(error?.response?.data, null, 2));
      console.error('Error status:', error?.response?.status);
      const message = error?.response?.data?.detail ||
                     error?.response?.data?.message ||
                     error?.response?.data?.error ||
                     (typeof error?.response?.data === 'string' ? error?.response?.data : null) ||
                     error?.message ||
                     t?.payment?.cardError || 'Karta ma\'lumotlarini yuborishda xatolik';
      setErrorMessage(message);
      Alert.alert(t?.payment?.error || 'Xatolik', message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify SMS code
  const handleVerifyCode = async () => {
    if (verificationCode.length < 4) {
      Alert.alert(t?.payment?.error || 'Xatolik', t?.payment?.invalidCode || 'Tasdiqlash kodini kiriting');
      return;
    }

    if (!paymentId) {
      Alert.alert(t?.payment?.error || 'Xatolik', 'To\'lov ID topilmadi');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Verify the code
      await api.verifyCard(paymentId, {
        code: verificationCode,
      });

      // Process payment
      setStep('processing');

      const payResponse = await api.processPayment(paymentId);

      if (payResponse.status === 'paid' || payResponse.success) {
        setStep('success');
      } else {
        throw new Error(payResponse.message || 'To\'lov amalga oshmadi');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      const message = error?.response?.data?.detail ||
                     error?.response?.data?.message ||
                     error?.message ||
                     t?.payment?.verificationError || 'Tasdiqlashda xatolik';
      setErrorMessage(message);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (resendTimer > 0 || !paymentId) return;

    setLoading(true);
    try {
      const response = await api.resendCode(paymentId);

      if (response.phone) {
        setMaskedPhone(response.phone);
      }

      setResendTimer(response.wait ? Math.ceil(response.wait / 1000) : 60);
      Alert.alert(t?.payment?.success || 'Muvaffaqiyat', t?.payment?.codeSent || 'Kod qayta yuborildi');
    } catch (error: any) {
      console.error('Resend error:', error);
      Alert.alert(
        t?.payment?.error || 'Xatolik',
        error?.response?.data?.detail || t?.payment?.resendError || 'Kodni qayta yuborishda xatolik'
      );
    } finally {
      setLoading(false);
    }
  };

  // Retry payment
  const handleRetry = () => {
    setStep('card_input');
    setPaymentId(null);
    setVerificationCode('');
    setErrorMessage('');
  };

  // Go back
  const handleGoBack = () => {
    if (step === 'success') {
      navigation.goBack();
    } else {
      Alert.alert(
        t?.payment?.cancelTitle || 'To\'lovni bekor qilish',
        t?.payment?.cancelMessage || 'To\'lovni bekor qilmoqchimisiz?',
        [
          { text: t?.common?.no || 'Yo\'q', style: 'cancel' },
          { text: t?.common?.yes || 'Ha', onPress: () => navigation.goBack() },
        ]
      );
    }
  };

  // Get title based on payment type
  const getTitle = () => {
    if (paymentType === 'featured') {
      return t?.payment?.featuredTitle || 'E\'lonni yuqoriga chiqarish';
    }
    return t?.payment?.postTitle || 'E\'lon uchun to\'lov';
  };

  // Render card input step
  const renderCardInput = () => (
    <View style={styles.stepContainer}>
      <View style={styles.cardInputSection}>
        <Text style={styles.sectionTitle}>{t?.payment?.cardDetails || 'Karta ma\'lumotlari'}</Text>

        {/* Card Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t?.payment?.cardNumber || 'Karta raqami'}</Text>
          <View style={styles.inputWrapper}>
            <CreditCard size={20} color={COLORS.gray500} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="8600 0000 0000 0000"
              placeholderTextColor={COLORS.gray400}
              keyboardType="number-pad"
              maxLength={19}
              // No name attribute as per Paycom guidelines
            />
          </View>
        </View>

        {/* Expiry Date Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t?.payment?.expiryDate || 'Amal qilish muddati'}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={expireInputRef}
              style={[styles.input, styles.expiryInput]}
              value={cardExpire}
              onChangeText={handleExpiryChange}
              placeholder="MM/YY"
              placeholderTextColor={COLORS.gray400}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
        </View>
      </View>

      {/* Security Notice - Required by Paycom */}
      <View style={styles.securityNotice}>
        <Shield size={16} color={COLORS.gray600} />
        <Text style={styles.securityText}>
          {t?.payment?.securityNotice || 'Karta ma\'lumotlaringiz shifrlangan holda Payme serverlarida saqlanadi va savdo nuqtasiga uzatilmaydi.'}
        </Text>
      </View>

      {/* Payme Logo and Terms - Required by Paycom */}
      <View style={styles.paymeSection}>
        <Image
          source={{ uri: 'https://cdn.payme.uz/logos/payme_01.png' }}
          style={styles.paymeLogo}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => Linking.openURL('https://payme.uz/oferta')}
        >
          <Text style={styles.termsLink}>
            {t?.payment?.termsLink || 'Payme foydalanish shartlari'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, !isCardValid() && styles.submitButtonDisabled]}
        onPress={handleSubmitCard}
        disabled={!isCardValid() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {t?.payment?.continue || 'Davom etish'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render verification step
  const renderVerification = () => (
    <View style={styles.stepContainer}>
      <View style={styles.verificationSection}>
        <View style={styles.verificationIcon}>
          <Shield size={48} color={COLORS.purple} />
        </View>

        <Text style={styles.verificationTitle}>
          {t?.payment?.enterCode || 'Tasdiqlash kodini kiriting'}
        </Text>

        <Text style={styles.verificationSubtitle}>
          {t?.payment?.codeSentTo || 'Kod yuborildi:'} {maskedPhone || '***'}
        </Text>

        {/* Code Input */}
        <View style={styles.codeInputContainer}>
          <TextInput
            ref={codeInputRef}
            style={styles.codeInput}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="000000"
            placeholderTextColor={COLORS.gray400}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
        </View>

        {/* Resend Button */}
        <TouchableOpacity
          style={[styles.resendButton, resendTimer > 0 && styles.resendButtonDisabled]}
          onPress={handleResendCode}
          disabled={resendTimer > 0 || loading}
        >
          <RefreshCw size={16} color={resendTimer > 0 ? COLORS.gray400 : COLORS.purple} />
          <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonTextDisabled]}>
            {resendTimer > 0
              ? `${t?.payment?.resendIn || 'Qayta yuborish'} (${resendTimer}s)`
              : t?.payment?.resendCode || 'Kodni qayta yuborish'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Verify Button */}
      <TouchableOpacity
        style={[styles.submitButton, verificationCode.length < 4 && styles.submitButtonDisabled]}
        onPress={handleVerifyCode}
        disabled={verificationCode.length < 4 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>
            {t?.payment?.verify || 'Tasdiqlash'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render processing step
  const renderProcessing = () => (
    <View style={[styles.stepContainer, styles.centerContent]}>
      <ActivityIndicator size="large" color={COLORS.purple} />
      <Text style={styles.processingText}>
        {t?.payment?.processing || 'To\'lov amalga oshirilmoqda...'}
      </Text>
    </View>
  );

  // Render success step
  const renderSuccess = () => (
    <View style={[styles.stepContainer, styles.centerContent]}>
      <View style={styles.successIcon}>
        <CheckCircle size={64} color={COLORS.success} />
      </View>
      <Text style={styles.successTitle}>
        {t?.payment?.successTitle || 'To\'lov muvaffaqiyatli!'}
      </Text>
      <Text style={styles.successSubtitle}>
        {paymentType === 'featured'
          ? t?.payment?.featuredSuccess || 'E\'loningiz yuqoriga chiqarildi'
          : t?.payment?.postSuccess || 'E\'loningiz uchun to\'lov qabul qilindi'}
      </Text>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.submitButtonText}>
          {t?.payment?.done || 'Tayyor'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render error step
  const renderError = () => (
    <View style={[styles.stepContainer, styles.centerContent]}>
      <View style={styles.errorIcon}>
        <CreditCard size={64} color={COLORS.error} />
      </View>
      <Text style={styles.errorTitle}>
        {t?.payment?.errorTitle || 'To\'lov amalga oshmadi'}
      </Text>
      <Text style={styles.errorSubtitle}>
        {errorMessage || t?.payment?.errorMessage || 'Iltimos, qaytadan urinib ko\'ring'}
      </Text>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleRetry}
      >
        <Text style={styles.submitButtonText}>
          {t?.payment?.retry || 'Qaytadan urinish'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 'card_input':
        return renderCardInput();
      case 'verification':
        return renderVerification();
      case 'processing':
        return renderProcessing();
      case 'success':
        return renderSuccess();
      case 'error':
        return renderError();
      default:
        return renderCardInput();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color={COLORS.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getTitle()}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Amount Display */}
      {amount && step !== 'success' && step !== 'error' && (
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>{t?.payment?.amount || 'To\'lov summasi'}</Text>
          <Text style={styles.amountValue}>
            {amount.toLocaleString()} {t?.payment?.currency || 'so\'m'}
          </Text>
          {durationDays && (
            <Text style={styles.durationText}>
              {t?.payment?.durationLabel || 'Amal qilish muddati'}: {durationDays} {t?.payment?.days || 'kun'}
            </Text>
          )}
        </View>
      )}

      {/* Step Indicator */}
      {step !== 'success' && step !== 'error' && step !== 'processing' && (
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step === 'card_input' && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === 'verification' && styles.stepDotActive]} />
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray800,
  },
  headerRight: {
    width: 40,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: COLORS.gray50,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray300,
  },
  stepDotActive: {
    backgroundColor: COLORS.purple,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.gray300,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: 12,
    fontSize: 18,
    color: COLORS.gray900,
    letterSpacing: 1,
  },
  expiryInput: {
    paddingLeft: 16,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.gray100,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.gray600,
    marginLeft: 8,
    lineHeight: 18,
  },
  paymeSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  paymeLogo: {
    width: 120,
    height: 40,
    marginBottom: 8,
  },
  termsLink: {
    fontSize: 12,
    color: COLORS.purple,
    textDecorationLine: 'underline',
  },
  submitButton: {
    backgroundColor: COLORS.purple,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    width:'100%',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  // Verification styles
  verificationSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verificationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.purpleLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: 24,
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  codeInput: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    color: COLORS.gray900,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
    color: COLORS.purple,
    marginLeft: 8,
  },
  resendButtonTextDisabled: {
    color: COLORS.gray400,
  },
  // Processing styles
  processingText: {
    fontSize: 16,
    color: COLORS.gray600,
    marginTop: 16,
  },
  // Success styles
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 32,
  },
  // Error styles
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 32,
  },
});
