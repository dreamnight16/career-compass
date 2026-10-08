import Link from 'next/link';
import { ArrowRight, Sparkles, UserCircle, Map, BookOpen, BarChart3, GitBranch, Compass, Library } from 'lucide-react';
import {
  ACHIEVEMENT_COUNT,
  CAREER_ENTRY_COUNT,
  CITY_COUNT,
  INDUSTRY_COUNT,
  KNOWLEDGE_ATOM_COUNT,
  RESOURCE_CATEGORY_COUNT,
  RESOURCE_LINK_COUNT,
  SALARY_SAMPLE_COUNT,
} from '@/data/catalog';

/**
 * 四段路 · 歧路板。
 *
 * 信息架构：把 8 个模块收进产品自身的四段推进（看清自己 → 看清路 → 做决定 → 走下去），
 * 加上横跨四段的决策教练。每一段是一块品牌实色场，模块是场内的行式入口。
 * 版式不对称：12 栏中按内容重要度分配 12 / 5+7 / 7+5，而不是等分卡片网格。
 *
 * 所有数字都来自 src/data/catalog.ts 的真实数据，没有动态数据时不编造。
 */

interface ModuleLink {
  tab: string;
  label: string;
  icon: typeof Sparkles;
  detail: string;
}

interface Stage {
  index: string;
  title: string;
  premise: string;
  fieldClass: string;
  spanClass: string;
  modules: ModuleLink[];
}

const STAGES: Stage[] = [
  {
    index: '一',
    title: '看清自己',
    premise: '先知道自己站在哪，才有比较的基准。',
    fieldClass: 'bg-dn-cyan',
    spanClass: 'lg:col-span-5',
    modules: [
      {
        tab: 'profile',
        label: '个人画像',
        icon: UserCircle,
        detail: '8 维角色卡 + 能力诊断；填满 6 维之前不给推荐',
      },
    ],
  },
  {
    index: '二',
    title: '看清路',
    premise: '每条路的门槛、代价和去向，都摆在同一张桌上。',
    fieldClass: 'bg-dn-emerald',
    spanClass: 'lg:col-span-7',
    modules: [
      {
        tab: 'careers',
        label: '路径探索',
        icon: Compass,
        detail: `${CAREER_ENTRY_COUNT} 个职业条目：技能树、晋升路径、行业方向`,
      },
      {
        tab: 'explore',
        label: '数据对比',
        icon: BarChart3,
        detail: `${SALARY_SAMPLE_COUNT} 个专业起薪 · ${CITY_COUNT} 个城市生活成本 · ${INDUSTRY_COUNT} 个行业平均工资`,
      },
      {
        tab: 'resources',
        label: '资源库',
        icon: Library,
        detail: `${RESOURCE_CATEGORY_COUNT} 个分类 / ${RESOURCE_LINK_COUNT} 条策展链接，只索引「去哪找」`,
      },
    ],
  },
  {
    index: '三',
    title: '做决定',
    premise: '把取舍写下来，回头才能看见自己是怎么变的。',
    fieldClass: 'bg-dn-violet',
    spanClass: 'lg:col-span-7',
    modules: [
      {
        tab: 'sim',
        label: '路径模拟',
        icon: GitBranch,
        detail: '三步选择生成路线框架，不做推荐',
      },
      {
        tab: 'journal',
        label: '决策日志',
        icon: BookOpen,
        detail: '记下每次权衡、信心和放弃的理由，日后回看',
      },
    ],
  },
  {
    index: '四',
    title: '走下去',
    premise: '进度、连续天数和里程碑都在本地留下痕迹。',
    fieldClass: 'bg-dn-amber',
    spanClass: 'lg:col-span-5',
    modules: [
      {
        tab: 'routes',
        label: '成就图鉴',
        icon: Map,
        detail: `${ACHIEVEMENT_COUNT} 枚徽章 · 连续打卡 · 成长报告`,
      },
    ],
  },
];

function ModuleRow({ module }: { module: ModuleLink }) {
  const Icon = module.icon;
  return (
    <Link
      href={`/main?tab=${module.tab}`}
      className="cc-row dn-focus group flex min-h-11 items-start gap-4 px-6 py-5 lg:px-8"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-dn-on-color" aria-hidden="true" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="cc-h2 text-dn-on-color">{module.label}</span>
        <span className="cc-body mt-1 text-dn-on-color">{module.detail}</span>
      </span>
      <ArrowRight className="cc-row-arrow mt-1 h-4 w-4 shrink-0 text-dn-on-color" aria-hidden="true" />
    </Link>
  );
}

export function FeatureGrid() {
  return (
    <section id="board" className="border-b border-border">
      <header className="mx-auto max-w-[1400px] px-6 pb-10 pt-20 lg:px-14">
        <p className="cc-kicker text-muted-foreground">四段路 · 一条循环</p>
        <h2 className="cc-h1 mt-4 max-w-3xl text-foreground">
          先看清自己，再看清路，然后自己决定
        </h2>
        <p className="cc-body mt-4 max-w-2xl text-muted-foreground">
          八个模块分布在四段推进里。任何一段都可以单独使用，也可以随时回到上一段重看一遍。
        </p>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-px bg-dn-divider lg:grid-cols-12">
        {/* 决策教练：横跨四段的可选辅助 */}
        <Link
          href="/main?tab=coach"
          className="cc-row dn-focus bg-dn-teal px-6 py-8 lg:col-span-12 lg:px-14 lg:py-10"
        >
          <div className="grid grid-cols-1 items-baseline gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="cc-kicker text-dn-on-color">可选辅助</p>
              <h3 className="cc-h1 mt-3 flex items-center gap-3 text-dn-on-color">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
                决策教练
              </h3>
            </div>
            <p className="cc-body lg:col-span-6 text-dn-on-color">
              不给答案，只把 A 与 B 的优势和风险摊开。每次引用都标注来源，可以点开核对，
              数据来源包括 {KNOWLEDGE_ATOM_COUNT} 条带来源与可信度标记的原子知识条目。
            </p>
          </div>
        </Link>

        {STAGES.map((stage) => (
          <section
            key={stage.index}
            aria-labelledby={`stage-${stage.index}`}
            className={`${stage.fieldClass} ${stage.spanClass} flex flex-col px-6 py-8 lg:px-8 lg:py-10`}
          >
            <p className="cc-kicker text-dn-on-color">第 {stage.index} 段</p>
            <h3 id={`stage-${stage.index}`} className="cc-h1 mt-3 text-dn-on-color">
              {stage.title}
            </h3>
            <p className="cc-body mt-3 max-w-lg text-dn-on-color">{stage.premise}</p>

            <div className="cc-rule-on-color mt-8 flex flex-1 flex-col">
              {stage.modules.map((m) => (
                <ModuleRow key={m.tab} module={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
