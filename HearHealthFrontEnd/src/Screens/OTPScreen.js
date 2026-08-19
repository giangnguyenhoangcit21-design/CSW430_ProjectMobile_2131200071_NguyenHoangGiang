import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, ScrollView, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { TRANSLATIONS } from '../Constants/LanguageConfig';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const OTPScreen = ({ route, navigation }) => {
  const { email, password, fullName, purpose = 'REGISTER' } = route.params || {};

  const { lang, toggleLanguage, t } = useContext(LanguageContext);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });
  const inputs = useRef([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    if (inputs.current[0]) inputs.current[0].focus();
    
    try {
      await api.post('/auth/send-otp', { email, purpose, lang });
      setAlertConfig({
        visible: true,
        title: t.successTitle,
        message: t.otpResentMsg,
        type: 'success'
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || t.otpResentErrorMsg;
      setAlertConfig({ visible: true, title: t.errorTitle, message: errorMsg, type: 'error' });
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setAlertConfig({ visible: true, title: t.invalidOtpLengthTitle, message: t.invalidOtpLengthMsg, type: 'error' });
      return;
    }

    setIsLoading(true);

    if (purpose === 'REGISTER' || purpose === 'GMAIL_LOGIN') {
      try {
        const response = await api.post('/auth/register', {
          email,
          password: password || '',
          fullName: fullName || '',
          otpCode,
        });

        const userEmailVal = response.data?.email || email;
        
        
        await AsyncStorage.setItem('userEmail', userEmailVal);
        
        if (response.data?.fullName) {
          await AsyncStorage.setItem('userFullName', response.data.fullName);
        }

        setIsLoading(false);
        const isScreened = response.data?.screeningCompleted === true;
        
        // Seamless navigation
        if (isScreened) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Screening' }],
          });
        }
      } catch (error) {
        setIsLoading(false);
        const errorMsg = error.response?.data?.message || t.otpInvalidMsg;
        setAlertConfig({ visible: true, title: t.verifyFailedTitle, message: errorMsg, type: 'error' });
      }
    } else {
      // RESET_PASSWORD flow
      try {
        const response = await api.post('/auth/verify-otp', {
          email,
          otpCode,
          purpose: 'RESET_PASSWORD'
        });

        setIsLoading(false);
        if (response.data === true || response.data?.valid === true || response.data?.isValid === true) {
          navigation.navigate('SetPassword', { email, otpCode });
        } else {
          setAlertConfig({ visible: true, title: t.verifyFailedTitle, message: t.otpInvalidMsg, type: 'error' });
        }
      } catch (error) {
        setIsLoading(false);
        const errorMsg = error.response?.data?.message || t.otpInvalidMsg;
        setAlertConfig({ visible: true, title: t.verifyFailedTitle, message: errorMsg, type: 'error' });
      }
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Bar */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t.otpTitle}</Text>
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
              <MaterialIcons name="mark-email-read" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>{t.otpTitle}</Text>
            <Text style={styles.subtitle}>
              {t.otpSentTo}{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          </View>

          {/* OTP Card */}
          <View style={styles.card}>
            <View style={styles.otpGrid}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={[
                    styles.otpInput,
                    digit ? styles.otpInputFilled : null
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  ref={(input) => { inputs.current[index] = input; }}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {/* Timer & Resend */}
            <View style={styles.timerRow}>
              {timer > 0 ? (
                <View style={styles.timerBadge}>
                  <MaterialIcons name="timer" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.timerText}>{t.resendAfter} <Text style={styles.timerCount}>{timer}s</Text></Text>
                </View>
              ) : (
                <TouchableOpacity onPress={handleResend} style={styles.resendBtn} activeOpacity={0.7}>
                  <MaterialIcons name="refresh" size={18} color={COLORS.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.resendText}>{t.resendOtp}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                (!isOtpComplete || isLoading) && styles.primaryButtonDisabled
              ]} 
              onPress={handleVerify}
              activeOpacity={0.8}
              disabled={!isOtpComplete || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    {purpose === 'REGISTER' 
                      ? t.verifyRegisterBtn 
                      : purpose === 'GMAIL_LOGIN' 
                        ? t.verifyLoginBtn 
                        : t.verifyResetPasswordBtn}
                  </Text>
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
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.rose100,
    backgroundColor: COLORS.white,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F2',
  },
  timerRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
  },
  timerCount: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resendText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.smallText + 1,
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

export default OTPScreen;


