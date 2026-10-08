'use client';

import { useState } from 'react';

/**
 * Big Five (OCEAN) 50题版 — IPIP 国际人格题库公开版
 * 五维度：Openness 开放性 / Conscientiousness 尽责性 / Extraversion 外向性
 *         Agreeableness 宜人性 / Neuroticism 情绪稳定性
 * 每题1-5分 Likert 量表。科学验证度高于 MBTI。
 */

const QUESTIONS = [
  // O: 开放性 (10题)
  { id:1, dim:'O', text:'我词汇量丰富' }, { id:2, dim:'O', text:'我理解事物很快' },
  { id:3, dim:'O', text:'我充满创意和想象力' }, { id:4, dim:'O', text:'我喜欢思考抽象的概念' },
  { id:5, dim:'O', rev:true, text:'我对艺术和文学不感兴趣' }, { id:6, dim:'O', text:'我喜欢尝试新事物' },
  { id:7, dim:'O', rev:true, text:'我很少产生新奇的想法' }, { id:8, dim:'O', text:'我对许多不同领域都感兴趣' },
  { id:9, dim:'O', text:'我欣赏艺术和美感' }, { id:10, dim:'O', rev:true, text:'我更喜欢常规和熟悉的事物' },

  // C: 尽责性 (10题)
  { id:11, dim:'C', text:'我随时准备好完成任务' }, { id:12, dim:'C', text:'我做事有条理、注重细节' },
  { id:13, dim:'C', text:'我信守承诺，说到做到' }, { id:14, dim:'C', rev:true, text:'我经常把东西弄乱' },
  { id:15, dim:'C', text:'我按照计划和日程行事' }, { id:16, dim:'C', rev:true, text:'我做事容易分心、半途而废' },
  { id:17, dim:'C', text:'我追求卓越，想把事情做到最好' }, { id:18, dim:'C', text:'我做事深思熟虑后再行动' },
  { id:19, dim:'C', rev:true, text:'我经常忘记把东西放回原处' }, { id:20, dim:'C', text:'我尽职尽责完成分配的任务' },

  // E: 外向性 (10题)
  { id:21, dim:'E', text:'我是聚会中的活跃分子' }, { id:22, dim:'E', text:'我喜欢结识新朋友' },
  { id:23, dim:'E', text:'我主动与人交谈、打开话题' }, { id:24, dim:'E', rev:true, text:'我更喜欢独处' },
  { id:25, dim:'E', text:'我在人群中感到精力充沛' }, { id:26, dim:'E', rev:true, text:'我在社交场合话不多' },
  { id:27, dim:'E', text:'我乐观开朗、充满热情' }, { id:28, dim:'E', rev:true, text:'我不喜欢成为人群的焦点' },
  { id:29, dim:'E', text:'我很容易与人建立关系' }, { id:30, dim:'E', text:'我感到快乐时就想与人分享' },

  // A: 宜人性 (10题)
  { id:31, dim:'A', text:'我关心他人的感受' }, { id:32, dim:'A', text:'我愿意花时间帮助他人' },
  { id:33, dim:'A', text:'我相信人性本善' }, { id:34, dim:'A', rev:true, text:'我对他人的错误难以宽容' },
  { id:35, dim:'A', text:'我尽量避免与人发生冲突' }, { id:36, dim:'A', rev:true, text:'我对别人的困难不太感兴趣' },
  { id:37, dim:'A', text:'我设身处地为他人着想' }, { id:38, dim:'A', rev:true, text:'我容易批评指责别人' },
  { id:39, dim:'A', text:'我会真诚地赞美他人' }, { id:40, dim:'A', text:'我让大家感到自在和被接纳' },

  // N: 情绪稳定性 (10题：直接分=神经质，高分=焦虑，取反后高分=稳定)
  { id:41, dim:'N', rev:true, text:'我很少感到焦虑或担心' },
  { id:42, dim:'N', text:'我容易紧张和压力大' }, { id:43, dim:'N', rev:true, text:'大部分时间我心情愉快放松' },
  { id:44, dim:'N', text:'我情绪波动比较大' }, { id:45, dim:'N', rev:true, text:'面对压力我能保持冷静' },
  { id:46, dim:'N', text:'我经常为小事烦心' }, { id:47, dim:'N', rev:true, text:'我能从容应对挫折' },
  { id:48, dim:'N', text:'我容易陷入低落情绪' }, { id:49, dim:'N', rev:true, text:'我情绪稳定、不容易被激怒' },
  { id:50, dim:'N', text:'我时常感到不知所措' },
];

