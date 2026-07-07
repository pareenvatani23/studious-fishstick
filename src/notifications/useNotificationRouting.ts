import { useEffect, useRef } from 'react';
import { navigationRef } from '../navigation/navigationRef';
import { useResetFlow } from '../store/ResetFlow';
import { useApp } from '../store/AppState';

/**
 * Routes notification taps into the app:
 *  - { type: 'reset' }  → start a reset (reset screen)
 *  - { type: 'lesson', lessonId } → open that lesson
 *  - { type: 'insights' } → open the Insights tab
 *
 * Handles both a warm tap (listener) and a cold start (app opened from a
 * notification while killed). No-ops if the native module is missing.
 */
let N: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  N = require('expo-notifications');
} catch {
  N = null;
}

export function useNotificationRouting() {
  const { start } = useResetFlow();
  const { signedIn, onboardingComplete } = useApp();
  const handledColdStart = useRef(false);
  const canRoute = signedIn && onboardingComplete;

  useEffect(() => {
    if (!N) return;

    const route = (data: any) => {
      if (!data || !navigationRef.isReady()) return;
      // only route into the app stack once the user is past auth/onboarding
      if (!canRoute) return;
      const nav = navigationRef as any;
      try {
        if (data.type === 'reset') {
          start();
          nav.navigate('ResetSituation');
        } else if (data.type === 'lesson' && data.lessonId) {
          nav.navigate('VideoLesson', { lessonId: String(data.lessonId) });
        } else if (data.type === 'insights') {
          nav.navigate('Main', { screen: 'ProgressTab' });
        } else if (data.type === 'community') {
          nav.navigate('Main', { screen: 'CommunityTab' });
        }
      } catch {
        // navigating to a screen not in the current stack — ignore
      }
    };

    // cold start: opened by tapping a notification
    if (!handledColdStart.current) {
      handledColdStart.current = true;
      N.getLastNotificationResponseAsync?.()
        .then((resp: any) => {
          const data = resp?.notification?.request?.content?.data;
          if (data) setTimeout(() => route(data), 400); // let navigation mount
        })
        .catch(() => {});
    }

    // warm taps
    const sub = N.addNotificationResponseReceivedListener?.((resp: any) => {
      route(resp?.notification?.request?.content?.data);
    });
    return () => { try { sub?.remove?.(); } catch {} };
  }, [canRoute, start]);
}
