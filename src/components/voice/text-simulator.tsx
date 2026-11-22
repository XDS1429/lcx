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
    <section className="paper-card mt-5 rounded-[26px] p-6 sm:p-7" aria-labelledby="text-demo-title">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#f4e2ce]/65 text-[#9a6a41]"><Keyboard className="size-6" aria-hidden="true" /></span>
          <div>
            <h2 id="text-demo-title" className="text-lg font-bold">文本输入模拟识别</h2>
            <p className="mt-1 text-base font-medium text-[#5f6d63]">无麦克风也能完整演示</p>
          </div>
        </div>
        <form onSubmit={submit} className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row">
          <label htmlFor="simulated-speech" className="sr-only">输入模拟识别文字</label>
          <div className="relative min-w-0 flex-1">
            <Input
              id="simulated-speech"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="例如：小张老师，孩子发烧怎么办"
              autoComplete="off"
              className="h-12 rounded-2xl border-[#ded7c9] bg-[#fbf8f1] px-4 pr-11 text-base placeholder:text-[#6f7c72] focus-visible:bg-white"
            />
            <CornerDownLeft className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#718076]" aria-hidden="true" />
          </div>
          <Button type="submit" disabled={!text.trim() || busy} className="h-12 rounded-2xl bg-[#526a55] px-7 text-base font-semibold hover:bg-[#425a49]">
            <Send aria-hidden="true" />发送并播报
          </Button>
        </form>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2.5 lg:pl-[168px]">
        <span className="mr-1 text-base font-semibold text-[#5f6d63]">快速填入</span>
        {examples.map((example) => (
          <button
            type="button"
            key={example}
            onClick={() => setText(example)}
            className="min-h-11 rounded-full border border-[#ddd6c8] bg-[#fbf8f1] px-4 py-2 text-base font-medium text-[#526158] transition-colors hover:border-[#bfcab9] hover:bg-[#edf0e7] hover:text-[#425a49] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7e957b]"
          >
            {example}
          </button>
        ))}
      </div>
    </section>
  );
}
