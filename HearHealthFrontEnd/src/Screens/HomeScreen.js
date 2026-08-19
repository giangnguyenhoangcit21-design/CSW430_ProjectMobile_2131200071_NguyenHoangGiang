import React, { useContext, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../Constants/theme';
import { TabScrollContext } from '../Context/TabScrollContext';
import api from '../Services/api';

import HeaderMobile from '../Components/Shared/HeaderMobile';
import WelcomeBanner from '../Components/Home/WelcomeBanner';
import MetricsGrid from '../Components/Home/MetricsGrid';
import Reminders from '../Components/Home/Reminders';

const HomeScreen = () => {
  const { onScroll } = useContext(TabScrollContext);
  const [overviewData, setOverviewData] = useState(null);

  const fetchOverview = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      const phone = undefined;
      const identifier = email || phone;
      if (identifier) {
        const response = await api.get('/health/overview', {
          params: { email: identifier, }
        });
        setOverviewData(response.data);
      }
    } catch (error) {
      console.log('Error fetching health overview:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOverview();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderMobile />
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <WelcomeBanner 
          name={overviewData?.fullName}
        />
        <MetricsGrid metrics={overviewData || {}} />
        <Reminders />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: 120,
  }
});

export default HomeScreen;


