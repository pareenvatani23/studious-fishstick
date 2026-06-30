import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppStateProvider } from './src/store/AppState';
import { ResetFlowProvider } from './src/store/ResetFlow';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * TrueShift — your daily reset for a steadier mind.
 * Local-only MVP: no account, no network. One simple flow: the daily "Reset".
 * Clinical copy is draft, pending review (see src/data + CONTENT_STUBS.md).
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppStateProvider>
          <ResetFlowProvider>
            <RootNavigator />
          </ResetFlowProvider>
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
