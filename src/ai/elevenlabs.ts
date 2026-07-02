import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { invokeTTS } from './edge';

/**
 * Voice narration via the `tts` edge function (ElevenLabs key lives server-side).
 * Returns a playable URI: on native we write the mp3 to the cache dir; on web we
 * return an object URL.
 */
export async function synthesize(text: string): Promise<string> {
  const buf = await invokeTTS(text);

  if (Platform.OS === 'web') {
    const blob = new Blob([buf], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  }
  const base64 = arrayBufferToBase64(buf);
  const uri = `${FileSystem.cacheDirectory}reset-${Date.now()}.mp3`;
  await FileSystem.writeAsStringAsync(uri, base64, { encoding: FileSystem.EncodingType.Base64 });
  return uri;
}

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b3 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[b1 >> 2];
    out += B64[((b1 & 3) << 4) | (b2 >> 4)];
    out += i + 1 < bytes.length ? B64[((b2 & 15) << 2) | (b3 >> 6)] : '=';
    out += i + 2 < bytes.length ? B64[b3 & 63] : '=';
  }
  return out;
}
