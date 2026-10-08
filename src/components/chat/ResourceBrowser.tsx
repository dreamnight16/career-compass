'use client';

import { useState, useMemo } from 'react';
import { Search, ExternalLink, X, Bookmark, Share2 } from 'lucide-react';
import { RESOURCE_INDEX, type ResourceCategory, type ResourceLink } from '@/data/resources';

// Category icons using lucide names
const CAT_ICONS: Record<string, string> = {
  'uni-job': '🏛️', 'industry-jobs': '🏭', 'freelance': '🏠',
  'humanities': '📜', 'media': '📡', 'business': '💼', 'law': '⚖️',
  'edu': '🍎', 'stem': '🔬', 'cs-career': '💻',
  'learn-code': '🖥️', 'learn-general': '📚',
  'medicine': '🩺', 'agri': '🌾', 'art': '🎨',
  'postgrad': '🎓', 'study-abroad': '✈️', 'civil': '🏛️',
  'competitions': '🏆', 'research': '🔬',
  'tools': '🛠️', 'awesome': '⭐',
  'salary': '💰', 'reports': '📊',
  'community': '👥', 'podcast': '🎧', 'lang': '🌐',
  'certs': '📜', 'volunteer': '🤝',
};

export function ResourceBrowser() {
  const [search, setSearch] = useState('');
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('career-compass-resource-bookmarks') || '[]')); } catch { return new Set(); }
  });

  const toggleSaved = (url: string) => {
    const next = new Set(saved);
    if (next.has(url)) next.delete(url); else next.add(url);
    setSaved(next);
    localStorage.setItem('career-compass-resource-bookmarks', JSON.stringify([...next]));
    import('@/lib/activity-store').then(({ addActivity }) => {
      addActivity({ type: 'resource_save', title: next.has(url) ? url : '', detail: '切换资源收藏' });
    });
  };

  const toggleCat = (id: string) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let cats = RESOURCE_INDEX;
    if (selectedCats.size > 0) cats = cats.filter(c => selectedCats.has(c.id));
    if (search) {
      const q = search.toLowerCase();
      cats = cats.map(c => ({
        ...c,
        links: c.links.filter(l =>
          l.name.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
        ),
      })).filter(c => c.links.length > 0);
    }
    return cats;
  }, [search, selectedCats]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Search bar */}
      <div className="shrink-0 border-b border-border bg-card px-5 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索 310+ 资源..."
              aria-label="搜索资源库"
              className="min-h-11 w-full border border-input bg-background py-2 pl-9 pr-14 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="清除搜索" className="dn-focus btn-press absolute right-1 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          {/* 资源条目数来自静态索引 RESOURCE_INDEX */}
          <span className="cc-num shrink-0 whitespace-nowrap text-sm text-muted-foreground">
            {RESOURCE_INDEX.reduce((s, c) => s + c.links.length, 0)} 条 · 静态索引
          </span>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="shrink-0 border-b border-border bg-card px-5 py-2">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-1.5">
          {RESOURCE_INDEX.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              aria-pressed={selectedCats.has(cat.id)}
              className={`btn-press dn-focus flex min-h-11 items-center gap-1.5 border px-2.5 py-1.5 text-xs transition-colors ${
                selectedCats.has(cat.id)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : selectedCats.size > 0
                    ? 'border-border bg-secondary text-muted-foreground'
                    : 'border-border bg-secondary text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              <span className="text-[11px]" aria-hidden="true">{CAT_ICONS[cat.id] || '📌'}</span>
              <span>{cat.title}</span>
              {/* 选中不只用颜色表达：额外给一个 ✓ 形状标记 */}
              {selectedCats.has(cat.id) && <span aria-hidden="true">✓</span>}
              <span className="cc-num">{cat.links.length}</span>
            </button>
          ))}
          {selectedCats.size > 0 && (
            <button onClick={() => setSelectedCats(new Set())} className="dn-focus btn-press min-h-11 px-2.5 py-1.5 text-xs text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground hover:decoration-2">
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* Resource cards grid */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-5xl">
          {filtered.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">无匹配资源</p>
          ) : (
            <div className="space-y-8">
              {filtered.map(cat => (
                <section key={cat.id}>
                  <div className="mb-3 flex items-baseline gap-2 border-b border-border pb-2">
                    <span className="text-base" aria-hidden="true">{CAT_ICONS[cat.id] || '📌'}</span>
                    <h2 className="cc-h2 text-foreground">{cat.title}</h2>
                    <span className="cc-num text-sm text-muted-foreground">{cat.links.length}</span>
                  </div>
                  {!selectedCats.has(cat.id) && selectedCats.size === 0 && (
                    <p className="mb-3 text-xs text-muted-foreground">{cat.description}</p>
                  )}
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.links.map(link => (
                      <ResourceCard key={link.name} link={link} saved={saved.has(link.url)} onToggle={() => toggleSaved(link.url)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function useResourceToast() {
  const toast = (type: string, message: string) => {
    import('@/components/ui/toast').then(({ toast }) => toast(type as 'success' | 'error' | 'info', message));
  };
  return toast;
}

function ResourceCard({ link, saved, onToggle }: { link: ResourceLink; saved: boolean; onToggle: () => void }) {
  const toast = useResourceToast();

  return (
    /* Level 1 平面卡片，Hover 才升到 Level 2；收藏/分享常驻可见，键盘可达 */
    <div className="group relative flex flex-col border border-border bg-card p-3 transition-all hover:border-primary hover:shadow-card-hover">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="dn-focus flex-1">
        <div className="flex items-start justify-between gap-2">
          {/* 标题带下划线反馈，不只用颜色表示可点击 */}
          <span className="text-sm text-foreground underline decoration-transparent decoration-1 underline-offset-2 transition-colors group-hover:decoration-current">{link.name}</span>
          <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{link.description}</p>
      </a>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={(e) => { e.preventDefault(); onToggle(); }}
          aria-pressed={saved}
          className={`btn-press dn-focus inline-flex min-h-11 items-center gap-1.5 border px-2.5 text-[11px] transition-colors ${
            saved
              ? 'border-transparent bg-dn-amber text-dn-on-color'
              : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
          }`}>
          <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} aria-hidden="true" /> {saved ? '已收藏' : '收藏'}
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(link.url).then(() => {
              toast('success', '链接已复制');
            }).catch(() => {});
          }}
          className="btn-press dn-focus ml-auto inline-flex min-h-11 min-w-11 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          aria-label="复制链接"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
