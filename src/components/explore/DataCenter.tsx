'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, ArrowUpDown, Bookmark, ChevronLeft, ChevronRight,
  Calculator, MapPin, ArrowUp, ArrowDown, Info
} from 'lucide-react';
import { loadAllData, getSalaryRanking, getCityCosts, getNationalAvg, getIndustries, hasLoadError } from '@/lib/data-store';
import { estimateNetSalary, ASSUMPTIONS_NOTE } from '@/lib/salary-calc';

// ── Types ───────────────────────────────────────────────────

type SubTab = 'majors' | 'cities' | 'industries';

interface MajorRow { name: string; salary: number; field: string; id: string }
interface CityRow { name: string; monthly: number }
interface IndustryRow { name: string; nonPrivate: number; private: number }

// ── Constants ────────────────────────────────────────────────

const MAJOR_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#ec4899', '#84cc16', '#0ea5e9'];
const SERIES_COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

const MAX_SELECT = 8;
const DEFAULT_SELECT_COUNT = 5;
const TOP_MAJOR_COUNT = 30;
const CITY_CHIP_COUNT = 10;
const DEFAULT_CITY = '上海';
const PAGE_SIZE = 50;

// ── Helpers ──────────────────────────────────────────────────

function formatSalary(value: number): string {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return `${value}`;
}

function fmtSigned(v: number): string {
  return `${v < 0 ? '-' : ''}¥${Math.abs(v).toLocaleString()}`;
}

// ── MajorSalaryView ──────────────────────────────────────────

