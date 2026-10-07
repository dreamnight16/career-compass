import { memo } from 'react';
import type { ChatMessage, KnowledgeAtom, WebSource, ChatSource } from '@/types';
import { safeMarkdown } from '@/lib/utils';

interface MessageBubbleProps { message: ChatMessage }

function isKnowledgeAtom(s: ChatSource): s is KnowledgeAtom {
  return 'category' in s;
}

function getSourceInfo(s: ChatSource): { title: string; url: string; badge: string; badgeClass: string } {
  if (isKnowledgeAtom(s)) {
    const badge = s.trustLevel === 'official' ? '官方' : s.trustLevel === 'ai-inferred' ? 'AI推断' : '社区';
    const badgeClass = s.trustLevel === 'official'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : s.trustLevel === 'ai-inferred'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-50 text-slate-600 border-slate-200';
    return { title: s.title, url: s.sourceUrl, badge, badgeClass };
  }
  return { title: s.title, url: s.url, badge: '搜索', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' };
}

function SourceLink({ source }: { source: ChatSource }) {
  const { title, url, badge, badgeClass } = getSourceInfo(source);
  if (!url?.startsWith('http')) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-md border border-border/40 bg-background px-2 py-1 text-xs text-primary transition-colors hover:bg-secondary">
      <span className="truncate">{title}</span>
      <span className={`shrink-0 rounded border px-1 py-px text-[9px] font-medium ${badgeClass}`}>{badge}</span>
      <span className="shrink-0 text-muted-foreground">↗</span>
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
        <div className="max-w-[75%] rounded-2xl bg-secondary px-4 py-2.5">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-secondary-foreground" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="max-w-[82%]">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-primary">歧点</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="rounded-r-xl rounded-bl-md border-l-[3px] border-primary bg-card px-4 py-3 shadow-sm">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground" dangerouslySetInnerHTML={{ __html: html }} />
            {realSources.length > 0 && (
              <div className="mt-3 border-t border-border pt-2">
                <span className="text-xs text-muted-foreground">参考来源</span>
                <div className="mt-1.5 space-y-1">
                  {realSources.slice(0, 5).map((s, i) => (
                    <SourceLink key={isKnowledgeAtom(s) ? s.id : s.url} source={s} />
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Feedback bar — only for assistant messages */}
        {!isUser && message.content.length > 0 && (
          <div className="mt-3 flex items-center gap-1 border-t border-border/30 pt-2">
            <button
              onClick={() => {
                import('@/lib/activity-store').then(({ addActivity }) => {
                  addActivity({ type: 'chat', title: '👍 有用:', detail: message.content.slice(0, 50) });
                });
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-emerald-600 transition-all active:scale-90"
              aria-label="有用"
            >
              👍 <span className="text-[10px]">有用</span>
            </button>
            <button
              onClick={() => {
                import('@/lib/activity-store').then(({ addActivity }) => {
                  addActivity({ type: 'chat', title: '👎 无用:', detail: message.content.slice(0, 50) });
                });
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-red-500 transition-all active:scale-90"
              aria-label="没用"
            >
              👎 <span className="text-[10px]">没用</span>
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(message.content).then(() => {
                  import('@/components/ui/toast').then(({ toast }) => toast('success', '已复制到剪贴板'));
                }).catch(() => {});
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-90 ml-auto"
              aria-label="复制"
            >
              📋 <span className="text-[10px]">复制</span>
            </button>
          </div>
        )}
      </div>
    )}
  </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
