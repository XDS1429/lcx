'use client';

import { MessageSquareText, RotateCcw, Sparkle, Square, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MatchType, SpeechResolution } from '@/lib/speech/types';
import type { VoicePhase } from '@/lib/speech/voice-machine';
import { cn } from '@/lib/utils';

const matchLabels: Record<MatchType, string> = {
  keyword: '明确关键词',
  similarity: '相似语句',
  wake: '唤醒词',
  unmatched: '未匹配',
};

interface ConversationPanelsProps {
  phase: VoicePhase;
  recognizedText: string;
  interimText: string;
  displayedReply: string;
  lastReply: string;
  lastResult: SpeechResolution | null;
  onStop: () => void;
  onReplay: () => void;
}

export function ConversationPanels({
  phase,
  recognizedText,
  interimText,
  displayedReply,
  lastReply,
  lastResult,
  onStop,
  onReplay,
}: ConversationPanelsProps) {
  const visibleRecognition = recognizedText || interimText;
  const sceneName = lastResult
    ? lastResult.matchType === 'wake'
      ? '唤醒响应'
      : (lastResult.scene?.name ?? '未命中场景')
    : '等待本次指令';

  return (
    <div className="flex h-full min-w-0 flex-col gap-5">
      <section className="paper-card grid grid-cols-2 gap-5 rounded-[24px] px-5 py-5 sm:px-7" aria-label="最近匹配结果">
        <div className="min-w-0">
          <p className="text-base font-semibold text-[#5f6d63]">最近一次命中场景</p>
          <p className="mt-2 truncate text-xl font-bold text-[#29372f] sm:text-2xl" title={sceneName}>{sceneName}</p>
        </div>
        <div className="min-w-0 border-l border-[#e8e1d4] pl-5">
          <p className="text-base font-semibold text-[#5f6d63]">匹配方式</p>
          <Badge
            variant="secondary"
            className={cn(
              'mt-2 px-3 py-1.5 text-base font-semibold',
              lastResult?.matchType === 'unmatched'
                ? 'bg-[#f4e2ce] text-[#704c30]'
                : 'bg-[#edf0e7] text-[#425a49]',
            )}
          >
            {lastResult ? matchLabels[lastResult.matchType] : '尚未匹配'}
          </Badge>
        </div>
      </section>

      <div className="grid flex-1 gap-5 md:grid-cols-2">
        <section className="paper-card flex min-h-[340px] min-w-0 flex-col rounded-[28px] p-6 sm:p-7" aria-labelledby="recognized-text-title">
          <div className="flex items-center justify-between gap-3 border-b border-[#eee7da] pb-5">
            <h2 id="recognized-text-title" className="flex items-center gap-2.5 text-lg font-bold">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#f4e2ce]/65 text-[#9a6a41]"><MessageSquareText className="size-5" aria-hidden="true" /></span>
              当前识别文字
            </h2>
            {interimText && !recognizedText && <Badge variant="outline" className="border-[#d9d2c4] px-3 py-1 text-base text-[#5f6d63]">识别中</Badge>}
          </div>
          <div className="flex flex-1 items-center py-7">
            <p className={cn(
              'whitespace-pre-wrap break-words text-[24px] font-medium leading-[1.7] tracking-wide sm:text-[26px]',
              !visibleRecognition && 'text-lg font-normal leading-8 text-[#647267]',
              interimText && !recognizedText && 'text-[#526158]',
            )}>
              {visibleRecognition || '识别到的中文内容会清楚地显示在这里。'}
            </p>
          </div>
          <p className="text-base font-medium leading-6 text-[#5f6d63]">支持“唤醒词”或“小张老师＋完整指令”</p>
        </section>

        <section className="paper-card flex min-h-[340px] min-w-0 flex-col rounded-[28px] border-[#dce4d7] bg-[#f8faf4] p-6 sm:p-7" aria-labelledby="reply-text-title">
          <div className="flex items-center justify-between gap-3 border-b border-[#e2e8dc] pb-5">
            <h2 id="reply-text-title" className="flex items-center gap-2.5 text-lg font-bold">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#e5eadf] text-[#526a55]"><Volume2 className="size-5" aria-hidden="true" /></span>
              小张老师回复
            </h2>
            <Badge variant="secondary" className="hidden bg-[#e5eadf] px-3 py-1 text-base font-semibold text-[#425a49] lg:inline-flex">固定话术 · 逐字输出</Badge>
          </div>
          <div className="flex flex-1 items-center py-7">
            <p
              aria-label={lastReply ? `完整回复：${lastReply}` : '等待回复'}
              className={cn(
                'whitespace-pre-wrap break-words text-[25px] font-semibold leading-[1.65] tracking-wide text-[#293f31] sm:text-[28px] 2xl:text-[30px]',
                !displayedReply && 'text-lg font-normal leading-8 text-[#647267]',
                phase === 'speaking' && displayedReply && 'reply-caret',
              )}
            >
              {displayedReply || '命中话术后，固定回复会在这里逐字显示并播报。'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onStop}
              disabled={phase !== 'speaking'}
              className="h-11 rounded-full border-[#d5ddd0] bg-white px-5 text-base font-semibold text-[#425a49]"
            >
              <Square aria-hidden="true" />停止播报
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onReplay}
              disabled={!lastReply || phase === 'thinking' || phase === 'listening'}
              className="h-11 rounded-full px-5 text-base font-semibold text-[#425a49]"
            >
              <RotateCcw aria-hidden="true" />重新播放
            </Button>
            {phase === 'thinking' && <Sparkle className="ml-auto size-5 animate-pulse text-[#b7865d]" aria-hidden="true" />}
          </div>
        </section>
      </div>
    </div>
  );
}
