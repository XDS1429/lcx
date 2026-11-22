import type { Metadata } from 'next';
import { ScenarioManager } from '@/components/scenarios/scenario-manager';

export const metadata: Metadata = {
  title: '话术管理',
  description: '管理小张老师的托育照护场景、触发关键词、相似语句和固定回复。',
};

export default function ScenariosPage() {
  return <ScenarioManager />;
}
