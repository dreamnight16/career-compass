'use client';
import { useMemo, useState } from 'react';
import type {
  OccupationCompetencyProfile,
  CompetencyGap,
  CompetencyGapAnalysis,
  ProficiencyLevel,
  GapPriority,
  SelfAssessment,
} from '@/types/competency';
import { PROFICIENCY_LABELS } from '@/types/competency';
import { matchResources } from '@/lib/resource-matcher';
import type { ResourceLink } from '@/data/resources';

interface CompetencyCardProps {
  profile: OccupationCompetencyProfile;
  selfAssessments: SelfAssessment[];
  onAssess: (competencyId: string, level: ProficiencyLevel, evidence: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const PROFICIENCY_LEVELS: ProficiencyLevel[] = [1, 2, 3, 4, 5];

const COMPETENCY_TYPE_LABELS: Record<string, string> = {
  professional:  '📐 专业素养',
  transferable:  '🤝 可迁移能力',
  digital:       '💻 数智素养',
  career_dev:    '🧭 职业发展',
  emotional:     '🧘 情绪管理',
  self_efficacy: '🌱 自我效能',
};

/** 根据 gap 值确定优先级 */
function calcPriority(gap: number, weight: number): GapPriority {
  if (gap >= 3 && weight >= 0.8) return 'blocker';
  if (gap >= 2) return 'critical';
  if (gap >= 1) return 'important';
  return 'nice_to_have';
}

/** 计算差距分析结果 */
function computeGapAnalysis(
  profile: OccupationCompetencyProfile,
  assessments: SelfAssessment[]
): CompetencyGapAnalysis {
  const assessMap = new Map(assessments.map((a) => [a.competencyId, a.currentLevel]));
  const gaps: CompetencyGap[] = profile.competencies.map((comp) => {
    const currentLevel = assessMap.get(comp.id) ?? 1;
    const certTarget: ProficiencyLevel = comp.layer === 'cert' ? 5 : 3;
    const gap = certTarget - currentLevel;
    return {
      competency: comp,
      currentLevel: currentLevel as ProficiencyLevel,
      targetLevel: certTarget,
      gap,
      priority: calcPriority(gap, comp.weightInOccupation),
    };
  });
  const sorted = [...gaps].sort(
    (a, b) => b.gap - a.gap || b.competency.weightInOccupation - a.competency.weightInOccupation,
  );
  return {
    targetOccupation: profile.occupation,
    gaps: sorted,
    generatedAt: new Date().toISOString(),
  };
}

/** 能力条实色场（品牌色，不用 Tailwind 默认调色板） */
function gapBarColor(gap: CompetencyGap): string {
  if (gap.gap <= 0) return 'bg-dn-emerald';
  if (gap.gap === 1) return 'bg-dn-amber';
  if (gap.gap === 2) return 'bg-dn-orange';
  return 'bg-dn-crimson';
}

/** 状态实色块：色块上的正文一律用 on-color，且一定带 ✓/△/✗ 文字标记 */
function gapChipClass(gap: CompetencyGap): string {
  if (gap.gap <= 0) return 'bg-dn-emerald text-dn-on-color';
  if (gap.gap === 1) return 'bg-dn-amber text-dn-on-color';
  if (gap.gap === 2) return 'bg-dn-orange text-dn-on-color';
  return 'bg-dn-crimson text-dn-on-color';
}

function gapLabel(gap: CompetencyGap): string {
  if (gap.gap <= 0) return '✓ 已达标';
  if (gap.gap === 1) return '△ 待加强';
  return '✗ 差距大';
}

export function CompetencyCard({
  profile,
  selfAssessments,
  onAssess,
  onRefresh,
  loading,
}: CompetencyCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resourceCache, setResourceCache] = useState<Map<string, ResourceLink[]>>(new Map());

  const getResources = (gap: CompetencyGap): ResourceLink[] => {
    const id = gap.competency.id;
    if (resourceCache.has(id)) return resourceCache.get(id)!;
    // compute lazily and cache
    const resources = matchResources(gap);
    setResourceCache(prev => new Map(prev).set(id, resources));
    return resources;
  };
  const analysis = useMemo(
    () => computeGapAnalysis(profile, selfAssessments),
    [profile, selfAssessments],
  );

  if (loading) {
    return (
      <div className="border border-border bg-card p-6" role="status">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">正在整理这份能力画像…</span>
        </div>
      </div>
    );
  }

  const assessedCount = selfAssessments.length;
  const totalCount = profile.competencies.length;
  const fillPct = totalCount > 0 ? Math.round((assessedCount / totalCount) * 100) : 0;

  // 按 type 分组
  const grouped = new Map<string, CompetencyGap[]>();
  for (const gap of analysis.gaps) {
    const type = gap.competency.type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push(gap);
  }

  return (
    <div className="border border-border bg-card">
      {/* 头部：强排版 + 实色进度，不叠圆角胶囊 */}
      <div className="border-b border-border bg-secondary px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-base" aria-hidden="true">{'🎯'}</span>
            <span className="cc-h2 truncate text-foreground">{profile.occupation} 能力画像</span>
          </div>
          <button
            onClick={onRefresh}
            className="dn-focus btn-press inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 px-2 text-xs text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="换一个职业"
          >
            <span aria-hidden="true">{'↻'}</span> 换职业
          </button>
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="cc-num text-2xl text-foreground">{assessedCount}</span>
          <span className="cc-num text-base text-muted-foreground">/{totalCount}</span>
          <span className="cc-kicker ml-1 text-muted-foreground">已评估</span>
        </div>
        {/* 进度条：直角，轨道用 Divider 以保证在 Canvas 上可见 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 bg-dn-divider" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={fillPct} aria-label="自评完成度">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="cc-num shrink-0 text-sm text-muted-foreground">{fillPct}%</span>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {profile.trustLevel === 'ai-inferred' ? '模型整理 · 仅供参考' : '社区贡献'}
        </p>
      </div>

      {/* 能力列表，按 6 维分组 */}
      <div className="divide-y divide-border">
        {Array.from(grouped.entries()).map(([type, gaps]) => (
          <div key={type} className="px-4 py-3">
            <h4 className="cc-kicker mb-2 text-muted-foreground">
              {COMPETENCY_TYPE_LABELS[type] || type}
            </h4>
            <div className="space-y-1">
              {gaps.map((gap) => (
                /* Escape 在行内任意位置（含展开面板内的控件）都能收回详情 */
                <div
                  key={gap.competency.id}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' && expanded === gap.competency.id) setExpanded(null);
                  }}
                >
                  <button
                    onClick={() => setExpanded(expanded === gap.competency.id ? null : gap.competency.id)}
                    className="dn-focus w-full text-left"
                    aria-expanded={expanded === gap.competency.id}
                    aria-controls={`gap-detail-${gap.competency.id}`}
                  >
                    <div className="flex min-h-11 items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="text-sm truncate text-foreground">{gap.competency.name}</span>
                        {gap.competency.layer === 'cert' && (
                          <span className="shrink-0 bg-dn-crimson px-1.5 py-0.5 text-[10px] text-dn-on-color">
                            门槛
                          </span>
                        )}
                      </div>
                      {/* 状态同时给出符号与文字，颜色只是附加信息 */}
                      <span className={`shrink-0 px-1.5 py-0.5 text-[11px] ${gapChipClass(gap)}`}>
                        {gapLabel(gap)}
                      </span>
                    </div>
                    {/* 水平对比条 */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-dn-divider">
                        <div
                          className={`h-full transition-all ${gapBarColor(gap)}`}
                          style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                        />
                      </div>
                      <span className="cc-num w-14 shrink-0 text-right text-[11px] text-muted-foreground">
                        Lv.{gap.currentLevel} → {gap.targetLevel}
                      </span>
                    </div>
                  </button>

                  {/* 展开详情 */}
                  {expanded === gap.competency.id && (
                    /* 展开详情：Level 3 层级 + Canvas 平面，有专属标题供读屏识别 */
                    <div
                      id={`gap-detail-${gap.competency.id}`}
                      role="region"
                      aria-label={`${gap.competency.name} 差距详情`}
                      className="dn-elevation-3 mt-2 space-y-2 border border-border bg-secondary p-3"
                    >
                      <p className="text-xs text-muted-foreground">
                        {'💡'} {gap.competency.importanceRationale}
                      </p>
                      <div className="space-y-1 text-xs">
                        <p className="text-muted-foreground">
                          当前：{gap.competency.proficiencyLevels[gap.currentLevel]}
                        </p>
                        <p className="text-foreground">
                          目标：{gap.competency.proficiencyLevels[gap.targetLevel]}
                        </p>
                      </div>
                      {/* 自评选择器：选中态同时有 ✓ 与 aria-pressed，不只靠颜色 */}
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="mr-1 text-[11px] text-muted-foreground">我的水平：</span>
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() =>
                              onAssess(gap.competency.id, lvl, '')
                            }
                            aria-pressed={gap.currentLevel === lvl}
                            className={`btn-press dn-focus min-h-11 border px-3 py-1.5 text-[11px] transition-colors ${
                              gap.currentLevel === lvl
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                            }`}
                          >
                            {gap.currentLevel === lvl && <span aria-hidden="true">✓ </span>}
                            {PROFICIENCY_LABELS[lvl].label}
                          </button>
                        ))}
                      </div>
                      {/* 推荐学习资源 */}
                      <div className="mt-2 border-t border-border pt-2">
                        <p className="cc-kicker mb-1 text-muted-foreground">
                          {'📚'} 推荐学习资源
                        </p>
                        {(() => {
                          const resources = getResources(gap);
                          if (resources.length === 0) {
                            return <p className="text-[11px] text-muted-foreground italic">暂无匹配资源，可在资源库中搜索相关关键词</p>;
                          }
                          return (
                            <div>
                              {resources.slice(0, 5).map((r, j) => (
                                <a
                                  key={j}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="dn-focus flex min-h-11 items-center gap-1.5 border-b border-border py-1 text-[11px] text-foreground underline decoration-1 underline-offset-2 transition-colors hover:bg-card hover:decoration-2"
                                >
                                  <span className="cc-num shrink-0 text-muted-foreground">{j + 1}.</span>
                                  <span className="truncate">{r.name}</span>
                                  <span className="shrink-0 text-muted-foreground" aria-hidden="true">↗</span>
                                </a>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
