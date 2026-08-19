import React, { useContext } from 'react';
import { Platform, Animated } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../Constants/theme';

import { TabScrollContext, TabScrollProvider } from '../Context/TabScrollContext';
import CustomTabBar from '../Components/Shared/CustomTabBar';

import { LanguageContext } from '../Context/LanguageContext';

// Import Screens
import LoginScreen from '../Screens/LoginScreen';

import RegisterScreen from '../Screens/RegisterScreen';
import ForgotPasswordScreen from '../Screens/ForgotPasswordScreen';
import OTPScreen from '../Screens/OTPScreen';
import SetPasswordScreen from '../Screens/SetPasswordScreen';
import HomeScreen from '../Screens/HomeScreen';
import MetricsScreen from '../Screens/MetricsScreen';
import StatisticsScreen from '../Screens/StatisticsScreen';
import ProfileScreen from '../Screens/ProfileScreen';
import EditProfileScreen from '../Screens/EditProfileScreen';

import GoalsScreen from '../Screens/GoalsScreen';
import ScreeningScreen from '../Screens/ScreeningScreen';
import TriageScreen from '../Screens/TriageScreen';

import MetricBPScreen from '../Screens/MetricBPScreen';
import MetricMetabolicScreen from '../Screens/MetricMetabolicScreen';
import MetricSymptomScreen from '../Screens/MetricSymptomScreen';

import GoalBPScreen from '../Screens/GoalBPScreen';
import GoalNutritionScreen from '../Screens/GoalNutritionScreen';
import ScheduleDoctorScreen from '../Screens/ScheduleDoctorScreen';
import ScheduleMedicationScreen from '../Screens/ScheduleMedicationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { t } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'dashboard';
          else if (route.name === 'Metrics') iconName = 'show-chart';
          else if (route.name === 'Statistics') iconName = 'bar-chart';
          else if (route.name === 'Goals') iconName = 'medication';
          else if (route.name === 'Profile') iconName = 'account-circle';

          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t.tabHome }} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} options={{ tabBarLabel: t.chartsTab || 'Thống kê' }} />
      <Tab.Screen name="Metrics" component={MetricsScreen} options={{ tabBarLabel: t.tabMetrics }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarLabel: t.tabGoals }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t.tabProfile }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <TabScrollProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
    
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTP" component={OTPScreen} />
          <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
          <Stack.Screen name="Screening" component={ScreeningScreen} />
          <Stack.Screen name="Triage" component={TriageScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="MetricBP" component={MetricBPScreen} />
          <Stack.Screen name="MetricMetabolic" component={MetricMetabolicScreen} />
          <Stack.Screen name="MetricSymptom" component={MetricSymptomScreen} />
          
          <Stack.Screen name="GoalBP" component={GoalBPScreen} />
          <Stack.Screen name="GoalNutrition" component={GoalNutritionScreen} />
          <Stack.Screen name="ScheduleDoctor" component={ScheduleDoctorScreen} />
          <Stack.Screen name="ScheduleMedication" component={ScheduleMedicationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TabScrollProvider>
  );
};

export default AppNavigator;


