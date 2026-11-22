import { describe, expect, it } from 'vitest';
import { DEFAULT_SCENARIOS, UNMATCHED_REPLY, WAKE_ONLY_REPLY } from './defaults';
import { matchScenario, resolveSpeechInput } from './matcher';
import type { Scenario } from './types';

function scenario(overrides: Partial<Scenario>): Scenario {
  return {
    id: 'scenario-id',
    name: '测试场景',
    priority: 10,
    keywords: [],
    similarPhrases: [],
    reply: '固定回复',
    enabled: true,
    ...overrides,
  };
}

describe('语音指令匹配', () => {
  it('仅唤醒词时固定逐字回复', () => {
    const result = resolveSpeechInput('小张老师。', DEFAULT_SCENARIOS);

    expect(result.matchType).toBe('wake');
    expect(result.reply).toBe(WAKE_ONLY_REPLY);
    expect(result.reply).toBe('我在，请说');
    expect(result.scene).toBeNull();
  });

  it('去掉一句话中的唤醒词后直接匹配指令', () => {
    const result = resolveSpeechInput('小张老师，孩子发烧怎么办', DEFAULT_SCENARIOS);

    expect(result.scene?.id).toBe('fever-care');
    expect(result.matchType).toBe('keyword');
    expect(result.commandText).toBe('孩子发烧怎么办');
  });

  it('明确关键词阶段优先于数字优先级更高的相似语句场景', () => {
    const scenarios = [
      scenario({
        id: 'similar-first',
        priority: 1,
        similarPhrases: ['孩子发烧怎么办'],
        reply: '相似场景回复',
      }),
      scenario({
        id: 'keyword-second',
        priority: 99,
        keywords: ['发烧'],
        reply: '关键词场景回复',
      }),
    ];

    const result = matchScenario('孩子发烧怎么办', scenarios);

    expect(result.scene?.id).toBe('keyword-second');
    expect(result.matchType).toBe('keyword');
  });

  it('同阶段命中多个场景时按数字优先级处理', () => {
    const scenarios = [
      scenario({ id: 'low', priority: 20, keywords: ['孩子'] }),
      scenario({ id: 'high', priority: 2, keywords: ['发烧'] }),
    ];

    expect(matchScenario('孩子发烧', scenarios).scene?.id).toBe('high');
  });

  it('同优先级保持话术表原始顺序', () => {
    const scenarios = [
      scenario({ id: 'first', priority: 5, keywords: ['孩子'] }),
      scenario({ id: 'second', priority: 5, keywords: ['发烧'] }),
    ];

    expect(matchScenario('孩子发烧', scenarios).scene?.id).toBe('first');
  });

  it('没有关键词时使用可解释的相似语句匹配', () => {
    const scenarios = [
      scenario({
        id: 'similar',
        keywords: ['不存在的词'],
        similarPhrases: ['幼儿入园焦虑怎么陪伴'],
      }),
    ];

    const result = matchScenario('幼儿入园焦虑怎么陪伴', scenarios);

    expect(result.scene?.id).toBe('similar');
    expect(result.matchType).toBe('similarity');
    expect(result.similarity).toBe(1);
  });

  it('未匹配时逐字使用固定提示', () => {
    const result = resolveSpeechInput('今天天气怎么样', DEFAULT_SCENARIOS);

    expect(result.scene).toBeNull();
    expect(result.matchType).toBe('unmatched');
    expect(result.reply).toBe(UNMATCHED_REPLY);
    expect(result.reply).toBe('我暂时没有听清，请再说一次');
  });

  it('停用场景不参与任何阶段', () => {
    const scenarios = [
      scenario({ id: 'disabled', keywords: ['发烧'], enabled: false }),
    ];

    expect(matchScenario('孩子发烧', scenarios).matchType).toBe('unmatched');
  });

  it('编辑后立即使用新关键词和新固定回复', () => {
    const edited = DEFAULT_SCENARIOS.map((item) =>
      item.id === 'fever-care'
        ? { ...item, keywords: ['测温'], reply: '编辑后的固定回复，标点不变！' }
        : item,
    );

    const result = resolveSpeechInput('小张老师，先测温', edited);

    expect(result.scene?.id).toBe('fever-care');
    expect(result.reply).toBe('编辑后的固定回复，标点不变！');
  });

  it('固定回复的字符、空格和标点完全不变', () => {
    const exactReply = '  原样回复，不增删！\n第二行。  ';
    const result = matchScenario(
      '测试关键词',
      [scenario({ keywords: ['测试关键词'], reply: exactReply })],
    );

    expect(result.reply).toBe(exactReply);
    expect([...result.reply]).toEqual([...exactReply]);
  });
});

describe('内置话术表', () => {
  it('至少包含八条完整且启用的托育场景', () => {
    expect(DEFAULT_SCENARIOS.length).toBeGreaterThanOrEqual(8);
    for (const item of DEFAULT_SCENARIOS) {
      expect(item.name).toBeTruthy();
      expect(Number.isFinite(item.priority)).toBe(true);
      expect(item.keywords.length).toBeGreaterThan(0);
      expect(item.similarPhrases.length).toBeGreaterThan(0);
      expect(item.reply).toBeTruthy();
      expect(item.enabled).toBe(true);
    }
  });
});
