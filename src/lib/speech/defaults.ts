import type { Scenario } from './types';

export const WAKE_WORD = '小张老师';
export const WAKE_ONLY_REPLY = '我在，请说';
export const UNMATCHED_REPLY = '我暂时没有听清，请再说一次';

export const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: 'airway-obstruction',
    name: '异物卡喉',
    priority: 1,
    keywords: ['异物卡喉', '卡喉', '噎住', '气道异物'],
    similarPhrases: ['孩子吃东西卡住了怎么办', '幼儿噎食如何处理'],
    reply:
      '立即停止进食并判断呼吸和咳嗽情况。无法有效咳嗽或呼吸时，立即呼叫急救，由受训人员按年龄实施气道异物急救；不要盲掏口腔。本演示不能替代急救培训或专业诊疗。',
    enabled: true,
  },
  {
    id: 'fever-care',
    name: '发热应对',
    priority: 10,
    keywords: ['发烧', '发热', '体温高'],
    similarPhrases: ['孩子体温升高怎么处理', '幼儿身体很烫怎么办'],
    reply:
      '先测体温并观察精神、呼吸和饮水情况，减少衣被，少量多次补液，及时通知家长。出现意识异常、抽搐、呼吸困难或持续精神萎靡时立即就医。本演示不能替代专业诊疗。',
    enabled: true,
  },
  {
    id: 'fall-care',
    name: '跌倒磕碰',
    priority: 20,
    keywords: ['跌倒', '磕碰', '摔伤', '撞到头'],
    similarPhrases: ['孩子不小心摔了一跤怎么办', '幼儿碰到头部如何观察'],
    reply:
      '先保持现场安全，检查意识、呼吸和受伤部位，不随意搬动疑似颈椎或严重损伤的幼儿。头部撞击后持续观察，出现呕吐、嗜睡或意识异常立即就医。本演示不能替代专业诊疗。',
    enabled: true,
  },
  {
    id: 'meal-care',
    name: '进餐照护',
    priority: 30,
    keywords: ['进餐', '吃饭', '喂食', '挑食'],
    similarPhrases: ['孩子用餐时需要注意什么', '幼儿不肯吃饭怎么照护'],
    reply:
      '营造安静进餐环境，核对食物禁忌，保持坐姿，鼓励自主进食并控制一口量。照护者全程观察，不追喂、不逗笑，发现呛咳立即停止进食。',
    enabled: true,
  },
  {
    id: 'nap-check',
    name: '午睡巡查',
    priority: 40,
    keywords: ['午睡', '午休', '睡姿', '巡查'],
    similarPhrases: ['孩子睡觉时老师要观察什么', '幼儿午休期间如何照看'],
    reply:
      '午睡前检查口腔和随身小物件，保持安全睡姿。按规定定时巡查，观察面色、呼吸、体温和被褥遮盖，保持呼吸道通畅，异常情况立即处理并记录。',
    enabled: true,
  },
  {
    id: 'emotion-comfort',
    name: '情绪安抚',
    priority: 50,
    keywords: ['哭闹', '情绪', '安抚', '分离焦虑'],
    similarPhrases: ['孩子一直哭应该怎么安慰', '幼儿入园焦虑怎么陪伴'],
    reply:
      '先蹲下与幼儿平视，用平静语气确认感受，陪伴其呼吸和安全表达。排查饥饿、疼痛或环境刺激，不呵斥、不贴标签，逐步帮助恢复活动。',
    enabled: true,
  },
  {
    id: 'handwashing',
    name: '洗手指导',
    priority: 60,
    keywords: ['洗手', '清洁双手', '七步洗手'],
    similarPhrases: ['怎样带孩子把双手洗干净', '幼儿正确清洁手部的方法'],
    reply:
      '用流动水打湿双手，取适量洗手液，按顺序清洁掌心、手背、指缝、指背、拇指、指尖和手腕，冲洗后擦干。进餐前、如厕后和户外活动后都要认真洗手。',
    enabled: true,
  },
  {
    id: 'family-communication',
    name: '家长沟通',
    priority: 70,
    keywords: ['家长', '沟通', '离园', '家园'],
    similarPhrases: ['怎样和父母交流孩子在园情况', '离园时如何与监护人交流'],
    reply:
      '先陈述客观事实，再说明已采取的照护措施和幼儿当前状态，认真倾听家长关切。重要情况及时记录并共同确认后续安排，保护幼儿隐私，避免主观评价。',
    enabled: true,
  },
];
