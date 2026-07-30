/** 路线存储 — localStorage 管理路线和成就状态 */

import type { Route, RouteNode } from './planner';

const ROUTES_KEY = 'career-compass-routes';

type StoredRoute = Route & { status: 'active' | 'completed' | 'abandoned' };

function guard(): boolean {
  return typeof localStorage !== 'undefined';
}

export function getRoutes(): StoredRoute[] {
  if (!guard()) return [];
  try {
    const raw = localStorage.getItem(ROUTES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) { localStorage.removeItem(ROUTES_KEY); return []; }
    const valid = parsed.filter((r: unknown) => r && typeof r === 'object' && typeof (r as Record<string, unknown>).id === 'string');
    return valid as StoredRoute[];
  } catch { return []; }
}

/** 合并保存：保留已有路线状态，追加新路线，不破坏已有进度 */
export function saveRoutes(routes: Route[]): void {
  if (!guard()) return;
  try {
    const existing = getRoutes();
    const existingIds = new Set(existing.map(r => r.id));
    const newRoutes: StoredRoute[] = routes
      .filter(r => !existingIds.has(r.id))
      .map(r => ({ ...r, status: 'active' as const }));
    const merged = [...existing, ...newRoutes];
    localStorage.setItem(ROUTES_KEY, JSON.stringify(merged));
  } catch { /* ignore */ }
}

export function updateNodeStatus(routeId: string, nodeId: string, done: boolean): void {
  if (!guard()) return;
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);
  if (!route) return;

  const nodeIdx = route.nodes.findIndex(n => n.id === nodeId);
  const node = route.nodes[nodeIdx];
  if (!node) return;

  if (done) {
    node.status = 'done';
    // 解锁下一个里程碑节点（离目标更近的: idx-1 因为数组是目标→起点顺序）
    if (nodeIdx > 0 && route.nodes[nodeIdx - 1].status === 'locked') {
      route.nodes[nodeIdx - 1].status = 'active';
    }
    // 检查是否全部完成
    if (route.nodes.every(n => n.status === 'done' || n.status === 'goal')) {
      route.status = 'completed';
    }
  } else {
    // 撤销完成 → 恢复 active，但不自动锁定已完成的兄弟节点
    if (route.status === 'completed') route.status = 'active';
    node.status = 'active';
  }

  try { localStorage.setItem(ROUTES_KEY, JSON.stringify(routes)); } catch { /* ignore */ }
}

export function abandonRoute(routeId: string): void {
  if (!guard()) return;
  const routes = getRoutes();
  const route = routes.find(r => r.id === routeId);
  if (route) {
    route.status = 'abandoned';
    try { localStorage.setItem(ROUTES_KEY, JSON.stringify(routes)); } catch { /* ignore */ }
  }
}

export function hasRoutes(): boolean {
  if (typeof window === 'undefined') return false;
  return getRoutes().length > 0;
}
