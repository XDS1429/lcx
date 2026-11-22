import { UNMATCHED_REPLY, WAKE_ONLY_REPLY, WAKE_WORD } from './defaults';
import type { Scenario, ScenarioMatch, SpeechResolution } from './types';

export const SIMILARITY_THRESHOLD = 0.42;

export function normalizeSpeechText(value: string): string {
  return value.toLocaleLowerCase('zh-CN').replace(/[^0-9a-z\u3400-\u9fff]/g, '');
}

export function extractWakeWordInput(input: string): string | null {
  const normalizedInput = normalizeSpeechText(input);
  const wakeWordIndex = normalizedInput.indexOf(WAKE_WORD);
  return wakeWordIndex === -1 ? null : normalizedInput.slice(wakeWordIndex);
}

function toBigrams(value: string): string[] {
  if (value.length < 2) {
    return value ? [value] : [];
  }

  return Array.from({ length: value.length - 1 }, (_, index) =>
    value.slice(index, index + 2),
  );
}

function overlapCoefficient(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  const intersection = new Set(left).size
    ? [...new Set(left)].filter((item) => rightSet.has(item)).length
    : 0;

  return (2 * intersection) / (new Set(left).size + rightSet.size);
}

/**
 * Explainable local similarity: 70% character-bigram Dice score plus
 * 30% single-character Dice score. No network or generative model is used.
 */
export function characterSimilarity(leftInput: string, rightInput: string): number {
  const left = normalizeSpeechText(leftInput);
  const right = normalizeSpeechText(rightInput);

  if (!left || !right) {
    return 0;
  }
  if (left === right) {
    return 1;
  }

  const bigramScore = overlapCoefficient(toBigrams(left), toBigrams(right));
  const characterScore = overlapCoefficient([...left], [...right]);

  return bigramScore * 0.7 + characterScore * 0.3;
}

function byStablePriority(scenarios: Scenario[]): Scenario[] {
  return scenarios
    .map((scenario, index) => ({ scenario, index }))
    .sort(
      (left, right) =>
        left.scenario.priority - right.scenario.priority || left.index - right.index,
    )
    .map(({ scenario }) => scenario);
}

export function matchScenario(input: string, scenarios: Scenario[]): ScenarioMatch {
  const command = normalizeSpeechText(input);
  const enabledScenarios = byStablePriority(scenarios.filter((scenario) => scenario.enabled));

  if (!command) {
    return {
      scene: null,
      matchType: 'unmatched',
      reply: UNMATCHED_REPLY,
      matchedText: null,
      similarity: null,
    };
  }

  // Stage 1 always finishes before any similarity candidate is considered.
  for (const scenario of enabledScenarios) {
    const keyword = scenario.keywords.find((candidate) => {
      const normalizedKeyword = normalizeSpeechText(candidate);
      return normalizedKeyword.length > 0 && command.includes(normalizedKeyword);
    });

    if (keyword) {
      return {
        scene: scenario,
        matchType: 'keyword',
        reply: scenario.reply,
        matchedText: keyword,
        similarity: null,
      };
    }
  }

  // Stage 2: every phrase crossing the threshold is a candidate. Priority,
  // rather than a higher similarity score, decides between multiple scenes.
  for (const scenario of enabledScenarios) {
    let bestPhrase: string | null = null;
    let bestScore = 0;

    for (const phrase of scenario.similarPhrases) {
      const score = characterSimilarity(command, phrase);
      if (score > bestScore) {
        bestScore = score;
        bestPhrase = phrase;
      }
    }

    if (bestPhrase && bestScore >= SIMILARITY_THRESHOLD) {
      return {
        scene: scenario,
        matchType: 'similarity',
        reply: scenario.reply,
        matchedText: bestPhrase,
        similarity: bestScore,
      };
    }
  }

  return {
    scene: null,
    matchType: 'unmatched',
    reply: UNMATCHED_REPLY,
    matchedText: null,
    similarity: null,
  };
}

export function resolveSpeechInput(
  input: string,
  scenarios: Scenario[],
): SpeechResolution {
  const normalizedInput = normalizeSpeechText(input);
  const wakeWordDetected = normalizedInput.startsWith(WAKE_WORD);
  const commandText = wakeWordDetected
    ? normalizedInput.slice(WAKE_WORD.length)
    : normalizedInput;

  if (wakeWordDetected && !commandText) {
    return {
      scene: null,
      matchType: 'wake',
      reply: WAKE_ONLY_REPLY,
      matchedText: WAKE_WORD,
      similarity: null,
      wakeWordDetected: true,
      commandText: '',
    };
  }

  return {
    ...matchScenario(commandText, scenarios),
    wakeWordDetected,
    commandText,
  };
}
