'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapPin, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { loadAllData, getSalaryRanking, getCityCosts, getNationalAvg, hasLoadError } from '@/lib/data-store';
import { PurchasingView } from './PurchasingView';
import { IndustryCompare } from './IndustryCompare';

const MAJOR_COLORS = ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4','#f97316','#6366f1','#14b8a6','#ec4899','#84cc16','#0ea5e9'];

type CompareMode = 'salary' | 'purchasing' | 'industry';

const MODES: { id: CompareMode; label: string }[] = [
  { id: 'salary', label: '专业薪资' },
  { id: 'purchasing', label: '城市购买力' },
  { id: 'industry', label: '行业体制对比' },
];

export function SalaryCompare() {
  const [mode, setMode] = useState<CompareMode>('salary');

  // Track compare views for achievements
  useEffect(() => {
    try {
      const existing: string[] = JSON.parse(localStorage.getItem('career-compass-compare-views') || '[]');
      if (!existing.includes(mode)) {
        localStorage.setItem('career-compass-compare-views', JSON.stringify([...existing, mode]));
      }
    } catch { /* ignore */ }
  }, [mode]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* 模式切换 */}
      <div className="shrink-0 border-b border-border/30 bg-background/60 px-6 pt-4 pb-0">
        <div className="mx-auto max-w-3xl flex gap-1">
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                mode === m.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {mode === 'salary' && <MajorSalaryView />}
        {mode === 'purchasing' && <PurchasingView />}
        {mode === 'industry' && <IndustryCompare />}
      </div>
    </div>
  );
}

function MajorSalaryView() {
  const [majors, setMajors] = useState<{ name: string; salary: number; field: string }[]>([]);
  const [cities, setCities] = useState<{ name: string; monthly: number }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selCity, setSelCity] = useState('上海');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [avg, setAvg] = useState(6435);

  const load = () => {
    setLoading(true); setError(false);
    loadAllData().then(ok => {
      if (ok) {
        const m = getSalaryRanking();
        setMajors(m);
        setCities(getCityCosts().slice(0, 12).map(c => ({ name: c.name, monthly: Math.round(c.income / 12) })));
        setAvg(getNationalAvg() || 6435);
        if (m.length > 0) setSelected(new Set(m.slice(0, 6).map(x => x.name)));
      } else { setError(hasLoadError()); }
      setLoading(false);
    }).catch(() => { setError(true); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) { if (next.size > 1) next.delete(name); }
    else if (next.size < 10) next.add(name);
    setSelected(next);
  };

  const list = useMemo(() => majors.filter(m => selected.has(m.name)).sort((a,b) => b.salary - a.salary), [majors, selected]);
  const maxVal = Math.max(...list.map(m => m.salary), 1);
  const cityData = cities.find(c => c.name === selCity) || cities[0];
  const cityMonthlyIncome = cityData?.monthly || 6000;

  if (loading) return <div className="flex items-center justify-center h-full"><div className="skeleton h-64 w-full max-w-2xl rounded-2xl" /></div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <p className="text-sm text-muted-foreground">数据加载失败</p>
      <button onClick={load} className="text-xs text-primary hover:underline">重试</button>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">薪资对比</h2>
        <p className="text-sm text-muted-foreground mb-6">{majors.length} 个专业，从统一数据中心加载</p>

        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1"><MapPin className="inline h-3.5 w-3.5"/> 参照城市：</span>
          {cities.slice(0, 10).map(c => (
            <button key={c.name} onClick={() => setSelCity(c.name)}
              aria-pressed={c.name === selCity}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${c.name === selCity ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {c.name} ¥{c.monthly.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mb-8 space-y-2">
          {list.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2 group">
              <span className="w-36 text-right text-[11px] text-muted-foreground truncate">{m.name}</span>
              <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden relative">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(m.salary/maxVal)*100}%`, backgroundColor: MAJOR_COLORS[i % MAJOR_COLORS.length] }} />
              </div>
              <span className="w-16 text-[11px] font-semibold tabular-nums text-foreground">¥{m.salary.toLocaleString()}</span>
              <span className="w-12 text-[10px] text-muted-foreground/50">{m.salary > avg ? <ArrowUp className="inline h-3 w-3 text-emerald-500"/> : <ArrowDown className="inline h-3 w-3 text-red-400"/>}{Math.abs(m.salary-avg)}</span>
            </div>
          ))}
          <div className="relative mt-3 pt-2 border-t border-dashed border-border/40">
            <div className="flex items-center gap-2">
              <span className="w-36 text-right text-[10px] text-muted-foreground/50">{selCity} 人均可支配收入(月)</span>
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-foreground/30" style={{ left: `${Math.min(100, (cityMonthlyIncome/maxVal)*100)}%` }} />
              </div>
              <span className="w-16 text-[11px] font-semibold">¥{cityMonthlyIncome.toLocaleString()}</span>
              <span className="w-12" />
            </div>
            <p className="mt-1 text-right text-[10px] text-muted-foreground/40">城市线为年人均可支配收入÷12（国家统计局口径），非平均工资</p>
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
                className={`rounded-lg px-3 py-1.5 text-xs transition-all ${selected.has(m.name) ? 'bg-foreground text-background shadow-sm' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
                {m.name} {m.salary > avg ? '↑' : '↓'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
