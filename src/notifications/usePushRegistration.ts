import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useApp } from '../store/AppState';

/**
 * Registers the device's Expo push token against the signed-in user so the
 * server (daily-nudge cron) can send push notifications. Defensive: no-ops on
 * web, if the native module is missing, or if permission isn't granted. Actual
 * Android delivery also requires FCM credentials configured in EAS.
 */
let N: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  N = require('expo-notifications');
} catch {
  N = null;
}

function projectId(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants').default;
    return (
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      undefined
    );
  } catch {
    return undefined;
  }
}

export function usePushRegistration() {
  const { hydrated, signedIn, reminderEnabled, expoPushToken, setExpoPushToken } = useApp();
  const busy = useRef(false);

  useEffect(() => {
    if (!N || Platform.OS === 'web' || !hydrated || !signedIn || !reminderEnabled) return;
    if (busy.current) return;
    busy.current = true;
    (async () => {
      try {
        const perm = await N.getPermissionsAsync();
        let granted = perm.granted;
        if (!granted) {
          const req = await N.requestPermissionsAsync();
          granted = !!req.granted;
        }
        if (!granted) return;
        const pid = projectId();
        const res = await N.getExpoPushTokenAsync(pid ? { projectId: pid } : undefined);
        const token = res?.data;
        if (token && token !== expoPushToken) setExpoPushToken(token);
      } catch {
        // ignore — token registration is best-effort
      } finally {
        busy.current = false;
      }
    })();
  }, [hydrated, signedIn, reminderEnabled, expoPushToken, setExpoPushToken]);
}
