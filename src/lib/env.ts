/**
 * 启动配置校验模块。
 *
 * 在 Next.js 服务器启动钩子（src/instrumentation.ts）中调用，
 * 使「缺少必需密钥」这类配置错误在启动阶段就暴露，而不是等到
 * 用户请求时才抛出一个难以定位的 500。
 */

/** AI 引擎至少需要配置一个提供方密钥。 */
export const AI_PROVIDER_KEYS = ['ANTHROPIC_API_KEY', 'DEEPSEEK_API_KEY'] as const;

export function validateConfig(): void {
  const hasAiKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY);
  if (hasAiKey) return;

  const message =
    '[config] 缺少 AI 密钥：请设置 ANTHROPIC_API_KEY 或 DEEPSEEK_API_KEY（至少一个），' +
    '参考 .env.example。AI 功能将不可用。';

  // 生产运行时 fail fast；构建阶段（next build）除外，避免因缺少密钥导致构建失败。
  const isProductionServer =
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build';

  if (isProductionServer) {
    throw new Error(message);
  }

  console.warn(message);
}
