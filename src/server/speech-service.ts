import { ASRClient, Config, TTSClient } from 'coze-coding-dev-sdk';

interface SynthesizeSpeechInput {
  text: string;
  rate: number;
  volume: number;
  forwardHeaders: Record<string, string>;
}

const DEFAULT_SPEECH_RATE = -8;

export function isServerSpeechConfigured(): boolean {
  try {
    const config = new Config();
    return Boolean(config.apiKey) || config.usesUserRuntimeAuth();
  } catch {
    return false;
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export async function synthesizeSpeech({
  text,
  rate,
  volume,
  forwardHeaders,
}: SynthesizeSpeechInput): Promise<ArrayBuffer> {
  const config = new Config();
  const client = new TTSClient(config, forwardHeaders);
  const result = await client.synthesize({
    uid: 'xiao-zhang-teacher-demo',
    text,
    speaker: 'zh_female_santongyongns_saturn_bigtts',
    audioFormat: 'mp3',
    sampleRate: 24000,
    speechRate: Math.round(clamp((rate - 1) * 100 + DEFAULT_SPEECH_RATE, -50, 100)),
    loudnessRate: Math.round(clamp((volume - 0.5) * 100, -50, 50)),
  });

  const audioResponse = await fetch(result.audioUri, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  if (!audioResponse.ok) {
    throw new Error('Speech audio retrieval failed');
  }

  return audioResponse.arrayBuffer();
}

export async function recognizeSpeech(
  audioBase64: string,
  forwardHeaders: Record<string, string>,
): Promise<string> {
  const config = new Config();
  const client = new ASRClient(config, forwardHeaders);
  const result = await client.recognize({
    uid: 'xiao-zhang-teacher-demo',
    base64Data: audioBase64,
  });
  return result.text;
}
