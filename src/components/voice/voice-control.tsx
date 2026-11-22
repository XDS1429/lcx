'use client';

import { AudioLines, Check, Loader2, Mic, Square, Volume2, X } from 'lucide-react';
import { PhaseIndicator } from '@/components/voice/phase-indicator';
import { Button } from '@/components/ui/button';
import type { VoicePhase } from '@/lib/speech/voice-machine';
import { VOICE_PHASES } from '@/lib/speech/voice-machine';
import { cn } from '@/lib/utils';

interface VoiceControlProps {
  phase: VoicePhase;
  notice: string;
  serverConfigured: boolean | null;
  browserRecognition: boolean;
  browserSynthesis: boolean;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onStop: () => void;
}

export function VoiceControl({
  phase,
  notice,
  serverConfigured,
  browserRecognition,
  browserSynthesis,
  onStart,
  onFinish,
  onCancel,
  onStop,
}: VoiceControlProps) {
  const currentPhase = VOICE_PHASES.find((item) => item.id === phase) ?? VOICE_PHASES[0];
  const mainAction = phase === 'idle' ? onStart : onFinish;
  const mainLabel =
    phase === 'idle'
      ? '开始聆听'
      : phase === 'listening'
        ? '完成识别'
        : phase === 'thinking'
          ? '正在思考'
          : '正在播报';

  return (
    <section className="paper-card flex flex-col items-center rounded-[28px] p-5 sm:p-6" aria-label="语音控制">
      <div className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-semibold text-[#425a49]">语音交互台</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf0e7] px-2.5 py-1 text-[11px] font-medium text-[#526a55]">
          <span className={cn('size-1.5 rounded-full bg-[#7e957b]', phase === 'listening' && 'animate-pulse')} />
          {serverConfigured === null ? '服务检查中' : serverConfigured ? '服务端语音模式' : '浏览器演示模式'}
        </span>
      </div>

      <div className="flex flex-col items-center py-7">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 90 45" className="hand-drawn absolute -top-7 -right-16 w-16 text-[#d99a62]/60" fill="none" aria-hidden="true">
            <path d="M7 34c7-1 9-5 10-11 4-7 13-6 16 0 8-13 26-9 27 4 12-3 20 2 22 7H7Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <button
            type="button"
            data-phase={phase}
            onClick={mainAction}
            disabled={phase === 'thinking' || phase === 'speaking'}
            aria-label={mainLabel}
            className={cn(
              'voice-button flex size-40 items-center justify-center rounded-full border-[7px] text-white shadow-[0_18px_38px_rgba(82,106,85,0.20)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7e957b]/35 disabled:cursor-default disabled:opacity-100 sm:size-44',
              phase === 'idle' && 'border-[#eef1e9] bg-[#526a55] hover:-translate-y-1 hover:bg-[#425a49]',
              phase === 'listening' && 'border-[#edf0e7] bg-[#6f876d]',
              phase === 'thinking' && 'border-[#f5eadc] bg-[#b7865d]',
              phase === 'speaking' && 'border-[#edf0e7] bg-[#425a49]',
            )}
          >
            {phase === 'idle' && <Mic className="size-14" strokeWidth={1.5} />}
            {phase === 'listening' && <AudioLines className="size-16" strokeWidth={1.35} />}
            {phase === 'thinking' && (
              <span className="flex items-center gap-2" aria-hidden="true">
                <span className="thinking-dot size-3 rounded-full bg-white" />
                <span className="thinking-dot size-3 rounded-full bg-white" />
                <span className="thinking-dot size-3 rounded-full bg-white" />
              </span>
            )}
            {phase === 'speaking' && (
              <span className="flex h-14 items-center gap-2" aria-hidden="true">
                {[10, 22, 14, 28].map((height, index) => (
                  <span key={index} className="sound-bar w-2 rounded-full bg-[#f4e2ce]" style={{ height }} />
                ))}
              </span>
            )}
          </button>
        </div>

        <div className="mt-7 text-center">
          <p className="text-2xl font-semibold tracking-tight text-[#29372f]">{currentPhase.label}</p>
          <p className="mt-1 text-sm text-[#718076]">
            {phase === 'idle' ? '轻触圆形按钮，开始现场演示' : mainLabel}
          </p>
        </div>

        {phase === 'listening' && (
          <div className="mt-4 flex items-center gap-2">
            <Button onClick={onFinish} size="sm" className="h-10 rounded-full bg-[#526a55] px-4">
              <Check />完成识别
            </Button>
            <Button onClick={onCancel} variant="ghost" size="sm" className="h-10 rounded-full px-4 text-[#68766b]">
              <X />取消聆听
            </Button>
          </div>
        )}
        {phase === 'speaking' && (
          <Button onClick={onStop} variant="outline" size="sm" className="mt-4 h-10 rounded-full border-[#d9d2c4] bg-white px-5">
            <Square />停止播报
          </Button>
        )}
        {phase === 'thinking' && (
          <span className="mt-4 inline-flex items-center gap-2 text-xs text-[#8b6b4d]"><Loader2 className="size-3.5 animate-spin" />正在匹配并准备播报</span>
        )}
      </div>

      <PhaseIndicator phase={phase} />

      <p className="mt-4 min-h-10 text-center text-xs leading-5 text-[#68766b]" role="status">
        {notice}
      </p>
      {!serverConfigured && !browserRecognition && (
        <p className="mt-1 text-center text-[11px] leading-5 text-[#8b6b4d]">
          {browserSynthesis ? '当前浏览器不支持语音识别，可使用下方文本输入。' : '可使用文本输入完成逐字回复演示。'}
        </p>
      )}
      {serverConfigured && (
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#718076]"><Volume2 className="size-3" />录音最长 8 秒，说完可手动完成</p>
      )}
    </section>
  );
}
