import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../store/AppState';
import { useAuth } from '../supabase/auth';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

// Onboarding
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { HowItWorksScreen } from '../screens/onboarding/HowItWorksScreen';
import { TextSizeScreen } from '../screens/onboarding/TextSizeScreen';
import { ReadAloudScreen } from '../screens/onboarding/ReadAloudScreen';
import { PrivacyScreen } from '../screens/onboarding/PrivacyScreen';
import { RemindersScreen } from '../screens/onboarding/RemindersScreen';
import { ReadyScreen } from '../screens/onboarding/ReadyScreen';

// Auth
import { SignInScreen } from '../screens/auth/SignInScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';

// Reset loop
import { SituationScreen } from '../screens/reset/SituationScreen';
import { NarrationScreen } from '../screens/reset/NarrationScreen';
import { DoneScreen } from '../screens/reset/DoneScreen';

// Detail / settings
import { ResetDetailScreen } from '../screens/progress/ResetDetailScreen';
import { VideoLessonScreen } from '../screens/explore/VideoLessonScreen';
import { HowToUseScreen } from '../screens/profile/HowToUseScreen';
import { ThemePickerScreen } from '../screens/profile/ThemePickerScreen';
import { ReminderSettingsScreen } from '../screens/profile/ReminderSettingsScreen';
import { CrisisResourcesScreen } from '../screens/profile/CrisisResourcesScreen';
import { InfoScreen } from '../screens/profile/InfoScreen';
import { DeleteDataScreen } from '../screens/profile/DeleteDataScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const themeCtx = useTheme();
  const { theme } = themeCtx;
  const { onboardingComplete, hydrated } = useApp();
  const { session, ready: authReady, configured } = useAuth();

  // When Supabase is configured we REQUIRE sign-in; otherwise fall back to
  // local-only mode so the app still runs without accounts.
  const showApp = configured ? !!session : true;
  const initialRouteName: keyof RootStackParamList = showApp
    ? 'Main'
    : onboardingComplete
    ? 'SignIn'
    : 'Welcome';

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

  if (!hydrated || !themeCtx.hydrated || (configured && !authReady)) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.teal} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        {!showApp ? (
          <Stack.Group>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="HowItWorks" component={HowItWorksScreen} />
            <Stack.Screen name="TextSize" component={TextSizeScreen} />
            <Stack.Screen name="ReadAloud" component={ReadAloudScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="Reminders" component={RemindersScreen} />
            <Stack.Screen name="Ready" component={ReadyScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="Main" component={TabNavigator} />
            {/* Reset loop */}
            <Stack.Screen name="ResetSituation" component={SituationScreen} />
            <Stack.Screen name="ResetNarration" component={NarrationScreen} />
            <Stack.Screen name="ResetDone" component={DoneScreen} />
            <Stack.Screen name="ResetDetail" component={ResetDetailScreen} />
            {/* detail / settings */}
            <Stack.Screen name="VideoLesson" component={VideoLessonScreen} />
            <Stack.Screen name="HowToUse" component={HowToUseScreen} />
            <Stack.Screen name="ThemePicker" component={ThemePickerScreen} />
            <Stack.Screen name="ReminderSettings" component={ReminderSettingsScreen} />
            <Stack.Screen name="CrisisResources" component={CrisisResourcesScreen} />
            <Stack.Screen name="Info" component={InfoScreen} />
            <Stack.Screen name="DeleteData" component={DeleteDataScreen} options={{ presentation: 'transparentModal', animation: 'fade' }} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
