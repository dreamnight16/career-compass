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

/* 图表系列色：直接引用 DNDL 品牌实色 Token（--dn-*），不再使用 Tailwind 默认调色板。
   语义固定，同一颜色在不同图表里表达同一件事：
     teal    = 品牌主序列        cyan    = 数据 / 常规通道
     emerald = 达标 / 完成       violet  = 探索 / 长期投入
     amber   = 提醒 / 待关注     orange  = 活动 / 次级强调
     steel   = 中性信息          crimson = 差距 / 风险
   缺陷 1：Tailwind v3 无法给 var(--x) 应用透明度修饰符，所以这里一律按实色使用，
   需要更淡的层级时改用 Canvas/Surface 平面或 Divider 分隔线，而不是降低 alpha。 */
const DN_SERIES_COLORS = [
  'var(--dn-teal)', 'var(--dn-cyan)', 'var(--dn-emerald)', 'var(--dn-violet)',
  'var(--dn-amber)', 'var(--dn-orange)', 'var(--dn-steel)', 'var(--dn-crimson)',
];
const MAJOR_COLORS = DN_SERIES_COLORS;
const SERIES_COLORS = DN_SERIES_COLORS;

const MAX_SELECT = 8;
const DEFAULT_SELECT_COUNT = 5;
const TOP_MAJOR_COUNT = 30;
const CITY_CHIP_COUNT = 10;
const DEFAULT_CITY = '上海';
const PAGE_SIZE = 50;

/* 交互词汇：可点击目标一律 ≥44×44 CSS px；选中态用 Teal 实色场 + On-Color 正文，
   未选中态用 Canvas 平面 + Divider 轮廓，状态不靠颜色单独表达（均带 aria-pressed）。 */
