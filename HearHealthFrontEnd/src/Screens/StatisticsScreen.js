import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { LanguageContext } from '../Context/LanguageContext';
import { TRANSLATIONS } from '../Constants/LanguageConfig';
import { COLORS } from '../Constants/theme';
import api from '../Services/api';
import HeaderMobile from '../Components/Shared/HeaderMobile';

const screenWidth = Dimensions.get('window').width;

const getBPStatus = (sys, dia, isEN) => {
  if (!sys || !dia) return null;
  if (sys >= 140 || dia >= 90) return { label: isEN ? 'High' : 'Cao', color: '#EF4444', bg: '#FEF2F2' };
  if (sys >= 120 || dia >= 80) return { label: isEN ? 'Elevated' : 'Hơi cao', color: '#F59E0B', bg: '#FEFCE8' };
  return { label: isEN ? 'Normal' : 'Bình thường', color: '#10B981', bg: '#ECFDF5' };
};

const getHRStatus = (hr, isEN) => {
  if (!hr) return null;
  if (hr > 100) return { label: isEN ? 'Fast' : 'Nhanh', color: '#EF4444', bg: '#FEF2F2' };
  if (hr < 60) return { label: isEN ? 'Slow' : 'Chậm', color: '#F59E0B', bg: '#FEFCE8' };
  return { label: isEN ? 'Normal' : 'Bình thường', color: '#10B981', bg: '#ECFDF5' };
};

