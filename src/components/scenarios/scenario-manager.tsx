'use client';

import { useMemo, useState } from 'react';
import { BookOpenText, Pencil, Plus, RotateCcw, Search, Tag, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { NurseryDecorations } from '@/components/decorations';
import { useApp } from '@/components/providers/app-provider';
import { ScenarioForm } from '@/components/scenarios/scenario-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { Scenario, ScenarioDraft } from '@/lib/speech/types';

export function ScenarioManager() {
  const { scenarios, addScenario, updateScenario, deleteScenario, toggleScenario, resetScenarios, storageReady } = useApp();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const filteredScenarios = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return scenarios;
    return scenarios.filter((scenario) =>
      [scenario.name, scenario.reply, ...scenario.keywords, ...scenario.similarPhrases]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [scenarios, search]);

  const enabledCount = scenarios.filter((scenario) => scenario.enabled).length;
  const keywordCount = scenarios.reduce((total, scenario) => total + scenario.keywords.length, 0);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(scenario: Scenario) {
    setEditing(scenario);
    setFormOpen(true);
  }

  function saveScenario(draft: ScenarioDraft) {
    if (editing) {
      updateScenario(editing.id, draft);
      toast.success('话术修改已保存', { description: '首页已立即使用更新后的固定话术。' });
    } else {
      addScenario(draft);
      toast.success('新话术场景已添加', { description: '场景已保存到当前浏览器。' });
    }
    setFormOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteScenario(deleteTarget.id);
    toast.success(`已删除“${deleteTarget.name}”`);
    setDeleteTarget(null);
  }

  function confirmReset() {
    resetScenarios();
    setResetOpen(false);
    toast.success('已恢复默认话术', { description: '8 条托育照护示例场景已还原。' });
  }

  return (
    <div className="relative mx-auto w-full max-w-[1720px] px-4 pb-4 pt-8 sm:px-6 sm:pt-10 lg:px-10 2xl:px-12">
      <NurseryDecorations />
      <section className="relative z-10 mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-base font-semibold tracking-wide text-[#705b42]">
            <BookOpenText className="size-5" aria-hidden="true" />固定话术内容管理
          </div>
          <h1 className="brand-title text-[42px] font-bold leading-tight sm:text-[52px]">话术管理</h1>
          <p className="mt-3 max-w-3xl text-base font-medium leading-8 text-[#526158] sm:text-lg">
            维护比赛现场使用的场景与固定回复。保存后首页立即生效，刷新页面也不会丢失。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <Button variant="outline" onClick={() => setResetOpen(true)} className="h-12 rounded-full border-[#d9d2c4] bg-[#fffefa] px-5 text-base font-semibold text-[#526158]">
            <RotateCcw aria-hidden="true" />恢复默认
          </Button>
          <Button onClick={openCreate} className="h-12 rounded-full bg-[#526a55] px-6 text-base font-semibold hover:bg-[#425a49]">
            <Plus aria-hidden="true" />新增场景
          </Button>
        </div>
      </section>

      <section className="relative z-10 mb-5 grid grid-cols-3 gap-3 sm:gap-4" aria-label="话术统计">
        {[
          { label: '全部场景', value: scenarios.length },
          { label: '已启用', value: enabledCount },
          { label: '明确关键词', value: keywordCount },
        ].map((item) => (
          <div key={item.label} className="paper-card rounded-[22px] px-4 py-5 sm:px-6">
            <p className="tabular-number text-3xl font-bold text-[#425a49] sm:text-4xl">{storageReady ? item.value : '—'}</p>
            <p className="mt-1.5 text-base font-semibold text-[#5f6d63] sm:text-base">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 paper-card rounded-[26px] p-5 sm:p-6" aria-label="场景列表与搜索">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#647267]" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索场景、关键词或回复"
              aria-label="搜索话术"
              className="h-12 rounded-full border-[#e1dacd] bg-[#fbf8f1] pl-11 pr-4 text-base placeholder:text-[#6f7c72]"
            />
          </div>
          <p className="text-base font-medium text-[#5f6d63] sm:text-base">显示 {filteredScenarios.length} / {scenarios.length} 条 · 数据保存在当前浏览器</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2 2xl:gap-5">
          {filteredScenarios.map((scenario) => (
            <article key={scenario.id} className="flex h-full flex-col rounded-[22px] border border-[#e3ddcf] bg-[#fffefa] p-5 transition-colors hover:border-[#c5d0bf] sm:p-6" aria-labelledby={`scenario-title-${scenario.id}`}>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 id={`scenario-title-${scenario.id}`} className="text-xl font-bold text-[#29372f]">{scenario.name}</h2>
                  <Badge variant="outline" className="tabular-number border-[#e0d6c6] bg-[#f4e2ce]/45 px-3 py-1 text-base font-semibold text-[#704c30]">优先级 {scenario.priority}</Badge>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold ${scenario.enabled ? 'bg-[#edf0e7] text-[#425a49]' : 'bg-[#f2eee5] text-[#5f6d63]'}`}>
                    <span className={`size-2 rounded-full ${scenario.enabled ? 'bg-[#526a55]' : 'bg-[#879087]'}`} aria-hidden="true" />
                    {scenario.enabled ? '已启用' : '已停用'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 pr-1 text-base font-bold text-[#526158]">
                    <Tag className="size-4 text-[#647267]" aria-hidden="true" />关键词 {scenario.keywords.length} 条
                  </span>
                  {scenario.keywords.slice(0, 4).map((keyword) => (
                    <span key={keyword} className="rounded-full bg-[#edf0e7] px-3 py-1.5 text-base font-medium text-[#425a49]">{keyword}</span>
                  ))}
                  {scenario.keywords.length > 4 && <span className="text-base font-semibold text-[#5f6d63]">+{scenario.keywords.length - 4} 个</span>}
                  <span className="rounded-full bg-[#f4e2ce]/50 px-3 py-1.5 text-base font-semibold text-[#704c30]">相似语句 {scenario.similarPhrases.length} 条</span>
                </div>

                <div className="mt-4 rounded-2xl bg-[#fbf8f1] px-4 py-3.5">
                  <p className="text-base font-bold text-[#526a55]">固定回复</p>
                  <p className="mt-1.5 whitespace-pre-wrap text-base font-medium leading-8 text-[#42544a]">{scenario.reply}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e8e1d4] pt-4">
                <label className="flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-base font-semibold text-[#526158]">
                  <Switch
                    checked={scenario.enabled}
                    onCheckedChange={(checked) => {
                      toggleScenario(scenario.id);
                      toast.success(checked ? `已启用“${scenario.name}”` : `已停用“${scenario.name}”`);
                    }}
                    aria-label={`${scenario.enabled ? '停用' : '启用'}${scenario.name}`}
                  />
                  {scenario.enabled ? '启用中' : '已停用'}
                </label>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button variant="outline" onClick={() => openEdit(scenario)} aria-label={`编辑${scenario.name}`} className="h-11 rounded-xl border-[#cfd8c9] bg-white px-4 text-base font-semibold text-[#425a49] hover:bg-[#edf0e7]">
                    <Pencil className="size-4" aria-hidden="true" />编辑
                  </Button>
                  <Button variant="outline" onClick={() => setDeleteTarget(scenario)} aria-label={`删除${scenario.name}`} className="h-11 rounded-xl border-[#ead2cc] bg-white px-4 text-base font-semibold text-[#9e4d43] hover:bg-[#f8ece8]">
                    <Trash2 className="size-4" aria-hidden="true" />删除
                  </Button>
                </div>
              </div>
            </article>
          ))}

          {filteredScenarios.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-[#d9d2c4] py-14 text-center xl:col-span-2">
              <Search className="mx-auto size-8 text-[#718076]" aria-hidden="true" />
              <p className="mt-3 text-lg font-semibold text-[#526158]">没有找到匹配的话术</p>
              <p className="mt-2 text-base text-[#5f6d63]">试试其他关键词，或新增一个场景。</p>
            </div>
          )}
        </div>
      </section>

      <ScenarioForm open={formOpen} scenario={editing} onOpenChange={setFormOpen} onSave={saveScenario} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-[24px] border-[#e3ddcf] bg-[#fffefa]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">确认删除“{deleteTarget?.name}”？</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-7 text-[#5f6d63]">
              删除后首页将不再匹配此场景，此操作无法撤销。若只是暂时不用，可以选择停用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-xl border-[#d9d2c4] px-5 text-base font-semibold">取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="h-11 rounded-xl bg-[#b75c50] px-5 text-base font-semibold text-white hover:bg-[#9e4d43]">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="rounded-[24px] border-[#e3ddcf] bg-[#fffefa]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">确认恢复默认话术？</AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-7 text-[#5f6d63]">
              当前新增场景、全部编辑和启停状态都会被默认的 8 条托育照护话术覆盖，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-xl border-[#d9d2c4] px-5 text-base font-semibold">保留当前话术</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="h-11 rounded-xl bg-[#526a55] px-5 text-base font-semibold hover:bg-[#425a49]">确认恢复默认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