const TOTAL = QUESTIONS.length;

/** 维度色全部取自 DNDL Token，不在组件里写死十六进制色值 */
const DIM_INFO: Record<string, { name: string; high: string; low: string; color: string }> = {
  O: { name: '开放性', high: '好奇心强、有创造力、喜欢新体验', low: '务实、传统、喜欢常规', color: 'var(--dn-violet)' },
  C: { name: '尽责性', high: '自律、有条理、追求卓越', low: '随性、灵活、不拘小节', color: 'var(--dn-emerald)' },
  E: { name: '外向性', high: '社交活跃、充满能量、乐观', low: '内向、安静、喜欢独处', color: 'var(--dn-amber)' },
  A: { name: '宜人性', high: '友善、乐于助人、容易合作', low: '直率、独立、有主见', color: 'var(--dn-cyan)' },
  N: { name: '情绪稳定性', high: '抗压、情绪平稳、从容冷静', low: '敏感、容易焦虑、情绪波动', color: 'var(--dn-crimson)' },
};

const CAREER_MAP: Record<string, string[]> = {
  'O高_C高_E高': ['企业家', '管理咨询', '市场营销总监', '活动策划'],
  'O高_C高_E低': ['研究科学家', '软件工程师', '数据分析师', '作家'],
  'O高_C低_E高': ['艺术家', '设计师', '记者', '演员'],
  'O高_C低_E低': ['独立创作者', '音乐家', '理论物理学家', '哲学家'],
  'O低_C高_E高': ['销售经理', '军官', '校长', '行政主管'],
  'O低_C高_E低': ['会计师', '审计师', '公务员', '医生'],
  'O低_C低_E高': ['导游', '公关', '促销员', '健身教练'],
  'O低_C低_E低': ['技术工人', '司机', '保安', '仓库管理'],
};

function careerKey(scores: Record<string, number>): string {
  return `O${scores.O>=50?'高':'低'}_C${scores.C>=50?'高':'低'}_E${scores.E>=50?'高':'低'}`;
}

interface Props {
  onComplete: (result: string) => void;
  onClose: () => void;
}

