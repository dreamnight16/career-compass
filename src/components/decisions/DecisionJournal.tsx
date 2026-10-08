'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, NotebookPen, PenLine, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import {
  addDecision,
  addSnapshot,
  deleteDecision,
  getDecisions,
  reopenDecision,
  settleDecision,
  type DecisionEntry,
  type DecisionOption,
  type DecisionSnapshot,
} from '@/lib/decision-store';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;
const NO_LEANING = '还没倾向';
const DEFAULT_CONFIDENCE = 50;
const DELETE_CONFIRM_TEXT = '删除这个决策记录？所有想法快照会一起删除。';

// DNDL：默认直角、控件轮廓用 border-input，次要文字只用满强度的 text-muted-foreground。
// 透明度修饰符在 var() 颜色上不生成 CSS，因此这里不再出现任何 `/10`、`/30` 之类写法。
const FIELD_CLS =
  'dn-focus w-full min-h-11 border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground placeholder:opacity-60';
const LABEL_CLS = 'mb-1 block text-xs font-medium text-muted-foreground';
const PRIMARY_BTN_CLS =
  'dn-focus btn-press inline-flex min-h-11 items-center justify-center gap-1.5 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground';
const GHOST_BTN_CLS =
  'dn-focus btn-press inline-flex min-h-11 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground';
// 纯图标按钮：必须带 aria-label，并保证 44×44 的可点击目标
const ICON_BTN_CLS =
  'dn-focus inline-flex min-h-11 min-w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground';
// 删除按钮：悬停时换成 Crimson 实色场，危险操作有明确的形状与颜色反馈
const DANGER_BTN_CLS =
  'dn-focus inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-dn-crimson hover:text-dn-on-color';

interface SnapshotDraft {
  leaning: string;
  confidence: number;
  reasoning: string;
  missingInfo: string;
}

interface OptionDraft {
  label: string;
  pros: string;
  cons: string;
}

function emptySnapshotDraft(): SnapshotDraft {
  return { leaning: NO_LEANING, confidence: DEFAULT_CONFIDENCE, reasoning: '', missingInfo: '' };
}

function emptyOptionDraft(): OptionDraft {
  return { label: '', pros: '', cons: '' };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 快照表单字段：新建决策的第一条快照与「补记一次想法」共用 */
function SnapshotFields({
  idPrefix,
  optionLabels,
  draft,
  onChange,
}: {
  idPrefix: string;
  optionLabels: string[];
  draft: SnapshotDraft;
  onChange: (next: SnapshotDraft) => void;
}) {
  const labels = Array.from(new Set(optionLabels.map((l) => l.trim()).filter((l) => l !== '')));
  const selectValue = draft.leaning === NO_LEANING || labels.includes(draft.leaning) ? draft.leaning : NO_LEANING;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-leaning`} className={LABEL_CLS}>当前倾向</label>
          <select
            id={`${idPrefix}-leaning`}
            value={selectValue}
            onChange={(e) => onChange({ ...draft, leaning: e.target.value })}
            className={FIELD_CLS}
          >
            <option value={NO_LEANING}>{NO_LEANING}</option>
            {labels.map((label) => (
              <option key={label} value={label}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${idPrefix}-confidence`} className={LABEL_CLS}>
            信心度：<span className="cc-num text-base text-foreground">{draft.confidence}%</span>
          </label>
          <input
            id={`${idPrefix}-confidence`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={draft.confidence}
            onChange={(e) => onChange({ ...draft, confidence: Number(e.target.value) })}
            className="dn-focus mt-2 w-full min-h-11 accent-primary"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-reasoning`} className={LABEL_CLS}>我此刻的想法</label>
        <textarea
          id={`${idPrefix}-reasoning`}
          rows={3}
          value={draft.reasoning}
          onChange={(e) => onChange({ ...draft, reasoning: e.target.value })}
          placeholder="现在为什么这么倾向？哪些权衡在拉扯？"
          className={`${FIELD_CLS} resize-y`}
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-missing`} className={LABEL_CLS}>还缺什么信息</label>
        <input
          id={`${idPrefix}-missing`}
          type="text"
          value={draft.missingInfo}
          onChange={(e) => onChange({ ...draft, missingInfo: e.target.value })}
          placeholder="如：目标院校近三年复试线、目标岗位真实薪资"
          className={FIELD_CLS}
        />
      </div>
    </div>
  );
}

