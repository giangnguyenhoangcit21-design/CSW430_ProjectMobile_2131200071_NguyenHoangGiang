import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import CustomSlider from '../Components/Shared/CustomSlider';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const MetricBPScreen = () => {
  const navigation = useNavigation();
  const { t } = useContext(LanguageContext);
  const [sys, setSys] = useState(120);
  const [dia, setDia] = useState(80);
  const [hr, setHr] = useState(72);
  const [spo2, setSpo2] = useState(98);
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
        await api.post('/health/daily-metrics', {
          email: identifier,
          sysBP: sys,
          diaBP: dia,
          heartRate: hr,
          spo2: spo2
        });
        showAlert(t.successTitle, t.bpSavedMsg, 'success', () => navigation.goBack());
      } else {
        navigation.goBack();
      }
    } catch (error) {
      showAlert(t.errorTitle, t.saveMetricError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSysStatus = (val) => {
    if (val < 90) return { text: t.statusLow, color: '#3B82F6', bg: '#DBEAFE' };
    if (val > 140) return { text: t.statusHigh, color: '#EF4444', bg: '#FEE2E2' };
    return { text: t.statusNormal, color: '#10B981', bg: '#D1FAE5' };
  };
  
  const getDiaStatus = (val) => {
    if (val < 60) return { text: t.statusLow, color: '#3B82F6', bg: '#DBEAFE' };
    if (val > 90) return { text: t.statusHigh, color: '#EF4444', bg: '#FEE2E2' };
    return { text: t.statusNormal, color: '#10B981', bg: '#D1FAE5' };
  };

  const getHrStatus = (val) => {
    if (val < 60) return { text: t.statusLow, color: '#3B82F6', bg: '#DBEAFE' };
    if (val > 100) return { text: t.statusFast, color: '#EF4444', bg: '#FEE2E2' };
    return { text: t.statusNormal, color: '#10B981', bg: '#D1FAE5' };
  };

  const getSpo2Status = (val) => {
    if (val < 90) return { text: t.statusDanger, color: '#EF4444', bg: '#FEE2E2' };
    if (val < 95) return { text: t.statusLow, color: '#F59E0B', bg: '#FEF3C7' };
    return { text: t.statusGood, color: '#10B981', bg: '#D1FAE5' };
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t.bpAndHrTitle}</Text>
        </View>

        <View style={styles.tabContent}>
          {/* Huyết áp */}
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderHeaderLeft}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.red50 }]}>
                  <MaterialIcons name="favorite" size={24} color={COLORS.red500} />
                </View>
                <View>
                  <Text style={styles.sliderLabel}>{t.bpMeasureLbl}</Text>
                  <Text style={styles.sliderUnit}>{t.bpMeasureDesc}</Text>
                </View>
              </View>
            </View>

            <View style={styles.bpResultBox}>
              <Text style={styles.bpResultLabel}>{t.bpResultLbl}</Text>
              <View style={styles.bpResultValueRow}>
                <Text style={[styles.bpResultValue, { color: COLORS.primary }]}>{sys}</Text>
                <Text style={styles.bpResultSlash}>/</Text>
                <Text style={[styles.bpResultValue, { color: COLORS.primary }]}>{dia}</Text>
                <Text style={styles.bpResultUnit}>mmHg</Text>
              </View>
            </View>

            {/* Sys */}
            <View style={styles.bpInnerCard}>
              <View style={styles.bpRowHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1}}>
                  <View style={[styles.bpDot, { backgroundColor: getSysStatus(sys).color }]} />
                  <Text style={styles.bpLabel} adjustsFontSizeToFit numberOfLines={1}>{t.sysLbl}</Text>
                </View>
                <View style={[styles.statusBadgeInline, { backgroundColor: getSysStatus(sys).bg }]}>
                  <Text style={[styles.statusBadgeTextInline, { color: getSysStatus(sys).color }]}>{getSysStatus(sys).text}</Text>
                </View>
              </View>
              <View style={styles.sliderControls}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => setSys(Math.max(80, sys - 1))}>
                  <Text style={[styles.adjustBtnText, { color: COLORS.primary }]}>-</Text>
                </TouchableOpacity>
                <Slider style={{ flex: 1, height: 40 }} minimumValue={80} maximumValue={200} step={1} value={sys} onValueChange={setSys} minimumTrackTintColor={COLORS.primary} maximumTrackTintColor={COLORS.rose100} thumbTintColor={COLORS.primary} />
                <TouchableOpacity style={styles.adjustBtn} onPress={() => setSys(Math.min(200, sys + 1))}>
                  <Text style={[styles.adjustBtnText, { color: COLORS.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dia */}
            <View style={styles.bpInnerCard}>
              <View style={styles.bpRowHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1}}>
                  <View style={[styles.bpDot, { backgroundColor: getDiaStatus(dia).color }]} />
                  <Text style={styles.bpLabel} adjustsFontSizeToFit numberOfLines={1}>{t.diaLbl}</Text>
                </View>
                <View style={[styles.statusBadgeInline, { backgroundColor: getDiaStatus(dia).bg }]}>
                  <Text style={[styles.statusBadgeTextInline, { color: getDiaStatus(dia).color }]}>{getDiaStatus(dia).text}</Text>
                </View>
              </View>
              <View style={styles.sliderControls}>
                <TouchableOpacity style={styles.adjustBtn} onPress={() => setDia(Math.max(50, dia - 1))}>
                  <Text style={[styles.adjustBtnText, { color: COLORS.primary }]}>-</Text>
                </TouchableOpacity>
                <Slider style={{ flex: 1, height: 40 }} minimumValue={50} maximumValue={130} step={1} value={dia} onValueChange={setDia} minimumTrackTintColor={COLORS.primary} maximumTrackTintColor={COLORS.rose100} thumbTintColor={COLORS.primary} />
                <TouchableOpacity style={styles.adjustBtn} onPress={() => setDia(Math.min(130, dia + 1))}>
                  <Text style={[styles.adjustBtnText, { color: COLORS.primary }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* BP Scale Bar */}
            <View style={styles.scaleBarContainer}>
              <View style={styles.scaleBar}>
                <View style={[styles.scaleSegment, { flex: 1, backgroundColor: '#60A5FA', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                <View style={[styles.scaleSegment, { flex: 1.5, backgroundColor: '#10B981' }]} />
                <View style={[styles.scaleSegment, { flex: 1, backgroundColor: '#EF4444', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={[styles.scaleLabel, { color: '#60A5FA', flex: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t.bpLowScale}</Text>
                <Text style={[styles.scaleLabel, { color: '#10B981', flex: 1.5, textAlign: 'center' }]} adjustsFontSizeToFit numberOfLines={1}>{t.bpNormalScale}</Text>
                <Text style={[styles.scaleLabel, { color: '#EF4444', flex: 1, textAlign: 'right' }]} adjustsFontSizeToFit numberOfLines={1}>{t.bpHighScale}</Text>
              </View>
            </View>
          </View>

          <CustomSlider icon="monitor-heart" label={t.hrLbl} unit={t.hrUnit} min={40} max={150} value={hr} setValue={setHr} color={COLORS.orange500} bgColor={COLORS.orange50} status={getHrStatus(hr)}>
            {/* Heart Rate Scale Bar */}
            <View style={[styles.scaleBarContainer, { marginTop: 20 }]}>
              <View style={styles.scaleBar}>
                <View style={[styles.scaleSegment, { flex: 1, backgroundColor: '#60A5FA', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                <View style={[styles.scaleSegment, { flex: 2, backgroundColor: '#10B981' }]} />
                <View style={[styles.scaleSegment, { flex: 1.5, backgroundColor: '#EF4444', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={[styles.scaleLabel, { color: '#60A5FA', flex: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t.hrLowScale}</Text>
                <Text style={[styles.scaleLabel, { color: '#10B981', flex: 2, textAlign: 'center' }]} adjustsFontSizeToFit numberOfLines={1}>{t.hrNormalScale}</Text>
                <Text style={[styles.scaleLabel, { color: '#EF4444', flex: 1.5, textAlign: 'right' }]} adjustsFontSizeToFit numberOfLines={1}>{t.hrFastScale}</Text>
              </View>
            </View>
          </CustomSlider>
          <CustomSlider icon="lungs" iconFamily="FontAwesome5" label={t.spo2Lbl} unit={t.spo2Unit} min={80} max={100} value={spo2} setValue={setSpo2} color="#0891B2" bgColor="#CFFAFE" status={getSpo2Status(spo2)}>
            {/* SpO2 Scale Bar */}
            <View style={[styles.scaleBarContainer, { marginTop: 20 }]}>
              <View style={styles.scaleBar}>
                <View style={[styles.scaleSegment, { flex: 1, backgroundColor: '#EF4444', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />
                <View style={[styles.scaleSegment, { flex: 1, backgroundColor: '#F59E0B' }]} />
                <View style={[styles.scaleSegment, { flex: 1.5, backgroundColor: '#10B981', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />
              </View>
              <View style={styles.scaleLabels}>
                <Text style={[styles.scaleLabel, { color: '#EF4444', flex: 1 }]} adjustsFontSizeToFit numberOfLines={1}>{t.spo2DangerScale}</Text>
                <Text style={[styles.scaleLabel, { color: '#F59E0B', flex: 1, textAlign: 'center' }]} adjustsFontSizeToFit numberOfLines={1}>{t.spo2LowScale}</Text>
                <Text style={[styles.scaleLabel, { color: '#10B981', flex: 1.5, textAlign: 'right' }]} adjustsFontSizeToFit numberOfLines={1}>{t.spo2GoodScale}</Text>
              </View>
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
  sliderCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  sliderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: SIZES.bodyText + 2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    flexShrink: 1,
  },
  sliderUnit: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  bpInnerCard: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    marginBottom: 16,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.rose100,
  },
  adjustBtnText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bpLabel: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  bpResultBox: {
    backgroundColor: COLORS.rose50,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'flex-end',
    marginBottom: SIZES.lg,
    alignSelf: 'stretch',
  },
  bpResultLabel: {
    fontSize: SIZES.smallText - 2,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  bpResultValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bpResultValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  bpResultSlash: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  bpResultUnit: {
    fontSize: SIZES.smallText - 2,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  bpRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
    gap: 8,
  },
  bpDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  statusBadgeInline: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    flexShrink: 0,
  },
  statusBadgeTextInline: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
  },
  scaleBarContainer: {
    marginTop: SIZES.xl,
  },
  scaleBar: {
    flexDirection: 'row',
    height: 8,
    marginBottom: 8,
  },
  scaleSegment: {
    height: '100%',
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scaleLabel: {
    fontSize: 10,
    fontWeight: 'bold',
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

export default MetricBPScreen;


