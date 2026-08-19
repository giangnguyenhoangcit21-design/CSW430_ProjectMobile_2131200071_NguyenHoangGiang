import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { TabScrollContext } from '../Context/TabScrollContext';
import { LanguageContext } from '../Context/LanguageContext';

const MetricsScreen = () => {
  const navigation = useNavigation();
  const { onScroll } = useContext(TabScrollContext) || {};
  const { t } = useContext(LanguageContext);

  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateRealtimeClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      setCurrentDateTime(`${hours}:${minutes} - ${t.todayLbl} (${day}/${month}/${year})`);
    };

    updateRealtimeClock();
    const timer = setInterval(updateRealtimeClock, 1000); // Realtime 1 second ticker

    return () => clearInterval(timer);
  }, [t.todayLbl]);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        
        {/* Title and Realtime Date/Time */}
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{t.metricsUpdateTitle}</Text>
          <View style={styles.pillInputContainer}>
            <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
            <Text style={styles.pillText}>{currentDateTime || t.loading}</Text>
            <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
          </View>
        </View>

        <Text style={styles.sectionDesc}>
          {t.metricsSelectDesc}
        </Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: COLORS.rose100, backgroundColor: COLORS.rose50 }]}
            onPress={() => navigation.navigate('MetricBP')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.red500 }]}>
              <MaterialIcons name="favorite" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: COLORS.red500 }]}>{t.bpAndHrTitle}</Text>
              <Text style={styles.menuDesc}>{t.bpAndHrDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.red500} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: COLORS.blue100, backgroundColor: COLORS.blue50 }]}
            onPress={() => navigation.navigate('MetricMetabolic')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.blue500 }]}>
              <MaterialIcons name="science" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: COLORS.blue500 }]}>{t.sugarAndFatTitle}</Text>
              <Text style={styles.menuDesc}>{t.sugarAndFatDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.blue500} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: '#FEF3C7', backgroundColor: COLORS.orange50 }]}
            onPress={() => navigation.navigate('MetricSymptom')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.orange500 }]}>
              <MaterialIcons name="sick" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuTitle, { color: COLORS.orange500 }]}>{t.symptomsTitle}</Text>
              <Text style={styles.menuDesc}>{t.symptomsDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.orange500} />
          </TouchableOpacity>
        </View>

      </Animated.ScrollView>
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
  titleRow: {
    marginBottom: SIZES.md,
    gap: 12,
  },
  pageTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  pillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: 30,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    gap: 8,
    ...SHADOWS.soft,
  },
  pillText: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  sectionDesc: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: SIZES.xl,
  },
  menuContainer: {
    gap: 16,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    minHeight: 120,
    ...SHADOWS.soft,
    gap: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  menuContent: {
    flex: 1,
    gap: 4,
  },
  menuTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  menuDesc: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
  }
});

export default MetricsScreen;


