import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile } from '@/types';
import { generateRoutes } from '@/lib/planner';
import { enforceApiGuard } from '@/lib/api-guard';

const STRING_FIELDS = ['grade', 'major', 'universityTier', 'targetCity', 'targetCareer'] as const;
const ARRAY_FIELDS = ['interests', 'lifestyle', 'redLines'] as const;

/**
 * 校验画像字段类型，避免运行时 TypeError。
 * 返回错误信息字符串；合法时返回 null。
 */
function validateProfile(profile: Record<string, unknown>): string | null {
  for (const field of STRING_FIELDS) {
    const value = profile[field];
    if (value !== undefined && value !== null && typeof value !== 'string') {
      return `profile.${field} 必须是字符串`;
    }
  }

  for (const field of ARRAY_FIELDS) {
    const value = profile[field];
    if (value === undefined || value === null) continue;
    if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
      return `profile.${field} 必须是字符串数组`;
    }
  }

  const budget = profile.householdBudget;
  if (budget !== undefined && budget !== null && (typeof budget !== 'number' || !Number.isFinite(budget))) {
    return 'profile.householdBudget 必须是数字';
  }

  const competencies = profile.currentCompetencies;
  if (competencies !== undefined && competencies !== null) {
    if (!Array.isArray(competencies)) {
      return 'profile.currentCompetencies 必须是数组';
    }
    for (const item of competencies) {
      const c = item as Record<string, unknown>;
      if (
        !c ||
        typeof c !== 'object' ||
        typeof c.name !== 'string' ||
        typeof c.selfAssessedLevel !== 'number'
      ) {
        return 'profile.currentCompetencies 项必须包含 name 和 selfAssessedLevel';
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const guardResponse = enforceApiGuard(request);
  if (guardResponse) return guardResponse;

  try {
    const body = await request.json();
    const profileRaw: unknown = body?.profile;

    if (!profileRaw || typeof profileRaw !== 'object' || Array.isArray(profileRaw)) {
      return NextResponse.json({ success: false, error: '请提供用户画像' }, { status: 400 });
    }

    const profile = profileRaw as Partial<UserProfile>;
    const validationError = validateProfile(profileRaw as Record<string, unknown>);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    const routes = await generateRoutes(profile);
    return NextResponse.json({ success: true, data: { routes } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '规划失败';
    console.error('[plan] error:', message);
    return NextResponse.json({ success: false, error: '路线生成失败，请稍后再试' }, { status: 500 });
  }
}
