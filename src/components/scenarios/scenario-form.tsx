'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { Scenario, ScenarioDraft } from '@/lib/speech/types';

interface ScenarioFormProps {
  open: boolean;
  scenario: Scenario | null;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: ScenarioDraft) => void;
}

interface FormState {
  name: string;
  priority: string;
  keywords: string;
  similarPhrases: string;
  reply: string;
  enabled: boolean;
}

type FieldName = keyof FormState;
type FormErrors = Partial<Record<FieldName, string>>;

function toFormState(scenario: Scenario | null): FormState {
  return scenario
    ? {
        name: scenario.name,
        priority: String(scenario.priority),
        keywords: scenario.keywords.join('\n'),
        similarPhrases: scenario.similarPhrases.join('\n'),
        reply: scenario.reply,
        enabled: scenario.enabled,
      }
    : { name: '', priority: '50', keywords: '', similarPhrases: '', reply: '', enabled: true };
}

function splitLines(value: string): string[] {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function ScenarioForm({ open, scenario, onOpenChange, onSave }: ScenarioFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(scenario));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (open) {
      setForm(toFormState(scenario));
      setErrors({});
    }
  }, [open, scenario]);

  function updateField<Field extends FieldName>(field: Field, value: FormState[Field]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const priority = Number(form.priority);
    const keywords = splitLines(form.keywords);
    const similarPhrases = splitLines(form.similarPhrases);

    if (!form.name.trim()) nextErrors.name = '请填写场景名称';
    if (!form.priority.trim() || !Number.isInteger(priority) || priority < 0 || priority > 9999) {
      nextErrors.priority = '请输入 0–9999 的整数';
    }
    if (keywords.length === 0) nextErrors.keywords = '请至少填写一个明确关键词';
    if (similarPhrases.length === 0) nextErrors.similarPhrases = '请至少填写一条相似语句';
    if (!form.reply.trim()) nextErrors.reply = '请填写固定回复';

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      name: form.name.trim(),
      priority,
      keywords,
      similarPhrases,
      reply: form.reply,
      enabled: form.enabled,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-[860px] overflow-y-auto rounded-[26px] border-[#e3ddcf] bg-[#fffefa] p-0">
        <form onSubmit={submit} noValidate>
          <DialogHeader className="border-b border-[#eee7da] px-6 pb-6 pt-7 text-left sm:px-8">
            <DialogTitle className="text-2xl">{scenario ? '编辑话术场景' : '新增话术场景'}</DialogTitle>
            <DialogDescription className="text-base leading-7 text-[#5f6d63]">
              固定回复将按保存内容逐字展示并播报，不会自动润色或扩写。带 * 的字段为必填项。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="grid gap-5 sm:grid-cols-[1fr_190px]">
              <div className="space-y-2.5">
                <Label htmlFor="scenario-name" className="text-base font-semibold">场景名称 <span className="text-[#a34840]" aria-hidden="true">*</span></Label>
                <Input
                  id="scenario-name"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  placeholder="例如：发热应对"
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'scenario-name-error' : undefined}
                  className="h-12 rounded-xl bg-[#fbf8f1] text-base placeholder:text-[#6f7c72]"
                />
                {errors.name && <p id="scenario-name-error" className="text-base font-medium text-[#a34840]" role="alert">{errors.name}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="scenario-priority" className="text-base font-semibold">数字优先级 <span className="text-[#a34840]" aria-hidden="true">*</span></Label>
                <Input
                  id="scenario-priority"
                  type="number"
                  min={0}
                  max={9999}
                  step={1}
                  value={form.priority}
                  onChange={(event) => updateField('priority', event.target.value)}
                  required
                  aria-invalid={Boolean(errors.priority)}
                  aria-describedby="scenario-priority-help"
                  className="tabular-number h-12 rounded-xl bg-[#fbf8f1] text-base"
                />
                {errors.priority ? <p id="scenario-priority-help" className="text-base font-medium text-[#a34840]" role="alert">{errors.priority}</p> : <p id="scenario-priority-help" className="text-base font-medium leading-6 text-[#5f6d63]">数值越小，越先处理；范围 0–9999</p>}
              </div>
            </div>

            <div className="rounded-2xl bg-[#edf0e7]/75 px-4 py-3.5 text-base font-medium leading-7 text-[#425a49]">
              匹配顺序固定：先检查所有启用场景的明确关键词，再检查相似语句。同阶段按数字优先级从小到大处理，同优先级保持列表顺序。
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2.5">
                <Label htmlFor="scenario-keywords" className="text-base font-semibold">触发关键词列表 <span className="text-[#a34840]" aria-hidden="true">*</span></Label>
                <Textarea
                  id="scenario-keywords"
                  value={form.keywords}
                  onChange={(event) => updateField('keywords', event.target.value)}
                  placeholder={'每行一个，例如：\n发烧\n发热\n体温高'}
                  rows={6}
                  required
                  aria-invalid={Boolean(errors.keywords)}
                  aria-describedby={`scenario-keywords-help${errors.keywords ? ' scenario-keywords-error' : ''}`}
                  className="resize-none rounded-xl bg-[#fbf8f1] text-base leading-7 placeholder:text-[#6f7c72]"
                />
                <p id="scenario-keywords-help" className="text-base font-medium leading-6 text-[#5f6d63]">每行一条；指令包含关键词即可命中</p>
                {errors.keywords && <p id="scenario-keywords-error" className="text-base font-medium text-[#a34840]" role="alert">{errors.keywords}</p>}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="scenario-similar" className="text-base font-semibold">相似语句列表 <span className="text-[#a34840]" aria-hidden="true">*</span></Label>
                <Textarea
                  id="scenario-similar"
                  value={form.similarPhrases}
                  onChange={(event) => updateField('similarPhrases', event.target.value)}
                  placeholder={'每行一条，例如：\n孩子体温升高怎么处理\n幼儿发烧怎么办'}
                  rows={6}
                  required
                  aria-invalid={Boolean(errors.similarPhrases)}
                  aria-describedby={`scenario-similar-help${errors.similarPhrases ? ' scenario-similar-error' : ''}`}
                  className="resize-none rounded-xl bg-[#fbf8f1] text-base leading-7 placeholder:text-[#6f7c72]"
                />
                <p id="scenario-similar-help" className="text-base font-medium leading-6 text-[#5f6d63]">每行一条；仅在关键词未命中时参与匹配</p>
                {errors.similarPhrases && <p id="scenario-similar-error" className="text-base font-medium text-[#a34840]" role="alert">{errors.similarPhrases}</p>}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="scenario-reply" className="text-base font-semibold">固定回复 <span className="text-[#a34840]" aria-hidden="true">*</span></Label>
                <span className="tabular-number text-base font-medium text-[#5f6d63]">{form.reply.length} 字</span>
              </div>
              <Textarea
                id="scenario-reply"
                value={form.reply}
                onChange={(event) => updateField('reply', event.target.value)}
                placeholder="输入适合现场播报的专业、简短话术"
                rows={5}
                required
                aria-invalid={Boolean(errors.reply)}
                aria-describedby={errors.reply ? 'scenario-reply-error' : undefined}
                className="resize-y rounded-xl bg-[#fbf8f1] text-base leading-8 placeholder:text-[#6f7c72]"
              />
              {errors.reply && <p id="scenario-reply-error" className="text-base font-medium text-[#a34840]" role="alert">{errors.reply}</p>}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#e8e1d4] px-4 py-4">
              <div>
                <Label htmlFor="scenario-enabled" className="text-base font-semibold">启用此场景</Label>
                <p className="mt-1.5 text-base font-medium leading-6 text-[#5f6d63]">停用后，首页匹配会立即跳过此场景</p>
              </div>
              <Switch id="scenario-enabled" checked={form.enabled} onCheckedChange={(checked) => updateField('enabled', checked)} />
            </div>
          </div>

          <DialogFooter className="border-t border-[#eee7da] px-6 py-5 sm:px-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-12 rounded-xl border-[#d9d2c4] px-5 text-base font-semibold">取消</Button>
            <Button type="submit" className="h-12 rounded-xl bg-[#526a55] px-6 text-base font-semibold hover:bg-[#425a49]">{scenario ? '保存修改' : '新增场景'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
