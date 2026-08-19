import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import { translateComorbidity, translateGender } from '../Constants/LanguageConfig';
import api from '../Services/api';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { lang, t } = useContext(LanguageContext);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [comorbidities, setComorbidities] = useState('');
  const [medications, setMedications] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success', onConfirm: null });

  const showAlert = (title, message, type = 'success', onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const closeAlert = () => {
    const onConfirm = alertConfig.onConfirm;
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (onConfirm) onConfirm();
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const email = await AsyncStorage.getItem('userEmail');
        const phone = undefined;
        const identifier = email || phone;
        if (identifier) {
          const response = await api.get('/health/profile', {
            params: { email: identifier, }
          });
          if (response.data) {
            setName(response.data.fullName || '');
            setAge(response.data.age ? String(response.data.age) : '');
            setGender(response.data.gender || '');
            setComorbidities(response.data.comorbidities || '');
            setMedications(response.data.medications || '');
          }
        }
      } catch (error) {
        console.log('Error loading profile for edit:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert(t.errorTitle, t.nameRequiredMsg, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.post('/health/profile/update', {
          email: identifier,
          fullName: name.trim(),
          age: age ? parseInt(age) : null,
          gender: gender.trim(),
          comorbidities: comorbidities.trim(),
          medications: medications.trim()
        });

        if (response.data?.fullName) {
          await AsyncStorage.setItem('userFullName', response.data.fullName);
        }

        showAlert(t.successTitle, t.profileUpdatedMsg, 'success', () => {
          navigation.goBack();
        });
      }
    } catch (error) {
      showAlert(t.errorTitle, t.profileUpdateError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (n) => {
    if (!n) return 'NA';
    const parts = n.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayGender = translateGender(gender, lang);
  const displayMedications = (!medications || medications === 'Chưa có' || medications === 'No medications' || medications === 'Không có') 
    ? (t.noMeds || (lang === 'EN' ? 'No medications' : 'Chưa có')) 
    : medications;
  const displayComorbidities = comorbidities 
    ? comorbidities.split(',').map(c => translateComorbidity(c, lang)).join(', ') 
    : '';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.pageTitle}>{t.editProfilePageTitle}</Text>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Text style={styles.saveBtnText}>{t.saveBtn}</Text>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <>
              {/* Avatar Section */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>{getInitials(name)}</Text>
                  </View>
                  <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
                    <MaterialIcons name="photo-camera" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.avatarSubText}>{t.changeAvatar}</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formContainer}>

                {/* Họ và tên */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.fullNameLabel}</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="person" size={20} color={COLORS.primary} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Tuổi & Giới tính */}
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t.ageLbl}</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="cake" size={20} color={COLORS.primary} />
                      <TextInput
                        style={styles.input}
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>{t.genderLbl}</Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="wc" size={20} color={COLORS.primary} />
                      <TextInput
                        style={styles.input}
                        value={displayGender}
                        onChangeText={setGender}
                      />
                    </View>
                  </View>
                </View>

                {/* Thuốc đang sử dụng */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.medsInUse}</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="medication" size={20} color={COLORS.primary} />
                    <TextInput
                      style={styles.input}
                      value={displayMedications}
                      onChangeText={setMedications}
                    />
                  </View>
                </View>

                {/* Bệnh nền */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{t.comorbiditiesLbl}</Text>
                  <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start', paddingTop: 14 }]}>
                    <MaterialIcons name="medical-information" size={20} color={COLORS.primary} />
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top', marginTop: Platform.OS === 'ios' ? 0 : -4 }]}
                      value={displayComorbidities}
                      onChangeText={setComorbidities}
                      multiline
                    />
                  </View>
                </View>

              </View>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
    marginTop: Platform.OS === 'android' ? 20 : 0,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  pageTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.rose50,
    borderRadius: 20,
  },
  saveBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.rose100,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  avatarSubText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.bodyText,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.rose50,
    ...SHADOWS.soft,
    gap: SIZES.lg,
  },
  inputGroup: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  inputLabel: {
    fontSize: SIZES.smallText,
    fontWeight: '700',
    color: COLORS.textMain,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '500',
  }
});

export default EditProfileScreen;


