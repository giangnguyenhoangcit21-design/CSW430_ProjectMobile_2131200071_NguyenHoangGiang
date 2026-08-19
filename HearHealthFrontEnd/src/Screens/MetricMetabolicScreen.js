import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import CustomSlider from '../Components/Shared/CustomSlider';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const MetricMetabolicScreen = () => {
  const navigation = useNavigation();
  const { t } = useContext(LanguageContext);
  const [chol, setChol] = useState(180);
  const [gluc, setGluc] = useState(110);
  const [weight, setWeight] = useState(70.5);
  const [cholNotMeasured, setCholNotMeasured] = useState(false);
  const [glucNotMeasured, setGlucNotMeasured] = useState(false);
  const [glucUnit, setGlucUnit] = useState('mg/dL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success', onConfirm: null });

  const showAlert = (title, message, type = 'success', onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const closeAlert = () => {
    const onConfirm = alertConfig.onConfirm;
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (onConfirm) onConfirm();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        let sugarMg = gluc;
        if (glucUnit === 'mmol/L') {
          sugarMg = gluc * 18;
        }

        await api.post('/health/daily-metrics', {
          email: identifier,
          cholesterol: cholNotMeasured ? null : chol,
          bloodSugar: glucNotMeasured ? null : sugarMg,
          weight: weight
        });
        showAlert(t.successTitle, t.metabolicSavedMsg, 'success', () => navigation.goBack());
      } else {
        navigation.goBack();
      }
    } catch (error) {
      showAlert(t.errorTitle, t.saveMetricError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBmiInfo = (w) => {
    const h = 1.65; // Mặc định chiều cao 1.65m
    const bmi = (w / (h * h)).toFixed(1);
    let text = t.statusNormal;
    if (bmi < 18.5) text = t.underweight;
    else if (bmi < 25) text = t.statusNormal;
    else if (bmi < 30) text = t.overweight;
    else text = t.obese;
    return { val: bmi, text };
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t.sugarAndFatTitle}</Text>
        </View>

        <View style={styles.tabContent}>
          <CustomSlider icon="water-drop" label={t.cholesterolLbl} unit={t.bloodTestUnit} min={100} max={350} step={5} value={chol} setValue={setChol} color={COLORS.purple500} bgColor={COLORS.purple50}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setCholNotMeasured(!cholNotMeasured)}>
              <View style={[styles.checkboxSquare, cholNotMeasured && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                {cholNotMeasured && <MaterialIcons name="check" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxLabel}>{t.cholNotMeasured}</Text>
            </TouchableOpacity>
          </CustomSlider>
          
          <CustomSlider icon="water-drop" label={t.bloodSugarTitleLbl} 
            unit={
              <View style={{flexDirection: 'row', gap: 8, marginTop: 4}}>
                <TouchableOpacity onPress={() => setGlucUnit('mg/dL')} style={[styles.unitBadge, glucUnit === 'mg/dL' && styles.unitBadgeActive]}>
                  <Text style={[styles.unitBadgeText, glucUnit === 'mg/dL' && styles.unitBadgeTextActive]}>mg/dL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setGlucUnit('mmol/L')} style={[styles.unitBadge, glucUnit === 'mmol/L' && styles.unitBadgeActive]}>
                  <Text style={[styles.unitBadgeText, glucUnit === 'mmol/L' && styles.unitBadgeTextActive]}>mmol/L</Text>
                </TouchableOpacity>
              </View>
            }
            min={glucUnit === 'mg/dL' ? 70 : 3.9} max={glucUnit === 'mg/dL' ? 200 : 11.1} step={glucUnit === 'mg/dL' ? 1 : 0.1} value={gluc} setValue={setGluc} color={COLORS.orange500} bgColor={COLORS.orange50}
          >
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setGlucNotMeasured(!glucNotMeasured)}>
              <View style={[styles.checkboxSquare, glucNotMeasured && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                {glucNotMeasured && <MaterialIcons name="check" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxLabel}>{t.sugarNotMeasured}</Text>
            </TouchableOpacity>
          </CustomSlider>
          
          <CustomSlider icon="monitor-weight" label={t.weightLbl} unit={t.bmiAutoEstimate} min={30} max={150} step={1} value={weight} setValue={setWeight} color={COLORS.blue500} bgColor={COLORS.blue50}>
            <View style={styles.bmiContainer}>
              <MaterialIcons name="info" size={16} color={COLORS.blue700} />
              <Text style={styles.bmiLabel}>{t.bmiHiddenLabel}</Text>
              <Text style={styles.bmiValue}>{t.bmiPrefix} {getBmiInfo(weight).val} ({getBmiInfo(weight).text})</Text>
            </View>
          </CustomSlider>
          
          <TouchableOpacity 
            style={[styles.submitBtnLarge, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Text style={styles.submitBtnLargeText}>{t.saveMetricsBtn}</Text>
                <MaterialIcons name="check-circle" size={24} color={COLORS.white} />
              </>
            )}
          </TouchableOpacity>
        </View>

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xl,
    gap: 16,
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  pageTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  tabContent: {
    gap: SIZES.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: SIZES.radiusLg,
    marginTop: 16,
    gap: 12,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxLabel: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  unitBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  unitBadgeActive: {
    backgroundColor: COLORS.orange500,
  },
  unitBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textMuted,
  },
  unitBadgeTextActive: {
    color: COLORS.white,
  },
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: SIZES.radiusLg,
    marginTop: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  bmiLabel: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.blue700,
  },
  bmiValue: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.blue700,
    flexShrink: 1,
  },
  submitBtnLarge: {
    backgroundColor: '#D9778A',
    padding: 16,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  submitBtnLargeText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  }
});

export default MetricMetabolicScreen;


