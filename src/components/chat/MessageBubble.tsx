import { memo } from 'react';
import type { ChatMessage, KnowledgeAtom, WebSource, ChatSource } from '@/types';
import { safeMarkdown } from '@/lib/utils';

interface MessageBubbleProps { message: ChatMessage }

function isKnowledgeAtom(s: ChatSource): s is KnowledgeAtom {
  return 'category' in s;
}

/** 来源可信度：品牌实色场 + 文字标签，颜色之外一定有可读的等级文字 */
function getSourceInfo(s: ChatSource): { title: string; url: string; badge: string; badgeClass: string } {
  if (isKnowledgeAtom(s)) {
    const badge = s.trustLevel === 'official' ? '官方' : s.trustLevel === 'ai-inferred' ? 'AI推断' : '社区';
    const badgeClass = s.trustLevel === 'official'
      ? 'bg-dn-emerald text-dn-on-color'
      : s.trustLevel === 'ai-inferred'
        ? 'bg-dn-amber text-dn-on-color'
        : 'bg-dn-steel text-dn-on-color';
    return { title: s.title, url: s.sourceUrl, badge, badgeClass };
  }
  return { title: s.title, url: s.url, badge: '搜索', badgeClass: 'bg-dn-cyan text-dn-on-color' };
}

function SourceLink({ source }: { source: ChatSource }) {
  const { title, url, badge, badgeClass } = getSourceInfo(source);
  if (!url?.startsWith('http')) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="dn-focus flex min-h-11 items-center gap-2 border-b border-border py-1.5 text-xs text-foreground underline decoration-1 underline-offset-2 transition-colors hover:bg-secondary hover:decoration-2">
      <span className="truncate">{title}</span>
      <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-medium ${badgeClass}`}>{badge}</span>
      <span className="shrink-0 text-muted-foreground" aria-hidden="true">↗</span>
    </a>
  );
}

function MessageBubbleInner({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const html = safeMarkdown(message.content);

  const realSources = (message.sources || []).filter(s => {
    const url = isKnowledgeAtom(s) ? s.sourceUrl : s.url;
    return url && url.startsWith('http');
  });

  return (
    <div className={`mb-5 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {isUser ? (
        /* 用户消息：Ink 实色场，正文用 on-ink；
           同时把 --foreground 就近重映射，避免 safeMarkdown 生成的 <strong class="text-foreground"> 在深色场上失去对比度 */
        <div
          className="max-w-[75%] bg-dn-ink px-4 py-3 text-dn-on-ink"
          style={{ ['--foreground' as string]: 'var(--dn-text-on-ink)' }}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="max-w-[82%]">
          <div className="mb-1 flex items-center gap-2">
            <span className="cc-kicker text-foreground">歧点</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          {/* 助手消息：Surface 平面 + 左侧品牌色竖条，平面无阴影 */}
          <div className="border-l-[3px] border-primary bg-card px-4 py-3">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
            {realSources.length > 0 && (
              <div className="mt-3 border-t border-border pt-2">
                <span className="cc-kicker text-muted-foreground">参考来源</span>
                <div className="mt-1">
                  {realSources.slice(0, 5).map((s, i) => (
                    <SourceLink key={isKnowledgeAtom(s) ? s.id : s.url} source={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Feedback bar — only for assistant messages */}
        {!isUser && message.content.length > 0 && (
          <div className="mt-2 flex items-center gap-1 border-t border-border pt-1">
            <button
              onClick={() => {
                import('@/lib/activity-store').then(({ addActivity }) => {
                  addActivity({ type: 'chat', title: '👍 有用:', detail: message.content.slice(0, 50) });
                });
              }}
              className="btn-press dn-focus inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="有用"
            >
              <span aria-hidden="true">👍</span> <span className="text-[11px]">有用</span>
            </button>
            <button
              onClick={() => {
                import('@/lib/activity-store').then(({ addActivity }) => {
                  addActivity({ type: 'chat', title: '👎 无用:', detail: message.content.slice(0, 50) });
                });
              }}
              className="btn-press dn-focus inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 px-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="没用"
            >
              <span aria-hidden="true">👎</span> <span className="text-[11px]">没用</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.content).then(() => {
                  import('@/components/ui/toast').then(({ toast }) => toast('success', '已复制到剪贴板'));
                }).catch(() => {});
              }}
              className="btn-press dn-focus ml-auto inline-flex min-h-11 items-center justify-center gap-1.5 px-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="复制"
            >
              <span aria-hidden="true">📋</span> <span className="text-[11px]">复制</span>
            </button>
          </div>
        )}
      </div>
    )}
  </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
