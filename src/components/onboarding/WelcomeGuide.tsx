'use client';

import { useState, useEffect } from 'react';
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

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-3xl bg-card p-8 shadow-2xl spring-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground">👋 欢迎来到歧点</h2>
          <button onClick={dismiss} className="rounded-lg p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4 mb-6">
          {STEPS.map((s, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <button key={i} onClick={() => setStep(i)}
                className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                  isActive ? 'border-primary/40 bg-primary/5 shadow-sm' : isDone ? 'border-emerald-200 bg-emerald-50/50' : 'border-border/20 bg-secondary/30'
                }`}>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isActive ? 'bg-primary text-white' : isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
                {isDone && <span className="ml-auto text-emerald-500 text-sm">✓</span>}
              </button>
            );
          })}
        </div>

        <button onClick={() => { dismiss(); router.push('/main?tab=coach'); }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-sm btn-press">
          开始探索 <ArrowRight className="h-4 w-4" />
        </button>
        <button onClick={dismiss} className="mt-2 w-full rounded-xl py-2 text-xs text-muted-foreground hover:text-foreground">跳过，直接进入</button>
      </div>
    </div>
  );
}
