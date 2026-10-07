'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Trash2 } from 'lucide-react';
import { getRoutes, updateNodeStatus, abandonRoute } from '@/lib/route-store';
import { addActivity } from '@/lib/activity-store';
import { ProgressRing } from '@/components/ui/progress-ring';
import { cn } from '@/lib/utils';

const NODE_W = 140;

export function RouteDashboard() {
  const router = useRouter();
  const [routes, setRoutes] = useState<ReturnType<typeof getRoutes>>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRoutes(getRoutes());
  }, []);

  useEffect(() => {
    setRoutes(getRoutes());
    window.addEventListener('routes-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('routes-updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  /** 放弃路线：记录理由到决策日志（放弃理由是最宝贵的决策数据） */
  const handleAbandon = useCallback((routeId: string, routeTitle: string) => {
    const reason = window.prompt('为什么要放弃这条路？记下理由，日后回看（可选）');
    abandonRoute(routeId);
    if (reason && reason.trim()) {
      import('@/lib/decision-store').then(({ addDecision, addSnapshot, settleDecision }) => {
        const entry = addDecision(`是否继续「${routeTitle}」这条路线`, [
          { label: '继续', pros: '', cons: '' },
          { label: '放弃', pros: '', cons: '' },
        ]);
        addSnapshot(entry.id, { leaning: '放弃', confidence: 80, reasoning: reason.trim(), missingInfo: '' });
        settleDecision(entry.id, '放弃');
      }).catch(() => {
        // 模块加载失败时静默降级，理由已通过 addActivity 记录
      });
      addActivity({ type: 'profile_update', title: `放弃路线: ${routeTitle}`, detail: reason.trim() });
    }
    refresh();
    // 通知 RouteBoard 重建上下文并检查成就解锁
    window.dispatchEvent(new Event('routes-updated'));
  }, [refresh]);

  const activeRoutes = routes.filter(r => r.status !== 'abandoned');
  const completedCount = routes.filter(r => r.status === 'completed').length;
  const totalNodes = routes.flatMap(r => r.nodes).length;
  const doneNodes = routes.flatMap(r => r.nodes).filter(n => n.status === 'done').length;
  const completionPct = totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0;

  if (routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-secondary">
          <svg className="h-12 w-12 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">还没有路线规划</h3>
        <p className="text-sm text-muted-foreground mb-6">完善个人画像后，可选用 AI 整理职业路线</p>
        <button onClick={() => router.push('/main?tab=profile')} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm btn-press">
          去完善画像
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overall progress bar */}
      <div className="bg-card rounded-xl border border-border/40 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">总进度</span>
          <span className="text-sm text-muted-foreground">{doneNodes}/{totalNodes} 节点 · {completionPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
          <span>📋 {activeRoutes.length} 条进行中</span>
          <span>✅ {completedCount} 条已完成</span>
        </div>
      </div>

      {/* Route cards */}
      {activeRoutes.map(route => {
        const nodes = route.nodes;
        const doneCount = nodes.filter(n => n.status === 'done').length;
        const isExpanded = expandedId === route.id;

        return (
          <div key={route.id} className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between p-4 border-b border-border/20">
              <div className="flex items-center gap-3">
                <ProgressRing value={doneCount} total={nodes.length} size={40} strokeWidth={3.5} />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{route.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {route.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-px rounded bg-secondary text-muted-foreground">{t}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">{route.salary}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : route.id)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label={isExpanded ? '收起详情' : '展开详情'}
                >
                  {isExpanded ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Horizontal node timeline */}
            <div className="px-4 py-4 overflow-x-auto">
              <div className="flex items-start gap-0 min-w-max">
                {nodes.map((node, idx) => {
                  const isDone = node.status === 'done';
                  const isActive = node.status === 'active';
                  const isGoal = node.status === 'goal';

                  return (
                    <div key={node.id} className="flex items-center">
                      {/* Connection line + flowing particle */}
                      {idx > 0 && (
                        <div className="relative flex items-center w-10 h-12">
                          <div className="w-full h-[2px] rounded-full"
                            style={{ background: isDone ? '#10b981' : isActive ? '#c96442' : '#d9c9b0' }}
                          />
                          {isActive && (
                            <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary animate-pulse" style={{ transform: 'translate(-50%, -50%)' }} />
                          )}
                        </div>
                      )}

                      {/* Node button */}
                      <button
                        onClick={() => {
                          if (node.status === 'active' || node.status === 'done') {
                            updateNodeStatus(route.id, node.id, node.status !== 'done');
                            refresh();
                            // 通知 RouteBoard 重建完整上下文并触发成就检查
                            window.dispatchEvent(new Event('routes-updated'));
                          }
                        }}
                        disabled={node.status === 'locked' || node.status === 'goal'}
                        className={cn(
                          'relative flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-xs transition-all',
                          isDone && 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:shadow-md cursor-pointer ripple-out',
                          isActive && 'bg-primary/10 border-primary text-primary hover:shadow-md cursor-pointer',
                          isGoal && 'bg-amber-50 border-amber-300 text-amber-800 cursor-default',
                          node.status === 'locked' && 'bg-secondary/50 border-border/30 text-muted-foreground cursor-default opacity-50',
                        )}
                        style={{ width: NODE_W, minHeight: 64 }}
                        aria-label={`${node.label} — ${node.status === 'done' ? '已完成' : node.status === 'active' ? '进行中' : node.status === 'goal' ? '最终目标' : '未解锁'}`}
                      >
                        <span className="text-base mb-0.5">
                          {isDone ? '✅' : isActive ? '⏳' : isGoal ? '⭐' : '🔒'}
                        </span>
                        <span className="font-medium text-[11px] leading-tight text-center line-clamp-2">
                          {node.label}
                        </span>
                        {isActive && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-border/10 pt-3 space-y-2 text-xs text-muted-foreground float-up">
                {route.requirements.length > 0 && (
                  <div>
                    <span className="font-semibold text-foreground">📊 门槛条件: </span>
                    {route.requirements.join('、')}
                  </div>
                )}
                {route.fit && <div><span className="font-semibold text-foreground">💡 适合人群: </span>{route.fit}</div>}
                {route.cost && <div><span className="font-semibold text-foreground">⏱️ 代价: </span>{route.cost}</div>}
                {route.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="font-semibold text-foreground">📎 数据来源: </span>
                    {route.sources.slice(0, 3).map((s, i) => {
                      const href = 'url' in s ? s.url : s.sourceUrl;
                      return (
                        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                          className="text-primary underline hover:no-underline">[{s.title}]</a>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAbandon(route.id, route.title)}
                    className="text-[11px] text-muted-foreground hover:text-red-500 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> 放弃此路线
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
