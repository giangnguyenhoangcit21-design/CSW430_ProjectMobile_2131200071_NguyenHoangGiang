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

const TimelineItem = ({ icon, timeText, bgIconColor, textColor, borderColor, meds, onToggle }) => {
  return (
    <View style={styles.timelineItem}>
      {/* Icon Node */}
      <View style={[styles.timelineNode, { backgroundColor: bgIconColor, borderColor: COLORS.white }]}>
        <MaterialIcons name={icon} size={20} color={textColor} />
      </View>
      
      {/* Content Box */}
      <View style={[styles.timelineBox, { backgroundColor: COLORS.white, borderColor }]}>
        <Text style={[styles.timelineTimeText, { color: textColor }]}>{timeText}</Text>
        
        {meds.map((med, index) => (
          <View key={med.id || index} style={[styles.medCard, med.taken && styles.medCardTaken]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.medName, med.taken && styles.medNameTaken]}>{med.name}</Text>
              <Text style={styles.medDesc}>{med.desc}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkBtn, med.taken && styles.checkBtnTaken]}
              onPress={() => onToggle && onToggle(med.id)}
              activeOpacity={0.8}
            >
              <MaterialIcons name={med.taken ? "check" : "radio-button-unchecked"} size={22} color={med.taken ? COLORS.white : COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const ScheduleMedicationScreen = () => {
  const navigation = useNavigation();
  const { lang, t } = useContext(LanguageContext);

  const [meds, setMeds] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDesc, setNewMedDesc] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
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

  const fetchReminders = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.get('/goals/reminders', {
          params: { email: identifier, }
        });
        if (response.data?.medications) {
          const formatted = response.data.medications.map(m => ({
            id: m.id,
            name: m.name,
            desc: m.description || (m.taken ? t.takenStatus : t.notTakenStatus),
            time: m.timeOfDay || t.morning,
            taken: Boolean(m.taken)
          }));
          setMeds(formatted);
        }
      }
    } catch (error) {
      console.log('Error fetching medications:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [lang])
  );

  useEffect(() => {
    fetchReminders();
  }, [lang]);

  const handleAddMed = async () => {
    if (newMedName.trim() === '') {
      showAlert(t.errorTitle, t.medNameRequired, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        await api.post('/schedules/medication', {
          email: identifier,
          medicationName: newMedName,
          description: newMedDesc,
          timeOfDay: newMedTime
        });
        showAlert(t.successTitle, t.medAddedSuccess, 'success', () => {
          setNewMedName('');
          setNewMedDesc('');
          fetchReminders();
        });
      }
    } catch (error) {
      showAlert(t.errorTitle, t.medAddError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMed = async (id) => {
    try {
      await api.post(`/schedules/medication/toggle?id=${id}`);
      fetchReminders();
    } catch (error) {
      console.log('Error toggling medication:', error);
    }
  };

  const normalizeTimeSlot = (timeStr, targetLang = 'VN') => {
    if (!timeStr) return targetLang === 'EN' ? 'Morning' : 'Sáng';
    const lower = timeStr.trim().toLowerCase();
    if (lower.includes('sáng') || lower.includes('morn')) return targetLang === 'EN' ? 'Morning' : 'Sáng';
    if (lower.includes('trưa') || lower.includes('noon')) return targetLang === 'EN' ? 'Noon' : 'Trưa';
    if (lower.includes('chiều') || lower.includes('afternoon')) return targetLang === 'EN' ? 'Afternoon' : 'Chiều';
    if (lower.includes('tối') || lower.includes('even') || lower.includes('night')) return targetLang === 'EN' ? 'Evening' : 'Tối';
    return timeStr;
  };

  const timeConfigs = {
    [t.morning]: { icon: 'wb-sunny', timeText: t.morningText, bgIconColor: COLORS.rose50, textColor: COLORS.primary, borderColor: COLORS.rose100 },
    [t.noon]: { icon: 'brightness-high', timeText: t.noonText, bgIconColor: COLORS.rose50, textColor: COLORS.primary, borderColor: COLORS.rose100 },
    [t.afternoon]: { icon: 'wb-twilight', timeText: t.afternoonText, bgIconColor: COLORS.rose50, textColor: COLORS.primary, borderColor: COLORS.rose100 },
    [t.evening]: { icon: 'dark-mode', timeText: t.eveningText, bgIconColor: COLORS.rose50, textColor: COLORS.primary, borderColor: COLORS.rose100 },
  };

  const currentSlots = [t.morning, t.noon, t.afternoon, t.evening];

  const groupedMeds = currentSlots.map(timeSlot => {
    return {
      time: timeSlot,
      items: meds.filter(m => normalizeTimeSlot(m.time, lang) === timeSlot)
    };
  }).filter(group => group.items.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title and Back Button */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t.scheduleMedicationPageTitle}</Text>
        </View>

        {/* Add Medication Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="medication" size={24} color={COLORS.primary} />
            <Text style={styles.cardTitle}>{t.addMedicationTitle}</Text>
          </View>
          <Text style={styles.cardDesc}>{t.addMedicationDesc}</Text>
          
          <View style={styles.formGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.medNameLbl}</Text>
              <TextInput 
                style={styles.textInputBase} 
                value={newMedName}
                onChangeText={setNewMedName}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.medInstructionLbl}</Text>
              <TextInput 
                style={styles.textInputBase} 
                value={newMedDesc}
                onChangeText={setNewMedDesc}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.medTimeLbl}</Text>
              <View style={styles.timeSelector}>
                {[t.morning, t.noon, t.afternoon, t.evening].map(timeSlot => (
                  <TouchableOpacity 
                    key={timeSlot} 
                    style={[styles.timeSlotBtn, newMedTime === timeSlot && styles.timeSlotBtnActive]}
                    onPress={() => setNewMedTime(timeSlot)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.timeSlotText, newMedTime === timeSlot && styles.timeSlotTextActive]}>{timeSlot}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.addBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleAddMed}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <MaterialIcons name="add" size={20} color={COLORS.white} />
                <Text style={styles.addBtnText}>{t.addToListBtn}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>{t.todayMedicationListTitle}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{meds.length}</Text>
          </View>
        </View>

        {/* Medication Timeline */}
        {groupedMeds.length === 0 ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="medical-services" size={48} color={COLORS.rose300 || COLORS.primary} />
            <Text style={styles.emptyTitle}>{t.noMedicationTitle}</Text>
            <Text style={styles.emptySub}>{t.noMedicationDesc}</Text>
          </View>
        ) : (
          <View style={styles.timelineWrapper}>
            {groupedMeds.map((group, index) => (
              <TimelineItem 
                key={index} 
                {...timeConfigs[group.time]} 
                meds={group.items}
                onToggle={handleToggleMed}
              />
            ))}
          </View>
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
  timeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeSlotBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    alignItems: 'center',
  },
  timeSlotBtnActive: {
    backgroundColor: COLORS.rose50,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  timeSlotTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
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
  timelineWrapper: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.rose100,
    marginLeft: 16,
  },
  timelineItem: {
    marginBottom: 24,
    position: 'relative',
  },
  timelineNode: {
    position: 'absolute',
    left: -31,
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    zIndex: 2,
  },
  timelineBox: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.md,
    ...SHADOWS.soft,
  },
  timelineTimeText: {
    fontSize: SIZES.bodyText + 1,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: SIZES.radiusLg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  medCardTaken: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
  },
  medName: {
    fontSize: SIZES.bodyText + 1,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  medNameTaken: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  medDesc: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
  },
  checkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkBtnTaken: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  }
});

export default ScheduleMedicationScreen;


