import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { TRANSLATIONS } from '../Constants/LanguageConfig';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const ForgotPasswordScreen = ({ navigation }) => {
  const { lang, toggleLanguage, t } = useContext(LanguageContext);
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

  const handleSendOTP = async () => {
    if (!email.trim() || !email.includes('@')) {
      setAlertConfig({ visible: true, title: t.missingInfo, message: t.invalidEmailMsg, type: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/send-otp', { email: email.trim(), purpose: 'RESET_PASSWORD', lang });
      setIsLoading(false);

      // Seamless navigation
      navigation.navigate('OTP', { email: email.trim(), purpose: 'RESET_PASSWORD' });
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || t.gmailApiErrorMsg;
      setAlertConfig({ visible: true, title: t.errorTitle, message: errorMsg, type: 'error' });
    }
  };

  const isFormValid = email.trim().includes('@');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Row with safe camera notch offset and language switcher */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.forgotPasswordTitle}</Text>
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
              <MaterialIcons name="lock-reset" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{t.forgotPasswordTitle}?</Text>
            <Text style={styles.subtitle}>
              {t.forgotPasswordDesc}
            </Text>
          </View>

          {/* Card Form */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.emailLabel}</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color={COLORS.primary} style={styles.inputIcon} />
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

            <TouchableOpacity 
              style={[styles.primaryButton, (!isFormValid || isLoading) && styles.primaryButtonDisabled]} 
              onPress={handleSendOTP}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>{t.sendOtpBtn}</Text>
                  <MaterialIcons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
                </>
              )}
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          const onConfirm = alertConfig.onConfirm;
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (onConfirm) onConfirm();
        }}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SIZES.lg,
    marginTop: Platform.OS === 'android' ? 12 : 4,
    zIndex: 999,
    elevation: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  langBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
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
    marginBottom: 24,
    width: '100%',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.rose100,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  card: {
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
  inputGroup: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: SIZES.smallText + 1,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textMain,
    fontWeight: '500',
    height: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
  },
});

export default ForgotPasswordScreen;


