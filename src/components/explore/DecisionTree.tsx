'use client';

import { useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';

interface Choice {
  label: string; result: string; icon: string;
}

interface Node {
  question: string;
  choices: Choice[];
}

const TREE: Node[] = [
  {
    question: '毕业后你想？',
    choices: [
      { label: '直接就业', result: '就业路径', icon: '💼' },
      { label: '考研深造', result: '升学路径', icon: '🎓' },
      { label: '出国留学', result: '留学路径', icon: '✈️' },
      { label: '考公/考编', result: '体制路径', icon: '🏛️' },
    ],
  },
  {
    question: '你更看重什么？',
    choices: [
      { label: '高薪资', result: '高薪导向', icon: '💰' },
      { label: '工作生活平衡', result: '平衡导向', icon: '⚖️' },
      { label: '快速成长', result: '成长导向', icon: '🚀' },
      { label: '稳定保障', result: '稳定导向', icon: '🛡️' },
    ],
  },
  {
    question: '你能接受多大的压力？',
    choices: [
      { label: '高强度高压', result: '高压适应', icon: '🔥' },
      { label: '中等程度', result: '中压适应', icon: '⚡' },
      { label: '轻松为主', result: '低压偏好', icon: '🌿' },
    ],
  },
];

/** 基于选择组合动态生成描述，替代预设推荐话术 */
function composeResult(choices: string[]): { title: string; steps: string[]; color: string } {
  const [direction, priority, pressure] = choices;

  // 方向模板
  const dirMap: Record<string, { title: string; steps: string[]; color: string }> = {
    '就业路径': { title: '直接就业', steps: ['大三暑期实习', '校招/社招投递', '入职成长'], color: '#ef4444' },
    '升学路径': { title: '考研深造', steps: ['确定目标院校', '12个月备考', '初试+复试', '研究生阶段积累'], color: '#8b5cf6' },
    '留学路径': { title: '出国留学', steps: ['语言考试+选校', '申请+文书', '拿到offer+签证', '海外就读+就业'], color: '#3b82f6' },
    '体制路径': { title: '考公/考编', steps: ['关注公告时间', '行测+申论备考', '笔试+面试', '入职+基层锻炼'], color: '#6366f1' },
  };

  const base = dirMap[direction] || { title: direction, steps: ['细化目标', '制定计划', '执行+调整'], color: '#6b7280' };
  const pressureMap: Record<string, string> = { '高压适应': '高强度', '中压适应': '中等压力', '低压偏好': '较轻松节奏' };

  const title = base.title;
  const steps = base.steps;
  const color = base.color;

  return { title, steps, color };
}

export function DecisionTree() {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [result, setResult] = useState<{ title: string; steps: string[]; color: string } | null>(null);

  const handleChoice = (choice: Choice) => {
    const next = [...choices, choice.result];
    if (step < TREE.length - 1) {
      setChoices(next);
      setStep(step + 1);
    } else {
      setChoices(next);
      setResult(composeResult(next));
      try { localStorage.setItem('career-compass-sim-done', 'true'); } catch { /* ignore */ }
    }
  };

  const reset = () => { setStep(0); setChoices([]); setResult(null); };

  if (result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6 spring-in">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl text-4xl" style={{ backgroundColor: result.color + '15' }}>
            🎯
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{result.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            你的选择：{choices.join(' → ')}
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            {`这是一个基于你选择的客观路线框架，具体薪资、门槛和可行性需要到AI规划师中结合你的个人画像验证`}
          </p>
          <div className="space-y-3 mb-8">
            {result.steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border/30 bg-card px-4 py-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i+1}</span>
                <span className="text-foreground">{s}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground/50 mb-4">本模拟仅为路线框架参考，不构成职业建议</p>
          <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors">
            <RefreshCw className="h-4 w-4" /> 重新选择
          </button>
        </div>
      </div>
    );
  }

  const node = TREE[step];
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-2 flex justify-center gap-1">
          {TREE.map((_, i) => (
            <div key={i} className={`h-1 w-8 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-8">第 {step+1} / {TREE.length} 步</p>
        <h2 className="text-xl font-semibold text-foreground mb-6">{node.question}</h2>
        <div className="space-y-2">
          {node.choices.map(c => (
            <button key={c.label} onClick={() => handleChoice(c)}
              className="w-full flex items-center gap-4 rounded-2xl border border-border/30 bg-card px-5 py-4 text-left card-hover btn-press spring-in">
              <span className="text-2xl">{c.icon}</span>
              <span className="text-base font-medium text-foreground">{c.label}</span>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground/30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
