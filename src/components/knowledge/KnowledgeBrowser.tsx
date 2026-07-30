'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowUpDown, Bookmark, ExternalLink, ChevronLeft, ChevronRight, Calculator } from 'lucide-react';
import { loadAllData, getSalaryRanking, getNationalAvg, hasLoadError } from '@/lib/data-store';
import { estimateNetSalary, ASSUMPTIONS_NOTE } from '@/lib/salary-calc';

interface Row { name: string; salary: number; field: string; id: string }
const PAGE_SIZE = 50;

export function KnowledgeBrowser() {
  const [allRows, setAllRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [page, setPage] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('career-compass-bookmarks')||'[]')); } catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [avg, setAvg] = useState(6435);
  const [showNet, setShowNet] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadAllData().then((ok) => {
      if (cancelled) return;
      if (ok) {
        const rows = getSalaryRanking()
          .filter((r): r is Row => typeof r.name === 'string' && typeof r.salary === 'number' && typeof r.field === 'string')
          .map(r => ({ ...r, id: `m-${r.name}` }));
        setAllRows(rows);
        setAvg(getNationalAvg() || 6435);
      } else {
        setError(hasLoadError());
      }
      setLoading(false);
    }).catch(() => { if (!cancelled) { setError(true); setLoading(false); }});
    return () => { cancelled = true; };
  }, []);

  const toggleBm = (id: string) => {
    const next = new Set(bookmarks); next.has(id) ? next.delete(id) : next.add(id);
    setBookmarks(next); localStorage.setItem('career-compass-bookmarks', JSON.stringify([...next]));
  };

  const allFields = useMemo(() => [...new Set(allRows.map(r => r.field))], [allRows]);

  const filtered = useMemo(() => {
    let result = search ? allRows.filter(r => r.name.includes(search) || r.field.includes(search)) : allRows;
    result = [...result].sort((a,b) => sortDir==='desc'?b.salary-a.salary:a.salary-b.salary);
    return [...result].sort((a,b) => (bookmarks.has(b.id)?1:0)-(bookmarks.has(a.id)?1:0));
  }, [allRows, search, sortDir, bookmarks]);

  const pages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center h-64 gap-3"><p className="text-sm text-muted-foreground">数据加载失败</p><button onClick={() => { setError(false); setLoading(true); loadAllData().then(ok => { if (ok) { setAllRows(getSalaryRanking().map(r => ({ ...r, id: `m-${r.name}` }))); setAvg(getNationalAvg() || 6435); } else setError(hasLoadError()); setLoading(false); }); }} className="text-xs text-primary hover:underline">重试</button></div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">数据库</h2>
            <p className="text-xs text-muted-foreground">{filtered.length} 个专业 · {allFields.length} 个学科 · 数据来源麦可思</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowNet(v=>!v)}
              aria-pressed={showNet}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium inline-flex items-center gap-1 transition-colors ${showNet?'bg-primary text-primary-foreground':'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              <Calculator className="h-3 w-3"/> 到手估算
            </button>
            <button onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')} className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3"/> {sortDir==='desc'?'高→低':'低→高'}
            </button>
            <div className="flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-muted-foreground/40"/>
              <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}} placeholder="搜索" aria-label="搜索专业" className="w-36 bg-transparent text-xs outline-none"/>
            </div>
          </div>
        </div>

        {/* Quick filters */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          <button onClick={()=>setSearch('')} className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${!search?'bg-foreground text-background':'bg-secondary text-muted-foreground hover:text-foreground'}`}>全部</button>
          {allFields.slice(0,8).map(f => (
            <button key={f} onClick={()=>{setSearch(f);setPage(0);}} className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${search===f?'bg-foreground text-background':'bg-secondary text-muted-foreground hover:text-foreground'}`}>{f}</button>
          ))}
          {allFields.length > 8 && <span className="text-[11px] text-muted-foreground/40 self-center">+{allFields.length-8} 更多</span>}
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
                {showNet && <th className="px-3 py-2.5 text-right text-[11px] font-medium text-muted-foreground">到手估算</th>}
                <th className="px-3 py-2.5 text-center text-[11px] font-medium text-muted-foreground w-10">收藏</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={r.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-2 text-xs text-muted-foreground/40 tabular-nums">{page*PAGE_SIZE+i+1}</td>
                  <td className="px-3 py-2 font-medium text-foreground text-[13px]">{r.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">{r.field}</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-[13px]">
                    <span className={r.salary >= avg ? 'text-emerald-600' : 'text-foreground'}>¥{r.salary.toLocaleString()}</span>
                  </td>
                  {showNet && <td className="px-3 py-2 text-right tabular-nums text-[13px]">
                    {(() => {
                      const b = estimateNetSalary(r.salary);
                      return (
                        <span className="text-muted-foreground" title={`五险一金 ¥${b.socialTotal.toLocaleString()} + 个税 ¥${b.monthlyTax.toLocaleString()}`}>
                          ¥{b.net.toLocaleString()}
                        </span>
                      );
                    })()}
                  </td>}
                  <td className="px-3 py-2 text-center">
                    <button onClick={()=>toggleBm(r.id)} className={bookmarks.has(r.id)?'text-amber-500':'text-muted-foreground/20 hover:text-amber-400'}>
                      <Bookmark className={`h-3.5 w-3.5 ${bookmarks.has(r.id)?'fill-amber-400':''}`}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronLeft className="h-3.5 w-3.5"/></button>
            <span className="text-xs text-muted-foreground">{page+1} / {pages}</span>
            <button onClick={()=>setPage(p=>Math.min(pages-1,p+1))} disabled={page>=pages-1} className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronRight className="h-3.5 w-3.5"/></button>
          </div>
        )}

        <div className="mt-6 space-y-1 text-center">
          {showNet && (
            <p className="text-[10px] text-muted-foreground/40">
              {ASSUMPTIONS_NOTE}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/40">
            数据来源：麦可思研究院《2026年中国本科生就业报告》、国家统计局 · <a href="https://finance.eastmoney.com/a/202607163809142791.html" target="_blank" rel="noopener noreferrer" className="hover:text-primary inline-flex items-center gap-0.5">查看原始报告<ExternalLink className="h-2.5 w-2.5"/></a>
          </p>
        </div>
      </div>
    </div>
  );
}
