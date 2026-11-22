'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider } from 'next-themes';
import { DEFAULT_SCENARIOS } from '@/lib/speech/defaults';
import type { Scenario, SpeechSettings } from '@/lib/speech/types';
import { Toaster } from '@/components/ui/sonner';

const SCENARIOS_STORAGE_KEY = 'xiao-zhang-teacher.scenarios.v1';
const SETTINGS_STORAGE_KEY = 'xiao-zhang-teacher.settings.v1';

const DEFAULT_SETTINGS: SpeechSettings = { rate: 1, volume: 0.9 };

type ScenarioDraft = Omit<Scenario, 'id'>;

interface AppContextValue {
  scenarios: Scenario[];
  settings: SpeechSettings;
  storageReady: boolean;
  addScenario: (draft: ScenarioDraft) => void;
  updateScenario: (id: string, draft: ScenarioDraft) => void;
  deleteScenario: (id: string) => void;
  toggleScenario: (id: string) => void;
  resetScenarios: () => void;
  updateSettings: (settings: Partial<SpeechSettings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function cloneDefaults(): Scenario[] {
  return DEFAULT_SCENARIOS.map((scenario) => ({
    ...scenario,
    keywords: [...scenario.keywords],
    similarPhrases: [...scenario.similarPhrases],
  }));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function parseScenarios(value: string | null): Scenario[] | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return null;

    const valid = parsed.every((item: unknown) => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.priority === 'number' &&
        Number.isFinite(candidate.priority) &&
        isStringArray(candidate.keywords) &&
        isStringArray(candidate.similarPhrases) &&
        typeof candidate.reply === 'string' &&
        typeof candidate.enabled === 'boolean'
      );
    });

    return valid ? (parsed as Scenario[]) : null;
  } catch {
    return null;
  }
}

function parseSettings(value: string | null): SpeechSettings | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.rate !== 'number' || typeof candidate.volume !== 'number') {
      return null;
    }
    return {
      rate: Math.min(1.5, Math.max(0.6, candidate.rate)),
      volume: Math.min(1, Math.max(0, candidate.volume)),
    };
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [scenarios, setScenarios] = useState<Scenario[]>(cloneDefaults);
  const [settings, setSettings] = useState<SpeechSettings>(DEFAULT_SETTINGS);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const savedScenarios = parseScenarios(window.localStorage.getItem(SCENARIOS_STORAGE_KEY));
    const savedSettings = parseSettings(window.localStorage.getItem(SETTINGS_STORAGE_KEY));
    if (savedScenarios) setScenarios(savedScenarios);
    if (savedSettings) setSettings(savedSettings);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios));
  }, [scenarios, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings, storageReady]);

  useEffect(() => {
    const syncScenarios = (event: StorageEvent) => {
      if (event.key !== SCENARIOS_STORAGE_KEY) return;
      const incoming = parseScenarios(event.newValue);
      if (incoming) setScenarios(incoming);
    };
    window.addEventListener('storage', syncScenarios);
    return () => window.removeEventListener('storage', syncScenarios);
  }, []);

  const addScenario = useCallback((draft: ScenarioDraft) => {
    const id = `scene-${window.crypto.randomUUID()}`;
    setScenarios((current) => [...current, { ...draft, id }]);
  }, []);

  const updateScenario = useCallback((id: string, draft: ScenarioDraft) => {
    setScenarios((current) =>
      current.map((scenario) => (scenario.id === id ? { ...draft, id } : scenario)),
    );
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setScenarios((current) => current.filter((scenario) => scenario.id !== id));
  }, []);

  const toggleScenario = useCallback((id: string) => {
    setScenarios((current) =>
      current.map((scenario) =>
        scenario.id === id ? { ...scenario, enabled: !scenario.enabled } : scenario,
      ),
    );
  }, []);

  const resetScenarios = useCallback(() => {
    setScenarios(cloneDefaults());
  }, []);

  const updateSettings = useCallback((next: Partial<SpeechSettings>) => {
    setSettings((current) => ({ ...current, ...next }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      scenarios,
      settings,
      storageReady,
      addScenario,
      updateScenario,
      deleteScenario,
      toggleScenario,
      resetScenarios,
      updateSettings,
    }),
    [
      scenarios,
      settings,
      storageReady,
      addScenario,
      updateScenario,
      deleteScenario,
      toggleScenario,
      resetScenarios,
      updateSettings,
    ],
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <AppContext.Provider value={value}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </AppContext.Provider>
    </ThemeProvider>
  );
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp 必须在 AppProvider 中使用');
  return context;
}
