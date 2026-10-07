/**
 * 启动配置校验模块。
 *
 * 在 Next.js 服务器启动钩子（src/instrumentation.ts）中调用，
 * 让缺少 AI 密钥在启动日志中可见，但不阻止本地数据工具运行。
 */

/** AI 是可选的辅助层；本地画像、资料和比较工具不需要密钥。 */
export const AI_PROVIDER_KEYS = ['ANTHROPIC_API_KEY', 'DEEPSEEK_API_KEY'] as const;

export function validateConfig(): void {
  const hasAiKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.DEEPSEEK_API_KEY);
  if (hasAiKey) return;

  console.warn(
    '[config] 未配置 AI 密钥。对话、路线和能力画像功能将暂不可用；本地资料、画像、测评和比较工具仍可使用。',
  );
}