export function PersonalityTest({ onComplete, onClose }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const answered = Object.keys(answers).length;
  const progress = (answered / TOTAL) * 100;
  const canSubmit = answered >= 40;

  const calcScores = (): Record<string, number> => {
    const dims: Record<string, { total: number; count: number }> = { O:{total:0,count:0}, C:{total:0,count:0}, E:{total:0,count:0}, A:{total:0,count:0}, N:{total:0,count:0} };
    for (const q of QUESTIONS) {
      const score = answers[q.id] || 3;
      dims[q.dim].total += q.rev ? (6 - score) : score;
      dims[q.dim].count += 1;
    }
    const scores: Record<string, number> = {};
    for (const [d, v] of Object.entries(dims)) {
      // 归一化到 0-100：最小值=count*1，最大值=count*5
      // score = (total - count) / (count * 4) * 100，中性=50
      scores[d] = Math.round(((v.total - v.count) / (v.count * 4)) * 100);
    }
    return scores;
  };

  if (showResult) {
    const scores = calcScores();
    const ck = careerKey(scores);
    const careers = CAREER_MAP[ck] || CAREER_MAP['O高_C高_E高'];

    return (
      <div className="mx-auto max-w-lg p-6">
        <div className="mb-6">
          <h3 className="cc-h2 text-foreground">🧬 大五人格画像</h3>
          <p className="mt-1 text-xs text-muted-foreground">题库来源：IPIP 国际人格题库公开版 · 结果仅作参考</p>
        </div>

        {/* 维度得分：数字为主要视觉，条形与文字标签同时表意 */}
        <div className="mb-6 space-y-4">
          {Object.entries(DIM_INFO).map(([d, info]) => (
            <div key={d}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-foreground">{info.name}</span>
                <span className="cc-num text-lg text-foreground">{scores[d]}%</span>
              </div>
              <div className="mt-1 h-2 w-full bg-dn-divider" role="progressbar"
                aria-valuenow={scores[d]} aria-valuemin={0} aria-valuemax={100} aria-label={`${info.name} 得分`}>
                <div className="h-full" style={{ width: `${scores[d]}%`, backgroundColor: info.color }} />
              </div>
              <div className="mt-1 flex justify-between gap-3 text-[11px] text-muted-foreground">
                <span>偏低：{info.low}</span>
                <span>偏高：{info.high}</span>
              </div>
            </div>
          ))}
        </div>

        {careers.length > 0 && (
          <div className="mb-6">
            <p className="cc-kicker mb-2 text-muted-foreground">与你特质相近的常见方向（仅参考）</p>
            <div className="flex flex-wrap gap-1.5">
              {careers.map(c => (
                <span key={c} className="bg-dn-cyan px-3 py-1 text-sm text-dn-on-color">{c}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={() => {
            const desc = Object.entries(scores).map(([d,v])=>`${DIM_INFO[d].name}:${v}`).join(',');
            localStorage.setItem('career-compass-bigfive', JSON.stringify({ scores, date: new Date().toISOString() }));
            onComplete(desc);
          }}
            className="dn-interactive dn-focus min-h-11 flex-1 bg-primary px-4 text-sm font-medium text-primary-foreground">保存到画像</button>
          <button onClick={onClose}
            className="dn-focus min-h-11 shrink-0 border border-input px-4 text-sm text-foreground transition-colors duration-hover hover:bg-secondary">关闭</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-5">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h3 className="cc-h2 text-foreground">🧬 Big Five 人格测评</h3>
          <span className="cc-num shrink-0 text-xl text-muted-foreground">{answered}/{TOTAL}</span>
        </div>
        <div className="h-2 w-full bg-dn-divider" role="progressbar"
          aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="答题进度">
          <div className="h-full bg-dn-teal" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">1 = 很不符合，5 = 很符合 · 题库来源：IPIP 国际人格题库公开版</p>
      </div>

      <div className="mb-4 max-h-[50vh] overflow-y-auto pr-1">
        {QUESTIONS.map(q => (
          <div key={q.id} className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
            <span className="cc-num w-6 shrink-0 text-xs text-muted-foreground">{q.id}</span>
            <p className="flex-1 text-sm text-foreground">{q.text}</p>
            <div className="flex shrink-0 gap-1">
              {[1,2,3,4,5].map(v => (
                <button key={v} onClick={() => setAnswers(p=>({...p,[q.id]:v}))}
                  aria-label={`第 ${q.id} 题：${v} 分`}
                  aria-pressed={answers[q.id]===v}
                  className={`dn-focus flex h-10 w-10 items-center justify-center border text-xs transition-colors duration-hover ${
                    answers[q.id]===v ? 'border-dn-teal bg-dn-teal text-dn-on-color' : 'border-border bg-dn-surface text-muted-foreground hover:border-input hover:text-foreground'
                  }`}>{v}</button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => { if(canSubmit) setShowResult(true); }}
          disabled={!canSubmit}
          className="dn-interactive dn-focus min-h-11 flex-1 bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground">
          {canSubmit ? `查看结果（${answered}/50）` : `至少完成40题（已答${answered}）`}
        </button>
        <button onClick={onClose}
          className="dn-focus min-h-11 shrink-0 border border-input px-4 text-sm text-foreground transition-colors duration-hover hover:bg-secondary">退出</button>
      </div>
    </div>
  );
}
