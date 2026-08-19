import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Slider from '@react-native-community/slider';
import { COLORS } from '../../Constants/theme';

const CustomSlider = ({ icon, iconFamily, label, unit, min, max, step, value, setValue, color, bgColor, children, status }) => {
  const IconComponent = iconFamily === 'FontAwesome5' ? FontAwesome5 : MaterialIcons;
  return (
    <View style={styles.sliderCard}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderHeaderLeft}>
          <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
            <IconComponent name={icon} size={24} color={color} />
          </View>
          <View style={{ flexShrink: 1, flex: 1 }}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
              <Text style={styles.sliderLabel} adjustsFontSizeToFit numberOfLines={1}>{label}</Text>
              {status && (
                <View style={[styles.statusBadgeInline, { backgroundColor: status.bg }]}>
                  <Text style={[styles.statusBadgeTextInline, { color: status.color }]}>{status.text}</Text>
                </View>
              )}
            </View>
            {typeof unit === 'string' ? (
              <Text style={styles.sliderUnit} adjustsFontSizeToFit numberOfLines={1}>{unit}</Text>
            ) : (
              unit
            )}
          </View>
        </View>
        <View style={styles.sliderHeaderRight}>
          <Text style={[styles.sliderValue, { color: color }]}>{value}</Text>
          <Text style={styles.sliderUnitRight}>{unit === 'Lần / Phút (BPM)' ? 'BPM' : typeof unit === 'string' && unit.includes('%') ? '%' : typeof unit === 'string' && unit.includes('mg/dL') ? 'mg/dL' : label.includes('Cân nặng') ? 'kg' : ''}</Text>
        </View>
      </View>

      <View style={styles.sliderControls}>
        <TouchableOpacity 
          style={styles.adjustBtn} 
          onPress={() => setValue(Math.max(min, value - (step || 1)))}
        >
          <Text style={styles.adjustBtnText}>-</Text>
        </TouchableOpacity>
        
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={min}
          maximumValue={max}
          step={step || 1}
          value={value}
          onValueChange={setValue}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.rose100}
          thumbTintColor={COLORS.primary}
        />

        <TouchableOpacity 
          style={styles.adjustBtn}
          onPress={() => setValue(Math.min(max, value + (step || 1)))}
        >
          <Text style={styles.adjustBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  sliderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sliderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  statusBadgeInline: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeTextInline: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  sliderUnit: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  sliderHeaderRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  sliderValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  sliderUnitRight: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginTop: -4,
  },
  sliderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.rose100,
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
    marginTop: -2,
    color: COLORS.primary,
  },
});

export default CustomSlider;


