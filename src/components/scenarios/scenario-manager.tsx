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
    <div className="relative mx-auto max-w-[1280px] px-4 pb-4 pt-8 sm:px-6 sm:pt-10 lg:px-10">
      <NurseryDecorations />
      <section className="relative z-10 mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#7b684f]">
            <BookOpenText className="size-4" />固定话术内容管理
          </div>
          <h1 className="brand-title text-[36px] font-bold leading-tight sm:text-[44px]">话术管理</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68766b] sm:text-[15px]">
            维护比赛现场使用的场景与固定回复。保存后首页立即生效，刷新页面也不会丢失。
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" onClick={() => setResetOpen(true)} className="h-11 rounded-full border-[#d9d2c4] bg-[#fffefa] px-4 text-[#68766b]">
            <RotateCcw />恢复默认
          </Button>
          <Button onClick={openCreate} className="h-11 rounded-full bg-[#526a55] px-5 hover:bg-[#425a49]">
            <Plus />新增场景
          </Button>
        </div>
      </section>

      <section className="relative z-10 mb-4 grid grid-cols-3 gap-2 sm:gap-4" aria-label="话术统计">
        {[
          { label: '全部场景', value: scenarios.length },
          { label: '已启用', value: enabledCount },
          { label: '明确关键词', value: keywordCount },
        ].map((item) => (
          <div key={item.label} className="paper-card rounded-[20px] px-4 py-4 sm:px-5">
            <p className="tabular-number text-2xl font-semibold text-[#425a49] sm:text-3xl">{storageReady ? item.value : '—'}</p>
            <p className="mt-1 text-xs text-[#718076] sm:text-sm">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 paper-card rounded-[26px] p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#879087]" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索场景、关键词或回复"
              aria-label="搜索话术"
              className="h-11 rounded-full border-[#e1dacd] bg-[#fbf8f1] pl-10 pr-4"
            />
          </div>
          <p className="text-xs text-[#718076]">显示 {filteredScenarios.length} / {scenarios.length} 条 · 数据保存在当前浏览器</p>
        </div>

        <div className="space-y-3">
          {filteredScenarios.map((scenario) => (
            <article key={scenario.id} className="rounded-[22px] border border-[#e8e1d4] bg-[#fffefa] p-4 transition-colors hover:border-[#cfd8c9] sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#29372f]">{scenario.name}</h2>
                    <Badge variant="outline" className="tabular-number border-[#e0d6c6] bg-[#f4e2ce]/40 font-medium text-[#805b3b]">优先级 {scenario.priority}</Badge>
                    <span className={scenario.enabled ? 'text-xs font-medium text-[#526a55]' : 'text-xs text-[#879087]'}>
                      {scenario.enabled ? '已启用' : '已停用'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Tag className="mr-1 size-3.5 text-[#879087]" />
                    {scenario.keywords.slice(0, 4).map((keyword) => (
                      <span key={keyword} className="rounded-full bg-[#edf0e7] px-2.5 py-1 text-xs text-[#526a55]">{keyword}</span>
                    ))}
                    {scenario.keywords.length > 4 && <span className="text-xs text-[#879087]">+{scenario.keywords.length - 4}</span>}
                    <span className="ml-2 text-xs text-[#879087]">相似语句 {scenario.similarPhrases.length} 条</span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#68766b]">{scenario.reply}</p>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#eee7da] pt-3 lg:justify-end lg:border-t-0 lg:pt-0">
                  <label className="mr-2 flex items-center gap-2 text-xs text-[#718076]">
                    <Switch
                      checked={scenario.enabled}
                      onCheckedChange={(checked) => {
                        toggleScenario(scenario.id);
                        toast.success(checked ? `已启用“${scenario.name}”` : `已停用“${scenario.name}”`);
                      }}
                      aria-label={`${scenario.enabled ? '停用' : '启用'}${scenario.name}`}
                    />
                    {scenario.enabled ? '启用' : '停用'}
                  </label>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(scenario)} aria-label={`编辑${scenario.name}`} title="编辑" className="size-10 rounded-full text-[#526a55] hover:bg-[#edf0e7]">
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(scenario)} aria-label={`删除${scenario.name}`} title="删除" className="size-10 rounded-full text-[#a65b50] hover:bg-[#f8ece8]">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}

          {filteredScenarios.length === 0 && (
            <div className="rounded-[22px] border border-dashed border-[#d9d2c4] py-14 text-center">
              <Search className="mx-auto size-7 text-[#a4a99e]" />
              <p className="mt-3 font-medium text-[#526158]">没有找到匹配的话术</p>
              <p className="mt-1 text-sm text-[#879087]">试试其他关键词，或新增一个场景。</p>
            </div>
          )}
        </div>
      </section>

      <ScenarioForm open={formOpen} scenario={editing} onOpenChange={setFormOpen} onSave={saveScenario} />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-[24px] border-[#e3ddcf] bg-[#fffefa]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除“{deleteTarget?.name}”？</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              删除后首页将不再匹配此场景，此操作无法撤销。若只是暂时不用，可以选择停用。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[#d9d2c4]">取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-[#b75c50] text-white hover:bg-[#9e4d43]">确认删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="rounded-[24px] border-[#e3ddcf] bg-[#fffefa]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认恢复默认话术？</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              当前新增场景、全部编辑和启停状态都会被默认的 8 条托育照护话术覆盖，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[#d9d2c4]">保留当前话术</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset} className="rounded-xl bg-[#526a55] hover:bg-[#425a49]">确认恢复默认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
