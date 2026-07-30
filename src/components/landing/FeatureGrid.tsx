'use client';

import { Sparkles, UserCircle, Database, Library } from 'lucide-react';

const features = [
  { icon: Sparkles, title: 'AI规划师', desc: '一对一深度对话，教决策不替决策' },
  { icon: UserCircle, title: '个人画像', desc: '8维角色卡 + 能力诊断，看清自己' },
  { icon: Database, title: '数据库', desc: '300+职业数据点，每条都有来源' },
  { icon: Library, title: '资源库', desc: '300+精选学习资源，精准匹配' },
];

interface FeatureGridProps {
  onEnter: () => void;
}

export function FeatureGrid({ onEnter }: FeatureGridProps) {
  return (
    <section className="min-h-screen bg-background px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-16 text-center text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
          四大模块
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <f.icon className="mb-5 h-7 w-7 text-primary/70 transition-colors group-hover:text-primary" strokeWidth={1.5} />
              <h3 className="mb-2 text-lg font-semibold tracking-tight text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={onEnter}
            className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:scale-[1.03] hover:shadow-md active:scale-[0.98]"
          >
            进入歧点
          </button>
        </div>
      </div>
    </section>
  );
}
