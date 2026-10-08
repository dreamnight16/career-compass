'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { getStreak, getStreakHistory, formatDateKey } from '@/lib/streak-store';
import { cn } from '@/lib/utils';

interface StreakCalendarProps {}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日'];

/** 热力图色阶：全部来自 DNDL Token（Teal → Cyan，最高档落到 Ink）。
 *  颜色只是辅助，图例同时给出每一档的互动次数区间文字。 */
function cellColor(count: number): string {
  if (count === 0) return 'bg-dn-divider';
  if (count <= 2) return 'cc-tint-teal';
  if (count <= 4) return 'bg-dn-teal';
  if (count <= 8) return 'bg-dn-cyan';
  return 'bg-dn-ink';
}

interface DayCell {
  date: string;
  count: number;
  activities: string[];
}

export function StreakCalendar(_props: StreakCalendarProps) {
  const [offset, setOffset] = useState(0); // 0 = current half, negative = past
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const streak = getStreak();
  const allDates = useMemo(() => getStreakHistory(), []);

  // Generate 180 days of cells
  const cells = useMemo(() => {
    const result: DayCell[] = [];
    const now = new Date();
    for (let i = 179 + offset * 30; i >= offset * 30; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const count = allDates.filter(dt => dt === key).length;
      result.push({ date: key, count: Math.min(count, 5), activities: [] });
    }
    return result;
  }, [allDates, offset]);

  // Group by week rows
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Month labels
  const monthMarkers: { label: string; col: number }[] = [];
  let lastMonth = '';
  cells.forEach((c, i) => {
    const m = c.date.slice(5, 7);
    if (m !== lastMonth) {
      lastMonth = m;
      monthMarkers.push({ label: MONTH_NAMES[parseInt(m) - 1], col: Math.floor(i / 7) });
    }
  });

  // 选中日的互动次数（仅用于文字复述，未选中时为 0）
  const selectedDayCount = selectedDay
    ? (cells.find(c => c.date === selectedDay)?.count ?? 0)
    : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-dn-orange" aria-hidden="true" />
          <h2 className="cc-h2 text-foreground">活跃记录</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            连续打卡 <span className="cc-num text-foreground">{streak}</span> 天
          </span>
          {streak >= 7 && (
            <span className="border border-dn-emerald cc-tint-emerald px-2 py-1 text-xs text-foreground">
              <span aria-hidden="true">🏅</span> 七日之约 · 已达成
            </span>
          )}
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:bg-dn-divider hover:text-foreground transition-colors"
          aria-label="查看更早的 30 天"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => setOffset(o => o < 0 ? o + 1 : 0)}
          className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:bg-dn-divider hover:text-foreground transition-colors"
          aria-label="查看更近的 30 天"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Month labels row */}
      <div className="flex ml-8 mb-1">
        {monthMarkers.map((mm, i) => (
          <span key={i} className="text-[10px] text-muted-foreground" style={{ width: `${(mm.col + 1) * 16}px` }}>
            {mm.label}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAY_NAMES.map((d, i) => (
            <span key={i} className="text-[9px] text-muted-foreground h-3 w-4 flex items-center">{d}</span>
          ))}
        </div>

        {/* Cells */}
        <div className="flex gap-0.5 flex-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell, di) => {
                const todayKey = formatDateKey(new Date());
                const isToday = cell.date === todayKey;
                const isSelected = cell.date === selectedDay;

                return (
                  <button
                    key={`${wi}-${di}`}
                    onClick={() => setSelectedDay(isSelected ? null : cell.date)}
                    className={cn(
                      'w-3 h-3 transition-colors duration-200',
                      cellColor(cell.count),
                      isToday && 'ring-1 ring-primary',
                      isSelected && 'ring-2 ring-dn-ink',
                      'hover:ring-2 hover:ring-dn-ink'
                    )}
                    title={`${cell.date}: ${cell.count} 次互动`}
                    aria-label={`${cell.date}: ${cell.count} 次互动`}
                    aria-pressed={isSelected}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 图例：色阶 + 文字区间说明，颜色不是唯一信息 */}
      <div className="mt-4">
        <p className="text-[11px] text-muted-foreground mb-1">图例 · 单日互动次数（少 → 多）</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><span className={cn('inline-block w-3 h-3 shrink-0', cellColor(0))} />0 次</span>
          <span className="inline-flex items-center gap-1"><span className={cn('inline-block w-3 h-3 shrink-0', cellColor(1))} />1–2 次</span>
          <span className="inline-flex items-center gap-1"><span className={cn('inline-block w-3 h-3 shrink-0', cellColor(3))} />3–4 次</span>
          <span className="inline-flex items-center gap-1"><span className={cn('inline-block w-3 h-3 shrink-0', cellColor(5))} />5 次及以上</span>
        </div>
      </div>

      {/* 选中日期：用文字复述选中内容，不靠颜色单独表达 */}
      {selectedDay && (
        <p className="mt-3 text-xs text-muted-foreground">
          已选 <span className="cc-num text-foreground">{selectedDay}</span> · 当日互动 <span className="cc-num text-foreground">{selectedDayCount}</span> 次
        </p>
      )}

      {/* Dynamic tip */}
      {streak > 0 && streak < 7 && (
        <p className="mt-3 text-xs text-muted-foreground">
          再坚持 <span className="cc-num text-foreground">{7 - streak}</span> 天就能解锁「七日之约」徽章
        </p>
      )}
    </div>
  );
}