/** 想法演变时间线，最新的在最后 */
function SnapshotTimeline({ snapshots }: { snapshots: DecisionSnapshot[] }) {
  if (snapshots.length === 0) {
    return <p className="text-sm text-muted-foreground">还没有想法记录，点「补记一次想法」写下此刻的权衡</p>;
  }
  return (
    <ol className="border-l border-border">
      {snapshots.map((s) => (
        <li key={s.id} className="relative pb-6 pl-5 last:pb-0">
          {/* 时间线节点：方形标记，形状本身也在表达「一次记录」 */}
          <span
            aria-hidden="true"
            className="absolute -left-[3px] top-1.5 h-[5px] w-[5px] bg-dn-teal"
          />
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <time dateTime={s.createdAt} className="cc-num text-sm text-muted-foreground">
              {formatDate(s.createdAt)}
            </time>
            <span className="text-xs font-medium text-foreground">倾向：{s.leaning}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div
              role="img"
              aria-label={`信心度 ${s.confidence}%`}
              className="h-1.5 w-32 overflow-hidden bg-muted"
            >
              <div className="h-full bg-dn-teal" style={{ width: `${s.confidence}%` }} />
            </div>
            <span className="cc-num text-xl text-foreground">{s.confidence}%</span>
            <span className="text-xs text-muted-foreground">
              信心度 · {s.confidence >= 70 ? '比较有把握' : s.confidence >= 40 ? '还在摇摆' : '把握很小'}
            </span>
          </div>
          {s.reasoning !== '' && <p className="mt-2 text-sm leading-relaxed text-foreground">{s.reasoning}</p>}
          {s.missingInfo !== '' && <p className="mt-1.5 text-xs text-muted-foreground">还缺：{s.missingInfo}</p>}
        </li>
      ))}
    </ol>
  );
}

function NewDecisionForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<OptionDraft[]>([emptyOptionDraft(), emptyOptionDraft()]);
  const [snapshot, setSnapshot] = useState<SnapshotDraft>(emptySnapshotDraft());
  const [error, setError] = useState('');

  const updateOption = (index: number, patch: Partial<OptionDraft>) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, ...patch } : o)));
  };

  const handleAddOption = () => {
    setOptions((prev) => (prev.length < MAX_OPTIONS ? [...prev, emptyOptionDraft()] : prev));
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => (prev.length > MIN_OPTIONS ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSave = () => {
    const trimmedQuestion = question.trim();
    if (trimmedQuestion === '') {
      setError('先写下你纠结的问题');
      return;
    }
    const validOptions: DecisionOption[] = options
      .map((o) => ({ label: o.label.trim(), pros: o.pros.trim(), cons: o.cons.trim() }))
      .filter((o) => o.label !== '');
    if (validOptions.length < MIN_OPTIONS) {
      setError(`至少填写 ${MIN_OPTIONS} 个选项的名称`);
      return;
    }

    const entry = addDecision(trimmedQuestion, validOptions);
    addSnapshot(entry.id, {
      leaning: snapshot.leaning,
      confidence: snapshot.confidence,
      reasoning: snapshot.reasoning.trim(),
      missingInfo: snapshot.missingInfo.trim(),
    });
    onSaved();
  };

  return (
    <section
      aria-label="记一个新决策"
      onKeyDown={(e) => {
        // Escape 关闭表单（取消按钮是本区块的第一个可聚焦控件之外的操作，语义与「取消」一致）
        if (e.key === 'Escape') onCancel();
      }}
      className="dn-elevation-2 mb-8 border border-border border-l-4 border-l-dn-teal bg-card px-5 py-5 spring-in"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="cc-h2 text-lg text-foreground">记一个新决策</h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="取消并关闭表单"
          className={ICON_BTN_CLS}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="new-decision-question" className={LABEL_CLS}>纠结的问题</label>
          <textarea
            id="new-decision-question"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="如：毕业后考研还是直接就业？"
            className={`${FIELD_CLS} resize-y`}
          />
        </div>

        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">摆在面前的选项（{MIN_OPTIONS}-{MAX_OPTIONS} 个）</p>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="border border-border bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="flex items-baseline gap-2">
                    <span aria-hidden="true" className="cc-num text-lg text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">选项 {index + 1}</span>
                  </span>
                  {options.length > MIN_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      aria-label={`删除选项 ${index + 1}`}
                      className={ICON_BTN_CLS}
                    >
                      <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateOption(index, { label: e.target.value })}
                    aria-label={`选项 ${index + 1} 名称`}
                    placeholder="选项名称，如：考研"
                    className={FIELD_CLS}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={option.pros}
                      onChange={(e) => updateOption(index, { pros: e.target.value })}
                      aria-label={`选项 ${index + 1}：我看重什么`}
                      placeholder="我看重什么"
                      className={FIELD_CLS}
                    />
                    <input
                      type="text"
                      value={option.cons}
                      onChange={(e) => updateOption(index, { cons: e.target.value })}
                      aria-label={`选项 ${index + 1}：我担心什么`}
                      placeholder="我担心什么"
                      className={FIELD_CLS}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {options.length < MAX_OPTIONS && (
            <button type="button" onClick={handleAddOption} className={`mt-3 ${GHOST_BTN_CLS}`}>
              <Plus aria-hidden="true" className="h-4 w-4" /> 加一个选项
            </button>
          )}
        </div>

        <div className="border-t border-border pt-5">
          <p className="mb-4 text-xs font-medium text-muted-foreground">此刻的想法（第一条记录）</p>
          <SnapshotFields
            idPrefix="new-snap"
            optionLabels={options.map((o) => o.label)}
            draft={snapshot}
            onChange={setSnapshot}
          />
        </div>

        {error !== '' && (
          <p role="alert" className="bg-dn-crimson px-3 py-2 text-sm text-dn-on-color">
            ✗ {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleSave} className={PRIMARY_BTN_CLS}>保存决策</button>
          <button type="button" onClick={onCancel} className={GHOST_BTN_CLS}>取消</button>
        </div>
      </div>
    </section>
  );
}

function DecisionCard({ decision, onChanged }: { decision: DecisionEntry; onChanged: () => void }) {
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [showSettle, setShowSettle] = useState(false);
  const [snapshotDraft, setSnapshotDraft] = useState<SnapshotDraft>(emptySnapshotDraft());
  const [settleChoice, setSettleChoice] = useState('');
  const snapshotTriggerRef = useRef<HTMLButtonElement | null>(null);
  const settleTriggerRef = useRef<HTMLButtonElement | null>(null);

  const optionLabels = decision.options.map((o) => o.label);
  const latest = decision.snapshots[decision.snapshots.length - 1];

  const openSnapshotForm = () => {
    setSnapshotDraft({
      leaning: latest !== undefined ? latest.leaning : NO_LEANING,
      confidence: latest !== undefined ? latest.confidence : DEFAULT_CONFIDENCE,
      reasoning: '',
      missingInfo: '',
    });
    setShowSettle(false);
    setShowSnapshotForm(true);
  };

  const openSettle = () => {
    const fallback = optionLabels.length > 0 ? optionLabels[0] : '';
    setSettleChoice(latest !== undefined && optionLabels.includes(latest.leaning) ? latest.leaning : fallback);
    setShowSnapshotForm(false);
    setShowSettle(true);
  };

  // 关闭内联面板后把焦点交回触发按钮；触发按钮在面板打开期间不渲染，故等下一帧再聚焦
  const closeSnapshotForm = () => {
    setShowSnapshotForm(false);
    window.requestAnimationFrame(() => snapshotTriggerRef.current?.focus());
  };

  const closeSettle = () => {
    setShowSettle(false);
    window.requestAnimationFrame(() => settleTriggerRef.current?.focus());
  };

  const handleSaveSnapshot = () => {
    addSnapshot(decision.id, {
      leaning: snapshotDraft.leaning,
      confidence: snapshotDraft.confidence,
      reasoning: snapshotDraft.reasoning.trim(),
      missingInfo: snapshotDraft.missingInfo.trim(),
    });
    closeSnapshotForm();
    onChanged();
  };

  const handleSettle = () => {
    if (settleChoice === '') return;
    settleDecision(decision.id, settleChoice);
    onChanged();
  };

  const handleDelete = () => {
    if (window.confirm(DELETE_CONFIRM_TEXT)) {
      deleteDecision(decision.id);
      onChanged();
    }
  };

  return (
    <article className="border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <h3 className="cc-h2 text-xl leading-snug text-foreground">{decision.question}</h3>
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`删除决策：${decision.question}`}
          className={DANGER_BTN_CLS}
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
        </button>
      </header>

      {/* 选项对比：编号 + 大字号 + 分隔线，不用小卡片堆叠 */}
      <div className="mt-5 grid gap-px border border-border bg-border sm:grid-cols-2">
        {decision.options.map((option, index) => (
          <div key={`${option.label}-${index}`} className="bg-background px-4 py-3">
            <div className="flex items-baseline gap-2">
              <span aria-hidden="true" className="cc-num text-xl text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm font-medium text-foreground">{option.label}</p>
            </div>
            {option.pros !== '' && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span aria-hidden="true">✓</span> 看重：{option.pros}
              </p>
            )}
            {option.cons !== '' && (
              <p className="mt-1 text-sm text-muted-foreground">
                <span aria-hidden="true">△</span> 担心：{option.cons}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="cc-kicker mb-3 text-muted-foreground">想法时间线</h4>
        <SnapshotTimeline snapshots={decision.snapshots} />
      </div>

      {showSnapshotForm && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeSnapshotForm();
          }}
          className="mt-5 space-y-4 border-t border-border pt-5 spring-in"
        >
          <p className="text-xs font-medium text-muted-foreground">补记一次想法</p>
          <SnapshotFields
            idPrefix={`snap-${decision.id}`}
            optionLabels={optionLabels}
            draft={snapshotDraft}
            onChange={setSnapshotDraft}
          />
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleSaveSnapshot} className={PRIMARY_BTN_CLS}>保存这次想法</button>
            <button type="button" onClick={closeSnapshotForm} className={GHOST_BTN_CLS}>取消</button>
          </div>
        </div>
      )}

      {showSettle && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeSettle();
          }}
          className="mt-5 space-y-3 border-t border-border pt-5 spring-in"
        >
          <label htmlFor={`settle-${decision.id}`} className={LABEL_CLS}>你最终选择了哪个？</label>
          <div className="flex flex-wrap items-center gap-3">
            <select
              id={`settle-${decision.id}`}
              value={settleChoice}
              onChange={(e) => setSettleChoice(e.target.value)}
              className={`${FIELD_CLS} sm:w-auto`}
            >
              {decision.options.map((option, index) => (
                <option key={`${option.label}-${index}`} value={option.label}>{option.label}</option>
              ))}
            </select>
            <button type="button" onClick={handleSettle} className={PRIMARY_BTN_CLS}>确认</button>
            <button type="button" onClick={closeSettle} className={GHOST_BTN_CLS}>取消</button>
          </div>
        </div>
      )}

      {!showSnapshotForm && !showSettle && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openSnapshotForm}
            ref={snapshotTriggerRef}
            className={PRIMARY_BTN_CLS}
          >
            <PenLine aria-hidden="true" className="h-4 w-4" /> 补记一次想法
          </button>
          <button
            type="button"
            onClick={openSettle}
            ref={settleTriggerRef}
            className="dn-focus btn-press inline-flex min-h-11 items-center justify-center gap-1.5 border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Check aria-hidden="true" className="h-4 w-4" /> 已想清楚
          </button>
        </div>
      )}
    </article>
  );
}

