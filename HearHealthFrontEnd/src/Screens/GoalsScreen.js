import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Animated } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import { TabScrollContext } from '../Context/TabScrollContext';

const GoalsScreen = () => {
  const navigation = useNavigation();
  const { onScroll } = useContext(TabScrollContext) || {};
  const { t } = useContext(LanguageContext);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>{t.goalsPageTitle}</Text>
        </View>

        <Text style={styles.sectionDesc}>
          {t.goalsPageDesc}
        </Text>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: COLORS.blue100, backgroundColor: COLORS.blue50 }]}
            onPress={() => navigation.navigate('GoalBP')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.blue500 }]}>
              <MaterialIcons name="favorite" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: COLORS.blue500 }]}>{t.goalBPTitle}</Text>
              <Text style={styles.menuCardDesc}>{t.goalBPDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.blue500} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: COLORS.orange100, backgroundColor: COLORS.orange50 }]}
            onPress={() => navigation.navigate('GoalNutrition')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.orange500 }]}>
              <MaterialIcons name="restaurant-menu" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: COLORS.orange500 }]}>{t.goalNutritionTitle}</Text>
              <Text style={styles.menuCardDesc}>{t.goalNutritionDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.orange500} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: COLORS.emerald100, backgroundColor: COLORS.emerald50 }]}
            onPress={() => navigation.navigate('ScheduleDoctor')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.emerald500 }]}>
              <MaterialIcons name="event" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: COLORS.emerald500 }]}>{t.scheduleDoctorTitle}</Text>
              <Text style={styles.menuCardDesc}>{t.scheduleDoctorDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.emerald500} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuCard, { borderColor: COLORS.purple100, backgroundColor: COLORS.purple50 }]}
            onPress={() => navigation.navigate('ScheduleMedication')}
          >
            <View style={[styles.iconBox, { backgroundColor: COLORS.purple500 }]}>
              <MaterialIcons name="medication" size={28} color={COLORS.white} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: COLORS.purple500 }]}>{t.scheduleMedicationTitle}</Text>
              <Text style={styles.menuCardDesc}>{t.scheduleMedicationDesc}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.purple500} />
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
  sectionDesc: {
    fontSize: SIZES.body3,
    color: COLORS.textLight,
    marginBottom: SIZES.xl,
    lineHeight: 24,
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
  menuCardContent: {
    flex: 1,
    gap: 4,
  },
  menuCardTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  menuCardDesc: {
    fontSize: SIZES.smallText,
    color: COLORS.textLight,
  }
});

export default GoalsScreen;


