import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SIZES, SHADOWS } from '../../Constants/theme';
import { TabScrollContext } from '../../Context/TabScrollContext';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { translateY } = useContext(TabScrollContext) || {};

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: translateY || 0 }] }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        let iconName = 'help-outline';
        if (route.name === 'Home') iconName = 'dashboard';
        else if (route.name === 'Metrics') iconName = 'show-chart';
        else if (route.name === 'Statistics') iconName = 'bar-chart';
        else if (route.name === 'Goals') iconName = 'medication';
        else if (route.name === 'Profile') iconName = 'account-circle';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[styles.tabButton, isFocused && styles.tabButtonActive]}
          >
            <MaterialIcons 
              name={iconName} 
              size={24} 
              color={isFocused ? COLORS.primary : COLORS.textLight} 
            />
            {isFocused && (
              <Text style={styles.tabTextActive} numberOfLines={1}>
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 35,
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 100,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 25,
  },
  tabButtonActive: {
    backgroundColor: COLORS.rose50,
    paddingHorizontal: 12,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  }
});

export default CustomTabBar;


