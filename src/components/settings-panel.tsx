'use client';

import { useEffect, useState } from 'react';
import { Check, Gauge, Settings2, Volume2 } from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { fetchSpeechServiceStatus } from '@/lib/speech/client-api';

export function SettingsPanel() {
  const { settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);
  const [serverConfigured, setServerConfigured] = useState<boolean | null>(null);
  const [browserSupport, setBrowserSupport] = useState({ recognition: false, synthesis: false });

  useEffect(() => {
    if (!open) return;
    setBrowserSupport({
      recognition: Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
      synthesis: 'speechSynthesis' in window,
    });
    void fetchSpeechServiceStatus().then((status) => setServerConfigured(status.serverConfigured));
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="h-11 rounded-full px-3 text-[#425a49] sm:px-4">
          <Settings2 className="size-4" />
          <span className="hidden sm:inline">演示设置</span>
          <span className="sr-only sm:hidden">演示设置</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[92vw] overflow-y-auto border-[#e3ddcf] bg-[#fffefa] p-0 sm:max-w-md">
        <SheetHeader className="border-b border-[#eee7da] px-6 pb-5 pt-7 text-left">
          <div className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-[#edf0e7] text-[#526a55]">
            <Settings2 className="size-5" />
          </div>
          <SheetTitle className="text-xl">演示设置</SheetTitle>
          <SheetDescription className="leading-6">
            调整现场播报效果。设置会保存在当前浏览器中。
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-7 px-6 pb-8">
          <section className="space-y-5 rounded-[22px] bg-[#fbf8f1] p-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="speech-rate" className="flex items-center gap-2 text-sm font-semibold">
                  <Gauge className="size-4 text-[#7e957b]" />语音语速
                </Label>
                <span className="tabular-number rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#526a55]">
                  {settings.rate.toFixed(1)}×
                </span>
              </div>
              <Slider
                id="speech-rate"
                min={0.6}
                max={1.5}
                step={0.1}
                value={[settings.rate]}
                onValueChange={(value) => updateSettings({ rate: value[0] })}
                aria-label="语音语速"
              />
              <div className="flex justify-between text-xs text-[#718076]"><span>舒缓</span><span>稍快</span></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="speech-volume" className="flex items-center gap-2 text-sm font-semibold">
                  <Volume2 className="size-4 text-[#7e957b]" />播报音量
                </Label>
                <span className="tabular-number rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#526a55]">
                  {Math.round(settings.volume * 100)}%
                </span>
              </div>
              <Slider
                id="speech-volume"
                min={0}
                max={1}
                step={0.05}
                value={[settings.volume]}
                onValueChange={(value) => updateSettings({ volume: value[0] })}
                aria-label="播报音量"
              />
              <div className="flex justify-between text-xs text-[#718076]"><span>轻声</span><span>清晰</span></div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">语音服务状态</h3>
            <div className="overflow-hidden rounded-[20px] border border-[#e8e1d4]">
              <div className="flex items-center justify-between border-b border-[#eee7da] px-4 py-3.5">
                <span className="text-sm text-[#68766b]">服务端密钥</span>
                <Badge variant="secondary" className="bg-[#edf0e7] text-[#425a49]">
                  {serverConfigured === null ? '检查中' : serverConfigured ? '已配置' : '未配置'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-b border-[#eee7da] px-4 py-3.5">
                <span className="text-sm text-[#68766b]">当前服务模式</span>
                <span className="text-sm font-medium">
                  {serverConfigured ? '服务端语音' : '浏览器演示'}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm text-[#68766b]">浏览器语音能力</span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-[#526a55]">
                  {(browserSupport.recognition || browserSupport.synthesis) && <Check className="size-4" />}
                  {browserSupport.recognition && browserSupport.synthesis
                    ? '识别与播报可用'
                    : browserSupport.synthesis
                      ? '播报可用'
                      : browserSupport.recognition
                        ? '识别可用'
                        : '请使用文本输入'}
                </span>
              </div>
            </div>
          </section>

          <div className="rounded-[20px] bg-[#f4e2ce]/65 p-4 text-sm leading-6 text-[#704c30]">
            <strong className="mb-1 block font-semibold">浏览器演示提示</strong>
            未配置服务端语音时自动使用 Web Speech API。推荐使用最新版 Chrome 或 Edge，并提前允许麦克风权限；不支持时可用文本输入演示。
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
