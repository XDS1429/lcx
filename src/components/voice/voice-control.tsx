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
  wakeWordEnabled: boolean;
  serverConfigured: boolean | null;
  browserRecognition: boolean;
  browserSynthesis: boolean;
  onStartWakeWord: () => void;
  onStopWakeWord: () => void;
  onStart: () => void;
  onFinish: () => void;
  onCancel: () => void;
  onStop: () => void;
}

export function VoiceControl({
  phase,
  notice,
  wakeWordEnabled,
  serverConfigured,
  browserRecognition,
  browserSynthesis,
  onStartWakeWord,
  onStopWakeWord,
  onStart,
  onFinish,
  onCancel,
  onStop,
}: VoiceControlProps) {
  const currentPhase = VOICE_PHASES.find((item) => item.id === phase) ?? VOICE_PHASES[0];
  const mainAction =
    phase === 'idle' ? (wakeWordEnabled ? onStopWakeWord : onStartWakeWord) : onFinish;
  const mainLabel =
    phase === 'idle'
      ? wakeWordEnabled
        ? '关闭关键词唤醒'
        : '开启关键词唤醒'
      : phase === 'listening'
        ? '完成识别'
        : phase === 'thinking'
          ? '正在思考'
          : '正在播报';

  return (
    <section className="paper-card flex h-full flex-col items-center rounded-[28px] p-6 sm:p-7" aria-label="语音控制">
      <div className="flex w-full flex-wrap items-center justify-between gap-2.5">
        <span className="text-lg font-bold text-[#425a49]">语音交互台</span>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#edf0e7] px-3 py-1.5 text-sm font-semibold text-[#425a49] sm:text-base">
          <span className={cn('size-2 rounded-full bg-[#7e957b]', (phase === 'listening' || wakeWordEnabled) && 'animate-pulse')} aria-hidden="true" />
          {serverConfigured === null ? '服务检查中' : serverConfigured ? '服务端语音模式' : '浏览器演示模式'}
        </span>
      </div>

      <div className="flex flex-col items-center py-8">
        <div className="relative flex items-center justify-center">
          <svg viewBox="0 0 90 45" className="hand-drawn absolute -top-7 -right-16 w-16 text-[#d99a62]/60" fill="none" aria-hidden="true">
            <path d="M7 34c7-1 9-5 10-11 4-7 13-6 16 0 8-13 26-9 27 4 12-3 20 2 22 7H7Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <button
            type="button"
            data-phase={phase}
            data-wake-active={wakeWordEnabled ? 'true' : undefined}
            onClick={mainAction}
            disabled={
              phase === 'thinking' ||
              phase === 'speaking' ||
              (phase === 'idle' && !wakeWordEnabled && !browserRecognition)
            }
            aria-label={mainLabel}
            aria-pressed={phase === 'idle' ? wakeWordEnabled : undefined}
            className={cn(
              'voice-button flex size-44 items-center justify-center rounded-full border-[7px] text-white shadow-[0_18px_38px_rgba(82,106,85,0.20)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#7e957b]/35 disabled:cursor-default disabled:opacity-100 sm:size-48',
              phase === 'idle' && 'border-[#eef1e9] bg-[#526a55] hover:-translate-y-1 hover:bg-[#425a49]',
              phase === 'listening' && 'border-[#edf0e7] bg-[#6f876d]',
              phase === 'thinking' && 'border-[#f5eadc] bg-[#b7865d]',
              phase === 'speaking' && 'border-[#edf0e7] bg-[#425a49]',
            )}
          >
            {phase === 'idle' && (wakeWordEnabled ? (
              <AudioLines className="size-16" strokeWidth={1.35} aria-hidden="true" />
            ) : (
              <Mic className="size-16" strokeWidth={1.5} aria-hidden="true" />
            ))}
            {phase === 'listening' && <AudioLines className="size-16" strokeWidth={1.35} aria-hidden="true" />}
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
          <p className="text-3xl font-bold tracking-tight text-[#29372f]">{currentPhase.label}</p>
          <p className="mt-2 text-base font-medium text-[#5f6d63]">
            {phase === 'idle'
              ? wakeWordEnabled
                ? '请说“小张老师”，无需再次点击'
                : '首次点击授权，之后使用关键词唤醒'
              : mainLabel}
          </p>
        </div>

        {phase === 'idle' && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Button
              onClick={onStart}
              variant="ghost"
              className="h-11 rounded-full px-5 text-base font-semibold text-[#526158]"
            >
              <Mic aria-hidden="true" />单次手动聆听
            </Button>
            {wakeWordEnabled && (
              <Button
                onClick={onStopWakeWord}
                variant="outline"
                className="h-11 rounded-full border-[#d9d2c4] bg-white px-5 text-base font-semibold"
              >
                <X aria-hidden="true" />关闭唤醒
              </Button>
            )}
          </div>
        )}
        {phase === 'listening' && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <Button onClick={onFinish} className="h-11 rounded-full bg-[#526a55] px-5 text-base font-semibold">
              <Check aria-hidden="true" />完成识别
            </Button>
            <Button onClick={onCancel} variant="ghost" className="h-11 rounded-full px-5 text-base font-semibold text-[#526158]">
              <X aria-hidden="true" />取消聆听
            </Button>
          </div>
        )}
        {phase === 'speaking' && (
          <Button onClick={onStop} variant="outline" className="mt-5 h-11 rounded-full border-[#d9d2c4] bg-white px-5 text-base font-semibold">
            <Square aria-hidden="true" />停止播报
          </Button>
        )}
        {phase === 'thinking' && (
          <span className="mt-5 inline-flex items-center gap-2 text-base font-semibold text-[#805b3b]"><Loader2 className="size-4 animate-spin" aria-hidden="true" />正在匹配并准备播报</span>
        )}
      </div>

      <PhaseIndicator phase={phase} />

      <p className="mt-5 min-h-12 text-center text-base font-medium leading-6 text-[#526158] sm:text-base" role="status" aria-live="polite" aria-atomic="true">
        {notice}
      </p>
      {!browserRecognition && (
        <p className="mt-2 text-center text-base font-medium leading-6 text-[#805b3b]">
          {browserSynthesis
            ? '当前浏览器不支持关键词唤醒，可使用单次手动聆听或文本输入。'
            : '可使用单次手动聆听或文本输入完成演示。'}
        </p>
      )}
      {browserRecognition && (
        <p className="mt-2 text-center text-base font-medium leading-6 text-[#5f6d63]">
          关键词待机使用浏览器识别，首次需授权麦克风
        </p>
      )}
      {serverConfigured && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-base font-medium text-[#5f6d63]"><Volume2 className="size-4" aria-hidden="true" />唤醒后的指令录音最长 8 秒</p>
      )}
    </section>
  );
}
