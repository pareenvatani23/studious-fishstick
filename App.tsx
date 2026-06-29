import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppStateProvider } from './src/store/AppState';
import { ShiftFlowProvider } from './src/store/ShiftFlow';
import { RootNavigator } from './src/navigation/RootNavigator';

/**
 * TrueShift — your daily reset for a steadier mind.
 * Local-only MVP: no account, no network. Easy mode is the default; Full mode
 * is opt-in. All clinical copy is stubbed (see src/data + CONTENT_STUBS.md).
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppStateProvider>
          <ShiftFlowProvider>
            <RootNavigator />
          </ShiftFlowProvider>
        </AppStateProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
