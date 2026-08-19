import React, { useState, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';
import { LanguageContext } from '../../Context/LanguageContext';
import api from '../../Services/api';

const Reminders = () => {
  const navigation = useNavigation();
  const { t } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('goals');
  const [reminders, setReminders] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReminders = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.get('/goals/reminders', {
          params: { email: identifier, }
        });
        setReminders(response.data);
      }
    } catch (error) {
      console.log('Error fetching reminders:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  const handleToggleMed = async (id) => {
    try {
      await api.post(`/schedules/medication/toggle?id=${id}`);
      fetchReminders();
    } catch (error) {
      console.log('Error toggling medication:', error);
    }
  };

  const bpTarget = reminders?.bpTarget || "--/--";
  const sysDiaParts = bpTarget.split('/');
  const bpSys = sysDiaParts[0] || "--";
  const bpDia = sysDiaParts.length > 1 ? "/" + sysDiaParts[1] : "";

  return (
    <View style={styles.container}>
      
      {/* Tab Control */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'goals' && styles.tabButtonActive]}
          onPress={() => setActiveTab('goals')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'goals' && styles.tabTextActive]}>{t.tabHealthGoals}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'schedule' && styles.tabButtonActive]}
          onPress={() => setActiveTab('schedule')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.tabTextActive]}>{t.tabTodaySchedule}</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content: Goals */}
      {activeTab === 'goals' && (
        <View style={styles.cardsWrapper}>
          {/* Mục tiêu Huyết áp */}
          <View style={styles.card}>
            <View style={styles.headerRowBetween}>
              <View style={[styles.headerRow, { marginBottom: 0 }]}>
                <MaterialIcons name="favorite" size={28} color={COLORS.primary} />
                <Text style={styles.title}>{t.bpGoalTitle}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionBox}
                onPress={() => navigation.navigate('GoalBP')}
              >
                <Text style={styles.actionText}>{t.updateBtn}</Text>
              </TouchableOpacity>
            </View>

            {reminders?.isBpGoalOverdue && (
              <View style={styles.overdueBadge}>
                <MaterialIcons name="warning" size={14} color="#EF4444" />
                <Text style={styles.overdueText}>{t.overdueWeekMsg}</Text>
              </View>
            )}

            <View style={styles.appointmentBox}>
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>{bpSys}</Text>
                <Text style={styles.dateMonth}>{bpDia}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoTitle}>{t.thisWeekGoal}</Text>
                <Text style={styles.infoDoctor}>{t.exerciseLbl}: {reminders?.activeMins || 30} {t.minsPerDay}</Text>
                <Text style={styles.infoTime}>{reminders?.bpWeekRange || t.noWeekSelected}</Text>
              </View>
            </View>
          </View>

          {/* Mục tiêu Dinh dưỡng */}
          <View style={styles.card}>
            <View style={styles.headerRowBetween}>
              <View style={[styles.headerRow, { marginBottom: 0 }]}>
                <MaterialIcons name="restaurant" size={28} color={COLORS.orange500} />
                <Text style={styles.title}>{t.nutritionGoalTitle}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionBox}
                onPress={() => navigation.navigate('GoalNutrition')}
              >
                <Text style={styles.actionText}>{t.updateBtn}</Text>
              </TouchableOpacity>
            </View>

            {reminders?.isNutritionGoalOverdue && (
              <View style={styles.overdueBadge}>
                <MaterialIcons name="warning" size={14} color="#EF4444" />
                <Text style={styles.overdueText}>{t.overdueWeekMsg}</Text>
              </View>
            )}

            <View style={styles.appointmentBox}>
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>{reminders?.weightTarget || "--"}</Text>
                <Text style={styles.dateMonth}>kg</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoTitle}>{t.weightGoalTitle}</Text>
                <Text style={styles.infoDoctor}>{t.bloodSugarLbl}: {reminders?.sugarTarget || "--"}</Text>
                <Text style={styles.infoTime}>{t.bloodFatLbl}: {reminders?.fatTarget || "--"}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Tab Content: Schedule */}
      {activeTab === 'schedule' && (
        <View style={styles.cardsWrapper}>
          {/* Lịch Hẹn Component */}
          <View style={styles.card}>
            <View style={styles.headerRowBetween}>
              <View style={[styles.headerRow, { marginBottom: 0 }]}>
                <MaterialIcons name="calendar-month" size={28} color={COLORS.primary} />
                <Text style={styles.title}>{t.upcomingAppt}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionBox}
                onPress={() => navigation.navigate('ScheduleDoctor')}
              >
                <Text style={styles.actionText}>{t.detailsBtn}</Text>
              </TouchableOpacity>
            </View>

            {reminders?.isDoctorApptOverdue && (
              <View style={styles.overdueBadge}>
                <MaterialIcons name="warning" size={14} color="#EF4444" />
                <Text style={styles.overdueText}>{t.overdueApptMsg}</Text>
              </View>
            )}

            <View style={styles.appointmentBox}>
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>{reminders?.appointmentDate ? reminders.appointmentDate.split('/')[0] : "15"}</Text>
                <Text style={styles.dateMonth}>{reminders?.appointmentDate ? t.monthLbl + " " + reminders.appointmentDate.split('/')[1] : t.monthLbl + " 10"}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoTitle}>{reminders?.appointmentType || t.regularCheckup}</Text>
                <Text style={styles.infoDoctor}>{reminders?.doctorName || t.noDoctorName}</Text>
                <Text style={styles.infoTime}>{reminders?.appointmentTime || t.noTimeSet} - {reminders?.appointmentLocation || t.clinicLbl}</Text>
              </View>
            </View>
          </View>

          {/* Thuốc Component */}
          <View style={styles.card}>
            <View style={styles.headerRowBetween}>
              <View style={[styles.headerRow, { marginBottom: 0 }]}>
                <MaterialIcons name="medication" size={28} color={COLORS.coral} />
                <Text style={styles.title}>{t.medicationTitle}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionBox}
                onPress={() => navigation.navigate('ScheduleMedication')}
              >
                <Text style={styles.actionText}>{t.detailsBtn}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.pillList}>
              {(!reminders?.medications || reminders.medications.length === 0) ? (
                <Text style={{ color: COLORS.textMuted, fontStyle: 'italic', textAlign: 'center', marginVertical: 8 }}>
                  {t.noMedSchedule}
                </Text>
              ) : (
                reminders.medications.map(med => (
                  <View key={med.id} style={[styles.pillItemPending, med.taken && styles.pillDone]}>
                    <View style={{ flex: 1 }}>
                      <Text style={med.taken ? styles.pillTitleDone : styles.pillTitle}>{med.name}</Text>
                      <Text style={med.taken ? styles.pillTimeDone : styles.pillTime}>
                        {med.timeOfDay || t.dailyLbl} - {med.description || (med.taken ? t.takenLbl : t.notTakenLbl)}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.checkBtn, med.taken && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}
                      onPress={() => handleToggleMed(med.id)}
                    >
                      <MaterialIcons 
                        name={med.taken ? "check" : "radio-button-unchecked"} 
                        size={24} 
                        color={med.taken ? COLORS.white : COLORS.textLight} 
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.rose50,
    borderRadius: SIZES.radiusLg,
    padding: 4,
    marginBottom: SIZES.lg,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd - 2,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.soft,
  },
  tabText: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  cardsWrapper: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 12,
  },
  headerRowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    flexShrink: 1,
  },
  actionBox: {
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.smallText,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  overdueText: {
    color: '#EF4444',
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
  },
  appointmentBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  dateCol: {
    alignItems: 'center',
    paddingRight: SIZES.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.rose100,
    minWidth: 60,
  },
  dateDay: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  dateMonth: {
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  infoCol: {
    paddingLeft: SIZES.md,
    flex: 1,
  },
  infoTitle: {
    fontSize: SIZES.bodyText + 2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  infoDoctor: {
    color: COLORS.textMuted,
  },
  infoTime: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  pillList: {
    gap: 12,
  },
  pillDone: {
    opacity: 0.6,
  },
  pillTitleDone: {
    fontSize: SIZES.bodyText + 2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textDecorationLine: 'line-through',
  },
  pillTimeDone: {
    color: COLORS.textMuted,
  },
  pillItemPending: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    padding: SIZES.md,
    borderRadius: SIZES.radiusLg,
    ...SHADOWS.soft,
  },
  pillTitle: {
    fontSize: SIZES.bodyText + 2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  pillTime: {
    color: COLORS.textMuted,
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
  }
});

export default Reminders;


