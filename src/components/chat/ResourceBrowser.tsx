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
      <div className="shrink-0 border-b border-border/40 bg-card px-5 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="搜索 310+ 资源..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {RESOURCE_INDEX.reduce((s, c) => s + c.links.length, 0)} 条资源
          </span>
        </div>
      </div>

      {/* Category filter chips */}
      <div className="shrink-0 border-b border-border/40 bg-card/50 px-5 py-2">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-1.5">
          {RESOURCE_INDEX.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedCats.has(cat.id)
                  ? 'bg-primary text-primary-foreground'
                  : selectedCats.size > 0
                    ? 'bg-muted text-muted-foreground/50'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span className="text-[11px]">{CAT_ICONS[cat.id] || '📌'}</span>
              <span>{cat.title}</span>
              <span className="opacity-50">{cat.links.length}</span>
            </button>
          ))}
          {selectedCats.size > 0 && (
            <button onClick={() => setSelectedCats(new Set())} className="rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
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
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-base">{CAT_ICONS[cat.id] || '📌'}</span>
                    <h2 className="text-sm font-semibold text-foreground">{cat.title}</h2>
                    <span className="text-xs text-muted-foreground">({cat.links.length})</span>
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
    <div className="group relative flex flex-col rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm">
      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground group-hover:text-primary">{link.name}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-primary" />
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{link.description}</p>
      </a>
      <button
        onClick={(e) => {
          e.preventDefault();
          navigator.clipboard.writeText(link.url).then(() => {
            toast('success', '链接已复制');
          }).catch(() => {});
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
        aria-label="分享链接"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
      <button onClick={(e) => { e.preventDefault(); onToggle(); }}
        className={`mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] transition-colors ${saved ? 'bg-amber-50 text-amber-700' : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-secondary'}`}>
        <Bookmark className={`h-3 w-3 ${saved ? 'fill-amber-400' : ''}`} /> {saved ? '已收藏' : '收藏'}
      </button>
    </div>
  );
}
