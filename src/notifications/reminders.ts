/**
 * Local reminder scheduling. expo-notifications is a NATIVE module, so it's
 * loaded defensively: on a build that doesn't include it (e.g. an OTA reaching
 * an older APK), this whole module no-ops instead of crashing.
 *
 * Because local notifications can't run code at fire time, we PRE-GENERATE the
 * next few days of personalised messages (see ai/openai.generateReminders) and
 * schedule them — refreshed whenever the app opens or a reset is saved.
 */
let N: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  N = require('expo-notifications');
} catch {
  N = null;
}

export const notificationsAvailable = !!N;

const ANDROID_CHANNEL = 'reminders';

let handlerSet = false;
function ensureSetup() {
  if (!N) return;
  if (!handlerSet) {
    try {
      N.setNotificationHandler({
        handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
      });
      handlerSet = true;
    } catch {}
  }
}

export async function ensureAndroidChannel() {
  if (!N) return;
  try {
    const { Platform } = require('react-native');
    if (Platform.OS === 'android') {
      await N.setNotificationChannelAsync(ANDROID_CHANNEL, {
        name: 'Daily check-ins',
        importance: N.AndroidImportance?.DEFAULT ?? 3,
        sound: null,
      });
    }
  } catch {}
}

/** Ask for permission. Returns true if granted. */
export async function ensurePermission(): Promise<boolean> {
  if (!N) return false;
  ensureSetup();
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    const req = await N.requestPermissionsAsync();
    return !!req.granted;
  } catch {
    return false;
  }
}

export interface ReminderMessage {
  title: string;
  body: string;
}

/**
 * Cancel everything and schedule one notification per day at (hour:minute) for
 * the next `messages.length` days. Small window = never spammy / stale.
 */
export async function reschedule(opts: {
  enabled: boolean;
  hour: number;
  minute: number;
  messages: ReminderMessage[];
}): Promise<void> {
  if (!N) return;
  ensureSetup();
  await ensureAndroidChannel();
  const isAndroid = require('react-native').Platform.OS === 'android';
  try {
    await N.cancelAllScheduledNotificationsAsync();
    if (!opts.enabled || opts.messages.length === 0) return;

    const now = new Date();
    for (let i = 0; i < opts.messages.length; i++) {
      const when = new Date();
      when.setHours(opts.hour, opts.minute, 0, 0);
      // first message: today if the time is still ahead, else tomorrow; then +1 day each
      if (i === 0 && when <= now) when.setDate(when.getDate() + 1);
      else if (i > 0) when.setDate(when.getDate() + (when <= now ? i + 1 : i));

      const msg = opts.messages[i];
      await N.scheduleNotificationAsync({
        content: { title: msg.title, body: msg.body, sound: null },
        trigger: isAndroid ? { channelId: ANDROID_CHANNEL, date: when } : { date: when },
      });
    }
  } catch {
    // scheduling failures shouldn't break the app
  }
}
