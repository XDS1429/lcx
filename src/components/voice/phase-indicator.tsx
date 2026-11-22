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
    <ol className="grid w-full grid-cols-2 gap-2" aria-label="语音交互阶段">
      {VOICE_PHASES.map((item, index) => {
        const active = item.id === phase;
        const Icon = phaseIcons[item.id];
        return (
          <li
            key={item.id}
            aria-current={active ? 'step' : undefined}
            className={cn(
              'relative min-h-[78px] rounded-[17px] border p-3 transition-all duration-300',
              active
                ? 'border-[#526a55] bg-[#526a55] text-white shadow-[0_8px_22px_rgba(82,106,85,0.18)]'
                : 'border-[#e7e1d5] bg-[#fbf8f1] text-[#68766b]',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Icon className={cn('size-4', active ? 'text-[#f4e2ce]' : 'text-[#8a978b]')} />
              <span className={cn('tabular-number text-[10px]', active ? 'text-white/60' : 'text-[#9a9f96]')}>
                0{index + 1}
              </span>
            </div>
            <p className={cn('mt-2 text-sm font-semibold', active ? 'text-white' : 'text-[#526158]')}>{item.label}</p>
            <p className={cn('mt-0.5 hidden text-[10px] sm:block', active ? 'text-white/70' : 'text-[#879087]')}>
              {item.description}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
