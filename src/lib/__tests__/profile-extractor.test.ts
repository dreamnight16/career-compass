import { describe, it, expect } from 'vitest';
import { extractProfile, extractCompetencySignals } from '@/lib/profile-extractor';

describe('extractProfile', () => {
  it('extracts grade, major, university tier, and target city', () => {
    const profile = extractProfile([
      { role: 'user', content: '我是大二的学生，专业是计算机科学，学校是985，毕业后想去上海工作。' },
    ]);

    expect(profile.grade).toBe('大二');
    expect(profile.major).toBe('计算机科学与技术');
    expect(profile.universityTier).toBe('985');
    expect(profile.targetCity).toBe('上海');
  });

  it('extracts household budget from the "预算/家里能支持" prefix pattern', () => {
    const profile = extractProfile([
      { role: 'user', content: '我家里能支持30万。' },
    ]);

    expect(profile.householdBudget).toBe(300000);
  });

  it('collects interests, lifestyle preferences, and red lines', () => {
    const profile = extractProfile([
      { role: 'user', content: '我喜欢游戏和编程，想要高薪稳定，不能接受996，也不想考研。' },
    ]);

    expect(profile.interests).toEqual(['游戏', '编程开发']);
    expect(profile.lifestyle).toContain('追求高薪');
    expect(profile.lifestyle).toContain('稳定优先');
    expect(profile.redLines).toEqual(['不接受996', '不考研']);
  });

  it('extracts a graduate grade (研一)', () => {
    const profile = extractProfile([
      { role: 'user', content: '我是研一的学生。' },
    ]);

    expect(profile.grade).toBe('研一');
  });

  it('collects multiple target cities in mention order', () => {
    const profile = extractProfile([
      { role: 'user', content: '我想去上海或者北京工作。' },
    ]);

    expect(profile.targetCity).toBe('上海、北京');
  });

  it('does not treat 不是985 as 985 tier, falls through to 211', () => {
    const profile = extractProfile([
      { role: 'user', content: '我不是985，是211。' },
    ]);

    expect(profile.universityTier).toBe('211');
  });

  it('detects 双非一本 and 专科 tiers', () => {
    expect(extractProfile([{ role: 'user', content: '我是双非一本。' }]).universityTier).toBe('双非一本');
    expect(extractProfile([{ role: 'user', content: '我是大专。' }]).universityTier).toBe('专科');
  });

  it('extracts household budget from the suffix "30万预算" pattern', () => {
    const profile = extractProfile([
      { role: 'user', content: '我有30万预算。' },
    ]);

    expect(profile.householdBudget).toBe(300000);
  });

  it('infers a low budget (50000) from indirect signals', () => {
    const profile = extractProfile([
      { role: 'user', content: '我家里条件一般。' },
    ]);

    expect(profile.householdBudget).toBe(50000);
  });

  it('raises budget to 300000 when studying abroad with family support is mentioned', () => {
    const profile = extractProfile([
      { role: 'user', content: '家里能支持我出国。' },
    ]);

    expect(profile.householdBudget).toBe(300000);
  });

  it('returns an empty profile for empty input', () => {
    expect(extractProfile([])).toEqual({});
  });
});

describe('extractCompetencySignals', () => {
  it('infers a course signal with level 3 from self-reported coursework', () => {
    const signals = extractCompetencySignals([
      { role: 'user', content: '我修过计算机网络课程' },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0].inferredLevel).toBe(3);
    expect(signals[0].competencyId).toBe('inferred-course-计算机网络');
  });

  it('infers a cert signal with level 3 and confidence 0.5', () => {
    const signals = extractCompetencySignals([
      { role: 'user', content: '我考了CET6证书' },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0].competencyId).toBe('inferred-cert-CET6');
    expect(signals[0].inferredLevel).toBe(3);
    expect(signals[0].confidence).toBe(0.5);
  });

  it('infers a project signal with level 3', () => {
    const signals = extractCompetencySignals([
      { role: 'user', content: '我做过数据分析项目' },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0].competencyId).toBe('inferred-project-数据分析');
    expect(signals[0].inferredLevel).toBe(3);
  });

  it('infers a weak signal with level 1 and confidence 0.7', () => {
    const signals = extractCompetencySignals([
      { role: 'user', content: '英语基础差' },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0].competencyId).toBe('inferred-weak-英语');
    expect(signals[0].inferredLevel).toBe(1);
    expect(signals[0].confidence).toBe(0.7);
  });

  it('infers a strong signal with level 4 and confidence 0.7', () => {
    const signals = extractCompetencySignals([
      { role: 'user', content: 'Python很熟练' },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0].competencyId).toBe('inferred-strong-Python');
    expect(signals[0].inferredLevel).toBe(4);
    expect(signals[0].confidence).toBe(0.7);
  });

  it('infers a teach signal with level 5 and confidence 0.7', () => {
    const signals = extractCompetencySignals([
      { role: 'user', content: '数据分析教过同学' },
    ]);

    expect(signals).toHaveLength(1);
    expect(signals[0].competencyId).toBe('inferred-teach-数据分析');
    expect(signals[0].inferredLevel).toBe(5);
    expect(signals[0].confidence).toBe(0.7);
  });

  it('returns no signals when nothing matches', () => {
    expect(extractCompetencySignals([
      { role: 'user', content: '我今天心情不错' },
    ])).toEqual([]);
  });
});
