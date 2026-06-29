import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { Icon, IconName } from '../components/icons';
import { AppText } from '../components/AppText';
import { radius, sizing } from '../theme/tokens';
import { TabParamList } from './types';

import { HomeScreen } from '../screens/home/HomeScreen';
import { StartShiftScreen } from '../screens/shift/StartShiftScreen';
import { ExploreScreen } from '../screens/explore/ExploreScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TABS: { name: keyof TabParamList; label: string; icon: IconName }[] = [
  { name: 'HomeTab', label: 'Home', icon: 'home' },
  { name: 'ShiftTab', label: 'Shift', icon: 'shift' },
  { name: 'ExploreTab', label: 'Explore', icon: 'explore' },
  { name: 'ProgressTab', label: 'Progress', icon: 'progress' },
  { name: 'YouTab', label: 'You', icon: 'user' },
];

function TabBarItem({ icon, label, focused }: { icon: IconName; label: string; focused: boolean }) {
  const { theme, tint } = useTheme();
  const c = theme.colors;
  return (
    <View style={{ alignItems: 'center', gap: 4, width: 64 }}>
      <View
        style={{
          paddingHorizontal: focused ? 16 : 0,
          paddingVertical: 6,
          borderRadius: radius.full,
          backgroundColor: focused ? tint(c.teal, 0.16) : 'transparent',
        }}
      >
        <Icon name={icon} color={focused ? c.teal : c.muted} size={22} />
      </View>
      <AppText size={11} weight={focused ? '600' : '400'} color={focused ? c.teal : c.muted}>
        {label}
      </AppText>
    </View>
  );
}

export function TabNavigator() {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          height: sizing.tabBar,
          paddingTop: 10,
          borderTopWidth: c.borderWidth,
          borderTopColor: c.border,
          backgroundColor: theme.isDark ? 'transparent' : c.card,
          elevation: 0,
        },
        tabBarBackground: () =>
          theme.isDark ? (
            <BlurView intensity={40} tint="dark" style={{ flex: 1, backgroundColor: 'rgba(14,22,25,0.7)' }} />
          ) : (
            <View style={{ flex: 1, backgroundColor: c.card }} />
          ),
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={
            t.name === 'HomeTab'
              ? HomeScreen
              : t.name === 'ShiftTab'
              ? StartShiftScreen
              : t.name === 'ExploreTab'
              ? ExploreScreen
              : t.name === 'ProgressTab'
              ? ProgressScreen
              : ProfileScreen
          }
          options={{
            tabBarAccessibilityLabel: t.label,
            tabBarIcon: ({ focused }) => <TabBarItem icon={t.icon} label={t.label} focused={focused} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
