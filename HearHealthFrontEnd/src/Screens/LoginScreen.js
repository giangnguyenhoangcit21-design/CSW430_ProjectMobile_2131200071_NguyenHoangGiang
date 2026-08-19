import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { TRANSLATIONS, getLocalizedErrorMessage } from '../Constants/LanguageConfig';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const LoginScreen = ({ navigation }) => {
  const { lang, toggleLanguage, t } = useContext(LanguageContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSendingGmailOtp, setIsSendingGmailOtp] = useState(false);
  
  // Quick Gmail Modal State
  const [gmailModalVisible, setGmailModalVisible] = useState(false);
  const [quickGmailEmail, setQuickGmailEmail] = useState('');

  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setAlertConfig({ visible: true, title: t.missingInfo, message: t.missingInfoMsg, type: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password 
      });
      
      const userEmailVal = response.data?.email || email.trim();
      
      await AsyncStorage.setItem('userEmail', userEmailVal);
      if (response.data?.fullName) {
        await AsyncStorage.setItem('userFullName', response.data.fullName);
      }
      
      setIsLoading(false);
      
      if (response.data.screeningCompleted) {
        navigation.replace('Main');
      } else {
        navigation.replace('Screening');
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || t.loginFailed;
      setAlertConfig({ visible: true, title: t.loginFailed, message: errorMsg, type: 'error' });
    }
  };

  const handleOpenGmailModal = () => {
    setQuickGmailEmail(email.trim());
    setGmailModalVisible(true);
  };

  const handleQuickGmailSubmit = async () => {
    const targetEmail = quickGmailEmail.trim() || email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setAlertConfig({ visible: true, title: t.missingInfo, message: t.invalidEmailMsg, type: 'error' });
      return;
    }

    setIsSendingGmailOtp(true);
    try {
      await api.post('/auth/send-otp', { email: targetEmail, purpose: 'GMAIL_LOGIN', lang });
      setIsSendingGmailOtp(false);
      setGmailModalVisible(false);

      // Seamless navigation without blocking alert
      navigation.navigate('OTP', { email: targetEmail, purpose: 'GMAIL_LOGIN' });

    } catch (error) {
      setIsSendingGmailOtp(false);
      const rawErrorMsg = error.response?.data?.message || t.gmailApiErrorMsg;
      const errorMsg = getLocalizedErrorMessage(rawErrorMsg, lang, t.gmailApiErrorMsg);
      setAlertConfig({ visible: true, title: t.gmailApiErrorTitle || (lang === 'EN' ? 'Gmail API Error' : 'Lỗi Gmail API'), message: errorMsg, type: 'error' });
    }
  };

  const isFormValid = email.trim().includes('@') && password.length >= 6;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Bar with Language Toggle */}
          <View style={[styles.topHeaderRow, { justifyContent: 'flex-end' }]}>
            <TouchableOpacity 
              style={styles.langBtn} 
              onPress={toggleLanguage} 
              activeOpacity={0.6}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={styles.langBtnText}>{lang === 'VN' ? '🇻🇳 VN' : '🇬🇧 EN'}</Text>
            </TouchableOpacity>
          </View>

          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="favorite" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.brandTitle}>{t.brandName}</Text>
            <Text style={styles.title}>{t.welcomeBack}</Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Quick Gmail Login Button */}
            <TouchableOpacity 
              style={styles.googleButton} 
              onPress={handleOpenGmailModal}
              activeOpacity={0.8}
            >
              <View style={styles.googleIconBadge}>
                <MaterialIcons name="mail" size={18} color={'#E11D48'} />
              </View>
              <Text style={styles.googleButtonText}>{t.quickGmailLogin}</Text>
              <MaterialIcons name="arrow-forward" size={18} color={'#E11D48'} style={{marginLeft: 8}} />
            </TouchableOpacity>


            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.orPassword}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.emailLabel}</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.emailPlaceholder}
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.passwordLabel}</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.passwordPlaceholder}
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>{t.forgotPasswordLink}</Text>
            </TouchableOpacity>

            {/* Main Login Button */}
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton, !isFormValid && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>{t.loginBtn}</Text>
                  <MaterialIcons name="arrow-forward" size={22} color={COLORS.white} style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>{t.noAccount} </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>{t.registerNow}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Quick Gmail Overlay Modal */}
      {gmailModalVisible && (
        <View style={styles.customModalOverlay}>
          <View style={styles.customModalCard}>
            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setGmailModalVisible(false)}
            >
              <MaterialIcons name="close" size={22} color={COLORS.textMuted} />
            </TouchableOpacity>
            
            <View style={styles.modalHeaderIcon}>
              <MaterialIcons name="mark-email-read" size={32} color={COLORS.primary} />
            </View>

            <Text style={styles.modalTitle}>{t.quickGmailLogin}</Text>
            <Text style={styles.modalSub}>{t.gmailModalDescLogin}</Text>
            
            <View style={styles.modalInputWrapper}>
              <MaterialIcons name="email" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.modalInput}
                placeholder={t.emailPlaceholder}
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                value={quickGmailEmail}
                onChangeText={setQuickGmailEmail}
              />
            </View>

            <TouchableOpacity 
              style={styles.modalSubmitBtn}
              onPress={handleQuickGmailSubmit}
              disabled={isSendingGmailOtp}
              activeOpacity={0.85}
            >
              {isSendingGmailOtp ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.modalSubmitBtnText}>{t.sendGmailOtpBtn}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
    paddingTop: Platform.OS === 'android' ? 32 : 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    marginTop: Platform.OS === 'android' ? 12 : 4,
    zIndex: 999,
    elevation: 10,
  },
  langBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.rose100,
    zIndex: 1000,
    elevation: 10,
    ...SHADOWS.medium,
  },
  langBtnText: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
    borderWidth: 2,
    borderColor: COLORS.rose100,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  title: {
    fontSize: SIZES.h1 - 4,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: SIZES.radiusLg,
    marginBottom: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  googleIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: SIZES.smallText + 1,
    fontWeight: 'bold',
    color: '#334155',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 10,
    color: COLORS.textLight,
    fontSize: SIZES.smallText - 1,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
    width: '100%',
  },
  label: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    fontWeight: '500',
    height: '100%',
  },
  eyeIcon: {
    padding: 6,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -2,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    color: COLORS.textMuted,
    fontSize: SIZES.smallText,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.smallText,
  },
  customModalOverlay: {
    position: 'absolute',
    top: -100,
    bottom: -100,
    left: -100,
    right: -100,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
    elevation: 25,
  },
  customModalCard: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SIZES.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.medium,
  },
  closeModalBtn: {
    alignSelf: 'flex-end',
    padding: 6,
  },
  modalHeaderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 14,
    height: 48,
    width: '100%',
    marginBottom: 16,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
  },
  modalSubmitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    width: '100%',
  },
  modalSubmitBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.bodyText,
  }
});

export default LoginScreen;


