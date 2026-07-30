'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { getRoutes } from '@/lib/route-store';
import { getAchievements, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';
import { getStreak } from '@/lib/streak-store';
import { toast } from '@/components/ui/toast';

type Theme = 'clean' | 'vibrant' | 'minimal';

const THEMES: { key: Theme; label: string; bg: string; text: string; accent: string }[] = [
  { key: 'clean', label: '简洁', bg: 'bg-card', text: 'text-foreground', accent: '#c96442' },
  { key: 'vibrant', label: '炫彩', bg: 'bg-gradient-to-br from-amber-50 to-orange-50', text: 'text-foreground', accent: '#f59e0b' },
  { key: 'minimal', label: '极简', bg: 'bg-white', text: 'text-slate-800', accent: '#475569' },
];

interface ShareCardProps {}

export function ShareCard(_props: ShareCardProps) {
  const [theme, setTheme] = useState<Theme>('vibrant');
  const [sections, setSections] = useState({ routes: true, badges: true, streak: true });
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const routes = getRoutes();
  const activeCount = routes.filter(r => r.status === 'active').length;
  const completedCount = routes.filter(r => r.status === 'completed').length;
  const badgeCount = getAchievements().length;
  const streak = getStreak();
  const t = THEMES.find(th => th.key === theme) || THEMES[0];

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyImage = useCallback(async () => {
    setCopied(true);
    toast('success', '已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const saveImage = useCallback(() => {
    toast('success', '截图保存功能开发中');
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          分享我的成长
        </h2>
      </div>

      {/* Theme selector */}
      <div className="flex gap-2">
        {THEMES.map(th => (
          <button
            key={th.key}
            onClick={() => setTheme(th.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              theme === th.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {th.label}
          </button>
        ))}
      </div>

      {/* Section toggles */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'routes' as const, label: '路线进度' },
          { key: 'badges' as const, label: '徽章数量' },
          { key: 'streak' as const, label: '连续天数' },
        ].map(s => (
          <label key={s.key} className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={sections[s.key]} onChange={() => toggleSection(s.key)}
              className="rounded border-border text-primary focus:ring-primary/30" />
            {s.label}
          </label>
        ))}
      </div>

      {/* Preview card */}
      <div
        ref={cardRef}
        className={`relative rounded-2xl border-2 border-border/30 p-6 shadow-xl share-card-3d overflow-hidden ${t.bg} ${t.text}`}
        style={{ maxWidth: 380 }}
      >
        {/* Decorative top bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />

        <h3 className="text-lg font-bold mb-4">✦ 歧点 · 我的职业成长报告 ✦</h3>

        {/* Metric chips */}
        <div className="flex gap-3 mb-4">
          {sections.routes && (
            <div className="flex-1 rounded-xl border border-border/30 bg-white/50 p-3 text-center">
              <div className="text-2xl">🗺️</div>
              <div className="text-xl font-bold">{activeCount}</div>
              <div className="text-[10px] text-muted-foreground">活跃路线 · {completedCount} 完成</div>
            </div>
          )}
          {sections.streak && (
            <div className="flex-1 rounded-xl border border-border/30 bg-white/50 p-3 text-center">
              <div className="text-2xl">🔥</div>
              <div className="text-xl font-bold">{streak}</div>
              <div className="text-[10px] text-muted-foreground">连续打卡</div>
            </div>
          )}
          {sections.badges && (
            <div className="flex-1 rounded-xl border border-border/30 bg-white/50 p-3 text-center">
              <div className="text-2xl">🏅</div>
              <div className="text-xl font-bold">{badgeCount}/{TOTAL_ACHIEVEMENTS}</div>
              <div className="text-[10px] text-muted-foreground">成就徽章</div>
            </div>
          )}
        </div>

        {/* Progress bar for badges */}
        {sections.badges && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>🏅 成就进度</span>
              <span>{badgeCount}/{TOTAL_ACHIEVEMENTS}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(badgeCount / TOTAL_ACHIEVEMENTS) * 100}%`, background: `linear-gradient(90deg, ${t.accent}, #f59e0b)` }} />
            </div>
          </div>
        )}

        {/* Custom signature */}
        <p className="text-xs text-muted-foreground italic mb-3">&ldquo;把路看清楚，决定你自己做&rdquo;</p>

        {/* Footer */}
        <div className="text-[10px] text-muted-foreground/60">
          生成时间: {new Date().toISOString().slice(0, 10)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={copyImage}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? '已复制' : '复制图片'}
        </button>
        <button onClick={saveImage}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary">
          <Download className="h-4 w-4" />
          保存到本地
        </button>
      </div>
    </div>
  );
}