function SettledCard({ decision, onChanged }: { decision: DecisionEntry; onChanged: () => void }) {
  const handleReopen = () => {
    reopenDecision(decision.id);
    onChanged();
  };

  const handleDelete = () => {
    if (window.confirm(DELETE_CONFIRM_TEXT)) {
      deleteDecision(decision.id);
      onChanged();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 border border-border border-l-4 border-l-dn-emerald bg-card px-4 py-3">
      {/* 状态同时由文字与色块表达，不只靠颜色 */}
      <span className="shrink-0 bg-dn-emerald px-2 py-1 text-xs font-medium text-dn-on-color">
        ✓ 已决定
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{decision.question}</p>
        {decision.settledChoice !== undefined && (
          <p className="text-xs text-muted-foreground">选择了：{decision.settledChoice}</p>
        )}
      </div>
      <button type="button" onClick={handleReopen} className={GHOST_BTN_CLS}>
        <RotateCcw aria-hidden="true" className="h-4 w-4" /> 重新打开
      </button>
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`删除决策：${decision.question}`}
        className={DANGER_BTN_CLS}
      >
        <Trash2 aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-start py-16 spring-in">
      {/* 实色场 + 图标，替代圆角浅底图标块 */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center bg-dn-violet text-dn-on-color">
        <NotebookPen aria-hidden="true" className="h-10 w-10" />
      </div>
      <h3 className="cc-h2 mb-3 text-foreground">还没有决策记录</h3>
      <p className="mb-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        纠结的时候，把此刻的权衡写下来：倾向哪边、有几分把握、还缺什么信息。
      </p>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-muted-foreground">
        过段时间回看，你会看到自己的想法是怎么一步步变化的——看清自己怎么想，比急着要一个答案更重要。
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="dn-focus btn-press inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        <Plus aria-hidden="true" className="h-4 w-4" /> 记一个新决策
      </button>
    </div>
  );
}

export function DecisionJournal() {
  const [decisions, setDecisions] = useState<DecisionEntry[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setDecisions(getDecisions());
  }, []);

  const refresh = () => setDecisions(getDecisions());

  const openDecisions = decisions.filter((d) => d.status === 'open');
  const settledDecisions = decisions.filter((d) => d.status === 'settled');
  const isEmpty = decisions.length === 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="cc-h1 text-2xl text-foreground">决策日志</h2>
            <p className="cc-body mt-2 text-muted-foreground">记下你此刻的权衡，过段时间回看想法怎么变了</p>
          </div>
          {!showForm && !isEmpty && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="dn-focus btn-press inline-flex min-h-11 items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
            >
              <Plus aria-hidden="true" className="h-4 w-4" /> 记一个新决策
            </button>
          )}
        </header>

        {decisions.length > 0 && (
          /* 概览用 Ink 实色场承载，数字本身成为视觉主体；数字全部来自本地记录 */
          <section aria-label="决策概览" className="mb-6 bg-dn-ink px-5 py-4">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <span className="cc-kicker cc-on-ink-dim">决策概览</span>
              <span className="text-sm text-dn-on-ink">
                <span className="cc-num text-2xl">{openDecisions.length}</span> 待决定
              </span>
              <span className="text-sm text-dn-on-ink">
                <span className="cc-num text-2xl">{settledDecisions.length}</span> 已决定
              </span>
              <span className="text-sm text-dn-on-ink">
                <span className="cc-num text-2xl">
                  {decisions.reduce((sum, d) => sum + d.snapshots.length, 0)}
                </span>{' '}
                条想法快照
              </span>
            </div>
          </section>
        )}

        {showForm && (
          <NewDecisionForm
            onSaved={() => { setShowForm(false); refresh(); }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {isEmpty && !showForm ? (
          <EmptyState onCreate={() => setShowForm(true)} />
        ) : (
          <>
            <section aria-label="进行中的决策" className="space-y-5">
              {openDecisions.map((d) => (
                <DecisionCard key={d.id} decision={d} onChanged={refresh} />
              ))}
              {openDecisions.length === 0 && !isEmpty && (
                <p className="border-b border-border py-6 text-sm text-muted-foreground">
                  手头的纠结都已想清楚了
                </p>
              )}
            </section>

            {settledDecisions.length > 0 && (
              <section aria-label="已决定的决策" className="mt-10 border-t border-border pt-5">
                <h3 className="cc-kicker mb-4 text-muted-foreground">
                  已决定（{settledDecisions.length}）
                </h3>
                <div className="space-y-3">
                  {settledDecisions.map((d) => (
                    <SettledCard key={d.id} decision={d} onChanged={refresh} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
