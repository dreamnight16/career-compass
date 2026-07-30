'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, TrendingUp, GraduationCap, Clock, MapPin, X } from 'lucide-react';

interface Career {
  title: string; industry: string; salaryRange: [number, number]; education: string; experience: string; outlook: 'rising' | 'stable' | 'declining'; cities: string[]; tags: string[]; desc: string;
}

const CAREERS: Career[] = [
  // === 互联网/科技 (10) ===
  { title:'算法工程师', industry:'互联网/AI', salaryRange:[25000,60000], education:'硕士及以上', experience:'0-3年', outlook:'rising', cities:['北京','上海','深圳','杭州'], tags:['AI','高薪','技术'], desc:'大模型应用落地需求爆发式增长' },
  { title:'前端开发工程师', industry:'互联网', salaryRange:[12000,30000], education:'本科及以上', experience:'0-3年', outlook:'declining', cities:['北京','上海','深圳','杭州'], tags:['技术','互联网'], desc:'初级岗位受AI冲击，但高级前端仍稀缺' },
  { title:'后端开发工程师', industry:'互联网', salaryRange:[15000,35000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['北京','上海','深圳','杭州'], tags:['技术','互联网'], desc:'Go/Java/Python后端，云原生和微服务方向需求稳定' },
  { title:'数据科学家', industry:'互联网/金融', salaryRange:[18000,45000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','深圳','杭州'], tags:['大数据','AI','高薪'], desc:'从海量数据中提取商业洞察' },
  { title:'产品经理', industry:'互联网', salaryRange:[15000,35000], education:'本科及以上', experience:'1-5年', outlook:'stable', cities:['北京','上海','深圳','杭州'], tags:['综合','沟通'], desc:'定义产品方向，协调技术设计运营' },
  { title:'UI/UX设计师', industry:'互联网', salaryRange:[12000,28000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['北京','上海','深圳','杭州'], tags:['设计','创意'], desc:'用户体验设计，B端SaaS需求增长' },
  { title:'网络安全工程师', industry:'信息安全', salaryRange:[15000,35000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','深圳','成都'], tags:['安全','技术'], desc:'企业数字化转型安全需求激增' },
  { title:'DevOps/SRE工程师', industry:'互联网', salaryRange:[18000,40000], education:'本科及以上', experience:'2-5年', outlook:'rising', cities:['北京','上海','深圳','杭州'], tags:['运维','云原生'], desc:'云原生普及推动需求上升约20%' },
  { title:'游戏开发工程师', industry:'游戏/娱乐', salaryRange:[15000,40000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['上海','北京','深圳','广州'], tags:['游戏','技术'], desc:'Unity/Unreal引擎，出海和独立游戏是新机会' },
  { title:'区块链开发工程师', industry:'Web3/金融', salaryRange:[20000,50000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','深圳','杭州'], tags:['区块链','高薪'], desc:'Web3和数字人民币推动需求' },
  // === 半导体/硬件 (6) ===
  { title:'集成电路工程师', industry:'半导体', salaryRange:[20000,50000], education:'硕士及以上', experience:'0-3年', outlook:'rising', cities:['上海','北京','深圳','无锡'], tags:['芯片','硬科技','高薪'], desc:'国产替代带来巨大人才缺口' },
  { title:'嵌入式系统工程师', industry:'物联网/汽车', salaryRange:[15000,35000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['深圳','上海','北京','苏州'], tags:['硬件','IoT'], desc:'物联网和智能汽车推动需求' },
  { title:'硬件测试工程师', industry:'电子制造', salaryRange:[10000,22000], education:'本科及以上', experience:'0-3年', outlook:'stable', cities:['深圳','上海','苏州','东莞'], tags:['硬件','测试'], desc:'电子产品测试验证，入门门槛相对低' },
  { title:'光电工程师', industry:'光电子', salaryRange:[15000,30000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['武汉','深圳','上海','长春'], tags:['光电子','技术'], desc:'光通信和激光应用需求增长' },
  { title:'射频工程师', industry:'通信', salaryRange:[18000,40000], education:'硕士及以上', experience:'2-5年', outlook:'rising', cities:['深圳','上海','北京','西安'], tags:['通信','高频'], desc:'5G/6G和卫星通信驱动需求' },
  { title:'电力电子工程师', industry:'新能源', salaryRange:[15000,35000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['深圳','上海','合肥','西安'], tags:['电力','新能源'], desc:'光伏逆变器/储能/电动车充电桩需求爆发' },
  // === 能源/制造 (8) ===
  { title:'电气工程师', industry:'电力/能源', salaryRange:[12000,28000], education:'本科及以上', experience:'0-5年', outlook:'rising', cities:['北京','上海','广州','武汉'], tags:['能源','绿牌'], desc:'新能源和智能电网推动需求增长' },
  { title:'机械工程师', industry:'制造/汽车', salaryRange:[10000,25000], education:'本科及以上', experience:'0-5年', outlook:'rising', cities:['上海','深圳','苏州','重庆'], tags:['制造','绿牌'], desc:'智能制造+新能源汽车推动需求' },
  { title:'材料工程师', industry:'新材料', salaryRange:[12000,28000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['上海','深圳','苏州','宁波'], tags:['材料','硬科技'], desc:'半导体材料/电池材料/航空材料是三大热点' },
  { title:'化工工程师', industry:'化工/能源', salaryRange:[10000,22000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['上海','南京','天津','青岛'], tags:['化工','传统'], desc:'精细化工和新能源材料是新增长点' },
  { title:'汽车工程师', industry:'汽车', salaryRange:[12000,28000], education:'本科及以上', experience:'0-5年', outlook:'rising', cities:['上海','深圳','广州','重庆'], tags:['汽车','新能源'], desc:'新能源+智能驾驶，整车和零部件需求旺盛' },
  { title:'航空航天工程师', industry:'航空航天', salaryRange:[15000,30000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','西安','成都'], tags:['航天','高端'], desc:'商业航天爆发，民企入局带来新机会' },
  { title:'采矿工程师', industry:'矿业', salaryRange:[12000,25000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['太原','西安','乌鲁木齐','昆明'], tags:['矿业','资源'], desc:'薪资高但工作环境艰苦，人才供不应求' },
  { title:'核工程技术人员', industry:'核能', salaryRange:[15000,35000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','深圳','成都'], tags:['核能','高端'], desc:'核电重启+核技术应用扩大' },
  // === 医疗健康 (10) ===
  { title:'临床医生', industry:'医疗健康', salaryRange:[10000,30000], education:'硕士+规培', experience:'3-8年', outlook:'stable', cities:['北京','上海','广州','成都'], tags:['医疗','高门槛'], desc:'规培+执业医师，周期长但社会地位高' },
  { title:'口腔医生', industry:'医疗健康', salaryRange:[15000,50000], education:'硕士+执业', experience:'2-5年', outlook:'rising', cities:['北京','上海','深圳','广州'], tags:['医疗','高薪'], desc:'口腔医疗市场化程度最高，收入上限高' },
  { title:'麻醉医师', industry:'医疗健康', salaryRange:[15000,35000], education:'硕士+执业', experience:'2-5年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['医疗','紧缺'], desc:'麻醉医生全国性短缺，薪资溢价明显' },
  { title:'护理学/护士', industry:'医疗健康', salaryRange:[7000,18000], education:'本科+执业证', experience:'0-5年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['医疗','刚需'], desc:'老龄化推动需求，男护士尤其紧缺' },
  { title:'药学研发', industry:'制药', salaryRange:[12000,30000], education:'硕士及以上', experience:'1-5年', outlook:'rising', cities:['上海','北京','苏州','南京'], tags:['医药','研发'], desc:'创新药研发投入加大，CRO行业扩张' },
  { title:'康复治疗师', industry:'医疗健康', salaryRange:[8000,20000], education:'本科+执业', experience:'0-5年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['康复','增长'], desc:'老龄化+运动康复意识提升推动需求' },
  { title:'医学影像技师', industry:'医疗健康', salaryRange:[8000,18000], education:'本科+执业', experience:'0-5年', outlook:'stable', cities:['北京','上海','广州','成都'], tags:['医疗','技术'], desc:'影像设备普及，操作技师需求稳定' },
  { title:'公共卫生专员', industry:'政府/医疗', salaryRange:[8000,18000], education:'硕士优先', experience:'0-3年', outlook:'rising', cities:['北京','上海','广州','武汉'], tags:['公卫','政策'], desc:'疫情后公共卫生体系加强，疾控/卫健委需求增加' },
  { title:'兽医', industry:'农业/宠物', salaryRange:[8000,25000], education:'本科+执业', experience:'1-5年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['宠物','医疗'], desc:'宠物经济爆发，连锁宠物医院快速扩张' },
  { title:'心理咨询师', industry:'健康/教育', salaryRange:[8000,25000], education:'硕士+执业', experience:'2-5年', outlook:'rising', cities:['北京','上海','深圳','成都'], tags:['健康','成长'], desc:'心理健康意识提升，需求快速增加' },
  // === 金融/商业 (8) ===
  { title:'投资银行分析师', industry:'金融', salaryRange:[20000,60000], education:'硕士+CFA', experience:'0-3年', outlook:'stable', cities:['北京','上海','深圳','香港'], tags:['金融','高薪'], desc:'IPO和并购业务，强度极大但回报极高' },
  { title:'量化研究员', industry:'金融', salaryRange:[25000,80000], education:'硕士及以上', experience:'0-3年', outlook:'rising', cities:['上海','北京','深圳','香港'], tags:['金融','量化'], desc:'数学/计算机背景，用算法做交易' },
  { title:'注册会计师', industry:'财务审计', salaryRange:[10000,30000], education:'本科+CPA', experience:'2-5年', outlook:'stable', cities:['北京','上海','深圳','广州'], tags:['财务','证书'], desc:'四大/内资所/企业财务三条路径' },
  { title:'精算师', industry:'保险', salaryRange:[15000,40000], education:'本科+精算考试', experience:'2-8年', outlook:'stable', cities:['北京','上海','深圳'], tags:['保险','证书'], desc:'考试周期长但通过后薪资水平高' },
  { title:'风险管理师', industry:'金融', salaryRange:[15000,35000], education:'硕士+FRM', experience:'2-5年', outlook:'stable', cities:['北京','上海','深圳'], tags:['金融','风控'], desc:'银行/保险/券商都需要，FRM/CFA加分' },
  { title:'管理咨询顾问', industry:'咨询', salaryRange:[18000,45000], education:'硕士/MBA', experience:'0-3年', outlook:'stable', cities:['北京','上海','深圳'], tags:['咨询','高薪'], desc:'MBB+四大咨询，高薪高压力高成长' },
  { title:'供应链管理', industry:'物流/制造', salaryRange:[12000,28000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['上海','深圳','广州','宁波'], tags:['物流','管理'], desc:'跨境电商+智能制造推动供应链管理需求' },
  { title:'保险精算/核保', industry:'保险', salaryRange:[10000,25000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['北京','上海','深圳'], tags:['保险','稳定'], desc:'保险深度提升带来精算和核保人才需求' },
  // === 教育/学术 (5) ===
  { title:'高校教师', industry:'教育', salaryRange:[8000,20000], education:'博士优先', experience:'0-3年', outlook:'stable', cities:['北京','上海','南京','武汉'], tags:['教育','学术'], desc:'寒暑假+稳定编制是核心吸引力' },
  { title:'中小学教师', industry:'教育', salaryRange:[6000,15000], education:'本科+教资', experience:'0-3年', outlook:'stable', cities:['北京','上海','广州','成都'], tags:['教育','稳定'], desc:'编制内教师稳定，但出生率下降影响长期需求' },
  { title:'特殊教育教师', industry:'教育', salaryRange:[6000,15000], education:'本科+教资', experience:'0-3年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['教育','公益'], desc:'国家投入持续增加，人才缺口大' },
  { title:'教育培训师', industry:'教育/企业', salaryRange:[8000,20000], education:'本科及以上', experience:'1-5年', outlook:'stable', cities:['北京','上海','广州','深圳'], tags:['培训','企业'], desc:'企业内训和职业技能培训需求稳定' },
  { title:'对外汉语教师', industry:'教育/国际', salaryRange:[8000,20000], education:'本科+教资', experience:'0-3年', outlook:'rising', cities:['北京','上海','广州','海外'], tags:['教育','国际'], desc:'中文国际化推动需求，海外就业机会多' },
  // === 政府/公共 (4) ===
  { title:'公务员/选调生', industry:'政府', salaryRange:[8000,15000], education:'本科及以上', experience:'0-1年', outlook:'stable', cities:['北京','上海','广州','成都'], tags:['体制','稳定'], desc:'国考/省考/选调，计算机专业需求增加' },
  { title:'消防指挥', industry:'应急管理', salaryRange:[8000,15000], education:'本科及以上', experience:'0-3年', outlook:'stable', cities:['北京','上海','广州','武汉'], tags:['应急','稳定'], desc:'应急管理体系完善带来新增岗位' },
  { title:'外交官/国际组织', industry:'外交/国际', salaryRange:[10000,25000], education:'硕士+外语', experience:'0-3年', outlook:'stable', cities:['北京','海外'], tags:['外交','国际'], desc:'外交部/国际组织，稳定性高且有海外经历' },
  { title:'城市规划师', industry:'政府/设计', salaryRange:[10000,22000], education:'硕士及以上', experience:'1-5年', outlook:'stable', cities:['北京','上海','深圳','广州'], tags:['规划','城市'], desc:'城市更新和智慧城市规划需求增加' },
  // === 媒体/艺术/设计 (6) ===
  { title:'新媒体运营', industry:'传媒', salaryRange:[8000,20000], education:'本科及以上', experience:'0-3年', outlook:'rising', cities:['北京','上海','杭州','广州'], tags:['内容','创意'], desc:'短视频+直播赛道持续扩大' },
  { title:'动画师', industry:'娱乐/游戏', salaryRange:[10000,28000], education:'本科及以上', experience:'0-5年', outlook:'rising', cities:['北京','上海','杭州','成都'], tags:['动画','创意'], desc:'国漫崛起+游戏出海，动画人才需求旺盛' },
  { title:'工业设计师', industry:'制造/设计', salaryRange:[10000,25000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['深圳','上海','北京','广州'], tags:['设计','制造'], desc:'消费电子和智能硬件推动工业设计需求' },
  { title:'策展人/画廊管理', industry:'艺术', salaryRange:[8000,20000], education:'硕士优先', experience:'2-5年', outlook:'stable', cities:['北京','上海','深圳','香港'], tags:['艺术','文化'], desc:'艺术品市场持续增长，策展和管理人才需求稳定' },
  { title:'音乐制作/录音师', industry:'娱乐', salaryRange:[8000,25000], education:'本科及以上', experience:'1-5年', outlook:'stable', cities:['北京','上海','广州','成都'], tags:['音乐','创意'], desc:'音乐流媒体和短视频推动音频内容需求' },
  { title:'摄影师/导演', industry:'影视/广告', salaryRange:[10000,30000], education:'本科及以上', experience:'1-5年', outlook:'stable', cities:['北京','上海','杭州','广州'], tags:['影视','创意'], desc:'短视频/直播/广告/影视四轮驱动' },
  // === 法律/社会 (4) ===
  { title:'律师(诉讼)', industry:'法律', salaryRange:[12000,40000], education:'本科+法考', experience:'2-5年', outlook:'stable', cities:['北京','上海','深圳','广州'], tags:['法律','高门槛'], desc:'法考是硬门槛，诉讼方向竞争激烈回报可观' },
  { title:'企业法务', industry:'法律', salaryRange:[12000,30000], education:'本科+法考', experience:'2-5年', outlook:'stable', cities:['北京','上海','深圳','广州'], tags:['法律','企业'], desc:'大企业和互联网公司法务需求稳步增长' },
  { title:'社会工作者', industry:'NGO/社区', salaryRange:[6000,15000], education:'本科+社工证', experience:'0-3年', outlook:'rising', cities:['北京','上海','深圳','广州'], tags:['公益','社会'], desc:'社会治理现代化推动社工职业化' },
  { title:'知识产权代理', industry:'法律', salaryRange:[10000,25000], education:'本科+专利代理', experience:'1-5年', outlook:'rising', cities:['北京','上海','深圳','广州'], tags:['法律','IP'], desc:'企业IP意识增强，专利和商标代理需求增长' },
  // === 农业/食品/环境 (5) ===
  { title:'食品研发工程师', industry:'食品/快消', salaryRange:[10000,25000], education:'硕士及以上', experience:'1-5年', outlook:'stable', cities:['上海','广州','天津','青岛'], tags:['食品','研发'], desc:'预制菜/功能性食品/植物基是新增长点' },
  { title:'环境工程师', industry:'环保', salaryRange:[10000,22000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','深圳','杭州'], tags:['环保','绿色'], desc:'碳中和目标驱动，ESG人才需求增长' },
  { title:'农艺师', industry:'农业', salaryRange:[8000,18000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['南京','武汉','成都','昆明'], tags:['农业','科研'], desc:'智慧农业和种业振兴推动需求' },
  { title:'水产养殖技术员', industry:'渔业', salaryRange:[8000,20000], education:'本科及以上', experience:'0-5年', outlook:'stable', cities:['青岛','大连','厦门','海口'], tags:['水产','养殖'], desc:'深远海养殖和智慧渔业是新方向' },
  { title:'森林资源管理', industry:'林业', salaryRange:[7000,15000], education:'本科及以上', experience:'0-3年', outlook:'stable', cities:['昆明','成都','哈尔滨','南宁'], tags:['林业','生态'], desc:'碳汇交易和国家公园建设带来新机会' },
  // === 交通/物流/旅游 (4) ===
  { title:'航海技术/轮机工程', industry:'航运', salaryRange:[15000,40000], education:'本科+船员证', experience:'0-5年', outlook:'stable', cities:['上海','大连','青岛','厦门'], tags:['航运','高薪'], desc:'高薪但需海上作业，适合愿意吃苦换高收入' },
  { title:'飞行员', industry:'航空', salaryRange:[20000,60000], education:'本科+飞行执照', experience:'2-5年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['航空','高薪'], desc:'民航需求恢复+低空经济爆发' },
  { title:'酒店管理', industry:'旅游', salaryRange:[8000,20000], education:'本科及以上', experience:'1-5年', outlook:'stable', cities:['上海','北京','三亚','广州'], tags:['旅游','服务'], desc:'高端酒店和度假村管理，国际品牌机会多' },
  { title:'物流管理', industry:'物流/电商', salaryRange:[10000,22000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['上海','深圳','广州','杭州'], tags:['物流','电商'], desc:'跨境电商+智慧物流推动需求' },
  // === 特殊/小众 (6) ===
  { title:'珠宝鉴定师', industry:'奢侈品', salaryRange:[10000,30000], education:'本科+鉴定证', experience:'2-5年', outlook:'stable', cities:['北京','上海','深圳','香港'], tags:['鉴定','专业'], desc:'奢侈品和珠宝市场持续增长' },
  { title:'体育赛事管理', industry:'体育', salaryRange:[10000,25000], education:'本科及以上', experience:'1-5年', outlook:'rising', cities:['北京','上海','广州','深圳'], tags:['体育','管理'], desc:'职业联赛+全民健身推动体育产业' },
  { title:'殡葬服务管理', industry:'社会服务', salaryRange:[8000,20000], education:'专科/本科', experience:'0-3年', outlook:'stable', cities:['北京','上海','广州','武汉'], tags:['特殊','刚需'], desc:'老龄化推动需求，专业人才稀缺薪资较高' },
  { title:'葡萄酒酿造', industry:'饮品', salaryRange:[8000,20000], education:'本科及以上', experience:'0-5年', outlook:'rising', cities:['烟台','银川','秦皇岛','昆明'], tags:['饮品','专业'], desc:'中国葡萄酒产业发展，从种植到品鉴全链条' },
  { title:'宠物美容/训导师', industry:'宠物', salaryRange:[6000,20000], education:'专科/培训', experience:'0-3年', outlook:'rising', cities:['北京','上海','广州','成都'], tags:['宠物','服务'], desc:'宠物经济分支，门槛低但天花板高' },
  { title:'电竞运营/解说', industry:'游戏/传媒', salaryRange:[8000,30000], education:'专科/本科', experience:'0-3年', outlook:'rising', cities:['上海','北京','深圳','成都'], tags:['电竞','新职业'], desc:'电子竞技产业规范化，职业路径逐渐清晰' },
];

const INDUSTRIES = [...new Set(CAREERS.map(c => c.industry))];
const OUTLOOK_MAP = { rising: '📈 上升', stable: '➡️ 稳定', declining: '📉 下降' };

export function CareerExplorer() {
  useEffect(() => {
    try { localStorage.setItem('career-compass-explorer-used', 'true'); } catch { /* ignore */ }
  }, []);

  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);
  const [outlook, setOutlook] = useState<string | null>(null);
  const [minSalary, setMinSalary] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => CAREERS.filter(c => {
    if (search && !c.title.includes(search) && !c.tags.some(t => t.includes(search)) && !c.industry.includes(search)) return false;
    if (industry && c.industry !== industry) return false;
    if (outlook && c.outlook !== outlook) return false;
    if (minSalary && c.salaryRange[0] < minSalary) return false;
    return true;
  }), [search, industry, outlook, minSalary]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">职业探索</h2>
          <p className="mt-1 text-sm text-muted-foreground">{CAREERS.length} 个职业方向，筛选找到适合你的路</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-muted-foreground/40" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索职业、行业、标签..." className="flex-1 bg-transparent text-sm outline-none" />
              {search && <button onClick={() => setSearch('')}><X className="h-4 w-4 text-muted-foreground/40" /></button>}
            </div>
            <select value={minSalary || ''} onChange={e => setMinSalary(Number(e.target.value))}
              className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground outline-none">
              <option value="">薪资不限</option>
              <option value="10000">¥10k+</option><option value="15000">¥15k+</option><option value="20000">¥20k+</option><option value="25000">¥25k+</option>
            </select>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setIndustry(null)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!industry ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>全部行业</button>
            {INDUSTRIES.map(i => (
              <button key={i} onClick={() => setIndustry(i === industry ? null : i)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${i === industry ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>{i}</button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap mt-1">
            <span className="text-[11px] text-muted-foreground/50 self-center mr-1">前景</span>
            {(['rising', 'stable', 'declining'] as const).map(o => (
              <button key={o} onClick={() => setOutlook(outlook === o ? null : o)}
                className={`rounded-full px-2.5 py-1 text-xs transition-colors ${outlook === o ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {{rising:'📈 上升',stable:'➡️ 稳定',declining:'📉 下降'}[o]}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="text-xs text-muted-foreground mb-3">{filtered.length} 个结果</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((c, i) => (
            <div key={c.title}
              role="button" tabIndex={0}
              aria-expanded={expanded === c.title}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(expanded === c.title ? null : c.title); }}}
              className={`rounded-2xl border border-border/20 bg-card p-5 card-hover card-enter card-enter-${Math.min(i+1, 6)} cursor-pointer ${expanded === c.title ? 'ring-2 ring-primary/20' : ''}`}
              onClick={() => setExpanded(expanded === c.title ? null : c.title)}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-xs text-muted-foreground">{c.industry}</p>
                </div>
                <span className="text-xs font-medium text-primary">{OUTLOOK_MAP[c.outlook]}</span>
              </div>
              {expanded === c.title && (
                <div className="mt-3 pt-3 border-t border-border/10 space-y-2">
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1 text-[10px]"><GraduationCap className="h-3 w-3 text-muted-foreground/50"/>{c.education}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-secondary/60 px-2 py-1 text-[10px]"><Clock className="h-3 w-3 text-muted-foreground/50"/>{c.experience}</span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">¥{c.salaryRange[0]/1000}k-{c.salaryRange[1]/1000}k</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.cities.map(city => (<span key={city} className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/70"><MapPin className="h-2.5 w-2.5"/>{city}</span>))}
                  </div>
                </div>
              )}
              {expanded !== c.title && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {c.tags.map(t => (<span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{t}</span>))}
                  <span className="ml-auto text-[10px] font-medium text-primary">¥{c.salaryRange[0]/1000}k-{c.salaryRange[1]/1000}k</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
