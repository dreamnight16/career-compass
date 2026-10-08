'use client';

import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Sparkles, UserCircle, Map, ArrowRight, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const STEPS = [
  { icon: Sparkles, title: '整理你的情况（可选对话）', desc: '可以用对话整理专业、年级和想法，也可以直接编辑画像' },
  { icon: UserCircle, title: '完善个人画像', desc: '做性格测试、兴趣测评，让后面的讨论更有依据' },
  { icon: Map, title: '获取路线图', desc: '可以让助手整理职业路线，也可以先用本地路径模拟' },
];

export function WelcomeGuide() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dismissed = localStorage.getItem('career-compass-welcome-dismissed');
    if (!dismissed) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem('career-compass-welcome-dismissed', 'true');
    setVisible(false);
  };

  // Esc 关闭
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible]);

  // 打开时焦点移入对话框；关闭后焦点回到打开前的元素
  useEffect(() => {
    if (!visible) return;
    restoreRef.current = (document.activeElement as HTMLElement | null) ?? null;
    panelRef.current?.focus();
    return () => {
      const back = restoreRef.current;
      if (back && document.contains(back)) back.focus();
    };
  }, [visible]);

  // 键盘可达：Tab 焦点保持在对话框内循环
  const trapFocus = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!nodes || nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color:var(--dn-overlay)] p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-guide-title"
        tabIndex={-1}
        onKeyDown={trapFocus}
        className="spring-in dn-acrylic dn-elevation-4 w-full max-w-md p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id="welcome-guide-title" className="cc-h2 text-foreground">👋 欢迎来到歧点</h2>
          <button onClick={dismiss} aria-label="关闭欢迎引导"
            className="dn-interactive dn-focus -mr-2 -mt-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mb-6 space-y-2">
          {STEPS.map((s, i) => {
            const isActive = i === step;
            const isDone = i < step;
            const onField = isActive || isDone;
            return (
              <button key={i} onClick={() => setStep(i)}
                aria-current={isActive ? 'step' : undefined}
                className={`dn-focus flex min-h-11 w-full items-center gap-4 border px-4 py-3.5 text-left transition-colors duration-hover ${
                  isActive ? 'border-transparent bg-dn-teal' : isDone ? 'border-transparent bg-dn-emerald' : 'border-border bg-secondary'
                }`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${
                  onField ? 'bg-dn-ink text-dn-on-ink' : 'bg-dn-divider text-muted-foreground'
                }`}>
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-base font-medium ${onField ? 'text-dn-on-color' : 'text-foreground'}`}>{s.title}</span>
                  <span className={`mt-0.5 block text-sm ${onField ? 'text-dn-on-color' : 'text-muted-foreground'}`}>{s.desc}</span>
                </span>
                {isDone && <span className="cc-kicker ml-auto shrink-0 text-dn-on-color">✓ 已完成</span>}
                {isActive && <span className="cc-kicker ml-auto shrink-0 text-dn-on-color">当前</span>}
              </button>
            );
          })}
        </div>

        <button onClick={() => { dismiss(); router.push('/main?tab=coach'); }}
          className="dn-interactive dn-focus flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-5 py-3 text-base font-medium text-primary-foreground">
          开始探索 <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        {/* 该按钮直接落在 acrylic 覆盖层上：`--dn-text-secondary` 只在 Canvas/Surface
            平面验证过，半透明底的实际对比度随背后内容变化，因此这里用可读的正文语义色。 */}
        <button onClick={dismiss}
          className="dn-focus mt-2 flex min-h-11 w-full items-center justify-center py-2 text-sm text-foreground underline decoration-1 underline-offset-4 hover:decoration-2">
          跳过，直接进入
        </button>
      </div>
    </div>
  );
}
