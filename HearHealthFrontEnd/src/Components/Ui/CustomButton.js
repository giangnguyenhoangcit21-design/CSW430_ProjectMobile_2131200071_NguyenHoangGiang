import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';

const CustomButton = ({ title, onPress, type = 'primary', style }) => {
  const isPrimary = type === 'primary';
  const isOutline = type === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary && styles.primaryBg,
        isOutline && styles.outlineBg,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.text,
          isPrimary && styles.primaryText,
          isOutline && styles.outlineText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: SIZES.touchTarget,
    borderRadius: SIZES.radiusLg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row',
    ...SHADOWS.soft,
  },
  primaryBg: {
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.h3,
  },
  outlineBg: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  outlineText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: SIZES.h3,
  },
  text: {
    textAlign: 'center',
  },
});

export default CustomButton;


