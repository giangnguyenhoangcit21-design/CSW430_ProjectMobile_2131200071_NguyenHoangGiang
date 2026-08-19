import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';
import { LanguageContext } from '../../Context/LanguageContext';

const HomeHeader = () => {
  const navigation = useNavigation();
  const { lang, toggleLanguage, t } = useContext(LanguageContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const doLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AsyncStorage.removeItem('userFullName');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userToken');
    } catch (e) {
      console.log('AsyncStorage clear error:', e);
    }
    
    setShowLogoutModal(false);
    setIsLoggingOut(false);

    setTimeout(() => {
      try {
        const rootNav = navigation.getParent() || navigation;
        rootNav.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      } catch (err) {
        console.log('Navigation reset error:', err);
        navigation.navigate('Login');
      }
    }, 50);
  };

  return (
    <View style={styles.headerWrapper}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="favorite" size={32} color={COLORS.primary} />
          <Text style={styles.appName}>{t.brandName || 'Heart Health'}</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            activeOpacity={0.8}
            onPress={toggleLanguage}
          >
            <Text style={styles.langText}>{lang === 'VN' ? '🇻🇳' : '🇬🇧'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.avatarBtn]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="account-circle" size={24} color={COLORS.blue500} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionBtn, styles.logoutBtn]}
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={24} color={COLORS.rose500} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Logout Overlay Modal */}
      <CustomAlert
        visible={showLogoutModal}
        title={t.logoutTitle || 'Đăng xuất'}
        message={t.logoutMsg || 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?'}
        type="error"
        showCancel={true}
        cancelText={t.cancelBtn || 'Hủy'}
        buttonText={isLoggingOut ? '...' : (t.confirmLogoutBtn || 'Đồng ý')}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={doLogout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.lg,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
    ...SHADOWS.soft,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarBtn: {
    backgroundColor: COLORS.blue100,
    borderColor: 'transparent',
  },
  logoutBtn: {
    backgroundColor: COLORS.rose50,
    borderColor: 'transparent',
  },
  langText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  }
});

export default HomeHeader;


