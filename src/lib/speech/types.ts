export interface Scenario {
  id: string;
  name: string;
  priority: number;
  keywords: string[];
  similarPhrases: string[];
  reply: string;
  enabled: boolean;
}

export type ScenarioDraft = Omit<Scenario, 'id'>;

export type MatchType = 'keyword' | 'similarity' | 'wake' | 'unmatched';

export interface ScenarioMatch {
  scene: Scenario | null;
  matchType: MatchType;
  reply: string;
  matchedText: string | null;
  similarity: number | null;
}

export interface SpeechResolution extends ScenarioMatch {
  wakeWordDetected: boolean;
  commandText: string;
}

export interface SpeechSettings {
  rate: number;
  volume: number;
}
