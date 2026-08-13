import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';
import type { OccupationCompetencyProfile } from '@/types/competency';
import { generateCompetencyProfile } from '@/lib/competency-generator';
import { enforceApiGuard } from '@/lib/api-guard';

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<OccupationCompetencyProfile>>> {
  const guardResponse = enforceApiGuard(request);
  if (guardResponse) return guardResponse;

  try {
    const body = await request.json();
    const occupation: string = body.occupation;

    if (!occupation || typeof occupation !== 'string' || occupation.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供目标职业' },
        { status: 400 }
      );
    }
    if (occupation.length > 50) {
      return NextResponse.json(
        { success: false, error: '职业名称过长' },
        { status: 400 }
      );
    }

    const profile = await generateCompetencyProfile(occupation.trim());

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 服务暂时不可用';
    console.error('[competency] error:', message);

    return NextResponse.json(
      {
        success: false,
        error: message.includes('ANTHROPIC_API_KEY')
          ? 'AI 服务未配置'
          : '能力画像生成失败，请稍后再试',
      },
      { status: 500 }
    );
  }
}
