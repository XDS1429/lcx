import type { SpeechSettings } from './types';

export interface SpeechServiceStatus {
  serverConfigured: boolean;
}

export async function fetchSpeechServiceStatus(): Promise<SpeechServiceStatus> {
  const response = await fetch('/api/speech/status', { cache: 'no-store' });
  if (!response.ok) return { serverConfigured: false };
  const data = (await response.json()) as Partial<SpeechServiceStatus>;
  return { serverConfigured: data.serverConfigured === true };
}

export async function requestServerSpeech(
  text: string,
  settings: SpeechSettings,
): Promise<Blob | null> {
  try {
    const response = await fetch('/api/speech/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, rate: settings.rate, volume: settings.volume }),
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('audio/')) {
      return null;
    }
    return await response.blob();
  } catch {
    return null;
  }
}

export async function requestServerRecognition(audio: Blob): Promise<string | null> {
  try {
    const bytes = new Uint8Array(await audio.arrayBuffer());
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    const response = await fetch('/api/speech/asr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64: window.btoa(binary) }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { available?: boolean; text?: string };
    return data.available && typeof data.text === 'string' ? data.text : null;
  } catch {
    return null;
  }
}
