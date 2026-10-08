import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  BOTTOM_MAJORS,
  SALARY_NATIONAL_AVG,
  SALARY_RECORDED_AT,
  SALARY_SAMPLE_COUNT,
  SALARY_SOURCE,
  SALARY_SPREAD,
  TOP_MAJORS,
  formatRecordedAt,
} from '@/data/catalog';

const yuan = (n: number) => `¥${n.toLocaleString('zh-CN')}`;

/**
 * 首页 Hero。
 *
 * 构图：左侧排版（字体本身即界面），右侧一块 Ink 实色场承载真实数据快照。
 * 数据全部来自 public/data/*.json，是数据文件记录值，不是实时状态。
 */
export function HeroSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-12">
        {/* 左：排版 */}
        <div className="px-6 py-16 lg:col-span-7 lg:px-14 lg:py-24">
          <p className="cc-kicker text-muted-foreground">DreamNight · 歧点 · 决策辅助</p>

          <h1 className="cc-display mt-6 text-foreground">歧点</h1>

          <p className="cc-h2 mt-4 text-foreground">为你探明前路</p>

          <div className="cc-body mt-10 max-w-xl space-y-1 text-muted-foreground">
            <p>不是告诉你该选哪条路</p>
            <p>而是让你看清每条路的样子</p>
            <p>然后自己决定</p>
          </div>

          <div className="mt-10 flex flex-wrap items-stretch gap-3">
            <Link
              href="/main"
              className="dn-interactive dn-focus inline-flex min-h-11 items-center gap-2 bg-primary px-8 py-3 text-base font-medium text-primary-foreground"
            >
              开始探索
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href="#board"
              className="dn-focus inline-flex min-h-11 items-center gap-2 border border-input px-8 py-3 text-base font-medium text-foreground transition-colors duration-hover hover:bg-secondary"
            >
              先看四段路
            </a>
          </div>

          <p className="mt-8 max-w-xl border-t border-border pt-4 text-sm text-muted-foreground">
            AI 助手是可选的。没有配置密钥时，个人画像、资源库、数据对比、路径模拟与决策日志照常可用。
          </p>
        </div>

        {/* 右：Ink 实色场 · 真实数据快照 */}
        <aside className="cc-on-ink bg-dn-ink px-6 py-16 lg:col-span-5 lg:px-12 lg:py-24">
          <p className="cc-kicker text-dn-on-ink">静态数据 · 非实时</p>

          <p className="cc-num mt-6 text-[4.5rem] text-dn-on-ink">{SALARY_SAMPLE_COUNT}</p>
          <p className="cc-body text-dn-on-ink">个本科专业的毕业起薪样本</p>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <dt className="text-sm text-dn-on-ink">本科毕业平均月收入</dt>
              <dd className="cc-num mt-1 text-3xl text-dn-on-ink">{yuan(SALARY_NATIONAL_AVG)}</dd>
            </div>
            <div>
              <dt className="text-sm text-dn-on-ink">最高与最低专业差额</dt>
              <dd className="cc-num mt-1 text-3xl text-dn-on-ink">{yuan(SALARY_SPREAD)}</dd>
            </div>
          </dl>

          <div className="cc-rule-on-ink mt-10 pt-6">
            <h2 className="cc-kicker text-dn-on-ink">起薪最高的 5 个专业</h2>
            <ul className="mt-3 space-y-2">
              {TOP_MAJORS.map((m) => (
                <li key={m.name} className="flex items-baseline justify-between gap-4">
                  <span className="cc-body text-dn-on-ink">{m.name}</span>
                  <span className="cc-num text-lg text-dn-on-ink">{yuan(m.salary)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cc-rule-on-ink mt-8 pt-6">
            <h2 className="cc-kicker text-dn-on-ink">起薪最低的 5 个专业</h2>
            <ul className="mt-3 space-y-2">
              {BOTTOM_MAJORS.map((m) => (
                <li key={m.name} className="flex items-baseline justify-between gap-4">
                  <span className="cc-body text-dn-on-ink">{m.name}</span>
                  <span className="cc-num text-lg text-dn-on-ink">{yuan(m.salary)}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs leading-relaxed text-dn-on-ink">
            来源：{SALARY_SOURCE}。数据文件记录时间 {formatRecordedAt(SALARY_RECORDED_AT)}，为静态数据，不会自动刷新。
          </p>
        </aside>
      </div>
    </section>
  );
}
