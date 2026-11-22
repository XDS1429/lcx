'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import {
  createBrowserRecognition,
  getRecognitionConstructor,
  selectChineseVoice,
} from '@/lib/speech/browser-recognition';
import {
  fetchSpeechServiceStatus,
  requestServerRecognition,
  requestServerSpeech,
} from '@/lib/speech/client-api';
import { resolveSpeechInput } from '@/lib/speech/matcher';
import type { Scenario, SpeechResolution, SpeechSettings } from '@/lib/speech/types';
import { voiceMachineReducer, type VoicePhase } from '@/lib/speech/voice-machine';

interface VoiceCapabilities {
  browserRecognition: boolean;
  browserSynthesis: boolean;
  mediaRecording: boolean;
}

export function useVoiceDemo(scenarios: Scenario[], settings: SpeechSettings) {
  const [phase, dispatch] = useReducer(voiceMachineReducer, 'idle');
  const phaseRef = useRef<VoicePhase>('idle');
  const [recognizedText, setRecognizedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [displayedReply, setDisplayedReply] = useState('');
  const [lastReply, setLastReply] = useState('');
  const [lastResult, setLastResult] = useState<SpeechResolution | null>(null);
  const [notice, setNotice] = useState('点击“开始聆听”，或先输入一句话体验。');
  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);
  const [capabilities, setCapabilities] = useState<VoiceCapabilities>({
    browserRecognition: false,
    browserSynthesis: false,
    mediaRecording: false,
  });

  const scenariosRef = useRef(scenarios);
  const settingsRef = useRef(settings);
  const sessionRef = useRef(0);
  const processingRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scenariosRef.current = scenarios;
  }, [scenarios]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const mediaRecording = Boolean(
      typeof navigator.mediaDevices?.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined',
    );
    setCapabilities({
      browserRecognition: Boolean(getRecognitionConstructor()),
      browserSynthesis: 'speechSynthesis' in window,
      mediaRecording,
    });

    let active = true;
    void fetchSpeechServiceStatus().then((status) => {
      if (active) setServerConfigured(status.serverConfigured);
    });
    return () => {
      active = false;
    };
  }, []);

  function transition(event: Parameters<typeof dispatch>[0]) {
    phaseRef.current = voiceMachineReducer(phaseRef.current, event);
    dispatch(event);
  }

  function clearTypingTimer() {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }

  function clearRecordingTimer() {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }

  function clearFinishTimer() {
    if (finishTimerRef.current) {
      clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }

  function stopMediaTracks() {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }

  function stopPlayback() {
    clearTypingTimer();
    clearFinishTimer();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  function stopCapture() {
    clearRecordingTimer();
    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    }

    const recorder = recorderRef.current;
    recorderRef.current = null;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    stopMediaTracks();
  }

  function beginTyping(text: string, session: number) {
    clearTypingTimer();
    const characters = [...text];
    let index = 0;
    setDisplayedReply('');
    if (characters.length === 0) return;

    typingTimerRef.current = setInterval(() => {
      if (sessionRef.current !== session) {
        clearTypingTimer();
        return;
      }
      index += 1;
      setDisplayedReply(characters.slice(0, index).join(''));
      if (index >= characters.length) clearTypingTimer();
    }, Math.max(28, Math.round(54 / settingsRef.current.rate)));
  }

  function finishPlayback(text: string, session: number, resumeListening: boolean) {
    if (sessionRef.current !== session) return;
    clearTypingTimer();
    clearFinishTimer();
    setDisplayedReply(text);
    transition('FINISH');

    if (resumeListening) {
      finishTimerRef.current = setTimeout(() => {
        if (sessionRef.current === session) void startListening();
      }, 320);
    }
  }

  function speakWithoutAudio(text: string, session: number, resumeListening: boolean) {
    transition('SYNTHESIZED');
    beginTyping(text, session);
    const duration = Math.max(1_200, [...text].length * 60);
    finishTimerRef.current = setTimeout(
      () => finishPlayback(text, session, resumeListening),
      duration,
    );
  }

  function speakInBrowser(text: string, session: number, resumeListening: boolean): boolean {
    if (!('speechSynthesis' in window)) return false;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = settingsRef.current.rate;
    utterance.volume = settingsRef.current.volume;
    const voice = selectChineseVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => finishPlayback(text, session, resumeListening);
    utterance.onerror = () => {
      if (sessionRef.current !== session) return;
      setNotice('播报已结束，可重新播放或继续聆听。');
      finishPlayback(text, session, false);
    };

    transition('SYNTHESIZED');
    beginTyping(text, session);
    window.speechSynthesis.speak(utterance);
    return true;
  }

  async function speakReply(text: string, session: number, resumeListening: boolean) {
    if (sessionRef.current !== session) return;
    stopPlayback();

    if (serverConfigured) {
      const audioBlob = await requestServerSpeech(text, settingsRef.current);
      if (sessionRef.current !== session) return;

      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audioUrlRef.current = url;
        audioRef.current = audio;
        audio.volume = settingsRef.current.volume;
        audio.onended = () => finishPlayback(text, session, resumeListening);
        audio.onerror = () => {
          if (sessionRef.current !== session) return;
          setNotice('音频播放未完成，请重新播放。');
          finishPlayback(text, session, false);
        };

        try {
          transition('SYNTHESIZED');
          beginTyping(text, session);
          await audio.play();
          return;
        } catch {
          stopPlayback();
          setNotice('自动播放受浏览器限制，已尝试使用浏览器语音。');
        }
      } else {
        setNotice('服务端合成暂不可用，已回退浏览器语音。');
      }
    }

    if (!speakInBrowser(text, session, resumeListening)) {
      setNotice('当前环境无法播放语音，正在逐字显示固定回复。');
      speakWithoutAudio(text, session, resumeListening);
    }
  }

  function processText(rawText: string, session: number, fromListening: boolean) {
    if (sessionRef.current !== session || processingRef.current) return;
    const text = rawText.trim();
    if (!text) {
      setNotice('没有听清，请再说一次，或使用文本输入。');
      transition('FINISH');
      return;
    }

    processingRef.current = true;
    transition(fromListening ? 'RECOGNIZED' : 'SUBMIT');
    setRecognizedText(text);
    setInterimText('');

    const result = resolveSpeechInput(text, scenariosRef.current);
    setLastResult(result);
    setLastReply(result.reply);

    void speakReply(result.reply, session, result.matchType === 'wake').finally(() => {
      processingRef.current = false;
    });
  }

  function startBrowserRecognition(session: number) {
    const recognition = createBrowserRecognition();
    if (!recognition || sessionRef.current !== session) {
      setNotice('当前浏览器不支持语音识别，请使用文本输入完成演示。');
      transition('CANCEL');
      return;
    }

    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      if (sessionRef.current !== session) return;
      let finalTranscript = '';
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal) finalTranscript += result[0].transcript;
        else interimTranscript += result[0].transcript;
      }

      setInterimText(interimTranscript);
      if (finalTranscript) processText(finalTranscript, session, true);
    };
    recognition.onerror = (event) => {
      if (sessionRef.current !== session || event.error === 'aborted') return;
      const message =
        event.error === 'not-allowed'
          ? '麦克风权限未开启，请允许访问或改用文本输入。'
          : event.error === 'no-speech'
            ? '没有听到声音，请靠近麦克风后再试。'
            : '浏览器识别暂不可用，请重试或改用文本输入。';
      setNotice(message);
      transition('CANCEL');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (
        sessionRef.current === session &&
        phaseRef.current === 'listening' &&
        !processingRef.current
      ) {
        setNotice((current) =>
          current === '正在聆听，请说“小张老师”或完整指令。'
            ? '本次聆听已结束，可再次开始或输入文字。'
            : current,
        );
        transition('CANCEL');
      }
    };

    try {
      recognition.start();
      setNotice('正在聆听，请说“小张老师”或完整指令。');
    } catch {
      setNotice('识别尚未准备好，请稍后再试或使用文本输入。');
      transition('CANCEL');
    }
  }

  async function startServerRecording(session: number) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (sessionRef.current !== session) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;
      recordingChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordingChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        void (async () => {
          stopMediaTracks();
          clearRecordingTimer();
          if (sessionRef.current !== session) return;

          const audio = new Blob(recordingChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          recordingChunksRef.current = [];
          if (audio.size === 0) {
            setNotice('没有获取到音频，请重试或使用文本输入。');
            transition('CANCEL');
            return;
          }

          setNotice('录音完成，正在识别文字。');
          const text = await requestServerRecognition(audio);
          if (sessionRef.current !== session) return;
          if (text === null) {
            setNotice('服务端识别暂不可用，请重试或改用文本输入。');
            transition('CANCEL');
          } else {
            processText(text, session, true);
          }
        })();
      };

      recorder.start();
      setNotice('正在录音，说完后点击“完成识别”。');
      recordingTimerRef.current = setTimeout(() => {
        if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      }, 8_000);
    } catch {
      if (sessionRef.current !== session) return;
      setNotice('服务端录音不可用，正在尝试浏览器识别。');
      startBrowserRecognition(session);
    }
  }

  async function startListening() {
    if (phaseRef.current !== 'idle' || processingRef.current) return;

    stopPlayback();
    stopCapture();
    sessionRef.current += 1;
    const session = sessionRef.current;
    setRecognizedText('');
    setInterimText('');
    setDisplayedReply('');
    setLastResult(null);
    transition('START');

    if (serverConfigured && capabilities.mediaRecording) {
      await startServerRecording(session);
    } else {
      startBrowserRecognition(session);
    }
  }

  function finishListening() {
    if (phaseRef.current !== 'listening') return;
    clearRecordingTimer();
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
      return;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setNotice('正在整理识别结果。');
    }
  }

  function cancelListening() {
    if (phaseRef.current !== 'listening') return;
    sessionRef.current += 1;
    processingRef.current = false;
    stopCapture();
    setInterimText('');
    setNotice('已取消本次聆听。');
    transition('CANCEL');
  }

  function stopSpeaking() {
    if (phaseRef.current !== 'speaking') return;
    sessionRef.current += 1;
    processingRef.current = false;
    stopPlayback();
    setDisplayedReply(lastReply);
    setNotice('已停止播报。');
    transition('STOP');
  }

  function replay() {
    if (!lastReply || phaseRef.current === 'thinking') return;
    stopCapture();
    stopPlayback();
    sessionRef.current += 1;
    const session = sessionRef.current;
    processingRef.current = false;
    transition('SUBMIT');
    void speakReply(lastReply, session, false);
  }

  function submitText(text: string) {
    if (!text.trim() || phaseRef.current === 'thinking') return;
    stopCapture();
    stopPlayback();
    sessionRef.current += 1;
    const session = sessionRef.current;
    processingRef.current = false;
    setLastResult(null);
    processText(text, session, false);
  }

  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      recognitionRef.current?.abort();
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioRef.current?.pause();
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  return {
    phase,
    recognizedText,
    interimText,
    displayedReply,
    lastReply,
    lastResult,
    notice,
    serverConfigured,
    capabilities,
    startListening,
    finishListening,
    cancelListening,
    stopSpeaking,
    replay,
    submitText,
  };
}
