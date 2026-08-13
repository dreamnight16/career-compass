import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

/**
 * 轻量级 API 防护：Bearer token 鉴权 + 内存 IP 限流。
 *
 * - 鉴权：设置环境变量 `API_AUTH_TOKEN` 后，所有请求必须携带
 *   `Authorization: Bearer <token>`，否则返回 401。未设置时跳过鉴权（便于本地开发）。
 * - 限流：同一 IP 在滑动窗口内超过上限返回 429。
 *
 * 注意：内存实现仅在单实例部署下有效；多实例/Serverless 场景请改用共享存储（如 Redis）。
 */

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 分钟滑动窗口
const RATE_LIMIT_MAX = 30; // 每窗口最多请求数

// IP -> 该窗口内最近的请求时间戳（毫秒）
const requestTimestamps = new Map<string, number[]>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestTimestamps.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (recent.length >= RATE_LIMIT_MAX) {
    requestTimestamps.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestTimestamps.set(ip, recent);

  // 定期清理过期 IP，避免内存无限增长
  if (requestTimestamps.size > 1000) {
    for (const [key, times] of requestTimestamps) {
      const alive = times.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (alive.length === 0) requestTimestamps.delete(key);
      else requestTimestamps.set(key, alive);
    }
  }

  return false;
}

/**
 * 校验请求的鉴权与限流。
 * 未通过时返回对应的 NextResponse（401/429），通过时返回 null 表示放行。
 */
export function enforceApiGuard<T>(
  request: NextRequest
): NextResponse<ApiResponse<T>> | null {
  const token = process.env.API_AUTH_TOKEN;
  if (token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${token}`) {
      return NextResponse.json<ApiResponse<T>>({ success: false, error: '未授权' }, { status: 401 });
    }
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json<ApiResponse<T>>(
      { success: false, error: '请求过于频繁，请稍后再试' },
      { status: 429 }
    );
  }

  return null;
}
