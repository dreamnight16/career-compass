import { HeroSection } from '@/components/landing/HeroSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import {
  CITY_COUNT,
  CITY_RECORDED_AT,
  CITY_SOURCE,
  INDUSTRY_COUNT,
  INDUSTRY_RECORDED_AT,
  INDUSTRY_SOURCE,
  KNOWLEDGE_ATOM_COUNT,
  RESOURCE_LINK_COUNT,
  SALARY_RECORDED_AT,
  SALARY_SAMPLE_COUNT,
  SALARY_SOURCE,
  formatRecordedAt,
} from '@/data/catalog';

const SOURCES = [
  {
    title: '专业起薪',
    count: `${SALARY_SAMPLE_COUNT} 个本科专业`,
    source: SALARY_SOURCE,
    recordedAt: SALARY_RECORDED_AT,
  },
  {
    title: '城市生活成本',
    count: `${CITY_COUNT} 个城市`,
    source: CITY_SOURCE,
    recordedAt: CITY_RECORDED_AT,
  },
  {
    title: '行业平均工资',
    count: `${INDUSTRY_COUNT} 个行业门类`,
    source: INDUSTRY_SOURCE,
    recordedAt: INDUSTRY_RECORDED_AT,
  },
];

export default function LandingPage() {
  return (
    <main id="cc-main">
      <HeroSection />
      <FeatureGrid />

      <section aria-labelledby="sources-heading" className="mx-auto max-w-[1400px] px-6 py-16 lg:px-14">
        <p className="cc-kicker text-muted-foreground">数据边界</p>
        <h2 id="sources-heading" className="cc-h2 mt-4 text-foreground">
          能核对的地方才写进来
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-px bg-dn-divider md:grid-cols-3">
          {SOURCES.map((s) => (
            <div key={s.title} className="bg-card px-6 py-8">
              <p className="cc-kicker text-muted-foreground">{s.title}</p>
              <p className="cc-num mt-4 text-3xl text-foreground">{s.count}</p>
              <p className="cc-body mt-4 text-muted-foreground">{s.source}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                数据文件记录时间 {formatRecordedAt(s.recordedAt)}（静态数据，不自动刷新）
              </p>
            </div>
          ))}
        </div>

        <div className="cc-rule mt-12 grid grid-cols-1 gap-8 pt-8 md:grid-cols-2">
          <p className="cc-body text-muted-foreground">
            资源库收录 {RESOURCE_LINK_COUNT} 条策展链接，只标注「去哪找」，不搬运数据本身；
            知识库 {KNOWLEDGE_ATOM_COUNT} 条原子条目，每条都带来源链接与可信度标记
            （官方 / AI 推断 / 社区未审核），AI 的每句断言都可以点开核对。
          </p>
          <p className="cc-body text-muted-foreground">
            网站本身不收集账号信息，画像、路径、日志与徽章都存在你自己的浏览器里。
            页面上的所有数字都是静态数据文件的值，本页不展示任何实时在线状态。
          </p>
        </div>
      </section>
    </main>
  );
}
