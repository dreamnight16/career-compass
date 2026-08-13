/**
 * Next.js 服务器启动钩子。
 * 服务器实例启动时执行一次，用于校验必需配置。
 */
import { validateConfig } from '@/lib/env';

export function register(): void {
  validateConfig();
}