const TARGET_HIT = 'min-h-11';
const CHIP_IDLE = 'border border-border bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground';
const CHIP_ACTIVE = 'bg-dn-teal text-dn-on-color';

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
    <div role="status" aria-live="polite" className="flex h-64 items-center justify-center">
      <p className="cc-kicker text-muted-foreground">正在加载专业薪资数据</p>
    </div>
  );
  if (error) return (
    <div role="alert" className="flex h-64 flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">数据加载失败（静态回退不可用）</p>
      <button onClick={load}
        className={`${TARGET_HIT} inline-flex items-center border border-input px-4 text-xs text-foreground hover:bg-muted`}>
        重试
      </button>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* ── Chart Section ── */}
      <section>
        <h3 className="text-lg font-normal text-foreground mb-1">薪资对比</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {majors.length} 个专业 · 全国均薪 ¥{avg.toLocaleString()}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="cc-kicker mr-1 inline-flex items-center gap-1 text-muted-foreground">
            <MapPin aria-hidden className="h-3.5 w-3.5" /> 参照城市
          </span>
          {cities.slice(0, 10).map(c => (
            <button key={c.name} onClick={() => setSelCity(c.name)}
              aria-pressed={c.name === selCity}
              className={`${TARGET_HIT} px-3 text-xs font-medium transition-colors ${c.name === selCity ? CHIP_ACTIVE : CHIP_IDLE}`}>
              {c.name} <span className="cc-num">¥{c.monthly.toLocaleString()}</span>
            </button>
          ))}
        </div>

        <div className="mb-6 space-y-2">
          {chartList.map((m, i) => {
            const above = m.salary > avg;
            const deltaLabel = `${above ? '高于' : '低于'}全国均薪 ¥${Math.abs(m.salary - avg).toLocaleString()}`;
            return (
              <div key={m.name} className="flex items-center gap-2">
                <span className="w-36 truncate text-right text-[11px] text-muted-foreground">{m.name}</span>
                <div className="relative h-5 flex-1 overflow-hidden bg-muted">
                  <div className="h-full transition-[width] duration-expand ease-dn-in"
                    style={{ width: `${(m.salary / maxVal) * 100}%`, backgroundColor: MAJOR_COLORS[i % MAJOR_COLORS.length] }} />
                </div>
                <span className="cc-num w-16 text-right text-[11px] text-foreground">
                  ¥{m.salary.toLocaleString()}
                </span>
                {/* 颜色之外还有方向箭头，差值含义由 title 与辅助文本说明 */}
                <span className="w-14 whitespace-nowrap text-right text-[10px] text-muted-foreground" title={deltaLabel}>
                  {above
                    ? <ArrowUp aria-hidden className="inline h-3 w-3" />
                    : <ArrowDown aria-hidden className="inline h-3 w-3" />}
                  {formatSalary(Math.abs(m.salary - avg))}
                  <span className="sr-only">{deltaLabel}</span>
                </span>
              </div>
            );
          })}
          <div className="relative mt-3 border-t border-dashed border-border pt-2">
            <div className="flex items-center gap-2">
              <span className="w-36 text-right text-[10px] text-muted-foreground">{selCity} 人均可支配收入(月)</span>
              <div className="relative h-5 flex-1 overflow-hidden">
                <div aria-hidden className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-dn-ink"
                  style={{ left: `${Math.min(100, (cityMonthlyIncome / maxVal) * 100)}%` }} />
              </div>
              <span className="cc-num w-16 text-right text-[11px] text-foreground">¥{cityMonthlyIncome.toLocaleString()}</span>
              <span className="w-14" />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground">
              城市线为年人均可支配收入÷12（国家统计局口径），非平均工资
            </p>
          </div>
        </div>

        {/* 选择面板：用一条 Divider 分隔线建立层级，而不是再套一张圆角白卡 */}
        <div className="border-t border-border pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Info aria-hidden className="h-4 w-4 text-muted-foreground" />
            <span className="cc-kicker text-muted-foreground">点击选择对比专业（最多 10 个）</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {majors.map(m => (
              <button key={m.name} onClick={() => toggle(m.name)}
                aria-pressed={selected.has(m.name)}
                title={`${m.name}：${m.salary > avg ? '高于' : '低于'}全国均薪`}
                className={`${TARGET_HIT} px-3 text-xs transition-colors ${selected.has(m.name) ? CHIP_ACTIVE : CHIP_IDLE}`}>
                {m.name} <span aria-hidden>{m.salary > avg ? '↑' : '↓'}</span>
                <span className="sr-only">（{m.salary > avg ? '高于' : '低于'}全国均薪）</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="cc-rule" />

      {/* ── Table Section ── */}
      <section>
        <h3 className="text-lg font-normal text-foreground mb-1">数据库</h3>
        <p className="text-xs text-muted-foreground mb-4">
          {filtered.length} 个专业 · {allFields.length} 个学科 · 数据来源麦可思
        </p>

        {/* Table toolbar */}
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <div className="flex min-h-11 items-center gap-1.5 border border-input bg-background px-3">
            <Search aria-hidden className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="搜索专业" aria-label="搜索专业"
              className="w-36 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={() => setShowNet(v => !v)}
            aria-pressed={showNet}
            className={`${TARGET_HIT} inline-flex items-center gap-1 px-3 text-xs font-medium transition-colors ${showNet ? CHIP_ACTIVE : CHIP_IDLE}`}>
            <Calculator aria-hidden className="h-3 w-3" /> 到手估算
          </button>
          <button
            onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
            className={`${TARGET_HIT} inline-flex items-center gap-1 px-3 text-xs font-medium transition-colors ${CHIP_IDLE}`}>
            <ArrowUpDown aria-hidden className="h-3 w-3" /> {sortDir === 'desc' ? '高→低' : '低→高'}
          </button>
          <span className="cc-num text-xs text-muted-foreground">
            共 {filtered.length} 条
          </span>
        </div>

        {/* Quick filters */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button onClick={() => { setSearch(''); setPage(0); }}
            aria-pressed={!search}
            className={`${TARGET_HIT} px-3 text-[11px] font-medium transition-colors ${!search ? CHIP_ACTIVE : CHIP_IDLE}`}>
            全部
          </button>
          {allFields.slice(0, 8).map(f => (
            <button key={f} onClick={() => { setSearch(f); setPage(0); }}
              aria-pressed={search === f}
              className={`${TARGET_HIT} px-3 text-[11px] transition-colors ${search === f ? CHIP_ACTIVE : CHIP_IDLE}`}>
              {f}
            </button>
          ))}
          {allFields.length > 8 && (
            <span className="self-center text-[11px] text-muted-foreground">
              +{allFields.length - 8} 更多未列出
            </span>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr className="border-b border-border">
                <th scope="col" className="w-8 px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground">#</th>
                <th scope="col" className="px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground">专业名称</th>
                <th scope="col" className="hidden px-3 py-2.5 text-left text-[11px] font-medium text-muted-foreground md:table-cell">学科门类</th>
                <th scope="col" className="px-3 py-2.5 text-right text-[11px] font-medium text-muted-foreground">月薪</th>
                {showNet && (
                  <th scope="col" className="px-3 py-2.5 text-right text-[11px] font-medium text-muted-foreground">到手估算</th>
                )}
                <th scope="col" className="w-14 px-3 py-2.5 text-center text-[11px] font-medium text-muted-foreground">收藏</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => {
                const netBreakdown = showNet ? estimateNetSalary(r.salary) : null;
                const above = r.salary >= avg;
                return (
                  <tr key={r.id} className="border-b border-border transition-colors hover:bg-muted">
                    <td className="cc-num px-3 py-2 text-xs text-muted-foreground">
                      {page * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-3 py-2 text-[13px] font-medium text-foreground">{r.name}</td>
                    <td className="hidden px-3 py-2 text-xs text-muted-foreground md:table-cell">{r.field}</td>
                    <td className="cc-num px-3 py-2 text-right text-[13px] text-foreground">
                      {/* 高于全国均值用 ▲ 形状标记 + 同义文字，不把含义只放在颜色上 */}
                      {above && <span aria-hidden className="mr-1 text-[10px] text-muted-foreground">▲</span>}
                      {above && <span className="sr-only">高于全国平均月薪 </span>}
                      ¥{r.salary.toLocaleString()}
                    </td>
                    {showNet && (
                      <td className="cc-num px-3 py-2 text-right text-[13px] text-muted-foreground">
                        <span title={`五险一金 ¥${netBreakdown!.socialTotal.toLocaleString()} + 个税 ¥${netBreakdown!.monthlyTax.toLocaleString()}`}>
                          ¥{netBreakdown!.net.toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => toggleBm(r.id)}
                        aria-pressed={bookmarks.has(r.id)}
                        aria-label={bookmarks.has(r.id) ? `取消收藏 ${r.name}` : `收藏 ${r.name}`}
                        className={`inline-flex min-h-11 min-w-11 items-center justify-center transition-colors ${bookmarks.has(r.id) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        {/* 已收藏 = 实心书签，未收藏 = 线框书签：形状本身即可读，不依赖颜色 */}
                        <Bookmark aria-hidden className={`h-3.5 w-3.5 ${bookmarks.has(r.id) ? 'fill-foreground' : ''}`} />
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
          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              aria-label="上一页"
              className={`${CHIP_IDLE} inline-flex min-h-11 min-w-11 items-center justify-center transition-colors disabled:opacity-60`}>
              <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
            </button>
            <span className="cc-num text-xs text-muted-foreground">{page + 1} / {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
              aria-label="下一页"
              className={`${CHIP_IDLE} inline-flex min-h-11 min-w-11 items-center justify-center transition-colors disabled:opacity-60`}>
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 space-y-1 text-center">
          {showNet && (
            <p className="text-[10px] text-muted-foreground">{ASSUMPTIONS_NOTE}</p>
          )}
          <p className="cc-kicker text-muted-foreground">数据来源</p>
          <p className="text-[10px] text-muted-foreground">
            麦可思研究院《2026年中国本科生就业报告》、国家统计局（随静态数据集打包）
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
    <div role="status" aria-live="polite" className="flex h-64 items-center justify-center">
      <p className="cc-kicker text-muted-foreground">正在加载城市消费数据</p>
    </div>
  );
  if (error || majors.length === 0 || cityMonthly <= 0) return (
    <div role="alert" className="flex h-64 flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">{error ? '数据加载失败（静态回退不可用）' : '暂无可用数据'}</p>
      <button onClick={load}
        className={`${TARGET_HIT} inline-flex items-center border border-input px-4 text-xs text-foreground hover:bg-muted`}>
        重试
      </button>
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-normal text-foreground mb-1">城市购买力</h3>
      <p className="text-xs text-muted-foreground mb-4">专业月薪能覆盖几个月的城市消费，结余多少</p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="cc-kicker mr-1 inline-flex items-center gap-1 text-muted-foreground">
          <MapPin aria-hidden className="h-3.5 w-3.5" /> 城市
        </span>
        {cities.map(c => (
          <button key={c.name} onClick={() => setSelCity(c.name)} aria-pressed={c.name === cityData.name}
            className={`${TARGET_HIT} px-3 text-xs font-medium transition-colors ${c.name === cityData.name ? CHIP_ACTIVE : CHIP_IDLE}`}>
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
              <div className="relative h-5 min-w-[140px] flex-1 bg-muted">
                <div className="h-full transition-[width] duration-expand ease-dn-in"
                  style={{ width: `${Math.min(100, (ratio / maxRatio) * 100)}%`, backgroundColor: SERIES_COLORS[colorIdx % SERIES_COLORS.length] }} />
                <div aria-hidden className="pointer-events-none absolute inset-y-0 border-l border-dashed border-dn-ink"
                  style={{ left: `${balancePos}%` }} />
              </div>
              <span className="w-44 shrink-0 whitespace-nowrap text-[11px]">
                <span className="cc-num text-foreground">x{ratio.toFixed(2)}</span>
                {/* 结余为负时用 △ 形状 + 文字同时说明，不只靠颜色 */}
                <span className="ml-2 text-[10px] text-muted-foreground">
                  {surplus < 0 && <span aria-hidden>△ </span>}
                  结余 {fmtSigned(surplus)}/月{surplus < 0 && '（入不敷出）'}
                </span>
              </span>
            </div>
          );
        })}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 border-t border-dashed border-border pt-2">
          <span className="w-36 text-right text-[10px] text-muted-foreground">收支平衡线 x1</span>
          <div className="relative h-5 min-w-[140px] flex-1">
            <div aria-hidden className="absolute inset-y-0 border-l border-dashed border-input"
              style={{ left: `${balancePos}%` }} />
          </div>
          <span className="w-44 shrink-0 text-[10px] text-muted-foreground">月薪 = 城市月均消费</span>
        </div>
      </div>

      <p className="mb-4 text-[10px] leading-relaxed text-muted-foreground">
        购买力 = 专业全国平均月薪 ÷ 城市月均消费支出（国家统计局口径）；专业薪资为全国均值，未按城市调整，仅供横向比较。
      </p>

      <div className="border-t border-border pt-5">
        <div className="mb-3 flex items-center gap-2">
          <Info aria-hidden className="h-4 w-4 text-muted-foreground" />
          <span className="cc-kicker text-muted-foreground">
            点击选择对比专业（1–{MAX_SELECT} 个，按全国平均月薪前 {TOP_MAJOR_COUNT}）
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {majors.map(m => {
            const idx = colorMap.get(m.name);
            const isSelected = idx !== undefined;
            return (
              <button key={m.name} onClick={() => toggle(m.name)} aria-pressed={isSelected}
                className={`${TARGET_HIT} px-3 text-xs transition-colors ${isSelected ? CHIP_ACTIVE : CHIP_IDLE}`}>
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
    <div role="status" aria-live="polite" className="flex h-64 items-center justify-center">
      <p className="cc-kicker text-muted-foreground">正在加载行业薪资数据</p>
    </div>
  );
  if (error || industries.length === 0) return (
    <div role="alert" className="flex h-64 flex-col items-center justify-center gap-3">
      <p className="text-sm text-muted-foreground">{error ? '数据加载失败（静态回退不可用）' : '暂无行业数据'}</p>
      <button onClick={load}
        className={`${TARGET_HIT} inline-flex items-center border border-input px-4 text-xs text-foreground hover:bg-muted`}>
        重试
      </button>
    </div>
  );

  const maxValue = Math.max(...industries.map(i => i.nonPrivate), 1);
  const pct = (v: number) => Math.min(100, Math.max(0, (v / maxValue) * 100));

  return (
    <div>
      <h3 className="text-lg font-normal text-foreground mb-1">体制内外薪资差</h3>
      <p className="text-xs text-muted-foreground mb-4">{industries.length} 个行业，非私营与私营单位对比</p>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-dn-teal" /> 非私营(国企/机关/事业)
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-dn-steel" /> 私营单位
        </span>
        <span className="text-muted-foreground">均为年平均工资</span>
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
                <div className="relative h-6 min-w-[180px] flex-1">
                  {hasPrivate && (
                    <div aria-hidden className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-dn-steel"
                      style={{ left: `${lineLeft}%`, width: `${lineWidth}%` }} />
                  )}
                  {hasPrivate && (
                    <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dn-steel ring-2 ring-background"
                      style={{ left: `${pPct}%` }} title={`私营 ¥${ind.private.toLocaleString()}`} />
                  )}
                  <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-dn-teal ring-2 ring-background"
                    style={{ left: `${npPct}%` }} title={`非私营 ¥${ind.nonPrivate.toLocaleString()}`} />
                </div>
                {hasPrivate ? (
                  <span className="cc-num shrink-0 bg-muted px-2 py-0.5 text-[10px] text-foreground"
                    title="非私营 ÷ 私营 年平均工资">
                    x{(ind.nonPrivate / ind.private).toFixed(1)}
                  </span>
                ) : (
                  <span className="shrink-0 bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">无私营数据</span>
                )}
              </div>
              <div className="mt-0.5 flex flex-wrap gap-x-3 text-[10px] text-muted-foreground sm:pl-[10.5rem]">
                <span className="cc-num">非私营 ¥{ind.nonPrivate.toLocaleString()}</span>
                {hasPrivate && <span className="cc-num">私营 ¥{ind.private.toLocaleString()}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* 决策提示是一块真正的 Teal 实色场，而不是浅色描边盒子 */}
      <div className="mb-4 bg-dn-teal p-4">
        <p className="cc-kicker mb-1 text-dn-on-color">决策提示</p>
        <p className="text-xs leading-relaxed text-dn-on-color">
          同一行业体制内外差距可达数倍，但稳定性、编制、晋升逻辑完全不同——差距大小由你自己权衡。
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground">
        数据来源：国家统计局2025年城镇单位就业人员平均工资（随静态数据集打包）；部分行业为估算值，仅供参考
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
        <header className="mb-6">
          <h2 className="cc-h2 text-foreground mb-1">数据中心</h2>
          <p className="cc-body text-sm text-muted-foreground">
            查询专业薪资、城市生活成本、行业体制差异
          </p>
        </header>

        {/* Sub-tabs：选中态同时有 3px Teal 底线与 Ink 正文，形状与颜色双重表达 */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              aria-pressed={subTab === tab.id}
              className={`min-h-11 border-b-[3px] px-4 text-sm transition-colors ${
                subTab === tab.id
                  ? 'border-dn-teal text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
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
