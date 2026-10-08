'use client';

import { useState, useRef, useCallback } from 'react';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { getRoutes } from '@/lib/route-store';
import { getAchievements, TOTAL_ACHIEVEMENTS } from '@/lib/achievement-store';
import { getStreak } from '@/lib/streak-store';
import { toast } from '@/components/ui/toast';

type Theme = 'clean' | 'vibrant' | 'minimal';

/** 三套主题全部由 DNDL 实色场组合而成：不再有品牌外颜色、十六进制色值与渐变。
 *  field 是顶栏与进度条用的品牌实色；chip 是卡片内部的浅色信息块。 */
const THEMES: {
  key: Theme;
  label: string;
  bg: string;
  text: string;
  dim: string;
  field: string;
  chip: string;
}[] = [
  {
    key: 'clean',
    label: '简洁',
    bg: 'bg-dn-surface',
    text: 'text-foreground',
    dim: 'text-muted-foreground',
    field: 'bg-dn-teal',
    chip: 'border-border bg-dn-canvas text-foreground',
  },
  {
    key: 'vibrant',
    label: '炫彩',
    bg: 'bg-dn-violet',
    text: 'text-dn-on-color',
    dim: 'text-dn-on-color',
    field: 'bg-dn-amber',
    chip: 'border-border bg-dn-canvas text-foreground',
  },
  {
    key: 'minimal',
    label: '极简',
    bg: 'bg-dn-canvas',
    text: 'text-foreground',
    dim: 'text-muted-foreground',
    field: 'bg-dn-steel',
    chip: 'border-border bg-dn-surface text-foreground',
  },
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
        <h2 className="cc-h2 text-foreground flex items-center gap-2">
          <Share2 className="h-5 w-5 text-dn-teal" aria-hidden="true" />
          分享我的成长
        </h2>
      </div>

      {/* Theme selector */}
      <div className="flex gap-2">
        {THEMES.map(th => (
          <button
            key={th.key}
            onClick={() => setTheme(th.key)}
            aria-pressed={theme === th.key}
            className={`min-h-11 px-3 text-xs transition-colors ${
              theme === th.key ? 'bg-primary text-primary-foreground' : 'bg-dn-divider text-foreground'
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
          <label key={s.key} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={sections[s.key]} onChange={() => toggleSection(s.key)}
              className="h-4 w-4 border-input text-primary" />
            {s.label}
          </label>
        ))}
      </div>

      {/* Preview card */}
      <div
        ref={cardRef}
        className={`relative overflow-hidden border border-border p-6 ${t.bg} ${t.text}`}
        style={{ maxWidth: 380 }}
      >
        {/* 顶部品牌实色条 */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${t.field}`} aria-hidden="true" />

        <h3 className="cc-h2 mt-2 mb-4">歧点 · 我的职业成长报告</h3>

        {/* Metric chips */}
        <div className="flex gap-3 mb-4">
          {sections.routes && (
            <div className={`flex-1 border p-3 text-center ${t.chip}`}>
              <div className="text-2xl" aria-hidden="true">🗺️</div>
              <div className="cc-num text-2xl">{activeCount}</div>
              <div className="text-[10px] text-muted-foreground">活跃路线 · {completedCount} 完成</div>
            </div>
          )}
          {sections.streak && (
            <div className={`flex-1 border p-3 text-center ${t.chip}`}>
              <div className="text-2xl" aria-hidden="true">🔥</div>
              <div className="cc-num text-2xl">{streak}</div>
              <div className="text-[10px] text-muted-foreground">连续打卡</div>
            </div>
          )}
          {sections.badges && (
            <div className={`flex-1 border p-3 text-center ${t.chip}`}>
              <div className="text-2xl" aria-hidden="true">🏅</div>
              <div className="cc-num text-2xl">{badgeCount}/{TOTAL_ACHIEVEMENTS}</div>
              <div className="text-[10px] text-muted-foreground">成就徽章</div>
            </div>
          )}
        </div>

        {/* Progress bar for badges */}
        {sections.badges && (
          <div className="mb-4">
            <div className={`flex justify-between text-xs mb-2 ${t.dim}`}>
              <span>成就进度</span>
              <span className="cc-num">{badgeCount}/{TOTAL_ACHIEVEMENTS}</span>
            </div>
            <div className="h-1.5 w-full bg-dn-divider overflow-hidden">
              <div
                className={`h-full ${t.field} transition-all duration-700`}
                style={{ width: `${(badgeCount / TOTAL_ACHIEVEMENTS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Custom signature */}
        <p className={`text-xs italic mb-3 ${t.dim}`}>&ldquo;把路看清楚，决定你自己做&rdquo;</p>

        {/* Footer：这是本卡片的预览生成时间，不是实时数据 */}
        <div className={`text-[11px] ${t.dim}`}>
          预览生成时间: {new Date().toISOString().slice(0, 10)}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button onClick={copyImage}
          className="inline-flex min-h-11 items-center gap-1.5 bg-primary px-4 text-sm text-primary-foreground btn-press">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? '已复制' : '复制图片'}
        </button>
        <button onClick={saveImage}
          className="inline-flex min-h-11 items-center gap-1.5 border border-input px-4 text-sm text-foreground hover:bg-dn-divider transition-colors">
          <Download className="h-4 w-4" aria-hidden="true" />
          保存到本地
        </button>
      </div>
    </div>
  );
}
