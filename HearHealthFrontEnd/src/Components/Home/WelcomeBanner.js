import React, { useContext } from 'react';
import { Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';
import { LanguageContext } from '../../Context/LanguageContext';

const WelcomeBanner = ({ name }) => {
  const { t } = useContext(LanguageContext);
  const displayName = name || 'bạn';

  return (
    <LinearGradient
      colors={[COLORS.blue50, COLORS.rose50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.banner}
    >
      <Text style={styles.title}>{t.bannerTitle}</Text>
      <Text style={styles.subtitle}>
        {t.bannerSubStable}{displayName}{t.bannerSubKeepUp}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: SIZES.xl,
    borderRadius: SIZES.radiusXl,
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.white,
    ...SHADOWS.soft,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 24,
  }
});

export default WelcomeBanner;


