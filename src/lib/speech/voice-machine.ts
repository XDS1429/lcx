export type VoicePhase = 'idle' | 'listening' | 'thinking' | 'speaking';

export type VoiceEvent =
  | 'START'
  | 'CANCEL'
  | 'RECOGNIZED'
  | 'SUBMIT'
  | 'SYNTHESIZED'
  | 'FINISH'
  | 'STOP';

export const VOICE_PHASES: Array<{
  id: VoicePhase;
  label: string;
  description: string;
}> = [
  { id: 'idle', label: '等待唤醒', description: '准备接收新指令' },
  { id: 'listening', label: '正在聆听', description: '正在获取识别内容' },
  { id: 'thinking', label: '正在思考', description: '正在匹配固定话术' },
  { id: 'speaking', label: '正在播报', description: '正在播放固定回复' },
];

export function voiceMachineReducer(phase: VoicePhase, event: VoiceEvent): VoicePhase {
  switch (event) {
    case 'START':
      return phase === 'idle' ? 'listening' : phase;
    case 'RECOGNIZED':
      return phase === 'listening' ? 'thinking' : phase;
    case 'SUBMIT':
      return 'thinking';
    case 'SYNTHESIZED':
      return phase === 'thinking' || phase === 'speaking' ? 'speaking' : phase;
    case 'CANCEL':
    case 'FINISH':
    case 'STOP':
      return 'idle';
    default:
      return phase;
  }
}
