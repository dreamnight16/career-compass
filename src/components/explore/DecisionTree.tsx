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

/* 路径实色场：直接引用 DNDL 品牌 Token，不再硬编码 #ef4444 / #8b5cf6 / #3b82f6 等默认调色板颜色。
   语义分配（与下方 dirMap 一一对应）：
     就业路径 = Cyan      —— 数据 / 常规社会通道
     升学路径 = Violet    —— 探索 / 长期投入
     留学路径 = Emerald   —— 达标 / 境外完成
     体制路径 = Steel     —— 中性信息 / 稳定保障
     兜底     = Teal      —— 品牌主色
   结果图标块直接使用同一实色场（原先把 `color + '15'` 拼接成带 alpha 的十六进制，
   既不是 DNDL 颜色，也依赖字符串拼接，已删除）。 */
const DIR_FIELDS: Record<string, string> = {
  '就业路径': 'var(--dn-cyan)',
  '升学路径': 'var(--dn-violet)',
  '留学路径': 'var(--dn-emerald)',
  '体制路径': 'var(--dn-steel)',
};
const DIR_FALLBACK_FIELD = 'var(--dn-teal)';

/* 选择按钮的实色场：第一步的四个方向按上面的语义取色，
   后续步骤按位置轮换品牌实色。文字一律用 text-dn-on-color（#102A27），不使用 text-white。 */
const DIR_CHOICE_FIELDS: Record<string, string> = {
  '就业路径': 'bg-dn-cyan',
  '升学路径': 'bg-dn-violet',
  '留学路径': 'bg-dn-emerald',
  '体制路径': 'bg-dn-steel',
};
const POSITIONAL_CHOICE_FIELDS = ['bg-dn-teal', 'bg-dn-orange', 'bg-dn-amber', 'bg-dn-violet'];

function choiceField(choice: Choice, index: number): string {
  return DIR_CHOICE_FIELDS[choice.result] ?? POSITIONAL_CHOICE_FIELDS[index % POSITIONAL_CHOICE_FIELDS.length];
}

/** 基于选择组合动态生成描述，替代预设推荐话术 */
function composeResult(choices: string[]): { title: string; steps: string[]; color: string } {
  const [direction, priority, pressure] = choices;

  // 方向模板
  const dirMap: Record<string, { title: string; steps: string[]; color: string }> = {
    '就业路径': { title: '直接就业', steps: ['大三暑期实习', '校招/社招投递', '入职成长'], color: DIR_FIELDS['就业路径'] },
    '升学路径': { title: '考研深造', steps: ['确定目标院校', '12个月备考', '初试+复试', '研究生阶段积累'], color: DIR_FIELDS['升学路径'] },
    '留学路径': { title: '出国留学', steps: ['语言考试+选校', '申请+文书', '拿到offer+签证', '海外就读+就业'], color: DIR_FIELDS['留学路径'] },
    '体制路径': { title: '考公/考编', steps: ['关注公告时间', '行测+申论备考', '笔试+面试', '入职+基层锻炼'], color: DIR_FIELDS['体制路径'] },
  };

  const base = dirMap[direction] || { title: direction, steps: ['细化目标', '制定计划', '执行+调整'], color: DIR_FALLBACK_FIELD };
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
      <div className="flex min-h-full flex-col items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          {/* 结果图标块：方向对应的品牌实色场，直角，不使用 rounded-3xl */}
          <div aria-hidden className="mb-6 inline-flex h-20 w-20 items-center justify-center text-4xl"
            style={{ backgroundColor: result.color }}>
            🎯
          </div>
          <h2 className="cc-h2 text-foreground mb-2">{result.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">
            你的选择：{choices.join(' → ')}
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            {`这是一个基于你选择的客观路线框架，具体薪资、门槛和可行性可以在对话教练中结合个人画像进一步核对`}
          </p>
          {/* 路线步骤：序号实色块 + Divider 分隔线构成层级，替代圆角卡片堆叠 */}
          <ol className="mb-8 text-left">
            {result.steps.map((s, i) => (
              <li key={i} className="dn-rise flex items-center gap-3 border-b border-border py-3 text-sm"
                style={{ ['--dn-enter-index' as string]: i + 1 }}>
                <span className="cc-num flex h-7 w-7 shrink-0 items-center justify-center bg-dn-teal text-xs text-dn-on-color" aria-hidden>
                  {i + 1}
                </span>
                <span className="text-foreground">
                  <span className="sr-only">第 {i + 1} 步：</span>{s}
                </span>
              </li>
            ))}
          </ol>
          <p className="mb-4 text-[11px] text-muted-foreground">本模拟仅为路线框架参考，不构成职业建议</p>
          <button onClick={reset}
            className="dn-interactive inline-flex min-h-11 items-center gap-2 bg-dn-teal px-5 text-sm font-medium text-dn-on-color">
            <RefreshCw aria-hidden className="h-4 w-4" /> 重新选择
          </button>
        </div>
      </div>
    );
  }

  const node = TREE[step];
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* 进度：直角分段规则线（不用圆点胶囊），并配可读的“第 N / M 步”文字 */}
        <div aria-hidden className="mb-2 flex justify-center gap-1.5">
          {TREE.map((_, i) => (
            <span key={i} className={`h-1 w-8 ${i <= step ? 'bg-dn-teal' : 'bg-muted'}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-8">第 {step+1} / {TREE.length} 步</p>
        <h2 className="cc-h2 text-foreground mb-6">{node.question}</h2>
        <div className="space-y-2">
          {node.choices.map((c, i) => (
            <button key={c.label} onClick={() => handleChoice(c)}
              className={`dn-interactive flex min-h-16 w-full items-center gap-4 px-5 py-4 text-left ${choiceField(c, i)}`}>
              <span aria-hidden className="text-2xl">{c.icon}</span>
              <span className="text-base font-medium text-dn-on-color">{c.label}</span>
              <ArrowRight aria-hidden className="ml-auto h-4 w-4 text-dn-on-color" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
