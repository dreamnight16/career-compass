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
      <div className="bg-secondary px-2.5 py-2 ring-1 ring-primary">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><span aria-hidden="true">{field.icon}</span><span>{field.label}</span></div>
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
          className="mt-0.5 min-h-9 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
    );
  }

  return (
    <button
      onClick={startEdit}
      className="group min-h-11 bg-card px-2.5 py-2 text-left transition-colors hover:bg-secondary"
      aria-label={`${field.label}：${isFilled ? field.format(v) : '未填写'}，点击编辑`}
    >
      <div className="flex items-center justify-between gap-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span aria-hidden="true">{field.icon}</span><span>{field.label}</span></span>
        <span className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 text-[11px] text-muted-foreground" aria-hidden="true">✎</span>
      </div>
      {/* 已填 / 未填用文字本身区分（值 vs「未填写」），不依赖颜色 */}
      <div className={`mt-0.5 text-sm ${isFilled ? 'text-foreground' : 'text-muted-foreground'}`}>
        {isFilled ? field.format(v) : '未填写'}
      </div>
    </button>
  );
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const filled = countFilled(profile), total = FIELDS.length, pct = Math.round((filled / total) * 100);

  if (collapsed) return (
    <button onClick={() => setCollapsed(false)} className="dn-focus btn-press flex min-h-11 w-full items-center gap-2.5 border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary">
      <span className="text-base" aria-hidden="true">📋</span><span className="text-foreground">角色卡</span>
      <span className="cc-num text-foreground">{filled}<span className="text-muted-foreground">/{total}</span></span>
      <span className="ml-auto text-xs text-muted-foreground">展开 ▾</span>
    </button>
  );

  return (
    /* Level 0：平面直角，靠分隔线与排版分层，不用圆角卡片堆叠 */
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base" aria-hidden="true">📋</span><span className="cc-h2 text-foreground">角色卡</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="cc-num text-2xl text-foreground">
            {filled}<span className="cc-num text-base text-muted-foreground">/{total}</span>
          </span>
          <button onClick={() => setCollapsed(true)} className="dn-focus btn-press inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground" aria-label="收起角色卡">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
      {/* 8 个维度：直角网格 + 发丝分隔线，不叠小圆角卡片 */}
      <div className="grid grid-cols-2 gap-px bg-border">
        {FIELDS.map(f => <EditableCell key={f.key} field={f} profile={profile} />)}
      </div>
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="cc-kicker text-muted-foreground">了解程度</span>
          <span className="cc-num text-xl text-foreground">{pct}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="角色卡填写进度">
          <div className={`h-full transition-all duration-500 ${filled >= 6 ? 'bg-dn-emerald' : filled >= 4 ? 'bg-dn-amber' : 'bg-dn-steel'}`} style={{ width: `${pct}%` }} />
        </div>
        {/* 状态用实色块 + 文字与符号表达，不只靠颜色 */}
        <div className="mt-2">
          {filled >= 6
            ? <span className="inline-flex min-h-9 items-center bg-dn-emerald px-2.5 text-xs text-dn-on-color">✓ 可以开始分析了</span>
            : filled >= 4
              ? <span className="inline-flex min-h-9 items-center bg-dn-amber px-2.5 text-xs text-dn-on-color">△ 继续了解中，还差 {6 - filled} 项</span>
              : <span className="inline-flex min-h-9 items-center border border-border px-2.5 text-xs text-muted-foreground">◇ 点击任意格子直接填写</span>}
        </div>
      </div>
    </div>
  );
}
