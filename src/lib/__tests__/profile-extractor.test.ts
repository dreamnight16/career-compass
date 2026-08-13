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
});