const StatisticsScreen = ({ navigation }) => {
  const { lang, t: contextT } = useContext(LanguageContext);
  const t = contextT || TRANSLATIONS[lang] || TRANSLATIONS.VN;
  const isEN = lang === 'EN';

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [period, setPeriod] = useState(7); // 7 or 30 days

  useFocusEffect(
    React.useCallback(() => {
      fetchMetrics();
    }, [period])
  );

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const email = await AsyncStorage.getItem('userEmail');
      const response = await api.get(`/health/metrics-history?email=${email}&days=${period}`);
      setMetrics(response.data || []);
    } catch (error) {
      console.log('Error fetching metrics history:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedMetrics = [...metrics].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latestMetric = sortedMetrics.length > 0 ? sortedMetrics[sortedMetrics.length - 1] : null;

  const prepareChartData = (key, mainColor) => {
    if (!metrics || metrics.length === 0) return null;
    
    let labels = [];
    let data = [];
    let data2 = []; // Diastolic for BP

    sortedMetrics.forEach(m => {
      const d = new Date(m.date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      labels.push(`${day}/${month}`);

      if (key === 'bp') {
        data.push(m.sysBP || 0);
        data2.push(m.diaBP || 0);
      } else {
        data.push(m[key] || 0);
      }
    });

    if (data.every(val => val === 0) && (!data2.length || data2.every(val => val === 0))) {
      return null;
    }

    if (key === 'bp') {
      return {
        labels,
        legend: [t.sysBPLbl || 'Tâm thu', t.diaBPLbl || 'Tâm trương'],
        datasets: [
          { data, color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})` }, // Systolic Red
          { data: data2, color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})` } // Diastolic Blue
        ]
      };
    }

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => mainColor ? mainColor(opacity) : `rgba(214, 106, 125, ${opacity})`
        }
      ]
    };
  };

  const renderChartCard = (title, iconName, data, unit, colorHex) => {
    if (!data) return null;

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(214, 106, 125, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
      strokeWidth: 2.5,
      barPercentage: 0.5,
      useShadowColorFromDataset: true,
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: colorHex || COLORS.primary
      }
    };

    return (
      <View style={styles.chartCard}>
        <View style={styles.chartCardHeader}>
          <Icon name={iconName} size={22} color={colorHex || COLORS.primary} />
          <Text style={styles.chartTitle}>{title}</Text>
          {unit ? <Text style={styles.chartUnit}>({unit})</Text> : null}
        </View>
        <LineChart
          data={data}
          width={screenWidth - 48}
          height={210}
          chartConfig={chartConfig}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
    );
  };

  const bpStatus = latestMetric ? getBPStatus(latestMetric.sysBP, latestMetric.diaBP, isEN) : null;
  const hrStatus = latestMetric ? getHRStatus(latestMetric.heartRate, isEN) : null;

  return (
    <View style={styles.container}>
      <HeaderMobile title={t.statisticsTitle || 'Thống Kê Chỉ Số'} navigation={navigation} />
      
      {/* Period Selection Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tabBtn, period === 7 && styles.tabBtnActive]} 
          onPress={() => setPeriod(7)}>
          <Text style={[styles.tabText, period === 7 && styles.tabTextActive]}>
            {isEN ? '7 Days' : '7 Ngày'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, period === 30 && styles.tabBtnActive]} 
          onPress={() => setPeriod(30)}>
          <Text style={[styles.tabText, period === 30 && styles.tabTextActive]}>
            {isEN ? '30 Days' : '30 Ngày'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Latest Metric Summary Cards */}
        {latestMetric && (
          <View style={styles.summarySection}>
            <Text style={styles.sectionHeading}>
              {isEN ? 'Latest Daily Summary' : 'Chỉ Số Gần Nhất'}
            </Text>
            
            <View style={styles.summaryGrid}>
              {/* BP Summary */}
              {latestMetric.sysBP && latestMetric.diaBP ? (
                <View style={styles.summaryCard}>
                  <Icon name="heart-pulse" size={24} color="#EF4444" />
                  <Text style={styles.summaryValue}>{latestMetric.sysBP}/{latestMetric.diaBP}</Text>
                  <Text style={styles.summaryLabel}>{t.metricBP || 'Huyết áp'} (mmHg)</Text>
                  {bpStatus && (
                    <View style={[styles.statusBadge, { backgroundColor: bpStatus.bg }]}>
                      <Text style={[styles.statusText, { color: bpStatus.color }]}>{bpStatus.label}</Text>
                    </View>
                  )}
                </View>
              ) : null}

              {/* Heart Rate Summary */}
              {latestMetric.heartRate ? (
                <View style={styles.summaryCard}>
                  <Icon name="pulse" size={24} color="#F59E0B" />
                  <Text style={styles.summaryValue}>{latestMetric.heartRate}</Text>
                  <Text style={styles.summaryLabel}>{t.metricHR || 'Nhịp tim'} (bpm)</Text>
                  {hrStatus && (
                    <View style={[styles.statusBadge, { backgroundColor: hrStatus.bg }]}>
                      <Text style={[styles.statusText, { color: hrStatus.color }]}>{hrStatus.label}</Text>
                    </View>
                  )}
                </View>
              ) : null}

              {/* Sugar Summary */}
              {latestMetric.bloodSugar ? (
                <View style={styles.summaryCard}>
                  <Icon name="water" size={24} color="#A855F7" />
                  <Text style={styles.summaryValue}>{latestMetric.bloodSugar}</Text>
                  <Text style={styles.summaryLabel}>{t.metricSugar || 'Đường huyết'} (mg/dL)</Text>
                </View>
              ) : null}

              {/* Weight Summary */}
              {latestMetric.weight ? (
                <View style={styles.summaryCard}>
                  <Icon name="scale-bathroom" size={24} color="#10B981" />
                  <Text style={styles.summaryValue}>{latestMetric.weight}</Text>
                  <Text style={styles.summaryLabel}>{t.metricWeight || 'Cân nặng'} (kg)</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Charts Container */}
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary || '#D66A7D'} style={{ marginTop: 50 }} />
        ) : metrics.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="chart-box-outline" size={60} color={COLORS.coral || '#FF8FA3'} />
            <Text style={styles.emptyStateText}>{t.noData || 'Chưa có dữ liệu thống kê'}</Text>
            <TouchableOpacity 
              style={styles.emptyStateBtn} 
              onPress={() => navigation.navigate('Metrics')}>
              <Icon name="plus-circle" size={18} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyStateBtnText}>
                {isEN ? 'Add Metric Today' : 'Cập nhật chỉ số ngay'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.chartsContainer}>
            {renderChartCard(t.metricBP || 'Biểu Đồ Huyết Áp', 'heart-pulse', prepareChartData('bp'), 'mmHg', '#EF4444')}
            {renderChartCard(t.metricHR || 'Biểu Đồ Nhịp Tim', 'pulse', prepareChartData('heartRate', (op) => `rgba(245, 158, 11, ${op})`), 'bpm', '#F59E0B')}
            {renderChartCard(t.metricSugar || 'Biểu Đồ Đường Huyết', 'water', prepareChartData('bloodSugar', (op) => `rgba(168, 85, 247, ${op})`), 'mg/dL', '#A855F7')}
            {renderChartCard(t.metricWeight || 'Biểu Đồ Cân Nặng', 'scale-bathroom', prepareChartData('weight', (op) => `rgba(16, 185, 129, ${op})`), 'kg', '#10B981')}
          </View>
        )}
        
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#FFF5F7',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background || '#FFF5F7',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.rose100 || '#FFE4E6',
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary || '#D66A7D',
    borderColor: COLORS.primary || '#D66A7D',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted || '#6B7280',
  },
  tabTextActive: {
    color: COLORS.white || '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain || '#1F2937',
    marginBottom: 12,
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: COLORS.white || '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.rose100 || '#FFE4E6',
    shadowColor: COLORS.primary || '#D66A7D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain || '#1F2937',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textMuted || '#6B7280',
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chartsContainer: {
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: COLORS.primary || '#D66A7D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.rose100 || '#FFE4E6',
  },
  chartCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain || '#1F2937',
    marginLeft: 8,
  },
  chartUnit: {
    fontSize: 13,
    color: COLORS.textMuted || '#6B7280',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textMuted || '#6B7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  emptyStateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary || '#D66A7D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: COLORS.primary || '#D66A7D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyStateBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default StatisticsScreen;
