import { NextResponse } from 'next/server';
import { isServerSpeechConfigured } from '@/server/speech-service';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json(
    { serverConfigured: isServerSpeechConfigured() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
