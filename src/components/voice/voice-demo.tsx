'use client';

import { BadgeCheck, Chrome, Leaf } from 'lucide-react';
import { NurseryDecorations } from '@/components/decorations';
import { useApp } from '@/components/providers/app-provider';
import { ConversationPanels } from '@/components/voice/conversation-panels';
import { TextSimulator } from '@/components/voice/text-simulator';
import { VoiceControl } from '@/components/voice/voice-control';
import { useVoiceDemo } from '@/hooks/use-voice-demo';

export function VoiceDemo() {
  const { scenarios, settings } = useApp();
  const voice = useVoiceDemo(scenarios, settings);

  return (
    <div className="relative mx-auto max-w-[1440px] px-4 pb-4 pt-8 sm:px-6 sm:pt-10 lg:px-10 lg:pt-12">
      <NurseryDecorations />
      <section className="relative z-10 mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e4d7c6] bg-[#f4e2ce]/45 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#805b3b]">
            <Leaf className="size-3.5" />托育保育 · 幼儿照护比赛现场演示
          </div>
          <h1 className="brand-title text-[42px] font-bold leading-tight text-[#29372f] sm:text-[54px]">小张老师</h1>
          <p className="mt-2 text-lg font-medium tracking-[0.08em] text-[#526a55] sm:text-xl">托育照护语音交互演示</p>
        </div>
        <div className="max-w-xl lg:pb-1 lg:text-right">
          <p className="text-sm leading-7 text-[#68766b] sm:text-[15px]">
            说“小张老师”唤醒，或直接说出完整照护问题。每一次回应都来自可管理的固定话术，原样展示，原样播报。
          </p>
          <div className="mt-3 flex flex-wrap gap-2 lg:justify-end">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#526a55]"><BadgeCheck className="size-4" />8 条内置照护场景</span>
            <span className="hidden text-[#c6c8bf] sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#718076]"><Chrome className="size-4" />推荐 Chrome / Edge</span>
          </div>
        </div>
      </section>

      <div className="relative z-10 grid items-stretch gap-4 xl:grid-cols-[350px_minmax(0,1fr)]">
        <VoiceControl
          phase={voice.phase}
          notice={voice.notice}
          serverConfigured={voice.serverConfigured}
          browserRecognition={voice.capabilities.browserRecognition}
          browserSynthesis={voice.capabilities.browserSynthesis}
          onStart={() => void voice.startListening()}
          onFinish={voice.finishListening}
          onCancel={voice.cancelListening}
          onStop={voice.stopSpeaking}
        />
        <ConversationPanels
          phase={voice.phase}
          recognizedText={voice.recognizedText}
          interimText={voice.interimText}
          displayedReply={voice.displayedReply}
          lastReply={voice.lastReply}
          lastResult={voice.lastResult}
          onStop={voice.stopSpeaking}
          onReplay={voice.replay}
        />
      </div>

      <div className="relative z-10">
        <TextSimulator phase={voice.phase} onSubmit={voice.submitText} />
      </div>
    </div>
  );
}
