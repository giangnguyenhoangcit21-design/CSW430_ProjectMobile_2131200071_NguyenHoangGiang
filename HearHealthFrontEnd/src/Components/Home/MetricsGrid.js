import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';
import { LanguageContext } from '../../Context/LanguageContext';

const MetricCard = ({ icon, value, label, bgColor, color }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.8}>
    <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
      <MaterialIcons name={icon} size={32} color={color} />
    </View>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

const MetricsGrid = ({ metrics = {} }) => {
  const { t } = useContext(LanguageContext);
  const {
    bloodPressure = "--/--",
    heartRate = "--",
    spo2 = "--",
    cholesterol = "--",
    bloodSugar = "--",
    weight = "--"
  } = metrics;

  return (
    <View style={styles.grid}>
      <MetricCard 
        icon="favorite" 
        value={bloodPressure} 
        label={t.metricBP} 
        bgColor={COLORS.red50} 
        color={COLORS.red500} 
      />
      <MetricCard 
        icon="monitor-heart" 
        value={heartRate} 
        label={t.metricHR} 
        bgColor={COLORS.orange50} 
        color={COLORS.orange500} 
      />
      <MetricCard 
        icon="air" 
        value={spo2} 
        label={t.metricSpo2} 
        bgColor={COLORS.emerald50} 
        color={COLORS.emerald500} 
      />
      <MetricCard 
        icon="water-drop" 
        value={cholesterol} 
        label={t.metricCholesterol} 
        bgColor={COLORS.purple50} 
        color={COLORS.purple500} 
      />
      <MetricCard 
        icon="science" 
        value={bloodSugar} 
        label={t.metricSugar} 
        bgColor={COLORS.rose50} 
        color={COLORS.rose500} 
      />
      <MetricCard 
        icon="monitor-weight" 
        value={weight} 
        label={t.metricWeight} 
        bgColor={COLORS.blue50} 
        color={COLORS.blue500} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: SIZES.xl,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.soft,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  value: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: SIZES.xs,
  },
  label: {
    fontSize: SIZES.smallText,
    color: COLORS.textMuted,
    fontWeight: '500',
  }
});

export default MetricsGrid;


