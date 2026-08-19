import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, SHADOWS } from '../Constants/theme';
import { LanguageContext } from '../Context/LanguageContext';
import { translateAssessmentTitle, translateTriageContent } from '../Constants/LanguageConfig';

const TriageScreen = ({ route, navigation }) => {
  const { lang, t } = useContext(LanguageContext);

  const triageResult = route.params?.triageResult || {
    title: lang === 'EN' ? 'NO DATA' : 'KHÔNG CÓ DỮ LIỆU',
    subtitle: lang === 'EN' ? 'Please take the assessment test again.' : 'Vui lòng thực hiện lại bài kiểm tra.',
    icon: 'error',
    color: '#6B7280',
    glowBg: '#F3F4F6',
    glowBorder: '#E5E7EB',
    recommendations: []
  };

  const { title, subtitle, icon, color, glowBg, glowBorder, recommendations } = triageResult;

  const displayTitle = translateAssessmentTitle(title, lang);
  const localizedContent = translateTriageContent(title, subtitle, recommendations, lang);

  const displaySubtitle = localizedContent.subtitle || subtitle;
  const displayRecs = (localizedContent.recommendations && localizedContent.recommendations.length > 0)
    ? localizedContent.recommendations
    : (recommendations || []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View style={styles.card}>

          {/* Risk Indicator */}
          <View style={styles.indicatorWrapper}>
            <View style={[styles.glowRing, { backgroundColor: glowBg, borderColor: glowBorder }]}>
              <View style={[styles.iconCircle, { backgroundColor: glowBorder }]}>
                <MaterialIcons name={icon} size={64} color={color} />
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: color }]}>
              <Text style={styles.statusBadgeText}>{displayTitle}</Text>
            </View>
          </View>

          <Text style={styles.title}>{lang === 'EN' ? 'Assessment Completed!' : 'Hoàn tất đánh giá!'}</Text>

          <Text style={styles.subtitle}>
            {displaySubtitle}
          </Text>

          {/* Personalized Recommendations */}
          <View style={styles.recommendationBox}>
            <View style={styles.recHeader}>
              <MaterialIcons name="lightbulb" size={24} color={COLORS.primary} />
              <Text style={styles.recTitle}>{lang === 'EN' ? 'Your Personal Action Plan:' : 'Kế hoạch dành cho bạn:'}</Text>
            </View>

            {displayRecs.map((rec, index) => (
              <View key={index} style={styles.recItem}>
                <MaterialIcons name="check-circle" size={20} color={color} />
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })}
          >
            <Text style={styles.actionBtnText}>{lang === 'EN' ? 'Go to Home' : 'Đi đến Trang chủ'}</Text>
            <MaterialIcons name="arrow-forward" size={24} color={COLORS.white} />
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
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 40,
    padding: SIZES.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100,
    ...SHADOWS.soft,
  },
  indicatorWrapper: {
    position: 'relative',
    marginBottom: 48,
    alignItems: 'center',
  },
  glowRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: COLORS.white,
    ...SHADOWS.soft,
  },
  statusBadgeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.bodyText,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textMain,
    marginBottom: SIZES.md,
  },
  subtitle: {
    fontSize: SIZES.bodyText,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  recommendationBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.rose50,
    marginBottom: 32,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SIZES.lg,
  },
  recTitle: {
    fontSize: SIZES.bodyText,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: SIZES.md,
  },
  recText: {
    flex: 1,
    fontSize: SIZES.bodyText,
    color: COLORS.textMain,
    lineHeight: 24,
  },
  actionBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
    borderRadius: SIZES.radiusLg,
    ...SHADOWS.soft,
  },
  actionBtnText: {
    color: COLORS.white,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  }
});

export default TriageScreen;


