'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Trash2 } from 'lucide-react';
import { getRoutes, updateNodeStatus, abandonRoute } from '@/lib/route-store';
import { addActivity } from '@/lib/activity-store';
import { ProgressRing } from '@/components/ui/progress-ring';
import { cn } from '@/lib/utils';

const NODE_W = 140;

/** 节点状态 → 文字语义：状态不能只靠颜色表达 */
function nodeStatusLabel(status: string): string {
  switch (status) {
    case 'done': return '已完成';
    case 'active': return '进行中';
    case 'goal': return '最终目标';
    default: return '未解锁';
  }
}

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
        <div className="mb-6 flex h-24 w-24 items-center justify-center bg-dn-divider">
          <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </div>
        <h3 className="cc-h2 text-foreground mb-2">还没有路线规划</h3>
        <p className="text-sm text-muted-foreground mb-6">完善个人画像后，可选用 AI 整理职业路线</p>
        <button onClick={() => router.push('/main?tab=profile')} className="min-h-11 bg-primary px-6 text-sm text-primary-foreground btn-press">
          去完善画像
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 总进度：一块 Ink 实色场，数字本身成为界面 */}
      <div className="bg-dn-ink text-dn-on-ink p-5">
        <div className="flex items-end justify-between mb-3">
          <span className="cc-kicker">总进度</span>
          <span className="text-sm cc-on-ink-dim">{doneNodes}/{totalNodes} 节点 · <span className="cc-num">{completionPct}%</span></span>
        </div>
        <div
          className="h-2 w-full bg-dn-canvas overflow-hidden"
          role="progressbar"
          aria-valuenow={completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="全部路线的节点完成率"
        >
          <div className="h-full bg-dn-teal transition-all duration-700 ease-out" style={{ width: `${completionPct}%` }} />
        </div>
        <div className="flex gap-6 mt-4 text-xs cc-on-ink-dim">
          <span className="cc-status cc-status-open">{activeRoutes.length} 条进行中</span>
          <span className="cc-status cc-status-done">{completedCount} 条已完成</span>
        </div>
      </div>

      {/* Route cards */}
      {activeRoutes.map(route => {
        const nodes = route.nodes;
        const doneCount = nodes.filter(n => n.status === 'done').length;
        const isExpanded = expandedId === route.id;

        return (
          <div key={route.id} className="bg-card border border-border overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <ProgressRing value={doneCount} total={nodes.length} size={40} strokeWidth={3.5} />
                <div>
                  <h3 className="cc-h2 text-foreground">{route.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {route.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-px bg-dn-divider text-foreground">{t}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">{route.salary}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : route.id)}
                  className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground hover:bg-dn-divider hover:text-foreground transition-colors"
                  aria-label={isExpanded ? '收起路线详情' : '展开路线详情'}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? <ChevronRight className="h-4 w-4 rotate-90" aria-hidden="true" /> : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
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
                      {/* 连接线：DNDL 品牌实色；当前位置用静态标记，不做循环脉冲 */}
                      {idx > 0 && (
                        <div className="relative flex items-center w-10 h-12">
                          <div className="w-full h-[2px]"
                            style={{ background: isDone ? 'var(--dn-emerald)' : isActive ? 'var(--dn-teal)' : 'var(--dn-divider)' }}
                          />
                          {isActive && (
                            <div className="absolute top-1/2 left-0 w-2 h-2 bg-dn-teal" style={{ transform: 'translate(-50%, -50%)' }} />
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
                          'relative flex flex-col items-center justify-center gap-1 border px-3 py-2.5 text-xs transition-colors',
                          isDone && 'cc-tint-emerald border-dn-emerald text-foreground hover:bg-dn-emerald hover:text-dn-on-color cursor-pointer ripple-out',
                          isActive && 'cc-tint-teal border-primary text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer',
                          isGoal && 'cc-tint-amber border-dn-amber text-foreground cursor-default',
                          node.status === 'locked' && 'bg-secondary border-border text-muted-foreground cursor-default',
                        )}
                        style={{ width: NODE_W, minHeight: 64 }}
                        aria-label={`${node.label} — ${nodeStatusLabel(node.status)}`}
                      >
                        {/* 状态：颜色之外另有形状 + 文字 */}
                        <span className={cn(
                          'cc-status text-[10px]',
                          isDone && 'cc-status-done',
                          isActive && 'cc-status-open',
                          node.status === 'locked' && 'cc-status-blocked',
                        )}>
                          {nodeStatusLabel(node.status)}
                        </span>
                        <span className="font-medium text-[11px] leading-tight text-center line-clamp-2">
                          {node.label}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-border pt-3 space-y-2 text-xs text-muted-foreground float-up">
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
                          className="text-foreground underline underline-offset-2 hover:bg-dn-divider">[{s.title}]</a>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleAbandon(route.id, route.title)}
                    className="inline-flex min-h-11 items-center gap-1.5 bg-dn-crimson px-3 text-[11px] font-medium text-dn-on-color btn-press"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> 放弃此路线
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
