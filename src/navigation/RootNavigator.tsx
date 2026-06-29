import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../store/AppState';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

// Onboarding
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { HowItWorksScreen } from '../screens/onboarding/HowItWorksScreen';
import { TextSizeScreen } from '../screens/onboarding/TextSizeScreen';
import { ReadAloudScreen } from '../screens/onboarding/ReadAloudScreen';
import { PrivacyScreen } from '../screens/onboarding/PrivacyScreen';
import { ReadyScreen } from '../screens/onboarding/ReadyScreen';
import { PatternSelectionScreen } from '../screens/onboarding/PatternSelectionScreen';

// Shift loop
import { StartShiftScreen } from '../screens/shift/StartShiftScreen';
import { EasyFeelingScreen } from '../screens/shift/EasyFeelingScreen';
import { EmotionalPullScreen } from '../screens/shift/EmotionalPullScreen';
import { NameStoryScreen } from '../screens/shift/NameStoryScreen';
import { ReframeScreen } from '../screens/shift/ReframeScreen';
import { SteadierResponseScreen } from '../screens/shift/SteadierResponseScreen';
import { ActionSelectionScreen } from '../screens/shift/ActionSelectionScreen';
import { ProofCollectedScreen } from '../screens/shift/ProofCollectedScreen';

// Detail / settings
import { VideoLessonScreen } from '../screens/explore/VideoLessonScreen';
import { ThemePickerScreen } from '../screens/profile/ThemePickerScreen';
import { CrisisResourcesScreen } from '../screens/profile/CrisisResourcesScreen';
import { InfoScreen } from '../screens/profile/InfoScreen';
import { DeleteDataScreen } from '../screens/profile/DeleteDataScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { theme } = useTheme();
  const themeCtx = useTheme();
  const { onboardingComplete, hydrated } = useApp();

  const navTheme: NavTheme = {
    ...DefaultTheme,
    dark: theme.isDark,
    colors: {
      ...DefaultTheme.colors,
      background: theme.colors.background,
      card: theme.colors.card,
      text: theme.colors.text1,
      border: theme.colors.border,
      primary: theme.colors.teal,
      notification: theme.colors.danger,
    },
  };

  if (!hydrated || !themeCtx.hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.teal} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        {!onboardingComplete ? (
          <Stack.Group>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
            <Stack.Screen name="TextSize" component={TextSizeScreen} />
            <Stack.Screen name="ReadAloud" component={ReadAloudScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Ready" component={ReadyScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main" component={TabNavigator} />
            {/* shift loop */}
            <Stack.Screen name="StartShift" component={StartShiftScreen} />
            <Stack.Screen name="EasyFeeling" component={EasyFeelingScreen} />
            <Stack.Screen name="EmotionalPull" component={EmotionalPullScreen} />
            <Stack.Screen name="NameStory" component={NameStoryScreen} />
            <Stack.Screen name="Reframe" component={ReframeScreen} />
            <Stack.Screen name="SteadierResponse" component={SteadierResponseScreen} />
            <Stack.Screen name="ActionSelection" component={ActionSelectionScreen} />
            <Stack.Screen name="ProofCollected" component={ProofCollectedScreen} />
            {/* detail / settings */}
            <Stack.Screen name="PatternSelection" component={PatternSelectionScreen} />
            <Stack.Screen name="VideoLesson" component={VideoLessonScreen} />
            <Stack.Screen name="ThemePicker" component={ThemePickerScreen} />
            <Stack.Screen name="CrisisResources" component={CrisisResourcesScreen} />
            <Stack.Screen name="Info" component={InfoScreen} />
            <Stack.Screen name="DeleteData" component={DeleteDataScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
