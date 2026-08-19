import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, ActivityIndicator, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { TabScrollContext } from '../Context/TabScrollContext';
import { LanguageContext } from '../Context/LanguageContext';
import { translateComorbidity, translateGender, translateAssessmentTitle } from '../Constants/LanguageConfig';
import api from '../Services/api';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { onScroll } = useContext(TabScrollContext) || {};
  const { lang, t } = useContext(LanguageContext);

  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Văn A',
    assessmentTitle: 'Bệnh nhân nguy cơ trung bình',
    assessmentColor: '#D97706',
    age: 65,
    gender: 'Nam',
    startDate: '15/07/2026',
    comorbidities: 'Cao huyết áp',
    medications: 'Aspirin, Thuốc mỡ máu',
    avatar: null
  });
  const [loading, setLoading] = useState(true);
  const [showComorbiditiesModal, setShowComorbiditiesModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.get('/health/profile', {
          params: { email: identifier, }
        });
        if (response.data) {
          setProfile(response.data);
        }
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const getInitials = (name) => {
    if (!name) return 'NA';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const medicationList = profile.medications && profile.medications !== 'Chưa có' && profile.medications !== 'No medications' 
    ? profile.medications.split(',').map(m => m.trim()).filter(Boolean)
    : [];

  const comorbidityList = profile.comorbidities && profile.comorbidities !== 'Chưa cập nhật' && profile.comorbidities !== 'Không có' && profile.comorbidities !== 'Not updated' && profile.comorbidities !== 'None'
    ? profile.comorbidities.split(',').map(c => translateComorbidity(c, lang)).filter(Boolean)
    : [];

  const displayComorbiditiesSummary = comorbidityList.length > 0
    ? comorbidityList.join(', ')
    : (profile.comorbidities ? translateComorbidity(profile.comorbidities, lang) : '');

  const isComorbiditiesLong = Boolean(
    profile.isComorbiditiesLong || 
    (comorbidityList.length > 1 || (displayComorbiditiesSummary && displayComorbiditiesSummary.length > 12))
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        
        <View style={styles.header}>
          <Text style={styles.pageTitle}>{t.profileTitle}</Text>
          <Text style={styles.subtitle}>{t.profileSubtitle}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <View style={styles.profileCard}>
            {/* Decorative Background Circle */}
            <View style={styles.decorativeCircle} />

            {/* User Info Row */}
            <View style={styles.userInfoRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarText}>{getInitials(profile.fullName)}</Text>
              </View>
              <View style={styles.userInfoText}>
                <Text style={styles.userName}>{profile.fullName}</Text>
                <View style={[styles.userBadge, profile.assessmentColor ? { backgroundColor: `${profile.assessmentColor}15` } : null]}>
                  <Text style={[styles.userBadgeText, profile.assessmentColor ? { color: profile.assessmentColor } : null]}>
                    {translateAssessmentTitle(profile.assessmentTitle, lang)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              
              <View style={styles.statBox}>
                <MaterialIcons name="cake" size={28} color={COLORS.textLight} />
                <View>
                  <Text style={styles.statLabel}>{t.ageLbl}</Text>
                  <Text style={styles.statValue}>{profile.age}{t.ageUnit}</Text>
                </View>
              </View>

              <View style={styles.statBox}>
                <MaterialIcons name="wc" size={28} color={COLORS.textLight} />
                <View>
                  <Text style={styles.statLabel}>{t.genderLbl}</Text>
                  <Text style={styles.statValue}>{translateGender(profile.gender, lang)}</Text>
                </View>
              </View>

              <View style={styles.statBox}>
                <MaterialIcons name="calendar-month" size={28} color={COLORS.textLight} />
                <View>
                  <Text style={styles.statLabel}>{t.startDateLbl}</Text>
                  <Text style={styles.statValue}>{profile.startDate}</Text>
                </View>
              </View>

              {/* Bệnh nền Card (Tappable only if content is long) */}
              {isComorbiditiesLong ? (
                <TouchableOpacity 
                  style={[styles.statBox]}
                  onPress={() => setShowComorbiditiesModal(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.statHeaderRow}>
                    <MaterialIcons name="medical-information" size={28} color={COLORS.textLight} />
                    <MaterialIcons name="zoom-in" size={18} color={COLORS.textLight} />
                  </View>
                  <View style={{ flex: 1, width: '100%' }}>
                    <Text style={styles.statLabel}>{t.comorbiditiesLbl} <Text style={styles.tapHint}>{t.tapToView}</Text></Text>
                    <Text style={styles.statValue} numberOfLines={1}>{displayComorbiditiesSummary}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.statBox}>
                  <MaterialIcons name="medical-information" size={28} color={COLORS.textLight} />
                  <View>
                    <Text style={styles.statLabel}>{t.comorbiditiesLbl}</Text>
                    <Text style={styles.statValue} numberOfLines={1}>{displayComorbiditiesSummary}</Text>
                  </View>
                </View>
              )}

              <View style={[styles.statBox, styles.statBoxFull]}>
                <MaterialIcons name="medication" size={28} color={COLORS.textLight} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.statLabel}>{t.medsInUse}</Text>
                  <View style={styles.pillContainer}>
                    {medicationList.length > 0 ? (
                      medicationList.map((med, index) => (
                        <View key={index} style={styles.pill}>
                          <Text style={styles.pillText}>{med}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyMedText}>{t.noMeds || (lang === 'EN' ? 'No medications' : 'Chưa có')}</Text>
                    )}
                  </View>
                </View>
              </View>

            </View>

            {/* Edit Button */}
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="edit" size={20} color={COLORS.textMain} />
              <Text style={styles.editBtnText}>{t.editProfileBtn}</Text>
            </TouchableOpacity>

          </View>
        )}

      </Animated.ScrollView>

      {/* Comorbidities Detail Modal (Soft Pink Theme) */}
      <Modal transparent visible={showComorbiditiesModal} animationType="fade" onRequestClose={() => setShowComorbiditiesModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="medical-information" size={26} color={COLORS.primary} />
              <Text style={styles.modalTitle}>{t.comorbidityDetailTitle}</Text>
            </View>

            <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
              {comorbidityList.length > 0 ? (
                comorbidityList.map((item, index) => (
                  <View key={index} style={styles.comorbidityItemRow}>
                    <MaterialIcons name="check-circle" size={20} color={COLORS.primary} />
                    <Text style={styles.comorbidityItemText}>{item}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.comorbidityItemText}>{profile.comorbidities}</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowComorbiditiesModal(false)} activeOpacity={0.8}>
              <Text style={styles.modalCloseText}>{t.closeBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 250,
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
  },
  header: {
    marginBottom: SIZES.xl,
  },
  pageTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    backgroundColor: COLORS.rose50,
    borderRadius: 100,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SIZES.lg,
    marginBottom: SIZES.lg,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.rose100,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  userBadge: {
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  userBadgeText: {
    color: COLORS.primary,
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  statBox: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: 16,
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: SIZES.md,
  },
  statBoxClickable: {
    borderWidth: 1,
    borderColor: COLORS.rose100,
    backgroundColor: COLORS.rose50,
  },
  statHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  tapHint: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statBoxFull: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  statLabel: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  pill: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    ...SHADOWS.soft,
  },
  pillText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyMedText: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingVertical: 16,
    borderRadius: SIZES.radiusLg,
    ...SHADOWS.soft,
  },
  editBtnText: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.rose100,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  comorbidityItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.rose50,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  comorbidityItemText: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textMain,
    flex: 1,
  },
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    marginTop: 16,
    ...SHADOWS.soft,
  },
  modalCloseText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.bodyText,
  }
});

export default ProfileScreen;


