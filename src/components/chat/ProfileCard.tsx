'use client';
import { useState } from 'react';
import type { UserProfile } from '@/types';

interface ProfileCardProps { profile: Partial<UserProfile> }

interface FieldDef {
  key: keyof UserProfile;
  label: string;
  icon: string;
  kind: 'text' | 'budget' | 'tags';
  format: (v: unknown) => string;
}

const FIELDS: FieldDef[] = [
  { key: 'grade', label: '年级', icon: '🎓', kind: 'text', format: v => String(v) },
  { key: 'major', label: '专业', icon: '📚', kind: 'text', format: v => String(v) },
  { key: 'universityTier', label: '学校', icon: '🏫', kind: 'text', format: v => String(v) },
  { key: 'targetCity', label: '城市', icon: '📍', kind: 'text', format: v => String(v) },
  { key: 'householdBudget', label: '预算', icon: '💰', kind: 'budget', format: v => `${(Number(v) / 10000).toFixed(0)}万` },
  { key: 'interests', label: '兴趣', icon: '🎯', kind: 'tags', format: v => Array.isArray(v) ? (v as string[]).join('、') : String(v) },
  { key: 'lifestyle', label: '方式', icon: '🌿', kind: 'tags', format: v => Array.isArray(v) ? (v as string[]).join('、') : String(v) },
  { key: 'redLines', label: '底线', icon: '🚫', kind: 'tags', format: v => Array.isArray(v) ? (v as string[]).join('、') : String(v) },
];

const countFilled = (p: Partial<UserProfile>) => FIELDS.filter(f => {
  const v = p[f.key];
  if (v === undefined || v === null) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return true;
  if (Array.isArray(v)) return v.length > 0;
  return false;
}).length;

/** 编辑某一格并写回 localStorage，广播 profile-updated 让各组件同步 */
function saveField(profile: Partial<UserProfile>, field: FieldDef, rawValue: string): void {
  // 以 localStorage 现值为基底合并，防止连续编辑时旧 prop 覆盖上一次修改
  let base: Partial<UserProfile> = profile;
  try {
    const stored = JSON.parse(localStorage.getItem('career-compass-profile') || '{}');
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      base = { ...profile, ...stored };
    }
  } catch { /* ignore */ }

  let value: unknown;
  const trimmed = rawValue.trim();
  if (field.kind === 'budget') {
    const num = parseFloat(trimmed);
    value = isNaN(num) || num < 0 ? undefined : Math.round(num * 10000);
  } else if (field.kind === 'tags') {
    const tags = trimmed.split(/[、，,\s]+/).map(s => s.trim()).filter(Boolean);
    value = tags.length > 0 ? tags : undefined;
  } else {
    value = trimmed.length > 0 ? trimmed : undefined;
  }
  const updated = { ...base } as Record<string, unknown>;
  if (value === undefined) delete updated[field.key];
  else updated[field.key] = value;
  try {
    localStorage.setItem('career-compass-profile', JSON.stringify(updated));
    window.dispatchEvent(new Event('profile-updated'));
  } catch {
    // localStorage 不可用（配额满/隐私模式/无痕浏览），修改仅存于内存，不做静默回退
    console.warn('[ProfileCard] localStorage.setItem failed — edit held in memory only');
  }
}

function EditableCell({ field, profile }: { field: FieldDef; profile: Partial<UserProfile> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const v = profile[field.key];
  const isFilled = v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0);

  const startEdit = () => {
    if (field.kind === 'budget') setDraft(isFilled ? String(Number(v) / 10000) : '');
    else if (field.kind === 'tags') setDraft(isFilled ? (v as string[]).join('、') : '');
    else setDraft(isFilled ? String(v) : '');
    setEditing(true);
  };

  const commit = () => {
    saveField(profile, field, draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-lg px-2.5 py-2 bg-background ring-1 ring-primary/40">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span>{field.icon}</span><span>{field.label}</span></div>
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if ((e.nativeEvent as KeyboardEvent).isComposing) return;
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') setEditing(false);
          }}
          placeholder={field.kind === 'budget' ? '万元，如 20' : field.kind === 'tags' ? '用、分隔' : ''}
          aria-label={`编辑${field.label}`}
          className="mt-0.5 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
        />
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className={`rounded-lg px-2.5 py-2 text-left transition-colors hover:ring-1 hover:ring-primary/30 group ${isFilled ? 'bg-background' : 'bg-background/50'}`}
      aria-label={`${field.label}：${isFilled ? field.format(v) : '未填写'}，点击编辑`}
    >
      <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span>{field.icon}</span><span>{field.label}</span></span>
        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-primary/60 transition-opacity">✎</span>
      </div>
      <div className={`mt-0.5 text-sm ${isFilled ? 'font-medium text-foreground' : 'text-muted-foreground/60'}`}>
        {isFilled ? field.format(v) : '—'}
      </div>
    </button>
  );
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const filled = countFilled(profile), total = FIELDS.length, pct = Math.round((filled / total) * 100);

  if (collapsed) return (
    <button onClick={() => setCollapsed(false)} className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm shadow-sm transition-all hover:shadow-md">
      <span className="text-base">📋</span><span className="font-medium text-foreground">角色卡</span>
      <span className="text-muted-foreground">({filled}/{total})</span>
      <span className="ml-auto text-xs text-muted-foreground">展开 ▾</span>
    </button>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/50 bg-secondary/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span><span className="text-sm font-semibold">角色卡</span>
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">{filled}/{total}</span>
        </div>
        <button onClick={() => setCollapsed(true)} className="rounded p-0.5 text-muted-foreground hover:text-foreground" aria-label="收起">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border/30 p-3">
        {FIELDS.map(f => <EditableCell key={f.key} field={f} profile={profile} />)}
      </div>
      <div className="border-t border-border/50 px-4 py-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>了解程度</span>
          <span className={`font-medium ${filled >= 6 ? 'text-emerald-600' : filled >= 4 ? 'text-primary' : 'text-muted-foreground'}`}>{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className={`h-full rounded-full transition-all duration-500 ${filled >= 6 ? 'bg-emerald-500' : filled >= 4 ? 'bg-primary' : 'bg-border'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-center text-xs">
          {filled >= 6 ? <span className="text-emerald-600">可以开始分析了</span> : filled >= 4 ? <span className="text-primary">继续了解中</span> : <span className="text-muted-foreground">点击任意格子直接填写</span>}
        </div>
      </div>
    </div>
  );
}
