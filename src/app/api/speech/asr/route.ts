import { HeaderUtils } from 'coze-coding-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { isServerSpeechConfigured, recognizeSpeech } from '@/server/speech-service';

export const runtime = 'nodejs';
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isServerSpeechConfigured()) {
    return NextResponse.json({ available: false }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64 : '';
    if (!audioBase64 || !/^[A-Za-z0-9+/]*={0,2}$/.test(audioBase64)) {
      return NextResponse.json({ error: '音频数据不符合要求' }, { status: 400 });
    }

    const audio = Buffer.from(audioBase64, 'base64');
    if (audio.length === 0 || audio.length > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: '音频大小不符合要求' }, { status: 400 });
    }

    const forwardHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const text = await recognizeSpeech(audioBase64, forwardHeaders);
    return NextResponse.json(
      { available: true, text },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ available: false }, { status: 503 });
  }
}
