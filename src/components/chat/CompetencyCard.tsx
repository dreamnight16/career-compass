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

/** 能力条颜色 */
function gapBarColor(gap: CompetencyGap): string {
  if (gap.gap <= 0) return 'bg-emerald-500';
  if (gap.gap === 1) return 'bg-amber-500';
  if (gap.gap === 2) return 'bg-orange-500';
  return 'bg-red-500';
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
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">正在整理这份能力画像...</span>
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* 头部 */}
      <div className="border-b border-border/50 bg-secondary/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">{'🎯'}</span>
            <span className="text-sm font-semibold">{profile.occupation} 能力画像</span>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground border border-border">
              {assessedCount}/{totalCount} 已评估
            </span>
          </div>
          <button
            onClick={onRefresh}
            className="rounded p-1 text-muted-foreground hover:text-foreground text-xs"
            aria-label="刷新"
          >
            {'↻'} 换职业
          </button>
        </div>
        {/* 进度条 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{fillPct}%</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {profile.trustLevel === 'ai-inferred' ? '模型整理 · 仅供参考' : '社区贡献'}
        </p>
      </div>

      {/* 能力列表，按 6 维分组 */}
      <div className="divide-y divide-border/30">
        {Array.from(grouped.entries()).map(([type, gaps]) => (
          <div key={type} className="px-4 py-3">
            <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {COMPETENCY_TYPE_LABELS[type] || type}
            </h4>
            <div className="space-y-2">
              {gaps.map((gap) => (
                <div key={gap.competency.id}>
                  <button
                    onClick={() => setExpanded(expanded === gap.competency.id ? null : gap.competency.id)}
                    className="w-full text-left"
                    aria-expanded={expanded === gap.competency.id}
                    aria-controls={`gap-detail-${gap.competency.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm truncate">{gap.competency.name}</span>
                        {gap.competency.layer === 'cert' && (
                          <span className="shrink-0 rounded bg-red-100 px-1 py-0.5 text-[10px] text-red-700">
                            门槛
                          </span>
                        )}
                      </div>
                      <span className={`shrink-0 ml-2 text-xs ${gap.gap <= 0 ? 'text-emerald-600' : gap.gap === 1 ? 'text-amber-600' : 'text-red-600'}`}>
                        {gapLabel(gap)}
                      </span>
                    </div>
                    {/* 水平对比条 */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${gapBarColor(gap)}`}
                          style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-12 text-right">
                        Lv.{gap.currentLevel} → {gap.targetLevel}
                      </span>
                    </div>
                  </button>

                  {/* 展开详情 */}
                  {expanded === gap.competency.id && (
                    <div
                      id={`gap-detail-${gap.competency.id}`}
                      className="mt-2 rounded-lg bg-background border border-border/50 p-3 space-y-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        {'💡'} {gap.competency.importanceRationale}
                      </p>
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          当前：{gap.competency.proficiencyLevels[gap.currentLevel]}
                        </p>
                        <p className="text-foreground font-medium">
                          目标：{gap.competency.proficiencyLevels[gap.targetLevel]}
                        </p>
                      </div>
                      {/* 自评选择器 */}
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground mr-1">我的水平：</span>
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() =>
                              onAssess(gap.competency.id, lvl, '')
                            }
                            className={`rounded px-2 py-0.5 text-[10px] transition-colors ${
                              gap.currentLevel === lvl
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
                            }`}
                          >
                            {PROFICIENCY_LABELS[lvl].label}
                          </button>
                        ))}
                      </div>
                      {/* 推荐学习资源 */}
                      <div className="mt-2 pt-2 border-t border-border/20">
                        <p className="text-[10px] text-muted-foreground mb-1">
                          {'📚'} 推荐学习资源
                        </p>
                        {(() => {
                          const resources = getResources(gap);
                          if (resources.length === 0) {
                            return <p className="text-[10px] text-muted-foreground/50 italic">暂无匹配资源，可在资源库中搜索相关关键词</p>;
                          }
                          return (
                            <div className="space-y-1">
                              {resources.slice(0, 5).map((r, j) => (
                                <a
                                  key={j}
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[10px] text-primary hover:bg-secondary/50 transition-colors"
                                >
                                  <span className="text-muted-foreground">{j + 1}.</span>
                                  <span className="truncate">{r.name}</span>
                                  <span className="shrink-0 text-muted-foreground/40">↗</span>
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
