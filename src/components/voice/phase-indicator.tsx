import { AudioLines, ListFilter, Mic2, Radio, type LucideIcon } from 'lucide-react';
import { VOICE_PHASES, type VoicePhase } from '@/lib/speech/voice-machine';
import { cn } from '@/lib/utils';

const phaseIcons: Record<VoicePhase, LucideIcon> = {
  idle: Radio,
  listening: Mic2,
  thinking: ListFilter,
  speaking: AudioLines,
};

export function PhaseIndicator({ phase }: { phase: VoicePhase }) {
  return (
    <ol className="grid w-full grid-cols-2 gap-2.5" aria-label="语音交互阶段">
      {VOICE_PHASES.map((item, index) => {
        const active = item.id === phase;
        const Icon = phaseIcons[item.id];
        return (
          <li
            key={item.id}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'relative min-h-[104px] rounded-[18px] border p-3.5 transition-all duration-300',
              active
                ? 'border-[#526a55] bg-[#526a55] text-white shadow-[0_8px_22px_rgba(82,106,85,0.18)]'
                : 'border-[#ddd7ca] bg-[#fbf8f1] text-[#526158]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Icon className={cn('size-5', active ? 'text-[#f4e2ce]' : 'text-[#68766b]')} aria-hidden="true" />
              <span className={cn('tabular-number text-xs font-semibold', active ? 'text-white/80' : 'text-[#5f6d63]')}>
                0{index + 1}
              </span>
            </div>
            <p className={cn('mt-2 text-base font-bold sm:text-lg', active ? 'text-white' : 'text-[#425a49]')}>{item.label}</p>
            <p className={cn('mt-1 text-sm font-medium leading-6 sm:text-base', active ? 'text-white/85' : 'text-[#5f6d63]')}>
              {item.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
