import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProfile, setUser, updateProfile, updateAvatar } from '../redux/slices/authSlice';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, User, Mail, Phone, MessageSquare, Camera, Check, Info } from 'lucide-react-native';
import { COLORS } from '../constants';

type Props = NativeStackScreenProps<any, 'ProfileEdit'>;

interface ProfileData {
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  bio: string;
  avatar: string;
}

export default function ProfileEditScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    avatar: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setIsFetching(true);
    dispatch(fetchProfile()).finally(() => setIsFetching(false));
  }, [dispatch]);

  useEffect(() => {
    if (authUser) {
      // Debug: log Redux user to verify field names
      console.log('🔁 authUser from Redux:', JSON.stringify(authUser, null, 2));

      // Prefer `full_name` when available and split into first/last
      const fullName = authUser.full_name ?? authUser.name ?? '';
      const [firstNameFromFull, ...rest] = fullName.split(' ');
      const lastNameFromFull = rest.join(' ');

      setProfileData({
        username: authUser.username ?? '',
        firstName: authUser.first_name ?? firstNameFromFull ?? authUser.username ?? '',
        lastName: authUser.last_name ?? lastNameFromFull ?? '',
        phoneNumber: authUser.phone ?? '',
        bio: authUser.bio ?? '',
        avatar: authUser.avatar ?? authUser.photo_url ?? '',
      });
    }
  }, [authUser]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!profileData.username.trim()) {
      Alert.alert('Xato', 'Foydalanuvchi nomi kiritilishi shart');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        username: profileData.username,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phoneNumber,
        bio: profileData.bio,
      };

      const updated = await dispatch(updateProfile(payload)).unwrap();

      // Update redux user (extra reducer also updates state)
      dispatch(setUser(updated));

      setIsLoading(false);
      Alert.alert('Muvaffaqiyat', 'Profil muvaffaqiyatli yangilandi', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Xato', 'Profilni yangilashda xato yuz berdi');
    }
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      "Avatar o'zgartirish",
      "Qanday usul bilan rasmni tanlaysiz?",
      [
        {
          text: 'Kamera',
          onPress: async () => {
            try {
              const result = await launchCamera({mediaType: 'photo', quality: 0.8});
              const asset = result?.assets?.[0];
              if (!asset?.uri) return;

              let uri = asset.uri;
              if (Platform.OS === 'ios' && uri && !uri.startsWith('file://')) {
                uri = 'file://' + uri;
              }

              const formData = new FormData();
              // @ts-ignore
              formData.append('avatar', {
                uri,
                name: asset.fileName ?? 'avatar.jpg',
                type: asset.type ?? 'image/jpeg',
              });

              setIsLoading(true);
              const updated = await dispatch(updateAvatar(formData)).unwrap();
              dispatch(setUser(updated));
              setProfileData(prev => ({...prev, avatar: updated.avatar ?? prev.avatar}));
              setIsLoading(false);
              Alert.alert('Muvaffaqiyat', 'Avatar yangilandi');
            } catch (err: any) {
              console.error('Avatar upload error (camera):', err?.response?.data ?? err.message ?? err);
              setIsLoading(false);
              const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? 'Avatar yangilashda xato yuz berdi';
              Alert.alert('Xato', msg);
            }
          },
        },
        {
          text: 'Galereya',
          onPress: async () => {
            try {
              const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
              const asset = result?.assets?.[0];
              if (!asset?.uri) return;

              let uri = asset.uri;
              if (Platform.OS === 'ios' && uri && !uri.startsWith('file://')) {
                uri = 'file://' + uri;
              }

              const formData = new FormData();
              // @ts-ignore
              formData.append('avatar', {
                uri,
                name: asset.fileName ?? 'avatar.jpg',
                type: asset.type ?? 'image/jpeg',
              });

              setIsLoading(true);
              const updated = await dispatch(updateAvatar(formData)).unwrap();
              dispatch(setUser(updated));
              setProfileData(prev => ({...prev, avatar: updated.avatar ?? prev.avatar}));
              setIsLoading(false);
              Alert.alert('Muvaffaqiyat', 'Avatar yangilandi');
            } catch (err: any) {
              console.error('Avatar upload error (gallery):', err?.response?.data ?? err.message ?? err);
              setIsLoading(false);
              const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? 'Avatar yangilashda xato yuz berdi';
              Alert.alert('Xato', msg);
            }
          },
        },
        {
          text: 'Bekor qilish',
          style: 'cancel',
        },
      ],
    );
  };


  
  if (isFetching) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ActivityIndicator size="large" style={{ marginTop: 80 }} color={COLORS.purple} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <ChevronLeft
            size={28}
            color={COLORS.gray900}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilni tahrirlash</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isLoading}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={styles.content}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {profileData.avatar ? (
                <Image
                  source={{ uri: profileData.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarGradient}>
                  <Text style={styles.avatarText}>
                    {profileData.firstName.charAt(0)}
                    {profileData.lastName.charAt(0)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.avatarEditButton}
                onPress={handleChangeAvatar}
                disabled={isLoading}
              >
                <Camera size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarHint}>Avatarni o'zgartirish</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
          
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.label}>Ism</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'firstName' && styles.inputWrapperFocused,
                  ]}
                >
                  <User
                    size={20}
                    color={
                      focusedField === 'firstName'
                        ? COLORS.purple
                        : COLORS.gray400
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ismingiz"
                    placeholderTextColor={COLORS.gray400}
                    value={profileData.firstName}
                    onChangeText={(text) =>
                      handleInputChange('firstName', text)
                    }
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    editable={!isLoading}
                  />
                </View>
              </View>

             
            </View>

            <View style={[styles.inputContainer]}>
              <Text style={styles.label}>Telefon raqami</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'phoneNumber' && styles.inputWrapperFocused,
                ]}
              >
                <Phone
                  size={20}
                  color={
                    focusedField === 'phoneNumber'
                      ? COLORS.purple
                      : COLORS.gray400
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="+998 90 123 45 67"
                  placeholderTextColor={COLORS.gray400}
                  value={profileData.phoneNumber}
                  onChangeText={(text) =>
                    handleInputChange('phoneNumber', text)
                  }
                  onFocus={() => setFocusedField('phoneNumber')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            </View>

         
            <View style={[styles.inputContainer]}>
              <Text style={styles.label}>Bio</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focusedField === 'bio' && styles.inputWrapperFocused,
                ]}
              >
                <MessageSquare
                  size={20}
                  color={
                    focusedField === 'bio'
                      ? COLORS.purple
                      : COLORS.gray400
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.textAreaInput]}
                  placeholder="O'zingiz haqida qisqacha ma'lumot yozing..."
                  placeholderTextColor={COLORS.gray400}
                  value={profileData.bio}
                  onChangeText={(text) =>
                    handleInputChange('bio', text)
                  }
                  onFocus={() => setFocusedField('bio')}
                  onBlur={() => setFocusedField(null)}
                  multiline={true}
                  numberOfLines={4}
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Info
              size={20}
              color={COLORS.purple}
            />
            <Text style={styles.infoText}>
              Shaxsiy ma'lumotlaringiz xavfsiz saqlangan
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Bekor qilish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            isLoading && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Check size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Saqlash</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 120,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarHint: {
    fontSize: 13,
    color: COLORS.gray500,
    fontWeight: '500',
  },

  // Form Section
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray200,
    paddingHorizontal: 12,
  },
  inputWrapperFocused: {
    borderColor: COLORS.purple,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 0,
    fontSize: 16,
    color: COLORS.gray900,
    fontWeight: '500',
  },
  textAreaInput: {
    paddingTop: 14,
    textAlignVertical: 'top',
  },

  // Name Row
  nameRow: {
    flexDirection: 'row',
    gap: 0,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray700,
    fontWeight: '500',
  },

  // Footer
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingBottom: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