function MajorSalaryView() {
  // ── Chart state
  const [majors, setMajors] = useState<MajorRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selCity, setSelCity] = useState(DEFAULT_CITY);

  // ── Table state
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('career-compass-bookmarks') || '[]')); }
    catch { return new Set(); }
  });
  const [showNet, setShowNet] = useState(false);

  // ── Shared state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [avg, setAvg] = useState(6435);

  const load = () => {
    setLoading(true); setError(false);
    loadAllData().then(ok => {
      if (ok) {
        const rows: MajorRow[] = getSalaryRanking()
          .filter(r => typeof r.name === 'string' && typeof r.salary === 'number')
          .map(r => ({ ...r, id: `m-${r.name}` }));
        setMajors(rows);
        setCities(getCityCosts().slice(0, 12).map(c => ({ name: c.name, monthly: Math.round(c.income / 12) })));
        setAvg(getNationalAvg() || 6435);
        if (rows.length > 0) setSelected(new Set(rows.slice(0, 6).map(x => x.name)));
      } else { setError(hasLoadError()); }
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  // ── Chart helpers
  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) { if (next.size > 1) next.delete(name); }
    else if (next.size < 10) next.add(name);
    setSelected(next);
  };

  const chartList = useMemo(
    () => majors.filter(m => selected.has(m.name)).sort((a, b) => b.salary - a.salary),
    [majors, selected]
  );
  const maxVal = Math.max(...chartList.map(m => m.salary), 1);
  const cityData = cities.find(c => c.name === selCity) || cities[0];
  const cityMonthlyIncome = cityData?.monthly || 6000;

  // ── Table helpers
  const toggleBm = (id: string) => {
    const next = new Set(bookmarks);
    next.has(id) ? next.delete(id) : next.add(id);
    setBookmarks(next);
    localStorage.setItem('career-compass-bookmarks', JSON.stringify([...next]));
  };

  const allFields = useMemo(() => [...new Set(majors.map(r => r.field))], [majors]);

  const filtered = useMemo(() => {
    let result = search
      ? majors.filter(r => r.name.includes(search) || r.field.includes(search))
      : majors;
    result = [...result].sort((a, b) => sortDir === 'desc' ? b.salary - a.salary : a.salary - b.salary);
    return [...result].sort((a, b) => (bookmarks.has(b.id) ? 1 : 0) - (bookmarks.has(a.id) ? 1 : 0));
  }, [majors, search, sortDir, bookmarks]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // ── Render
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="skeleton h-64 w-full max-w-2xl rounded-2xl" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-sm text-muted-foreground">数据加载失败</p>
      <button onClick={load} className="text-xs text-primary hover:underline">重试</button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* ── Chart Section ── */}
      <section>
        <h3 className="text-base font-semibold text-foreground mb-1">薪资对比</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {majors.length} 个专业 · 全国均薪 ¥{avg.toLocaleString()}
        </p>

        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">
            <MapPin className="inline h-3.5 w-3.5" /> 参照城市：
          </span>
          {cities.slice(0, 10).map(c => (
            <button key={c.name} onClick={() => setSelCity(c.name)}
              aria-pressed={c.name === selCity}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                c.name === selCity ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              {c.name} ¥{c.monthly.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mb-6 space-y-2">
          {chartList.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2 group">
              <span className="w-36 text-right text-[11px] text-muted-foreground truncate">{m.name}</span>
              <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden relative">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(m.salary / maxVal) * 100}%`, backgroundColor: MAJOR_COLORS[i % MAJOR_COLORS.length] }} />
              </div>
              <span className="w-16 text-[11px] font-semibold tabular-nums text-foreground">
                ¥{m.salary.toLocaleString()}
              </span>
              <span className="w-12 text-[10px] text-muted-foreground/50">
                {m.salary > avg ? <ArrowUp className="inline h-3 w-3 text-emerald-500" /> : <ArrowDown className="inline h-3 w-3 text-red-400" />}
                {formatSalary(Math.abs(m.salary - avg))}
              </span>
            </div>
          ))}
          <div className="relative mt-3 pt-2 border-t border-dashed border-border/40">
            <div className="flex items-center gap-2">
              <span className="w-36 text-right text-[10px] text-muted-foreground/50">{selCity} 人均可支配收入(月)</span>
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-foreground/30"
                  style={{ left: `${Math.min(100, (cityMonthlyIncome / maxVal) * 100)}%` }} />
              </div>
              <span className="w-16 text-[11px] font-semibold">¥{cityMonthlyIncome.toLocaleString()}</span>
              <span className="w-12" />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground/40">
              城市线为年人均可支配收入÷12（国家统计局口径），非平均工资
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/30 bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">点击选择对比专业（最多10个）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {majors.map(m => (
              <button key={m.name} onClick={() => toggle(m.name)}
                aria-pressed={selected.has(m.name)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                  selected.has(m.name)
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}>
                {m.name} {m.salary > avg ? '↑' : '↓'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Table Section ── */}
      <section>
        <h3 className="text-base font-semibold text-foreground mb-1">数据库</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} 个专业 · {allFields.length} 个学科 · 数据来源麦可思
        </p>

        {/* Table toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-muted-foreground/40" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="搜索专业" aria-label="搜索专业"
              className="w-36 bg-transparent text-xs outline-none"
            />
          </div>
          <button
            onClick={() => setShowNet(v => !v)}
            aria-pressed={showNet}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1 transition-colors ${
              showNet ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            <Calculator className="h-3 w-3" /> 到手估算
          </button>
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowUpDown className="h-3 w-3" /> {sortDir === 'desc' ? '高→低' : '低→高'}
          </button>
          <span className="text-xs text-muted-foreground">
            共 {filtered.length} 条
          </span>
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          <button onClick={() => { setSearch(''); setPage(0); }}
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
              !search ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            全部
          </button>
          {allFields.slice(0, 8).map(f => (
            <button key={f} onClick={() => { setSearch(f); setPage(0); }}
              className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                search === f ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}>
              {f}
            </button>
          ))}
          {allFields.length > 8 && (
            <span className="text-[11px] text-muted-foreground/40 self-center">
              +{allFields.length - 8} 更多
            </span>
          )}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/20 bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/30">
              <tr className="border-b border-border/20">
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground w-8">#</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground">专业名称</th>
                <th className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">学科门类</th>
                <th className="px-3 py-2.5 text-right text-[11px] font-medium text-muted-foreground">月薪</th>
                {showNet && (
                  <th className="px-3 py-2.5 text-right text-[11px] font-medium text-muted-foreground">到手估算</th>
                )}
                <th className="px-3 py-2.5 text-center text-[11px] font-medium text-muted-foreground w-10">收藏</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => {
                const netBreakdown = showNet ? estimateNetSalary(r.salary) : null;
                return (
                  <tr key={r.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                    <td className="px-3 py-2 text-xs text-muted-foreground/40 tabular-nums">
                      {page * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-3 py-2 font-medium text-foreground text-[13px]">{r.name}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">{r.field}</td>
                    <td className="px-3 py-2 text-right font-semibold tabular-nums text-[13px]">
                      <span className={r.salary >= avg ? 'text-emerald-600' : 'text-foreground'}>
                        ¥{r.salary.toLocaleString()}
                      </span>
                    </td>
                    {showNet && (
                      <td className="px-3 py-2 text-right tabular-nums text-[13px]">
                        <span className="text-muted-foreground"
                          title={`五险一金 ¥${netBreakdown!.socialTotal.toLocaleString()} + 个税 ¥${netBreakdown!.monthlyTax.toLocaleString()}`}>
                          ¥{netBreakdown!.net.toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleBm(r.id)}
                        className={bookmarks.has(r.id) ? 'text-amber-500' : 'text-muted-foreground/20 hover:text-amber-400'}>
                        <Bookmark className={`h-3.5 w-3.5 ${bookmarks.has(r.id) ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground">{page + 1} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 space-y-1 text-center">
          {showNet && (
            <p className="text-[10px] text-muted-foreground/40">{ASSUMPTIONS_NOTE}</p>
          )}
          <p className="text-[10px] text-muted-foreground/40">
            数据来源：麦可思研究院《2026年中国本科生就业报告》、国家统计局
          </p>
        </div>
      </section>
    </div>
  );
}

// ── CityPurchasingView ───────────────────────────────────────

function CityPurchasingView() {
  const [majors, setMajors] = useState<MajorRow[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [colorMap, setColorMap] = useState<Map<string, number>>(new Map());
  const [selCity, setSelCity] = useState(DEFAULT_CITY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    loadAllData().then(ok => {
      if (ok) {
        const top = [...getSalaryRanking()].sort((a, b) => b.salary - a.salary).slice(0, TOP_MAJOR_COUNT);
        const topRows: MajorRow[] = top.map(r => ({ ...r, id: `m-${r.name}` }));
        setMajors(topRows);
        setCities(getCityCosts().slice(0, CITY_CHIP_COUNT).map(c => ({ name: c.name, monthly: c.monthly })));
        setColorMap(new Map(topRows.slice(0, DEFAULT_SELECT_COUNT).map((m, i) => [m.name, i])));
      } else { setError(true); }
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggle = (name: string) => {
    setColorMap(prev => {
      const next = new Map(prev);
      if (next.has(name)) {
        if (next.size > 1) next.delete(name);
        return next;
      }
      if (next.size >= MAX_SELECT) return prev;
      const used = new Set(next.values());
      let idx = 0;
      while (used.has(idx) && idx < SERIES_COLORS.length - 1) idx += 1;
      next.set(name, idx);
      return next;
    });
  };

  const rows = useMemo(() => majors.filter(m => colorMap.has(m.name)).sort((a, b) => b.salary - a.salary), [majors, colorMap]);
  const cityData = cities.find(c => c.name === selCity) || cities[0];
  const cityMonthly = cityData && cityData.monthly > 0 ? cityData.monthly : 0;
  const ratios = rows.map(m => (cityMonthly > 0 ? m.salary / cityMonthly : 0));
  const maxRatio = Math.max(...ratios, 1);
  const balancePos = Math.min(100, (1 / maxRatio) * 100);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
  if (error || majors.length === 0 || cityMonthly <= 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-sm text-muted-foreground">{error ? '数据加载失败' : '暂无可用数据'}</p>
      <button onClick={load} className="text-xs text-primary hover:underline">重试</button>
    </div>
  );

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-1">城市购买力</h3>
      <p className="text-xs text-muted-foreground mb-4">专业月薪能覆盖几个月的城市消费，结余多少</p>

      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">
          <MapPin className="inline h-3.5 w-3.5" /> 城市：
        </span>
        {cities.map(c => (
          <button key={c.name} onClick={() => setSelCity(c.name)} aria-pressed={c.name === cityData.name}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              c.name === cityData.name ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}>
            {c.name} 消费¥{c.monthly.toLocaleString()}/月
          </button>
        ))}
      </div>

      <div className="mb-2 space-y-2">
        {rows.map(m => {
          const ratio = m.salary / cityMonthly;
          const surplus = m.salary - cityMonthly;
          const colorIdx = colorMap.get(m.name) ?? 0;
          return (
            <div key={m.name} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="w-36 truncate text-right text-[11px] text-muted-foreground" title={m.name}>{m.name}</span>
              <div className="relative h-5 flex-1 min-w-[140px] rounded-full bg-secondary">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (ratio / maxRatio) * 100)}%`, backgroundColor: SERIES_COLORS[colorIdx % SERIES_COLORS.length] }} />
                <div aria-hidden className="pointer-events-none absolute inset-y-0 border-l border-dashed border-foreground/25"
                  style={{ left: `${balancePos}%` }} />
              </div>
              <span className="w-44 shrink-0 whitespace-nowrap text-[11px] tabular-nums">
                <span className="font-semibold text-foreground">x{ratio.toFixed(2)}</span>
                <span className={`ml-2 text-[10px] ${surplus < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  结余 {fmtSigned(surplus)}/月{surplus < 0 && '（入不敷出）'}
                </span>
              </span>
            </div>
          );
        })}
        <div className="flex flex-wrap items-center gap-x-2 pt-2 mt-1 border-t border-dashed border-border/40">
          <span className="w-36 text-right text-[10px] text-muted-foreground/60">收支平衡线 x1</span>
          <div className="relative h-5 flex-1 min-w-[140px]">
            <div aria-hidden className="absolute inset-y-0 border-l border-dashed border-foreground/40"
              style={{ left: `${balancePos}%` }} />
          </div>
          <span className="w-44 shrink-0 text-[10px] text-muted-foreground/60">月薪 = 城市月均消费</span>
        </div>
      </div>

      <p className="mb-4 text-[10px] leading-relaxed text-muted-foreground/60">
        购买力 = 专业全国平均月薪 ÷ 城市月均消费支出（国家统计局口径）；专业薪资为全国均值，未按城市调整，仅供横向比较。
      </p>

      <div className="rounded-2xl border border-border/30 bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-xs text-muted-foreground">
            点击选择对比专业（1–{MAX_SELECT} 个，按全国平均月薪前 {TOP_MAJOR_COUNT}）
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {majors.map(m => {
            const idx = colorMap.get(m.name);
            const isSelected = idx !== undefined;
            return (
              <button key={m.name} onClick={() => toggle(m.name)} aria-pressed={isSelected}
                className={`rounded-lg px-3 py-1.5 text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  isSelected ? 'bg-foreground text-background shadow-sm' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}>
                {isSelected && (
                  <span aria-hidden className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
                    style={{ backgroundColor: SERIES_COLORS[idx % SERIES_COLORS.length] }} />
                )}
                {m.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── IndustryCompareView ──────────────────────────────────────

function IndustryCompareView() {
  const [industries, setIndustries] = useState<IndustryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    loadAllData().then(ok => {
      if (ok) setIndustries([...getIndustries()].sort((a, b) => b.nonPrivate - a.nonPrivate));
      else setError(true);
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
  if (error || industries.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-sm text-muted-foreground">{error ? '数据加载失败' : '暂无行业数据'}</p>
      <button onClick={load} className="text-xs text-primary hover:underline">重试</button>
    </div>
  );

  const maxValue = Math.max(...industries.map(i => i.nonPrivate), 1);
  const pct = (v: number) => Math.min(100, Math.max(0, (v / maxValue) * 100));

  return (
    <div>
      <h3 className="text-base font-semibold text-foreground mb-1">体制内外薪资差</h3>
      <p className="text-xs text-muted-foreground mb-4">{industries.length} 个行业，非私营与私营单位对比</p>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-primary" /> 非私营(国企/机关/事业)
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-muted-foreground" /> 私营单位
        </span>
        <span className="text-muted-foreground/60">均为年平均工资</span>
      </div>

      <div className="mb-4 space-y-1">
        {industries.map(ind => {
          const hasPrivate = ind.private > 0;
          const npPct = pct(ind.nonPrivate);
          const pPct = pct(ind.private);
          const lineLeft = Math.min(npPct, pPct);
          const lineWidth = Math.abs(npPct - pPct);
          return (
            <div key={ind.name} className="py-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <span className="w-40 truncate text-[11px] text-muted-foreground" title={ind.name}>{ind.name}</span>
                <div className="relative h-6 flex-1 min-w-[180px]">
                  {hasPrivate && (
                    <div aria-hidden className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-muted-foreground/25"
                      style={{ left: `${lineLeft}%`, width: `${lineWidth}%` }} />
                  )}
                  {hasPrivate && (
                    <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground ring-2 ring-background"
                      style={{ left: `${pPct}%` }} title={`私营 ¥${ind.private.toLocaleString()}`} />
                  )}
                  <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background"
                    style={{ left: `${npPct}%` }} title={`非私营 ¥${ind.nonPrivate.toLocaleString()}`} />
                </div>
                {hasPrivate ? (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium tabular-nums text-foreground"
                    title="非私营 ÷ 私营 年平均工资">
                    x{(ind.nonPrivate / ind.private).toFixed(1)}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">无私营数据</span>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-[10px] tabular-nums text-muted-foreground/70 sm:pl-[10.5rem]">
                <span>非私营 ¥{ind.nonPrivate.toLocaleString()}</span>
                {hasPrivate && <span>私营 ¥{ind.private.toLocaleString()}</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4">
        <p className="text-xs font-medium text-foreground mb-1">决策提示</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          同一行业体制内外差距可达数倍，但稳定性、编制、晋升逻辑完全不同——差距大小由你自己权衡。
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground/60">
        数据来源：国家统计局2025年城镇单位就业人员平均工资；部分行业为估算值，仅供参考
      </p>
    </div>
  );
}

// ── DataCenter ────────────────────────────────────────────────

const TABS: { id: SubTab; label: string }[] = [
  { id: 'majors', label: '专业薪资' },
  { id: 'cities', label: '城市购买力' },
  { id: 'industries', label: '行业对比' },
];

export function DataCenter() {
  const [subTab, setSubTab] = useState<SubTab>('majors');

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-1">数据中心</h2>
          <p className="text-sm text-muted-foreground">
            查询专业薪资、城市生活成本、行业体制差异
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              aria-pressed={subTab === tab.id}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                subTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {subTab === 'majors' && <MajorSalaryView />}
        {subTab === 'cities' && <CityPurchasingView />}
        {subTab === 'industries' && <IndustryCompareView />}
      </div>
    </div>
  );
}
