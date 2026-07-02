import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppStateProvider } from './src/store/AppState';
import { ResetFlowProvider } from './src/store/ResetFlow';
import { AuthProvider } from './src/supabase/auth';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AnimatedSplash } from './src/components/AnimatedSplash';
import { useReminderSync } from './src/notifications/useReminderSync';
import { useCloudSync } from './src/supabase/useCloudSync';

/**
 * TrueShift — your daily reset for a steadier mind.
 * Local-only MVP: no account, no network for user data. One simple flow.
 */
export default function App() {
  // Apply the latest OTA update on FIRST launch (so users never need to open
  // twice or clear cache). Time-boxed so a slow network can't block startup.
  const [ready, setReady] = useState(__DEV__ || !Updates.isEnabled);

  useEffect(() => {
    if (ready) return;
    let settled = false;
    const finish = () => { if (!settled) { settled = true; setReady(true); } };
    (async () => {
      try {
        const res = await Updates.checkForUpdateAsync();
        if (res.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // relaunches into the new bundle
          return;
        }
      } catch {
        // offline / no update — just run what we have
      }
      finish();
    })();
    const t = setTimeout(finish, 5000); // safety: never hang on splash
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0E1619', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#74C7B8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppStateProvider>
            <ResetFlowProvider>
              <Root />
            </ResetFlowProvider>
          </AppStateProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Root() {
  const [splashDone, setSplashDone] = useState(false);
  useReminderSync(); // keep personalised daily reminders scheduled + fresh
  useCloudSync(); // mirror resets to the signed-in user's Supabase account
  return (
    <>
      <RootNavigator />
      {!splashDone && <AnimatedSplash onDone={() => setSplashDone(true)} />}
    </>
  );
}
