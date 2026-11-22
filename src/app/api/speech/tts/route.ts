import { HeaderUtils } from 'coze-coding-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';
import {
  isServerSpeechConfigured,
  synthesizeSpeech,
} from '@/server/speech-service';

export const runtime = 'nodejs';
const MAX_REPLY_LENGTH = 1_000;

export async function POST(request: NextRequest) {
  if (!isServerSpeechConfigured()) {
    return NextResponse.json({ available: false }, { status: 503 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const text = typeof body.text === 'string' ? body.text : '';
    const rate = typeof body.rate === 'number' ? body.rate : 1;
    const volume = typeof body.volume === 'number' ? body.volume : 0.9;

    if (!text.trim() || text.length > MAX_REPLY_LENGTH) {
      return NextResponse.json({ error: '回复文本长度不符合要求' }, { status: 400 });
    }
    if (
      !Number.isFinite(rate) ||
      !Number.isFinite(volume) ||
      rate < 0.6 ||
      rate > 1.5 ||
      volume < 0 ||
      volume > 1
    ) {
      return NextResponse.json({ error: '语音参数不符合要求' }, { status: 400 });
    }

    const forwardHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const audio = await synthesizeSpeech({ text, rate, volume, forwardHeaders });

    return new NextResponse(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ available: false }, { status: 503 });
  }
}
