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
      <div className="p-6 max-w-md mx-auto text-center">
        <p className="text-2xl mb-4">✅ 测评完成</p>
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">你的兴趣类型</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {interests.map(q => (
              <span key={q.id} className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">{q.icon} {q.label}</span>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">你的职业价值观</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {values.map(q => (
              <span key={q.id} className="rounded-full bg-secondary px-3 py-1 text-sm text-foreground">💎 {q.label}</span>
            ))}
          </div>
        </div>
        <button onClick={handleComplete} className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground">
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
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          {step === 'interest' ? '🎯 兴趣测评' : '💎 价值观测评'}
        </h3>
        <span className="text-xs text-muted-foreground">{selected.size}/{max} 项</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        {step === 'interest'
          ? '选择你最感兴趣的 3 个类型，帮助你找到适合的职业方向'
          : '选择对你最重要的 3 个职业价值观，帮助 AI 推荐匹配的路线'}
      </p>
      <div className="space-y-2 mb-6">
        {questions.map(q => (
          <button
            key={q.id}
            onClick={() => toggle(q.id)}
            className={`w-full text-left flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
              selected.has(q.id)
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border/40 bg-card hover:border-border'
            }`}
          >
            <span className="text-xl">{q.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{q.label}</p>
              <p className="text-xs text-muted-foreground">{q.desc}</p>
            </div>
            {selected.has(q.id) && <span className="ml-auto text-primary text-sm">✓</span>}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        {step === 'interest' ? (
          <button
            onClick={() => setStep('value')}
            disabled={selected.size === 0}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-30"
          >
            下一步：价值观测评
          </button>
        ) : (
          <button
            onClick={() => setStep('result')}
            disabled={selected.size === 0}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-30"
          >
            查看结果
          </button>
        )}
        <button onClick={onClose} className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted-foreground">跳过</button>
      </div>
    </div>
  );
}
