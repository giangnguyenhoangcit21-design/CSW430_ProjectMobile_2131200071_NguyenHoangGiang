import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import HeaderMobile from '../Components/Shared/HeaderMobile';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';

const MetricSymptomScreen = () => {
  const navigation = useNavigation();
  const { t } = useContext(LanguageContext);
  const [chestPain, setChestPain] = useState(0);
  const [breath, setBreath] = useState(0);
  const [notes, setNotes] = useState('');

  const painOptions = [
    { text: t.painNone, icon: 'sentiment-satisfied-alt', color: '#FB7185' },
    { text: t.painMild, icon: 'sentiment-neutral', color: '#FACC15' },
    { text: t.painSevere, icon: 'sentiment-very-dissatisfied', color: '#E11D48' }
  ];

  const breathOptions = [
    { text: t.breathNormal, icon: 'sentiment-satisfied-alt', color: '#FB7185' },
    { text: t.breathMild, icon: 'sentiment-neutral', color: '#FACC15' },
    { text: t.breathSevere, icon: 'sentiment-very-dissatisfied', color: '#E11D48' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>{t.symptomsTitle}</Text>
        </View>

        <View style={styles.tabContent}>
          {/* Chest Pain */}
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderHeaderLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialIcons name="sick" size={24} color="#EF4444" />
                </View>
                <Text style={styles.sliderLabel}>{t.chestPainLbl}</Text>
              </View>
            </View>
            <View style={styles.symptomOptionsRow}>
              {painOptions.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.symptomOptionBtn,
                    chestPain === idx && { borderColor: opt.color, backgroundColor: opt.color + '10' }
                  ]}
                  onPress={() => setChestPain(idx)}
                >
                  <View style={[styles.symptomIconCircle, { backgroundColor: opt.color }]}>
                    <MaterialIcons name={opt.icon} size={24} color={COLORS.white} />
                  </View>
                  <Text style={[styles.symptomOptionText, chestPain === idx && { color: opt.color }]}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Breath */}
          <View style={styles.sliderCard}>
            <View style={styles.sliderHeader}>
              <View style={styles.sliderHeaderLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                  <MaterialIcons name="air" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.sliderLabel}>{t.breathLbl}</Text>
              </View>
            </View>
            <View style={styles.symptomOptionsRow}>
              {breathOptions.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.symptomOptionBtn,
                    breath === idx && { borderColor: opt.color, backgroundColor: opt.color + '10' }
                  ]}
                  onPress={() => setBreath(idx)}
                >
                  <View style={[styles.symptomIconCircle, { backgroundColor: opt.color }]}>
                    <MaterialIcons name={opt.icon} size={24} color={COLORS.white} />
                  </View>
                  <Text style={[styles.symptomOptionText, breath === idx && { color: opt.color }]}>{opt.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View>
            <Text style={styles.sectionTitle}>{t.notesLbl}</Text>
            <TextInput
              style={styles.notesInput}
              placeholder={t.notesPlaceholder}
              placeholderTextColor={COLORS.textLight}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity style={styles.submitBtnLarge} onPress={() => navigation.goBack()}>
            <Text style={styles.submitBtnLargeText}>{t.saveMetricsBtn}</Text>
            <MaterialIcons name="check-circle" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  symptomOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  symptomOptionBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
  },
  symptomIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symptomOptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.bodyText + 2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 8,
    marginTop: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.rose100,
    borderRadius: SIZES.radiusLg,
    padding: 16,
    height: 100,
    textAlignVertical: 'top',
    backgroundColor: COLORS.white,
    fontSize: SIZES.bodyText,
    color: COLORS.textMain,
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

export default MetricSymptomScreen;


