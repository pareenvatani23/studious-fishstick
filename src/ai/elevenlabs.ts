import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { ELEVENLABS_API_KEY, ELEVENLABS_MODEL, ELEVENLABS_VOICE_ID, AI_TIMEOUT_MS } from './config';

/**
 * ElevenLabs TTS → a playable URI. On native we write the mp3 to the cache dir;
 * on web we return an object URL. (ElevenLabs avatar VIDEO has no API yet, so
 * this is audio played over the in-app visual.)
 */
export async function synthesize(text: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_MODEL,
          // calm + expressive + steady: moderate stability, high similarity, gentle style
          voice_settings: { stability: 0.5, similarity_boost: 0.85, style: 0.3, use_speaker_boost: true },
        }),
      }
    );
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}`);
  const buf = await res.arrayBuffer();

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
