import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import CustomAlert from '../Components/Shared/CustomAlert';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import api from '../Services/api';

const ScheduleDoctorScreen = () => {
  const navigation = useNavigation();
  const { t } = useContext(LanguageContext);

  const [doctorName, setDoctorName] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [location, setLocation] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'success', onConfirm: null });

  // Date & Time Picker Modal States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const showAlert = (title, message, type = 'success', onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const closeAlert = () => {
    const onConfirm = alertConfig.onConfirm;
    setAlertConfig(prev => ({ ...prev, visible: false }));
    if (onConfirm) onConfirm();
  };

  const fetchReminders = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.get('/goals/reminders', {
          params: { email: identifier, }
        });
        if (response.data?.doctorAppointments) {
          const list = response.data.doctorAppointments.map(a => ({
            id: a.id,
            doctor: a.doctorName,
            type: a.appointmentType,
            date: a.appointmentDate,
            time: a.appointmentTime,
            location: a.location,
            isOverdue: Boolean(a.isOverdue)
          }));
          setAppointments(list);
        }
      }
    } catch (error) {
      console.log('Error fetching appointments:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  const handleAddAppointment = async () => {
    if (!doctorName || !appointmentDate) {
      showAlert(t.errorTitle, t.doctorRequiredError, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        await api.post('/schedules/doctor', {
          email: identifier,
          doctorName,
          appointmentType,
          appointmentDate,
          appointmentTime,
          location
        });

        // Immediately refresh list
        await fetchReminders();

        showAlert(t.successTitle, t.appointmentSaved, 'success', () => {
          setDoctorName('');
          setAppointmentType('');
          setAppointmentDate('');
          setAppointmentTime('');
          setLocation('');
        });
      }
    } catch (error) {
      showAlert(t.errorTitle, t.appointmentSaveError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDate = () => {
    const d = selectedDay < 10 ? `0${selectedDay}` : selectedDay;
    const m = selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth;
    setAppointmentDate(`${d}/${m}/${selectedYear}`);
    setShowDatePicker(false);
  };

  const confirmTime = () => {
    const h = selectedHour < 10 ? `0${selectedHour}` : selectedHour;
    const min = selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute;
    setAppointmentTime(`${h}:${min}`);
    setShowTimePicker(false);
  };

  const selectQuickDate = (offsetDays) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    setSelectedDay(target.getDate());
    setSelectedMonth(target.getMonth() + 1);
    setSelectedYear(target.getFullYear());
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title and Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t.scheduleDoctorPageTitle}</Text>
        </View>

        {/* Add Appointment Form */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="event" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{t.addAppointmentTitle}</Text>
          </View>
          <Text style={styles.cardDesc}>{t.addAppointmentDesc}</Text>
          
          <View style={styles.formGrid}>
            {/* Tên Bác sĩ (Không placeholder) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.doctorNameLbl}</Text>
              <TextInput 
                style={styles.textInputBase} 
                value={doctorName}
                onChangeText={setDoctorName}
              />
            </View>

            {/* Loại khám (Không placeholder) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.appointmentTypeLbl}</Text>
              <TextInput 
                style={styles.textInputBase} 
                value={appointmentType}
                onChangeText={setAppointmentType}
              />
            </View>
            
            {/* Ngày khám & Giờ khám Pickers */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t.appointmentDateLbl}</Text>
                <TouchableOpacity 
                  style={styles.pickerBox} 
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="calendar-today" size={18} color={COLORS.primary} />
                  <Text style={[styles.pickerText, !appointmentDate && { color: COLORS.textLight }]}>
                    {appointmentDate || t.selectDateLbl}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>{t.appointmentTimeLbl}</Text>
                <TouchableOpacity 
                  style={styles.pickerBox} 
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                  <Text style={[styles.pickerText, !appointmentTime && { color: COLORS.textLight }]}>
                    {appointmentTime || t.selectTimeLbl}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Địa điểm */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.locationLbl}</Text>
              <TextInput 
                style={styles.textInputBase} 
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.addBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleAddAppointment}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <MaterialIcons name="add" size={20} color={COLORS.white} />
                <Text style={styles.addBtnText}>{t.saveAppointmentBtn}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{t.appointmentListTitle}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{appointments.length}</Text>
          </View>
        </View>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="event-available" size={48} color={COLORS.rose300 || COLORS.primary} />
            <Text style={styles.emptyTitle}>{t.noAppointmentTitle}</Text>
            <Text style={styles.emptySub}>{t.noAppointmentDesc}</Text>
          </View>
        ) : (
          appointments.map((apt) => {
            const dateParts = apt.date ? apt.date.split('/') : ['--', '--', '--'];
            const dayText = dateParts[0] || '--';
            const monthText = dateParts.length > 1 ? `${t.monthTag}${dateParts[1]}` : t.aptTag;
            
            return (
              <View key={apt.id} style={[styles.aptCard, apt.isOverdue && styles.aptCardOverdue]}>
                {/* Date Box */}
                <View style={[styles.aptDateBox, apt.isOverdue && styles.aptDateBoxOverdue]}>
                  <Text style={[styles.aptDateText, apt.isOverdue && styles.aptDateTextOverdue]}>{dayText}</Text>
                  <Text style={[styles.aptMonthText, apt.isOverdue && styles.aptMonthTextOverdue]}>{monthText}</Text>
                </View>

                {/* Content */}
                <View style={styles.aptContent}>
                  <View style={styles.aptTopRow}>
                    <Text style={styles.aptDoctor}>{apt.doctor || t.noDoctorName}</Text>
                    {apt.isOverdue ? (
                      <View style={styles.overdueBadgeTag}>
                        <Text style={styles.overdueBadgeTagText}>{t.overdueTag}</Text>
                      </View>
                    ) : (
                      <View style={styles.upcomingBadgeTag}>
                        <Text style={styles.upcomingBadgeTagText}>{t.upcomingTag}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.aptType}>{apt.type || t.regularCheckupDefault}</Text>
                  
                  <View style={styles.aptRow}>
                    <MaterialIcons name="access-time" size={16} color={COLORS.primary} />
                    <Text style={styles.aptRowText}>{apt.time || t.noTimeSet}</Text>
                  </View>

                  {apt.location ? (
                    <View style={styles.aptRow}>
                      <MaterialIcons name="location-on" size={16} color={COLORS.textMuted} />
                      <Text style={styles.aptRowText}>{apt.location}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}

      </ScrollView>

      {/* Date Picker Modal (Soft Pink Theme) */}
      <Modal transparent visible={showDatePicker} animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="date-range" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>{t.chooseDateTitle}</Text>
            </View>

            {/* Quick Date Chips */}
            <View style={styles.quickDateRow}>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => selectQuickDate(0)}>
                <Text style={styles.quickDateText}>{t.todayChip}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => selectQuickDate(1)}>
                <Text style={styles.quickDateText}>{t.tomorrowChip}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickDateChip} onPress={() => selectQuickDate(7)}>
                <Text style={styles.quickDateText}>{t.nextWeekChip}</Text>
              </TouchableOpacity>
            </View>

            {/* Date Stepper */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>{t.dayStepper}</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedDay(Math.max(1, selectedDay - 1))}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{selectedDay < 10 ? `0${selectedDay}` : selectedDay}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedDay(Math.min(31, selectedDay + 1))}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>{t.monthStepper}</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedMonth(Math.max(1, selectedMonth - 1))}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{selectedMonth < 10 ? `0${selectedMonth}` : selectedMonth}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedMonth(Math.min(12, selectedMonth + 1))}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>{t.yearStepper}</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedYear(selectedYear - 1)}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{selectedYear}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedYear(selectedYear + 1)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmDate}>
              <Text style={styles.modalConfirmText}>{t.confirmDateBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal (Soft Pink Theme) */}
      <Modal transparent visible={showTimePicker} animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="access-time" size={24} color={COLORS.primary} />
              <Text style={styles.modalTitle}>{t.chooseTimeTitle}</Text>
            </View>

            {/* Quick Time Slots */}
            <View style={styles.quickDateRow}>
              {['08:00', '09:00', '10:00', '14:00', '16:00', '19:00'].map(t => (
                <TouchableOpacity 
                  key={t} 
                  style={styles.quickDateChip} 
                  onPress={() => {
                    const parts = t.split(':');
                    setSelectedHour(parseInt(parts[0]));
                    setSelectedMinute(parseInt(parts[1]));
                  }}
                >
                  <Text style={styles.quickDateText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Hour & Minute Stepper */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>{t.hourStepper}</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedHour((selectedHour - 1 + 24) % 24)}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{selectedHour < 10 ? `0${selectedHour}` : selectedHour}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedHour((selectedHour + 1) % 24)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.stepperBox}>
                <Text style={styles.stepperLabel}>{t.minuteStepper}</Text>
                <View style={styles.stepperControls}>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedMinute((selectedMinute - 15 + 60) % 60)}>
                    <Text style={styles.stepBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}</Text>
                  <TouchableOpacity style={styles.stepBtn} onPress={() => setSelectedMinute((selectedMinute + 15) % 60)}>
                    <Text style={styles.stepBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmTime}>
              <Text style={styles.modalConfirmText}>{t.confirmTimeBtn}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xl,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
  },
  pageTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    marginBottom: 24,
    ...SHADOWS.soft,
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
    color: COLORS.textMuted,
    marginBottom: 16,
    lineHeight: 20,
  },
  formGrid: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: SIZES.smallText,
    color: COLORS.textMain,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  textInputBase: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: SIZES.bodyText,
    color: COLORS.textMain,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  pickerText: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMain,
    fontWeight: 'bold',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: SIZES.radiusLg,
    gap: 8,
    ...SHADOWS.soft,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.bodyText + 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  countBadge: {
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  countBadgeText: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
  },
  emptyTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  aptCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    marginBottom: 12,
    ...SHADOWS.soft,
  },
  aptCardOverdue: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  aptDateBox: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.rose50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  aptDateBoxOverdue: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  aptDateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  aptDateTextOverdue: {
    color: '#EF4444',
  },
  aptMonthText: {
    fontSize: 9,
    color: COLORS.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  aptMonthTextOverdue: {
    color: '#EF4444',
  },
  aptContent: {
    flex: 1,
  },
  aptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
    gap: 8,
  },
  aptDoctor: {
    fontSize: SIZES.bodyText + 1,
    fontWeight: 'bold',
    color: COLORS.textMain,
    flex: 1,
  },
  upcomingBadgeTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  upcomingBadgeTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065F46',
  },
  overdueBadgeTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  overdueBadgeTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  aptType: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontWeight: '500',
  },
  aptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  aptRowText: {
    fontSize: SIZES.smallText,
    color: COLORS.textMain,
    fontWeight: '500',
  },

  // Modal Pickers Styles (Soft Pink Theme)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  quickDateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickDateChip: {
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  quickDateText: {
    fontSize: SIZES.smallText,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    gap: 12,
  },
  stepperBox: {
    alignItems: 'center',
    flex: 1,
  },
  stepperLabel: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    padding: 4,
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepperVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
    minWidth: 28,
    textAlign: 'center',
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    ...SHADOWS.soft,
  },
  modalConfirmText: {
    color: COLORS.white,
    fontSize: SIZES.bodyText + 1,
    fontWeight: 'bold',
  }
});

export default ScheduleDoctorScreen;


