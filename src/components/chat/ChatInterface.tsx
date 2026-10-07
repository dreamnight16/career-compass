'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { ChatMessage, UserProfile } from '@/types';
import { MessageBubble } from './MessageBubble';
import { extractProfile } from '@/lib/profile-extractor';
import { addActivity } from '@/lib/activity-store';
import { hasRoutes as clientHasRoutes } from '@/lib/route-store';
import { parseSourcesLine, stripDoneMarker } from '@/lib/stream-protocol';

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant', timestamp: new Date().toISOString(),
  content: `嗨，我是歧点里的决策助手。\n\n我不会替你选路，但可以陪你把信息、代价和顾虑摊开来看。\n\n先从眼前的情况开始：\n\n**你现在大几，读什么专业？**`,
};

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('career-compass-messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as ChatMessage[];
      }
    } catch { /* ignore */ }
    return [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>(() => {
    try {
      const saved = localStorage.getItem('career-compass-profile');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<string>('');

  // listen for profile changes from other components
  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('career-compass-profile');
        if (saved) setProfile(JSON.parse(saved));
      } catch { /* ignore */ }
    };
    window.addEventListener('profile-updated', load);
    return () => window.removeEventListener('profile-updated', load);
  }, []);

  const persistMessages = useCallback((msgs: ChatMessage[]) => {
    try { localStorage.setItem('career-compass-messages', JSON.stringify(msgs.slice(-50))); } catch { /* ignore */ }
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    const text = input.trim(); if (!text || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const filtered = messages.filter(m => m.content.length > 0);
    const newMessages = [...filtered, userMsg];
    setMessages(newMessages); setInput(''); setLoading(true);

    // 先添加一个空的 assistant 消息，用于流式填充
    const assistantMsg: ChatMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, assistantMsg]);
    streamingRef.current = '';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, hasRoutes: clientHasRoutes() }),
      });

      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => ({} as { error?: string }));
        throw new Error(payload.error || '这次没接上对话服务');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sources: ChatMessage['sources'] = [];
      let pending = '';          // 等待 sources 首行完整到达的缓冲
      let sourcesParsed = false;
      let raw = '';              // sources 行之后的全部正文（可含换行）

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        if (!sourcesParsed) {
          pending += text;
          const parsed = parseSourcesLine(pending);
          if (!parsed.complete) continue; // 首行未完整，继续等待
          if (parsed.meta) {
            sources = (parsed.meta.sources || []) as ChatMessage['sources'];
            const p = parsed.meta.profile;
            if (p && Object.keys(p).length > 0) {
              setProfile(prev => mergeProfile(prev, p as Partial<UserProfile>));
            }
          }
          raw = parsed.rest;
          sourcesParsed = true;
          pending = '';
        } else {
          raw += text;
        }

        streamingRef.current = stripDoneMarker(raw, false);
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: streamingRef.current, sources };
          }
          return updated;
        });
      }

      // 最终状态（flush 解码器 + 未收到换行时 pending 也是正文）
      raw += decoder.decode();
      if (!sourcesParsed) raw = pending;
      const finalContent = stripDoneMarker(raw, true);
      const finalMessages = [...newMessages, {
        role: 'assistant' as const,
        content: finalContent || '收到你的消息，但我暂时无法给出完整的回复。请重试。',
        timestamp: new Date().toISOString(),
        sources,
      }];
      setMessages(finalMessages);
      persistMessages(finalMessages);

      // 提取画像并合并保存
      const extractedProfile = extractProfile(finalMessages);
      let merged: Partial<UserProfile>;
      try {
        const stored = JSON.parse(localStorage.getItem('career-compass-profile') || '{}');
        merged = mergeProfile(stored, extractedProfile);
      } catch { merged = mergeProfile(profile, extractedProfile); }
      setProfile(merged);
      localStorage.setItem('career-compass-profile', JSON.stringify(merged));
      window.dispatchEvent(new Event('profile-updated'));

      // 记录活动
      addActivity({ type: 'chat', title: userMsg.content.slice(0, 30), detail: finalContent.slice(0, 60) });

    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : '这次没接上对话服务';
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        const fallback = `${message}\n\n聊天先停一下。个人画像、资源库、数据对比、路径模拟和决策日志仍然可以继续用。`;
        // 替换空的 assistant 占位为错误消息（不追加）
        if (last.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = { ...last, content: fallback, timestamp: new Date().toISOString() };
        } else {
          updated.push({ role: 'assistant', content: fallback, timestamp: new Date().toISOString() });
        }
        return updated;
      });
    }
    finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || (e as unknown as { keyCode: number }).keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="chat-scroll flex-1 overflow-y-auto px-5 py-6">
        {messages.map((msg, i) => (
          <div key={i}>
            <MessageBubble message={msg} />
            {msg.role === 'assistant' && i === messages.length - 1 && msg.content.length > 20 && !loading && (
              <div className="mb-5 flex justify-start">
                <div className="max-w-[82%] ml-6">
                  <button
                    onClick={() => { setInput('能再详细解释一下吗？'); }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                  还想继续的话，可以问：“能再详细解释一下吗？”
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === '' && <div className="mb-5 flex justify-start">
            <div className="max-w-[82%]"><div className="mb-1 flex items-center gap-2"><span className="text-xs font-medium uppercase tracking-wider text-primary/60">歧点</span><span className="h-px flex-1 bg-border" /></div>
          <div className="rounded-r-xl rounded-bl-md border-l-[3px] border-primary/40 bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center gap-1.5"><div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" /><div className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:0.12s]" /><div className="h-2 w-2 animate-bounce rounded-full bg-primary/50 [animation-delay:0.24s]" /></div></div></div></div>}
        <div ref={chatEndRef} />
      </div>
      <div className="shrink-0 border-t border-border/50 bg-card/60 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="说说你现在在纠结什么..." rows={2}
            className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20" disabled={loading}
            aria-label="聊天输入" />
          <button onClick={handleSend} disabled={loading || !input.trim()}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-20">发送</button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground">先把路看清楚，决定还是你来做</p>
      </div>
    </div>
  );
}

function mergeProfile(old: Partial<UserProfile>, incoming: Partial<UserProfile>): Partial<UserProfile> {
  const merged = { ...old };
  for (const key of Object.keys(incoming) as (keyof UserProfile)[]) {
    const newVal = incoming[key]; if (newVal === undefined || newVal === null) continue;
    if (Array.isArray(newVal) && Array.isArray(merged[key])) {
      const combined = [...(merged[key] as string[])];
      for (const item of newVal as string[]) { if (!combined.includes(item)) combined.push(item); }
      (merged as Record<string, unknown>)[key] = combined;
    } else if (Array.isArray(newVal)) { (merged as Record<string, unknown>)[key] = [...(newVal as string[])]; }
    else { (merged as Record<string, unknown>)[key] = newVal; }
  }
  return merged;
}
