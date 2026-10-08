'use client';

import { useState } from 'react';

/** Holland RIASEC 六型 */
const RIASEC_QUESTIONS = [
  { id: 'R', label: '动手操作', desc: '喜欢使用工具、机器，动手制作或修理东西', icon: '🔧' },
  { id: 'I', label: '思考研究', desc: '喜欢分析问题、做研究、解决复杂难题', icon: '🔬' },
  { id: 'A', label: '创意表达', desc: '喜欢艺术创作、设计、写作、音乐等表达性工作', icon: '🎨' },
  { id: 'S', label: '助人服务', desc: '喜欢帮助他人、教学、辅导、提供支持', icon: '🤝' },
  { id: 'E', label: '领导影响', desc: '喜欢领导团队、说服他人、创业或管理', icon: '💼' },
  { id: 'C', label: '秩序规范', desc: '喜欢按规则办事、整理数据、处理细节', icon: '📋' },
];

const VALUE_QUESTIONS = [
  { id: 'salary', label: '高收入', desc: '薪资水平是我选择职业的首要因素', icon: '💰' },
  { id: 'stability', label: '稳定保障', desc: '工作稳定、不容易失业很重要', icon: '🛡️' },
  { id: 'freedom', label: '时间自由', desc: '能自己掌控工作时间与节奏', icon: '🕐' },
  { id: 'growth', label: '快速成长', desc: '工作中能不断学到新东西、提升自己', icon: '📈' },
  { id: 'impact', label: '社会影响', desc: '做对社会有意义的事，帮助别人', icon: '🌍' },
  { id: 'balance', label: '工作生活平衡', desc: '不加班，有充足时间享受生活', icon: '⚖️' },
];

interface CareerTestProps {
  onComplete: (result: { interests: string[]; values: string[] }) => void;
  onClose: () => void;
}

export function CareerTest({ onComplete, onClose }: CareerTestProps) {
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'interest' | 'value' | 'result'>('interest');

  const toggleInterest = (id: string) => {
    const next = new Set(selectedInterests);
    if (next.has(id)) next.delete(id); else if (next.size < 3) next.add(id);
    setSelectedInterests(next);
  };

  const toggleValue = (id: string) => {
    const next = new Set(selectedValues);
    if (next.has(id)) next.delete(id); else if (next.size < 3) next.add(id);
    setSelectedValues(next);
  };

  const handleComplete = () => {
    const interests = RIASEC_QUESTIONS.filter(q => selectedInterests.has(q.id)).map(q => q.label);
    const values = VALUE_QUESTIONS.filter(q => selectedValues.has(q.id)).map(q => q.label);
    localStorage.setItem('career-compass-test-result', JSON.stringify({ interests, values, date: new Date().toISOString() }));
    onComplete({ interests, values });
  };

  if (step === 'result') {
    const interests = RIASEC_QUESTIONS.filter(q => selectedInterests.has(q.id));
    const values = VALUE_QUESTIONS.filter(q => selectedValues.has(q.id));
    return (
      <div className="mx-auto max-w-md p-6">
        <p className="cc-h2 mb-4 text-foreground">✓ 测评完成</p>
        <div className="mb-4">
          <p className="cc-kicker mb-2 text-muted-foreground">你的兴趣类型</p>
          <div className="flex flex-wrap gap-2">
            {interests.map(q => (
              <span key={q.id} className="bg-dn-teal px-3 py-1 text-sm text-dn-on-color">{q.icon} {q.label}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="cc-kicker mb-2 text-muted-foreground">你的职业价值观</p>
          <div className="flex flex-wrap gap-2">
            {values.map(q => (
              <span key={q.id} className="bg-dn-violet px-3 py-1 text-sm text-dn-on-color">💎 {q.label}</span>
            ))}
          </div>
        </div>
        <button onClick={handleComplete}
          className="dn-interactive dn-focus flex min-h-11 w-full items-center justify-center bg-primary px-6 text-sm font-medium text-primary-foreground">
          保存并更新画像
        </button>
      </div>
    );
  }

  const questions = step === 'interest' ? RIASEC_QUESTIONS : VALUE_QUESTIONS;
  const selected = step === 'interest' ? selectedInterests : selectedValues;
  const toggle = step === 'interest' ? toggleInterest : toggleValue;
  const max = 3;

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h3 className="cc-h2 text-foreground">
          {step === 'interest' ? '🎯 兴趣测评' : '💎 价值观测评'}
        </h3>
        <span className="cc-num shrink-0 text-xl text-muted-foreground">{selected.size}/{max}<span className="ml-1 text-xs">项</span></span>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {step === 'interest'
          ? '选择你最感兴趣的 3 个类型，帮助你找到适合的职业方向'
          : '选择对你最重要的 3 个职业价值观，帮助 AI 推荐匹配的路线'}
      </p>
      <div className="mb-6 space-y-2">
        {questions.map(q => {
          const isSelected = selected.has(q.id);
          return (
            <button
              key={q.id}
              onClick={() => toggle(q.id)}
              aria-pressed={isSelected}
              className={`dn-focus flex min-h-11 w-full items-center gap-4 border px-4 py-3 text-left transition-colors duration-hover ${
                isSelected
                  ? 'border-dn-teal bg-dn-teal text-dn-on-color'
                  : 'border-border bg-dn-surface text-foreground hover:border-input'
              }`}
            >
              <span className="text-xl" aria-hidden="true">{q.icon}</span>
              <span className="min-w-0">
                <span className="block text-base font-medium">{q.label}</span>
                <span className={`mt-0.5 block text-sm ${isSelected ? 'text-dn-on-color' : 'text-muted-foreground'}`}>{q.desc}</span>
              </span>
              {isSelected && <span className="cc-kicker ml-auto shrink-0">✓ 已选</span>}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        {step === 'interest' ? (
          <button
            onClick={() => setStep('value')}
            disabled={selected.size === 0}
            className="dn-interactive dn-focus min-h-11 flex-1 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
          >
            下一步：价值观测评
          </button>
        ) : (
          <button
            onClick={() => setStep('result')}
            disabled={selected.size === 0}
            className="dn-interactive dn-focus min-h-11 flex-1 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
          >
            查看结果
          </button>
        )}
        <button onClick={onClose}
          className="dn-focus min-h-11 shrink-0 border border-input px-4 text-sm text-foreground transition-colors duration-hover hover:bg-secondary">跳过</button>
      </div>
    </div>
  );
}
