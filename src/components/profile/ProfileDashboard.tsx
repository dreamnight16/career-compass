'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/types';
import { ProfileCard } from '@/components/chat/ProfileCard';
import { CompetencyCard } from '@/components/chat/CompetencyCard';
import type { OccupationCompetencyProfile, StudentCompetencyProfile, SelfAssessment, ProficiencyLevel } from '@/types/competency';
import { CareerTest } from './CareerTest';
import { PersonalityTest } from './PersonalityTest';
import { toast } from '@/components/ui/toast';
import { addActivity, getStats } from '@/lib/activity-store';
import { Beaker, Brain, Download } from 'lucide-react';

/** 导出用户全部本地数据为 JSON 文件（数据主权归用户） */
function exportAllData(): void {
  try {
    const KEYS = [
      'career-compass-profile', 'career-compass-messages', 'career-compass-competency', 'career-compass-routes',
      'career-compass-decisions', 'career-compass-activity', 'career-compass-bookmarks',
      'career-compass-resource-bookmarks', 'career-compass-bigfive', 'career-compass-test-result',
    ];
    const data: Record<string, unknown> = { exportedAt: new Date().toISOString(), app: 'career-compass' };
    for (const k of KEYS) {
      const raw = localStorage.getItem(k);
      if (raw) { try { data[k] = JSON.parse(raw); } catch { data[k] = raw; } }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-compass-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    toast('error', '导出失败');
  }
}

type TestType = 'career' | 'bigfive' | null;

function isValidCompetencyProfile(v: unknown): v is OccupationCompetencyProfile {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return typeof o.occupation === 'string' && Array.isArray(o.competencies);
}

function isValidStudentCompetency(v: unknown): v is StudentCompetencyProfile {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return Array.isArray(o.selfAssessments);
}

export function ProfileDashboard() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [competencyProfile, setCompetencyProfile] = useState<OccupationCompetencyProfile | null>(null);
  const [studentCompetency, setStudentCompetency] = useState<StudentCompetencyProfile>({ selfAssessments: [], inferredSignals: [] });
  const [showCompetency, setShowCompetency] = useState(false);
  const [competencyLoading, setCompetencyLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [competencyOccupation, setCompetencyOccupation] = useState('');
  const [activeTest, setActiveTest] = useState<TestType>(null);

  useEffect(() => {
    const load = () => {
      try {
        const saved = localStorage.getItem('career-compass-competency');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (isValidStudentCompetency(parsed.studentCompetency)) setStudentCompetency(parsed.studentCompetency);
          if (isValidCompetencyProfile(parsed.competencyProfile)) { setCompetencyProfile(parsed.competencyProfile); setShowCompetency(true); }
        }
        const profileSaved = localStorage.getItem('career-compass-profile');
        if (profileSaved) setProfile(JSON.parse(profileSaved));
      } catch { /* ignore */ }
    };
    load();
    window.addEventListener('profile-updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('profile-updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const handleAssess = (competencyId: string, level: ProficiencyLevel, evidence: string) => {
    setStudentCompetency((prev) => {
      const existingIdx = prev.selfAssessments.findIndex((a) => a.competencyId === competencyId);
      const assessment: SelfAssessment = { competencyId, currentLevel: level, evidence, lastUpdated: new Date().toISOString() };
      const selfAssessments = existingIdx >= 0
        ? prev.selfAssessments.map((a, i) => (i === existingIdx ? assessment : a))
        : [...prev.selfAssessments, assessment];
      const updated = { ...prev, selfAssessments };
      try { localStorage.setItem('career-compass-competency', JSON.stringify({ studentCompetency: updated, competencyProfile })); } catch {}
      return updated;
    });
  };

  const handleGenerate = async () => {
    const occupation = competencyOccupation.trim();
    if (!occupation) return;
    setCompetencyLoading(true);
    try {
      const res = await fetch('/api/competency', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ occupation }) });
      const json = await res.json();
      if (json.success && isValidCompetencyProfile(json.data)) {
        setCompetencyProfile(json.data);
        setStudentCompetency((prev) => {
          const updated = { ...prev, targetCareer: occupation };
          try { localStorage.setItem('career-compass-competency', JSON.stringify({ studentCompetency: updated, competencyProfile: json.data })); } catch {}
          return updated;
        });
        setShowCompetency(true);
        addActivity({ type: 'competency', title: `生成能力画像: ${occupation}` });
        const count = parseInt(localStorage.getItem('career-compass-competency-count') || '0', 10) + 1;
        localStorage.setItem('career-compass-competency-count', String(count));
        toast('success', '能力画像已生成');
      } else {
        toast('error', json.error || '生成失败，请稍后重试');
      }
    } catch {
      toast('error', '网络错误，请稍后重试');
    }
    finally { setCompetencyLoading(false); }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">个人画像</h2>
        <button onClick={exportAllData}
          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          title="导出画像、对话、路线、决策日志等全部本地数据">
          <Download className="h-3.5 w-3.5" /> 导出我的数据
        </button>
      </div>

      {/* 测评工具 */}
      {activeTest === 'career' && (
        <CareerTest
          onComplete={(result) => {
            const updated = {
              ...profile,
              interests: [...new Set([...(profile.interests || []), ...result.interests])],
              lifestyle: [...new Set([...(profile.lifestyle || []), ...result.values])],
            };
            setProfile(updated);
            localStorage.setItem('career-compass-profile', JSON.stringify(updated));
            localStorage.setItem('career-compass-personality-result', 'true');
            window.dispatchEvent(new Event('profile-updated'));
            addActivity({ type: 'profile_update', title: '完成职业兴趣测评' });
            setActiveTest(null);
            toast('success', '兴趣测评结果已保存');
          }}
          onClose={() => setActiveTest(null)}
        />
      )}
      {activeTest === 'bigfive' && (
        <PersonalityTest
          onComplete={(desc) => {
            const updated = { ...profile, lifestyle: [...new Set([...(profile.lifestyle || []), `BigFive:${desc}`])] };
            setProfile(updated);
            localStorage.setItem('career-compass-profile', JSON.stringify(updated));
            localStorage.setItem('career-compass-personality-result', 'true');
            window.dispatchEvent(new Event('profile-updated'));
            addActivity({ type: 'profile_update', title: '完成大五人格测评' });
            setActiveTest(null);
            toast('success', '性格测评结果已保存');
          }}
          onClose={() => setActiveTest(null)}
        />
      )}
      {!activeTest && (
        <div className="mb-6 space-y-2">
          <button onClick={() => setActiveTest('bigfive')}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-left transition-colors hover:bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">大五人格测评</p>
              <p className="text-xs text-muted-foreground">50 题 · 科学人格模型，了解你的性格与职业匹配</p>
            </div>
          </button>
          <button onClick={() => setActiveTest('career')}
            className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-left transition-colors hover:bg-primary/10">
            <Beaker className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">职业兴趣测评</p>
              <p className="text-xs text-muted-foreground">Holland 六型 + 职业价值观，帮你找到适合的方向</p>
            </div>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 角色卡 */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">角色卡</h3>
          <ProfileCard profile={profile} />
        </div>

        {/* 能力画像入口 */}
        <div>
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">能力画像</h3>
          {showCompetency && competencyProfile ? (
            <CompetencyCard
              profile={competencyProfile}
              selfAssessments={studentCompetency.selfAssessments}
              onAssess={handleAssess}
              onRefresh={() => { setShowCompetency(false); setCompetencyProfile(null); setCompetencyOccupation(''); try { localStorage.removeItem('career-compass-competency'); } catch {} }}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border/60 bg-card/40 px-4 py-3">
              <p className="mb-2 text-xs text-muted-foreground">生成目标职业的能力画像</p>
              <div className="flex gap-2">
                <input
                  value={competencyOccupation}
                  onChange={(e) => setCompetencyOccupation(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.nativeEvent as KeyboardEvent).isComposing || (e as unknown as { keyCode: number }).keyCode === 229) return;
                    if (e.key === 'Enter') handleGenerate();
                  }}
                  placeholder="输入目标职业，如：律师..."
                  className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                  disabled={competencyLoading}
                  aria-label="目标职业"
                />
                <button
                  onClick={handleGenerate}
                  disabled={competencyLoading || !competencyOccupation.trim()}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-30"
                >
                  {competencyLoading ? '生成中...' : '查看能力需求'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 成长轨迹 */}
      <div className="mt-8">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">成长轨迹</h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="对话次数" value={String(getStats().totalConversations)} />
          <StatCard label="能力评估" value={String(studentCompetency.selfAssessments.length)} />
          <StatCard label="资源收藏" value={String(getStats().resourceSaves)} />
        </div>
      </div>

      {/* 路线图入口 */}
      <div className="mt-6 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">生成路线图</p>
            <p className="text-xs text-muted-foreground mt-0.5">基于你的画像，AI 规划可行的职业路线</p>
          </div>
          <button
            onClick={async () => {
              setPlanLoading(true);
              try {
                const res = await fetch('/api/plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profile }) });
                const json = await res.json();
                if (json.success && json.data?.routes && Array.isArray(json.data.routes)) {
                  const { saveRoutes } = await import('@/lib/route-store');
                  saveRoutes(json.data.routes);
                  window.dispatchEvent(new Event('routes-updated'));
                  addActivity({ type: 'profile_update', title: `生成 ${json.data.routes.length} 条路线` });
                  toast('success', `已生成 ${json.data.routes.length} 条路线，在成就图鉴中查看`);
                  // navigate to routes tab
                  const current = new URLSearchParams(window.location.search);
                  current.set('tab', 'routes');
                  window.history.pushState(null, '', `/main?${current.toString()}`);
                  window.dispatchEvent(new Event('popstate'));
                } else {
                  toast('error', json.error || '生成失败，请稍后重试');
                }
              } catch {
                toast('error', '网络错误，请稍后重试');
              }
              finally { setPlanLoading(false); }
            }}
            disabled={planLoading}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-30"
          >
            {planLoading ? '生成中...' : '生成路线图'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 text-center shadow-sm">
      <p className="text-2xl font-bold text-foreground font-serif-hero">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
