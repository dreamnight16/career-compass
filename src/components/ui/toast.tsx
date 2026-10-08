'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string; type: ToastType; message: string; exiting?: boolean; action?: ToastAction;
}

let addToastFn: ((type: ToastType, message: string, action?: ToastAction) => void) | null = null;

export function toast(type: ToastType, message: string, action?: ToastAction) {
  addToastFn?.(type, message, action);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimers = (id: string) => {
    const t = timersRef.current;
    if (t.has(id)) { clearTimeout(t.get(id)!); t.delete(id); }
  };

  const add = useCallback((type: ToastType, message: string, action?: ToastAction) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => {
      const next = [...prev, { id, type, message, action }];
      if (next.length > 5) {
        const removed = next.shift()!;
        setTimeout(() => { clearTimers(removed.id); clearTimers(removed.id + ':remove'); }, 0);
      }
      return next;
    });
    const exitTimer = setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
      const removeTimer = setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
        timersRef.current.delete(id);
      }, 200);
      timersRef.current.set(id + ':remove', removeTimer);
    }, 3000);
    timersRef.current.set(id, exitTimer);
  }, []);

  const manualClose = useCallback((id: string) => {
    clearTimers(id);
    clearTimers(id + ':remove');
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 200);
  }, []);

  useEffect(() => {
    addToastFn = add;
    return () => {
      addToastFn = null;
      timersRef.current.forEach((tid) => clearTimeout(tid));
      timersRef.current.clear();
    };
  }, [add]);

  const icons = { success: CheckCircle, error: XCircle, info: Info };
  /** 品牌实色场：成功 Emerald / 错误 Crimson / 信息 Cyan，色块上的正文一律用 on-color */
  const fields: Record<ToastType, string> = {
    success: 'bg-dn-emerald',
    error: 'bg-dn-crimson',
    info: 'bg-dn-cyan',
  };
  /** 状态不能只用颜色表达：状态词与图标同时出现 */
  const labels: Record<ToastType, string> = { success: '成功', error: '出错', info: '提示' };

  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => {
        const Icon = icons[t.type];
        return (
          <div key={t.id}
            className={`dn-elevation-3 flex max-w-sm items-center gap-3 px-4 text-sm text-dn-on-color transition-all duration-hover ${fields[t.type]} ${t.exiting ? 'translate-x-4 opacity-0' : 'spring-in opacity-100'}`}>
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="cc-kicker shrink-0">{labels[t.type]}</span>
            <span className="min-w-0 flex-1">{t.message}</span>
            {t.action && (
              <button
                onClick={() => { t.action!.onClick(); manualClose(t.id); }}
                className="dn-focus min-h-11 shrink-0 px-2 text-xs underline underline-offset-2"
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => manualClose(t.id)}
              aria-label="关闭通知"
              className="dn-interactive dn-focus -mr-2 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
