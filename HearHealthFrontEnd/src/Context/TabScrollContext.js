import React, { createContext, useRef } from 'react';
import { Animated } from 'react-native';

export const TabScrollContext = createContext();

export const TabScrollProvider = ({ children }) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  // Track the scroll event
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  // We want to hide the tab bar when scrolling down, and show it when scrolling up.
  // We use diffClamp to only track the delta changes within a range (0 to 120).
  const scrollYClamped = Animated.diffClamp(scrollY, 0, 120);

  // Translate Y by the clamped value
  const translateY = scrollYClamped.interpolate({
    inputRange: [0, 120],
    outputRange: [0, 120],
  });

  return (
    <TabScrollContext.Provider value={{ onScroll, translateY }}>
      {children}
    </TabScrollContext.Provider>
  );
};


