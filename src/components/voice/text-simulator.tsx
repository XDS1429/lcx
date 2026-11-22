'use client';

import { useState, type FormEvent } from 'react';
import { CornerDownLeft, Keyboard, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const examples = ['小张老师', '小张老师，孩子发烧怎么办', '孩子一直哭应该怎么安慰', '午睡时要注意什么'];
const busyPhases = new Set(['thinking']);

export function TextSimulator({
  phase,
  onSubmit,
}: {
  phase: string;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const busy = busyPhases.has(phase);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() || busy) return;
    onSubmit(text);
    setText('');
  }

  return (
    <section className="paper-card mt-4 rounded-[26px] p-5 sm:p-6" aria-labelledby="text-demo-title">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f4e2ce]/65 text-[#9a6a41]"><Keyboard className="size-5" /></span>
          <div>
            <h2 id="text-demo-title" className="text-sm font-semibold">文本输入模拟识别</h2>
            <p className="mt-0.5 text-xs text-[#718076]">无麦克风也能完整演示</p>
          </div>
        </div>
        <form onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
          <label htmlFor="simulated-speech" className="sr-only">输入模拟识别文字</label>
          <div className="relative min-w-0 flex-1">
            <Input
              id="simulated-speech"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="例如：小张老师，孩子发烧怎么办"
              autoComplete="off"
              className="h-12 rounded-2xl border-[#ded7c9] bg-[#fbf8f1] px-4 pr-10 text-[15px] placeholder:text-[#9a9f96] focus-visible:bg-white"
            />
            <CornerDownLeft className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#a4a99e]" />
          </div>
          <Button type="submit" disabled={!text.trim() || busy} className="h-12 rounded-2xl bg-[#526a55] px-6 text-[15px] hover:bg-[#425a49]">
            <Send />发送并播报
          </Button>
        </form>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 lg:pl-[152px]">
        <span className="mr-1 text-xs text-[#879087]">快速填入</span>
        {examples.map((example) => (
          <button
            type="button"
            key={example}
            onClick={() => setText(example)}
            className="min-h-8 rounded-full border border-[#e3ddcf] bg-[#fbf8f1] px-3 py-1.5 text-xs text-[#68766b] transition-colors hover:border-[#bfcab9] hover:bg-[#edf0e7] hover:text-[#425a49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e957b]"
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
