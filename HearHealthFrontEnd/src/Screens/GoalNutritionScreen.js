import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  return `${format(monday)} - ${format(sunday)}`;
};

const GoalNutritionScreen = () => {
  const navigation = useNavigation();
  const { t } = useContext(LanguageContext);
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange());
  const [fatTarget, setFatTarget] = useState('');
  const [sugarTarget, setSugarTarget] = useState('');
  const [weightTarget, setWeightTarget] = useState('');
  const [metaLevel, setMetaLevel] = useState(1);
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

  const fetchGoals = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.get('/goals/reminders', {
          params: { email: identifier, }
        });
        if (response.data) {
          if (response.data.goalCholesterol) setFatTarget(response.data.goalCholesterol);
          if (response.data.goalFastingBloodSugar) setSugarTarget(response.data.goalFastingBloodSugar);
          if (response.data.goalWeight) setWeightTarget(String(response.data.goalWeight));
        }
      }
    } catch (error) {
      console.log('Error fetching Nutrition goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setWeekRange(getCurrentWeekRange());
      fetchGoals();
    }, [])
  );

  const handleSave = async () => {
    if (!fatTarget && !sugarTarget && !weightTarget) {
      showAlert(t.errorTitle, t.nutritionInputRequired, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        await api.post('/goals/nutrition', {
          email: identifier,
          weekRange,
          fatTarget,
          sugarTarget,
          weightTarget: weightTarget ? parseFloat(weightTarget) : null
        });
        showAlert(t.successTitle, t.nutritionGoalSaved, 'success', () => navigation.goBack());
      }
    } catch (error) {
      showAlert(t.errorTitle, t.genericErrorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (fatTarget || sugarTarget) {
      setMetaLevel(2); 
    } else if (weightTarget) {
      setMetaLevel(1); 
    } else {
      setMetaLevel(0); 
    }
  }, [fatTarget, sugarTarget, weightTarget]);

  const getMetaRecommendationText = () => {
    const goals = [];
    if (fatTarget) goals.push(t.nutriFocusBloodFat);
    if (sugarTarget) goals.push(t.nutriFocusBloodSugar);
    if (weightTarget) goals.push(t.nutriFocusWeight);
    
    const focus = goals.length > 0 ? goals.join(', ') : t.nutriFocusGeneral;

    if (metaLevel === 0) return t.nutriRecoMaintain.replace('{focus}', focus);
    if (metaLevel === 1) return t.nutriRecoDash.replace('{focus}', focus);
    return t.nutriRecoStrict.replace('{focus}', focus);
  };

  const metaTherapies = [
    { title: t.nutriTherapyMaintainTitle, text: t.nutriTherapyMaintainDesc, icon: 'local-dining', color: '#10B981', bg: '#D1FAE5' },
    { title: t.nutriTherapyDashTitle, text: t.nutriTherapyDashDesc, icon: 'restaurant-menu', color: '#3B82F6', bg: '#DBEAFE' },
    { title: t.nutriTherapyStrictTitle, text: t.nutriTherapyStrictDesc, icon: 'health-and-safety', color: '#EF4444', bg: '#FEE2E2' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t.goalNutritionPageTitle}</Text>
        </View>

        <View style={styles.datePickerContainer}>
          <MaterialIcons name="date-range" size={24} color={COLORS.primary} />
          <Text style={styles.dateLabel}>{t.weekSetupLbl}</Text>
          <TextInput 
            style={styles.dateInput} 
            value={weekRange}
            onChangeText={setWeekRange}
            placeholder="DD/MM - DD/MM"
          />
          <MaterialIcons name="edit" size={18} color={COLORS.textLight} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="water-drop" size={24} color={COLORS.orange500} />
                <Text style={styles.cardTitle}>{t.bloodSugarFatTitle}</Text>
              </View>
              <Text style={styles.cardDesc}>{t.bloodSugarFatDesc}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.fatInputLbl}</Text>
                <TextInput 
                  style={styles.textInputBase}
                  placeholder="< 200"
                  placeholderTextColor={COLORS.textLight}
                  value={fatTarget}
                  onChangeText={setFatTarget}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t.sugarInputLbl}</Text>
                <TextInput 
                  style={styles.textInputBase}
                  placeholder="90 - 130"
                  placeholderTextColor={COLORS.textLight}
                  value={sugarTarget}
                  onChangeText={setSugarTarget}
                />
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="monitor-weight" size={24} color={COLORS.blue500} />
                <Text style={styles.cardTitle}>{t.weightGoalCardTitle}</Text>
              </View>
              <Text style={styles.cardDesc}>{t.weightGoalDesc}</Text>
              <View style={styles.inputRow}>
                <TextInput 
                  style={styles.numberInputLg}
                  keyboardType="numeric"
                  placeholder="0.0"
                  placeholderTextColor={COLORS.textLight}
                  value={weightTarget}
                  onChangeText={setWeightTarget}
                />
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>

            {(fatTarget || sugarTarget || weightTarget) ? (
              <View style={[styles.card, { backgroundColor: COLORS.orange50, borderColor: COLORS.orange100 }]}>
                <View style={styles.cardHeader}>
                  <MaterialIcons name="restaurant" size={24} color={COLORS.orange600} />
                  <Text style={styles.cardTitle}>{t.dietRecoTitle}</Text>
                </View>
                <Text style={styles.recoText}>{getMetaRecommendationText()}</Text>
                
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 12, color: COLORS.textMain }}>{t.nutritionTherapiesTitle}</Text>
                  {metaTherapies.map((therapy, idx) => (
                    <View key={idx} style={[styles.therapyCard, { backgroundColor: therapy.bg }]}>
                      <View style={[styles.therapyIconWrap, { backgroundColor: therapy.color }]}>
                        <MaterialIcons name={therapy.icon} size={20} color={COLORS.white} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.therapyTitle, { color: therapy.color }]}>{therapy.title}</Text>
                        <Text style={styles.therapyText}>{therapy.text}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <TouchableOpacity 
              style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]} 
              onPress={handleSave}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.saveBtnText}>{t.saveNutritionGoalBtn}</Text>
              )}
            </TouchableOpacity>
          </>
        )}

      </ScrollView>

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
    padding: SIZES.md,
    paddingBottom: 80,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xl,
    gap: 12,
  },
  backBtn: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    ...SHADOWS.soft,
  },
  pageTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    marginBottom: SIZES.lg,
    gap: 8,
  },
  dateLabel: {
    fontSize: SIZES.body3,
    color: COLORS.textMain,
    fontWeight: '600',
  },
  dateInput: {
    flex: 1,
    fontSize: SIZES.body3,
    color: COLORS.orange500,
    fontWeight: 'bold',
    padding: 0,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  cardDesc: {
    fontSize: SIZES.smallText,
    color: COLORS.textLight,
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: SIZES.smallText,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  textInputBase: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: SIZES.body3,
    color: COLORS.textMain,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  numberInputLg: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.blue500,
    minWidth: 120,
    textAlign: 'center',
  },
  unitText: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  recoText: {
    fontSize: SIZES.body3,
    color: COLORS.orange600,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  therapyCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  therapyIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  therapyTitle: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  therapyText: {
    fontSize: 12,
    color: COLORS.textMain,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOWS.medium,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  }
});

export default GoalNutritionScreen;


