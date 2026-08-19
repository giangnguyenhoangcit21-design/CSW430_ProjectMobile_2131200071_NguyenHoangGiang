import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const SetPasswordScreen = ({ route, navigation }) => {
  const { email, otpCode } = route.params || {};
  const { lang, toggleLanguage, t } = useContext(LanguageContext);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });
  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setAlertConfig({ visible: true, title: t.missingInfo, message: t.enterNewPasswordMsg, type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setAlertConfig({ visible: true, title: t.passwordMismatch, message: t.passwordMismatchMsg, type: 'error' });
      return;
    }

    if (password.length < 6) {
      setAlertConfig({ visible: true, title: t.weakPasswordTitle, message: t.weakPasswordMsg, type: 'error' });
      return;
    }
    
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        email, 
        newPassword: password, 
        otpCode 
      });

      setIsLoading(false);
      // Directly reset stack to Login screen on success
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error.response?.data?.message || t.genericErrorMsg;
      setAlertConfig({ visible: true, title: t.updateFailedTitle, message: errorMsg, type: 'error' });
    }
  };

  const isFormValid = password.length >= 6 && password === confirmPassword;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Row with Back Button and Language Switcher */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.setPasswordTitle}</Text>
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
              <MaterialIcons name="security" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{t.setPasswordTitle}</Text>
            <Text style={styles.subtitle}>
              {t.setPasswordSubtitle}{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            
            {/* Mật khẩu mới */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.newPasswordLabel}</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.newPasswordPlaceholder}
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Xác nhận mật khẩu mới */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t.confirmNewPasswordLabel}</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock-clock" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t.confirmNewPasswordPlaceholder}
                  placeholderTextColor={COLORS.textLight}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showConfirmPassword ? "visibility" : "visibility-off"} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.primaryButton, (!isFormValid || isLoading) && styles.primaryButtonDisabled]} 
              onPress={handleSubmit}
              disabled={!isFormValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>{t.savePasswordBtn}</Text>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
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
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: COLORS.primary,
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
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 14,
    height: 50,
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
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    marginTop: 8,
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

export default SetPasswordScreen;


