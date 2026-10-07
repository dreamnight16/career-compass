import { afterEach, describe, expect, it, vi } from 'vitest';
import { isAiConfigured } from '@/lib/ai-client';
import { validateConfig } from '@/lib/env';

const originalAnthropic = process.env.ANTHROPIC_API_KEY;
const originalDeepSeek = process.env.DEEPSEEK_API_KEY;

afterEach(() => {
  if (originalAnthropic === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = originalAnthropic;
  if (originalDeepSeek === undefined) delete process.env.DEEPSEEK_API_KEY;
  else process.env.DEEPSEEK_API_KEY = originalDeepSeek;
  vi.restoreAllMocks();
});

describe('optional AI configuration', () => {
  it('does not block startup when no provider key is present', () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.DEEPSEEK_API_KEY;
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(() => validateConfig()).not.toThrow();
    expect(isAiConfigured()).toBe(false);
  });

  it('reports AI as configured when either provider key is present', () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.DEEPSEEK_API_KEY = 'test-key';

    expect(isAiConfigured()).toBe(true);
  });
});
