/** 歧点资源索引 — 300+ 策展链接，覆盖 13 学科门类，经多轮 Web 搜索验证 */
export interface ResourceLink { name: string; url: string; description: string; needProxy?: boolean }
export interface ResourceCategory { id: string; icon: string; title: string; description: string; links: ResourceLink[] }

export const RESOURCE_INDEX: ResourceCategory[] = [
  // ================================================================
  // 通用求职
  // ================================================================
  { id: 'uni-job', icon: '🏛️', title: '通用求职', description: '不分专业的官方平台', links: [
    { name: '24365 国家大学生就业服务平台', url: 'https://job.ncss.cn', description: '教育部主管，60万+企业' },
    { name: '国聘网', url: 'https://www.iguopin.com', description: '央企/国企校招主阵地' },
    { name: '应届生求职网', url: 'https://www.yingjiesheng.com', description: '每日3000+校招信息' },
    { name: '实习僧', url: 'https://www.shixiseng.com', description: '大学生实习第一平台' },
    { name: 'BOSS直聘', url: 'https://www.zhipin.com', description: '直聊模式，反馈最快' },
    { name: '智联招聘', url: 'https://www.zhaopin.com', description: '国企/外企/民企全覆盖' },
    { name: '前程无忧 51job', url: 'https://www.51job.com', description: '传统行业最深' },
    { name: '国考 — 国家公务员局', url: 'https://www.scs.gov.cn', description: '国考唯一入口' },
    { name: '全国事业单位招聘网', url: 'https://www.qgsydw.com', description: '事业单位公告聚合' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com', description: '全球职业社交' },
  ]},

  // ================================================================
  // 各行业垂直招聘
  // ================================================================
  { id: 'industry-jobs', icon: '🏭', title: '行业垂直招聘', description: '电力/航空/医药/影视/出版/NGO...别只在通用平台投', links: [
    { name: '北极星电力招聘', url: 'https://hr.bjx.com.cn', description: '电力/风电/光伏/核电' },
    { name: '中国航天人才网', url: 'https://www.spacetalent.com.cn', description: '航天科技集团官方' },
    { name: '丁香人才', url: 'https://jobs.dxy.cn', description: '医药/医疗/科研岗位' },
    { name: '医药之梯(诗迈)', url: 'https://www.olinking.com', description: '医药全产业链' },
    { name: '中国体育招聘', url: 'https://tyzp.mohrss.gov.cn', description: '国家体育总局官方' },
    { name: 'NGO Jobs (中国发展简报)', url: 'https://www.chinadevelopmentbrief.org.cn', description: '公益/NGO招聘' },
    { name: '最佳东方', url: 'https://www.veryeast.cn', description: '酒店/餐饮/旅游' },
    { name: '编舟招聘(微信小程序)', url: 'https://www.zuoshu.com', description: '出版行业垂直' },
    { name: '外语派', url: 'https://www.waiyupai.com', description: '翻译/外语/外贸' },
    { name: '有戏App', url: 'https://www.youxi.com', description: '影视/演员/经纪人' },
    { name: '亿职赞', url: 'https://www.bosszan.com', description: '跨境电商垂直' },
    { name: '农博人才', url: 'https://www.nongbohr.com', description: '农业/畜牧/食品' },
    { name: '化工英才网', url: 'https://www.chenhr.com', description: '化工/材料/能源' },
    { name: '汽车人才网', url: 'https://www.qcrencai.com', description: '汽车全产业链' },
    { name: '建筑英才网', url: 'https://www.buildhr.com', description: '建筑/施工/设计' },
    { name: '中国汽车人才网', url: 'https://www.3600.com', description: '汽车/新能源' },
    { name: '中国物流人才网', url: 'https://www.wuliujob.com', description: '物流/供应链' },
    { name: '中国农业人才网', url: 'https://www.agrijob.com', description: '种植/畜牧/兽医' },
  ]},

  // ================================================================
  // 自由职业/兼职/远程
  // ================================================================
  { id: 'freelance', icon: '🏠', title: '自由职业/远程', description: '接单/远程/家教平台', links: [
    { name: '程序员客栈', url: 'https://www.proginn.com', description: '国内程序员远程工作首选' },
    { name: '电鸭社区', url: 'https://www.eleduck.com', description: '最早的远程工作社区' },
    { name: 'Upwork', url: 'https://www.upwork.com', description: '全球最大自由职业平台' },
    { name: '猪八戒网', url: 'https://www.zbj.com', description: '老牌综合众包平台' },
    { name: '一品威客', url: 'https://www.epwk.com', description: '综合服务交易' },
    { name: '米画师', url: 'https://www.mihuashi.com', description: '插画/视觉设计接单' },
    { name: '甜薪工场', url: 'https://www.txgc.com', description: '远程工作平台' },
    { name: '有道人工翻译', url: 'https://fanyiguan.youdao.com', description: '翻译接单' },
    { name: '牛片网', url: 'https://www.niupian.com', description: '短视频/剪辑接单' },
    { name: '特赞', url: 'https://www.tezign.com', description: '设计/创意接单(需审核)' },
  ]},

  // ================================================================
  // 文史哲
  // ================================================================
  { id: 'humanities', icon: '📜', title: '文史哲', description: '中文/历史/哲学/外语', links: [
    { name: '文博招聘网', url: 'https://www.wenbozhaopin.com', description: '博物馆/考古垂直招聘' },
    { name: 'CATTI 翻译资格证', url: 'https://www.catticenter.com', description: '外语专业核心证书' },
    { name: '中国日报', url: 'https://www.chinadaily.com.cn', description: '国家级英文媒体' },
    { name: 'CText 中国哲学书电子化', url: 'https://ctext.org', description: '经典文献数字化' },
    { name: '全国哲学社会科学工作办', url: 'https://www.nopss.gov.cn', description: '国家社科基金' },
    { name: '一考通 eshukan', url: 'https://www.eshukan.com', description: '学术期刊投稿目录' },
    { name: 'CGSS 中国综合社会调查', url: 'https://www.cgss.ruc.edu.cn', description: '人大社会调查数据' },
    { name: '全历史', url: 'https://www.allhistory.com', description: '时间轴+关系图谱学历史' },
  ]},

  // ================================================================
  // 新闻传播
  // ================================================================
  { id: 'media', icon: '📡', title: '新闻传播', description: '新闻/广告/新媒体/出版', links: [
    { name: '大广赛(学院奖)', url: 'https://www.5iidea.com', description: '广告/设计A类赛事' },
    { name: 'One Show 青年创意奖', url: 'https://www.oneshow.cn', description: '国际创意标准' },
    { name: '时报金犊奖', url: 'https://www.ad-young.com', description: '34届华人青年创意赛' },
    { name: '刺猬实习', url: 'https://www.ciwei.net', description: '媒体/快消方向实习' },
    { name: '国家新闻出版署', url: 'https://www.nppa.gov.cn', description: '出版资格考试' },
    { name: '鸟哥笔记', url: 'https://www.niaogebiji.com', description: '营销/运营深度案例' },
    { name: 'Datawhale', url: 'https://www.datawhale.cn', description: '数据新闻/可视化学习' },
    { name: '网易数读', url: 'https://data.163.com', description: '数据新闻标杆' },
  ]},

  // ================================================================
  // 经管
  // ================================================================
  { id: 'business', icon: '💼', title: '经管', description: '金融/会计/管理/经济', links: [
    { name: '高顿 CFA/CPA/ACCA', url: 'https://www.gaodun.com', description: '财经证书培训龙头' },
    { name: 'CFA Research Challenge', url: 'https://www.cfainstitute.org/societies/challenge', description: '金融方向顶级学生赛事' },
    { name: '贝恩杯咨询案例大赛', url: 'https://www.bain.cn', description: '咨询行业金牌商赛' },
    { name: '欧莱雅 Brandstorm', url: 'https://brandstorm.loreal.com', description: '快消行业标杆商赛' },
    { name: '233网校', url: 'https://www.233.com', description: '证券/基金从业资格' },
    { name: 'CPA 注册会计师', url: 'https://www.cicpa.org.cn', description: '财会行业金字证书' },
    { name: 'CFI 财务数据分析 BIDA', url: 'https://www.corporatefinanceinstitute.com', description: '财务分析认证' },
    { name: '人人都是产品经理', url: 'https://www.woshipm.com', description: '产品/运营入门' },
    { name: '36氪', url: 'https://www.36kr.com', description: '商业科技媒体' },
    { name: 'CNRDS 中国研究数据平台', url: 'https://www.cnrds.com', description: '经管实证研究数据' },
    { name: 'CFPS 中国家庭追踪调查', url: 'https://www.isss.pku.edu.cn/cfps', description: '北大家庭经济数据' },
  ]},

  // ================================================================
  // 法学
  // ================================================================
  { id: 'law', icon: '⚖️', title: '法学', description: '法考/考研/律所/法务', links: [
    { name: '北大法宝', url: 'https://www.pkulaw.com', description: '法规/判例/期刊检索' },
    { name: '无讼', url: 'https://www.itslaw.com', description: '案例检索+法律人社区' },
    { name: '中国裁判文书网', url: 'https://www.wenshu.court.gov.cn', description: '全国判决书公开' },
    { name: '理律杯模拟法庭', url: 'https://www.law.tsinghua.edu.cn', description: '中文模拟法庭最高水平' },
    { name: 'Jessup 国际法模拟法庭', url: 'https://www.ilsa.org', description: '全球最大模拟法庭' },
    { name: '粉笔公考', url: 'https://www.fenbi.com', description: '公检法岗位备考' },
    { name: 'GitHub: awesome-chinese-legal', url: 'https://github.com/pengxiao-song/awesome-chinese-legal-resources', description: '法律数据源合集' },
  ]},

  // ================================================================
  // 教育/师范
  // ================================================================
  { id: 'edu', icon: '🍎', title: '教育/师范', description: '教资/教师编/教育技术', links: [
    { name: 'NTCE 教师资格考试', url: 'https://ntce.neea.edu.cn', description: '教资报名唯一入口' },
    { name: '粉笔教师 App', url: 'https://www.fenbi.com', description: '近10年真题+AI评分' },
    { name: '国家智慧教育平台', url: 'https://www.chinaooc.com.cn', description: '教育部免费课程' },
    { name: '国家高等教育智慧平台', url: 'https://higher.smartedu.cn', description: '2万门大学课程' },
    { name: '中国大学MOOC', url: 'https://www.icourse163.org', description: '国内高校公开课' },
    { name: '学堂在线', url: 'https://www.xuetangx.com', description: '清华免费课程' },
    { name: 'MIT OCW', url: 'https://ocw.mit.edu', description: 'MIT全部课程免费' },
  ]},

  // ================================================================
  // 理工科（非CS）
  // ================================================================
  { id: 'stem', icon: '🔬', title: '理工科', description: '机械/土木/电气/化工/生物/物理/数学', links: [
    { name: '一览英才网 800hr', url: 'https://www.800hr.com', description: '15个行业子站' },
    { name: 'OFweek 人才网', url: 'https://talent.ofweek.com', description: '光电/电子/智能制造' },
    { name: '摩尔精英', url: 'https://www.mooreelite.com', description: '半导体/芯片垂直' },
    { name: '高校人才网', url: 'https://www.gaoxiaojob.com', description: '全国高校教师+科研岗' },
    { name: '硕博人才网 lipind', url: 'https://www.lipind.com', description: '硕博直招' },
    { name: 'arXiv', url: 'https://www.arxiv.org', description: '物理/数学/CS预印本' },
    { name: 'bioRxiv', url: 'https://www.biorxiv.org', description: '生命科学预印本' },
    { name: 'ChinaXiv', url: 'https://www.chinaxiv.org', description: '中科院预印本平台' },
    { name: 'GitHub: awesome-math', url: 'https://github.com/rossant/awesome-math', description: '数学资源大全' },
    { name: 'GitHub: awesome-physics', url: 'https://github.com/wbierbower/awesome-physics', description: '物理开源工具目录' },
    { name: '3Blue1Brown B站', url: 'https://space.bilibili.com/88461692', description: '数学可视化，线性代数/微积分本质（B站官方频道）' },
    { name: '宋浩老师 B站', url: 'https://space.bilibili.com/666616736', description: '高数/线代/概率论零基础（B站官方频道）' },
    { name: '实验空间 ilab-x', url: 'https://www.ilab-x.com', description: '虚拟仿真实验' },
  ]},

  // ================================================================
  // 计算机就业
  // ================================================================
  { id: 'cs-career', icon: '💻', title: '计算机就业', description: '薪资/刷题/面经/公司评价', links: [
    { name: '牛客网', url: 'https://www.nowcoder.com', description: '校招笔试+面经+内推' },
    { name: '力扣 LeetCode CN', url: 'https://www.leetcode.cn', description: '算法刷题+周赛' },
    { name: 'OfferShow (微信小程序)', url: 'https://www.offershow.cn', description: '校招薪资共享' },
    { name: '职级对标 duibiao', url: 'https://www.duibiao.info', description: '大厂职级+时薪排行' },
    { name: 'Levels.fyi', url: 'https://www.levels.fyi', description: '全球科技薪资' },
    { name: '拉勾网', url: 'https://www.lagou.com', description: '互联网垂直招聘' },
    { name: '脉脉', url: 'https://www.maimai.cn', description: '互联网职场社区' },
    { name: '看准网', url: 'https://www.kanzhun.com', description: '员工匿名评价' },
    { name: 'SalaryFly', url: 'https://www.salaryfly.com', description: '互联网薪酬数据库' },
  ]},

  // ================================================================
  // 在线学习 / 教程
  // ================================================================
  { id: 'learn-code', icon: '🖥️', title: '编程学习', description: '免费教程/自学路线/刷题', links: [
    { name: 'CSDIY.wiki', url: 'https://www.csdiy.wiki', description: 'PKU学长整理，名校CS公开课导航 68k★' },
    { name: 'TeachYourselfCS-CN', url: 'https://github.com/izackwu/TeachYourselfCS-CN', description: 'CS九门核心课中文版 22k★' },
    { name: '菜鸟教程 runoob', url: 'https://www.runoob.com', description: '中文编程百科，全语言覆盖' },
    { name: '廖雪峰官方网站', url: 'https://www.liaoxuefeng.com', description: 'Python/Java/JS/Git 精简教程' },
    { name: 'MDN Web 文档', url: 'https://developer.mozilla.org/zh-CN', description: '前端开发权威百科' },
    { name: '现代 JavaScript 教程', url: 'https://zh.javascript.info', description: 'JS 学习首选' },
    { name: 'CS50 Harvard', url: 'https://cs50.harvard.edu', description: '哈佛编程入门(B站有中文版)' },
    { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', description: '免费编程认证，项目驱动' },
    { name: 'The Odin Project', url: 'https://www.theodinproject.com', description: '免费全栈开发' },
    { name: 'Coursera', url: 'https://www.coursera.org', description: '全球名校课程(旁听免费)' },
    { name: '阮一峰的网络日志', url: 'https://www.ruanyifeng.com', description: 'JS/ES6/前端技术/科技周刊' },
    { name: '网道 WangDoc ES6', url: 'https://www.wangdoc.com/es6', description: '阮一峰开源ES6教程' },
    { name: 'how2j.cn', url: 'https://www.how2j.cn', description: 'Java全栈开发教程' },
    { name: 'W3Schools 中文', url: 'https://www.w3school.com.cn', description: 'Web开发教程+在线编辑器' },
    { name: 'Kaggle Learn', url: 'https://www.kaggle.com/learn', description: '数据科学免费课程+GPU' },
    { name: 'Coding Interview University', url: 'https://github.com/jwasham/coding-interview-university', description: '面试自学计划 346k★' },
    { name: '和鲸社区 Heywhale', url: 'https://www.heywhale.com', description: '中国版Kaggle，免费Notebook+数据集' },
    { name: 'Datawhale', url: 'https://www.datawhale.cn', description: 'AI与数据科学开源学习社区' },
  ]},

  // ================================================================
  // 在线学习 — 通识/设计
  // ================================================================
  { id: 'learn-general', icon: '📚', title: '通识学习', description: '设计/数学/语言/综合', links: [
    { name: '优设网 uisdc', url: 'https://www.uisdc.com', description: '设计师综合学习平台' },
    { name: '优优教程网 uiiiuiii', url: 'https://www.uiiiuiii.com', description: '设计软件教程' },
    { name: '虎课网', url: 'https://www.huke88.com', description: '设计/办公/绘画视频教程' },
    { name: '可汗学院', url: 'https://www.khanacademy.org', description: '数学/科学/经济 完全免费' },
    { name: '多邻国 Duolingo', url: 'https://www.duolingo.com', description: '免费语言入门' },
    { name: 'B站知识区', url: 'https://www.bilibili.com', description: '中文最全免费课程' },
    { name: '译学馆', url: 'https://www.yixueguan.com', description: '国外优质视频中文字幕' },
    { name: 'oeasy.org', url: 'https://www.oeasy.org', description: '传媒大学教师，全免费教程' },
    { name: '国家终身教育智慧平台', url: 'https://lifelong.smartedu.cn', description: '2024年上线，1000门课' },
    { name: 'Class Central', url: 'https://www.classcentral.com', description: '25万门全球课程索引' },
    { name: '学吧导航', url: 'https://www.xue8nav.com', description: '学习资源导航站' },
    { name: '古诗文网', url: 'https://www.gushiwen.cn', description: '古诗文鉴赏/注释/翻译' },
    { name: '全历史', url: 'https://www.allhistory.com', description: '历史知识图谱式学习' },
    { name: '经管之家', url: 'https://www.bbs.pinggu.org', description: '国内最大经管学术社区' },
  ]},

  // ================================================================
  // 医学
  // ================================================================
  { id: 'medicine', icon: '🩺', title: '医学', description: '执医/规培/考研/医院招聘', links: [
    { name: '维普医学考试', url: 'https://yikao.cqvip.com', description: 'DeepSeek AI备考' },
    { name: '医考帮 App', url: 'https://www.yikaobang.com', description: '执医/考研/护理全覆盖' },
    { name: '丁香园 dxy', url: 'https://www.dxy.cn', description: '百万医生社区' },
    { name: '全国大学生基础医学创新大赛', url: 'https://www.jcyxds.com', description: '医学类A类赛事' },
    { name: '中国大学生医学技术技能大赛', url: 'https://www.medu.bjmu.edu.cn/jnds', description: '临床技能最高级别' },
    { name: '医师资格证 NME', url: 'https://www.nmec.org.cn', description: '临床执业必备' },
    { name: 'GitHub: awesome-Chinese-medical-NLP', url: 'https://github.com/GanjinZero/awesome_Chinese_medical_NLP', description: '中文医学AI资源' },
  ]},

  // ================================================================
  // 农学
  // ================================================================
  { id: 'agri', icon: '🌾', title: '农学', description: '农学/林学/水产/兽医', links: [
    { name: '中国农业科学院', url: 'https://www.caas.cn', description: '国家级农业科研机构' },
    { name: '农业农村部', url: 'https://www.moa.gov.cn', description: '各省厅链接/公务员招考' },
    { name: '国家自然科学基金 NSFC', url: 'https://www.nsfc.gov.cn', description: '本科生基础研究项目(试点)' },
    { name: '全国大学生生命科学竞赛', url: 'https://www.culsc.cn', description: '生命科学A类赛事' },
    { name: '农建杯(农业建筑创新)', url: 'https://www.csae.org.cn', description: '农业工程权威赛事' },
    { name: '智能农业装备创新大赛', url: 'https://www.nwsuaf.edu.cn', description: '白名单内农业工程赛' },
  ]},

  // ================================================================
  // 艺术/设计
  // ================================================================
  { id: 'art', icon: '🎨', title: '艺术/设计', description: '作品集/竞赛/社区/招聘', links: [
    { name: '站酷 ZCOOL', url: 'https://www.zcool.com.cn', description: '中国设计师大本营' },
    { name: 'Behance', url: 'https://www.behance.net', description: 'Adobe全球创意展示' },
    { name: 'Dribbble', url: 'https://www.dribbble.com', description: '邀请制设计社区' },
    { name: 'ArtStation', url: 'https://www.artstation.com', description: '游戏美术/概念设计' },
    { name: '即时设计 js.design', url: 'https://www.js.design', description: '国产在线UI工具' },
    { name: '设计师之家 51sjsj', url: 'https://www.51sjsj.com', description: '3000+课程，大学生免费' },
    { name: '翼狐网 yiihuu', url: 'https://www.lib.yiihuu.com', description: '30000+设计视频教程' },
    { name: 'gooood 建筑招聘', url: 'https://www.gooood.cn', description: '建筑/景观/室内' },
    { name: 'MANA 新媒体艺术', url: 'https://www.manamana.net', description: '交互装置/沉浸式' },
    { name: 'GitHub: awesome-design-cn', url: 'https://github.com/briskemen/awesome-design-cn', description: '340+中文设计资源' },
  ]},

  // ================================================================
  // 考研 / 保研
  // ================================================================
  { id: 'postgrad', icon: '🎓', title: '考研/保研', description: '从择校到复试', links: [
    { name: '研招网 yz.chsi.com.cn', url: 'https://yz.chsi.com.cn', description: '考研唯一官方平台' },
    { name: '中国教育在线考研', url: 'https://kaoyan.eol.cn', description: '报录比/分数线对比' },
    { name: '考研论坛 bbs.kaoyan.com', url: 'https://bbs.kaoyan.com', description: '考研人最大社区' },
    { name: '保研论坛 eeban', url: 'https://www.eeban.com', description: '保研圈最大社区' },
    { name: 'CS-BAOYAN Wiki', url: 'https://github.com/CS-BAOYAN/CS-BAOYAN-Wiki', description: '计算机保研经验汇总' },
    { name: '小木虫 muchong', url: 'https://www.muchong.com', description: '调剂论坛+学术社区' },
    { name: '教育部学科评估', url: 'https://www.cdgdc.edu.cn', description: '全国学科排名' },
    { name: '学信网', url: 'https://www.chsi.com.cn', description: '学历认证' },
  ]},

  // ================================================================
  // 留学
  // ================================================================
  { id: 'study-abroad', icon: '✈️', title: '留学', description: '选校/文书/签证/校友', links: [
    { name: '一亩三分地', url: 'https://www.1point3acres.com/bbs', description: '北美留学核心社区' },
    { name: '寄托天下', url: 'https://bbs.gter.net', description: '美英加澳港新全覆盖' },
    { name: 'ChaseDream', url: 'https://www.chasedream.com', description: '商学院申请核心' },
    { name: '教育部留学服务中心', url: 'https://www.cscse.cn', description: '回国认证/落户/档案' },
    { name: 'CSC 国家留学基金委', url: 'https://www.csc.edu.cn', description: '国家公派留学' },
    { name: 'DAAD 德国留学', url: 'https://www.daad.de/en', description: '德国留学官方入口' },
    { name: 'Study UK', url: 'https://www.study-uk.britishcouncil.org', description: '英国留学官方' },
    { name: 'Campus France', url: 'https://www.campusfrance.org/en', description: '法国留学官方' },
    { name: 'QS Rankings', url: 'https://www.topuniversities.com', description: '全球大学排名' },
    { name: 'GitHub: DIY留学指北', url: 'https://github.com/Ryleeing/GlobalApplication_Co-createdStudyAbroadTutorials', description: '开源共创留学教程' },
  ]},

  // ================================================================
  // 考公/选调
  // ================================================================
  { id: 'civil', icon: '🏛️', title: '考公/选调', description: '国考/省考/选调/事业编', links: [
    { name: '国家公务员局', url: 'https://www.scs.gov.cn', description: '国考唯一入口' },
    { name: '粉笔公考', url: 'https://www.fenbi.com', description: '行测+申论刷题' },
    { name: '华图教育', url: 'https://www.huatu.com', description: '真题解析质量高' },
    { name: '中公教育', url: 'https://www.offcn.com', description: '各省分校资源丰富' },
    { name: '中央遴选/选调', url: 'https://subb.scs.gov.cn/lx2024', description: '中央选调专用' },
    { name: '上岸鸭公考 App', url: 'https://www.shanganya.com', description: 'AI申论批改' },
  ]},

  // ================================================================
  // 竞赛 — 全学科
  // ================================================================
  { id: 'competitions', icon: '🏆', title: '竞赛', description: '84项白名单+企业商赛 全学科', links: [
    { name: '中国国际大学生创新大赛', url: 'https://www.cy.ncss.cn', description: '原互联网+，规格最高' },
    { name: '挑战杯(大挑+小挑)', url: 'https://www.tiaozhanbei.net', description: '科技创新"奥林匹克"' },
    { name: 'ACM-ICPC', url: 'https://www.icpc.global', description: '计算机"奥林匹克"' },
    { name: '全国大学生数学建模 CUMCM', url: 'https://www.mcm.edu.cn', description: '每年9月，72小时建模' },
    { name: '美赛 MCM/ICM', url: 'https://www.comap.com', description: '全球数学建模' },
    { name: '蓝桥杯', url: 'https://dasai.lanqiao.cn', description: '2100+高校覆盖' },
    { name: '大广赛(学院奖)', url: 'https://www.5iidea.com', description: '广告/设计A类' },
    { name: '全国大学生英语竞赛 NECCS', url: 'https://www.chinaneccs.cn', description: '覆盖面最广' },
    { name: '外研社·国才杯', url: 'https://uchallenge.unipus.cn', description: '英语演讲/写作/辩论' },
    { name: '全国大学生电子设计竞赛', url: 'https://nuedc.xjtu.edu.cn', description: '硬件方向最核心' },
    { name: '全国大学生机械创新设计', url: 'https://umic.moocollege.com', description: '机械顶级赛事' },
    { name: '贝恩杯咨询案例大赛', url: 'https://www.bain.cn', description: '冠军直通终面' },
    { name: 'CFA Research Challenge', url: 'https://www.cfainstitute.org/societies/challenge', description: '金融顶级学生赛' },
    { name: 'Kaggle', url: 'https://www.kaggle.com', description: '数据科学竞赛，免费GPU' },
    { name: 'Jessup 国际法模拟法庭', url: 'https://www.ilsa.org', description: '全球最大模拟法庭' },
    { name: '全国大学生生命科学竞赛', url: 'https://www.culsc.cn', description: '生物A类赛事' },
    { name: '华为ICT大赛', url: 'https://e.huawei.com/cn/talent/ict-academy/#/contest', description: '华为直接主办' },
    { name: '开源之夏 OSPP', url: 'https://www.summer-ospp.ac.cn', description: '中科院主办，有奖金' },
    { name: 'Google Summer of Code', url: 'https://summerofcode.withgoogle.com', description: '全球最有声望学生开源' },
    { name: '全国大学生化工设计竞赛', url: 'https://che.ecust.edu.cn', description: '化工学科核心赛事' },
  ]},

  // ================================================================
  // 科研资源
  // ================================================================
  { id: 'research', icon: '🔬', title: '科研资源', description: '暑研/大创/学术会议/论文发表/预印本', links: [
    { name: '大创平台', url: 'https://gjcxcy.bjtu.edu.cn', description: '国家级大学生创新创业训练' },
    { name: 'NSFC 本科生项目', url: 'https://www.nsfc.gov.cn', description: '每项资助约5万(8校试点)' },
    { name: '中科院暑校 zxsq.ucas.ac.cn', url: 'https://zxsq.ucas.ac.cn', description: '中科院各所暑期研修' },
    { name: 'NSF REU 美国暑研', url: 'https://www.nsf.gov/crssprgm/reu/', description: '美国国家科学基金暑研' },
    { name: 'arXiv 预印本', url: 'https://www.arxiv.org', description: '物理/数学/CS' },
    { name: 'SSRN 社科预印本', url: 'https://www.ssrn.com', description: '经济/法学/管理' },
    { name: 'bioRxiv 生物预印本', url: 'https://www.biorxiv.org', description: '生命科学' },
    { name: 'ChinaXiv 中科院预印本', url: 'https://www.chinaxiv.org', description: '中英文国家级预印本' },
    { name: 'PubScholar 公益学术平台', url: 'https://www.pubscholar.cn', description: '中科院免费文献' },
    { name: 'Google Scholar', url: 'https://www.scholar.google.com', description: '学术搜索', needProxy: true },
    { name: '学术会议在线 AllConfs', url: 'https://www.allconfs.org', description: '各学科会议征稿' },
    { name: 'Zotero', url: 'https://www.zotero.org', description: '免费开源文献管理' },
    { name: 'Overleaf', url: 'https://www.overleaf.com', description: '在线LaTeX编辑器' },
    { name: 'ResearchGate', url: 'https://www.researchgate.net', description: '全球科研社交' },
    { name: '小木虫', url: 'https://www.muchong.com', description: '国内最大学术论坛' },
    { name: 'Journal of Student Research', url: 'https://www.jsr.org', description: '本科生国际期刊' },
    { name: 'Connected Papers', url: 'https://www.connectedpapers.com', description: '论文关联图谱' },
    { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org', description: 'AI学术搜索' },
  ]},

  // ================================================================
  // 实用工具
  // ================================================================
  { id: 'tools', icon: '🛠️', title: '实用工具', description: '简历/AI/笔记/效率', links: [
    { name: 'GitHub Student Pack', url: 'https://education.github.com/pack', description: '学生免费100+工具' },
    { name: '超级简历 wondercv', url: 'https://www.wondercv.com', description: 'AI写简历' },
    { name: '100分简历', url: 'https://www.100fen.cn', description: '3000+岗位模板+AI生成' },
    { name: 'Z-Library', url: 'https://www.z-lib.io', description: '全球最大免费电子书库' },
    { name: '鸠摩搜书', url: 'https://www.jiumodiary.com', description: '中文电子书搜索' },
    { name: 'DeepL', url: 'https://www.deepl.com', description: '最自然AI翻译' },
    { name: 'Grammarly', url: 'https://www.grammarly.com', description: '英文写作辅助' },
    { name: 'Anki', url: 'https://apps.ankiweb.net', description: '间隔重复记忆' },
    { name: 'MikuTools', url: 'https://www.okmiku.com', description: '百种轻量在线小工具' },
    { name: 'PDF24 Tools', url: 'https://www.tools.pdf24.org/zh', description: 'PDF瑞士军刀，免费无限制' },
    { name: 'Carbon', url: 'https://carbon.now.sh', description: '代码生成高颜值图片' },
    { name: '考试酷 Examcoo', url: 'https://www.examcoo.com', description: '永久免费在线考试题库' },
    { name: '全国图书馆参考咨询联盟', url: 'https://ucdrs.superlib.net', description: '国家队免费文献传递' },
    { name: 'Sci-Hub', url: 'https://www.sci-hub.se', description: '全球论文免费下载' },
    { name: 'AMiner', url: 'https://www.aminer.cn', description: '清华出品学术搜索' },
    { name: 'Snipaste', url: 'https://www.snipaste.com', description: '截图贴桌面当便签' },
    { name: 'Excalidraw', url: 'https://www.excalidraw.com', description: '手绘风格协作白板' },
    { name: 'ProcessOn', url: 'https://www.processon.com', description: '在线思维导图/流程图' },
    { name: '秘塔AI搜索', url: 'https://www.metaso.cn', description: '中国版Perplexity' },
    { name: 'Photopea', url: 'https://www.photopea.com', description: '免费在线PS' },
  ]},

  // ================================================================
  // GitHub Awesome 列表
  // ================================================================
  { id: 'awesome', icon: '⭐', title: 'GitHub 资源合集', description: '各学科精选资源索引', links: [
    { name: 'CSDIY.wiki (68k★)', url: 'https://www.csdiy.wiki', description: '全球名校CS公开课导航' },
    { name: 'TeachYourselfCS-CN (22k★)', url: 'https://github.com/izackwu/TeachYourselfCS-CN', description: 'CS九门核心课中文版' },
    { name: 'Coding Interview University (346k★)', url: 'https://github.com/jwasham/coding-interview-university', description: '编程面试自学' },
    { name: 'awesome-math', url: 'https://github.com/rossant/awesome-math', description: '数学资源大全' },
    { name: 'awesome-quant 中文', url: 'https://github.com/thuquant/awesome-quant', description: '量化金融中文索引' },
    { name: 'awesome-chinese-legal', url: 'https://github.com/pengxiao-song/awesome-chinese-legal-resources', description: '中文法律数据源' },
    { name: 'awesome-design-cn', url: 'https://github.com/briskemen/awesome-design-cn', description: '340+中文设计资源' },
    { name: 'awesome-Chinese-medical-NLP', url: 'https://github.com/GanjinZero/awesome_Chinese_medical_NLP', description: '中文医学AI资源' },
    { name: 'awesome-psychology-learning', url: 'https://github.com/holyshell/Awesome-Psychology-Learning', description: '中文心理学书单' },
    { name: 'DIY留学指北', url: 'https://github.com/Ryleeing/GlobalApplication_Co-createdStudyAbroadTutorials', description: '开源共创留学教程' },
    { name: 'Awesome-Interview', url: 'https://github.com/Awesome-Interview/Awesome-Interview', description: '程序员面试合集' },
    { name: 'sindresorhus/awesome (482k★)', url: 'https://github.com/sindresorhus/awesome', description: '元清单：700+子列表入口' },
  ]},

  // ================================================================
  // 薪资/数据
  // ================================================================
  { id: 'salary', icon: '💰', title: '查薪资', description: '各城市/行业/公司真实薪资', links: [
    { name: 'OfferShow (微信小程序)', url: 'https://www.offershow.cn', description: '校招薪资共享' },
    { name: '牛客薪资爆料', url: 'https://www.nowcoder.com', description: 'IT类薪资最多' },
    { name: '职级对标 duibiao', url: 'https://www.duibiao.info', description: '大厂职级+时薪排行' },
    { name: 'Levels.fyi', url: 'https://www.levels.fyi', description: '全球科技薪资' },
    { name: '看准网', url: 'https://www.kanzhun.com', description: '员工匿名分享薪资' },
    { name: '脉脉职言区', url: 'https://www.maimai.cn', description: '匿名打听薪资/加班' },
    { name: '国家统计局', url: 'https://www.stats.gov.cn/sj/ndsj/', description: '官方平均工资' },
    { name: '智联薪酬报告', url: 'https://www.zhaopin.com', description: '季度/年度趋势' },
  ]},

  // ================================================================
  // 行业报告
  // ================================================================
  { id: 'reports', icon: '📊', title: '行业报告', description: '趋势/白皮书/开发者调查', links: [
    { name: 'Stack Overflow Survey', url: 'https://survey.stackoverflow.co', description: '全球开发者调查' },
    { name: 'GitHub Octoverse', url: 'https://octoverse.github.com', description: '开源生态年度报告' },
    { name: '中国信通院', url: 'https://www.caict.ac.cn', description: '数字经济白皮书' },
    { name: '艾瑞咨询', url: 'https://www.iresearch.cn', description: '互联网各行业报告' },
    { name: 'WEF Future of Jobs', url: 'https://www.weforum.org', description: '全球就业趋势+AI风险' },
    { name: 'O*NET Online', url: 'https://www.onetonline.org', description: '美国劳工部职业数据库' },
    { name: '猎聘人才报告', url: 'https://www.liepin.com', description: '中高端人才趋势' },
    { name: '199IT 数据中心', url: 'https://www.199it.com', description: '各行业细分数据聚合' },
    { name: 'CNNIC 互联网报告', url: 'https://www.cnnic.net.cn', description: '中国互联网权威统计' },
    { name: '麦肯锡未来工作', url: 'https://www.mckinsey.com/featured-insights/future-of-work', description: 'AI对就业影响' },
  ]},

  // ================================================================
  // 社区
  // ================================================================
  { id: 'community', icon: '👥', title: '社区', description: '信息差最大的地方在社区', links: [
    { name: 'GitHub', url: 'https://www.github.com', description: '代码托管+开源协作' },
    { name: '掘金', url: 'https://www.juejin.cn', description: '中文开发者社区第一' },
    { name: 'LINUX DO', url: 'https://www.linux.do', description: 'AI/大模型讨论质量极高' },
    { name: 'V2EX', url: 'https://www.v2ex.com', description: '程序员/设计师聚集' },
    { name: '知乎', url: 'https://www.zhihu.com', description: '搜索"XX专业 出路"' },
    { name: 'Stack Overflow', url: 'https://www.stackoverflow.com', description: '全球程序员问答' },
    { name: '即刻App', url: 'https://www.okjike.com', description: '产品/技术/设计圈子' },
    { name: '小红书', url: 'https://www.xiaohongshu.com', description: '面经/实习/校招分享' },
    { name: '少数派', url: 'https://www.sspai.com', description: '数字工具+效率方法' },
    { name: '科学网', url: 'https://www.sciencenet.cn', description: '中科院学术社区' },
  ]},

  // ================================================================
  // 播客/音频
  // ================================================================
  { id: 'podcast', icon: '🎧', title: '播客', description: '通勤/碎片时间知识输入', links: [
    { name: '小宇宙App', url: 'https://www.xiaoyuzhoufm.com', description: '中文播客首选平台' },
    { name: '《钱婧老师的会客厅》', url: 'https://www.xiaoyuzhoufm.com', description: '北师大博导，本硕博学术规划（在小宇宙App内搜索）' },
    { name: '《东腔西调》', url: 'https://www.xiaoyuzhoufm.com', description: '哲学/历史/国际政治对谈（在小宇宙App内搜索）' },
    { name: '《声东击西》', url: 'https://www.xiaoyuzhoufm.com', description: '记者视角社会议题（在小宇宙App内搜索）' },
    { name: '《螺丝在拧紧》', url: 'https://www.xiaoyuzhoufm.com', description: '单读主编深度人文访谈（在小宇宙App内搜索）' },
    { name: '《翻转电台》', url: 'https://www.xiaoyuzhoufm.com', description: '哲学经典+当下问题（在小宇宙App内搜索）' },
    { name: '《文化有限》', url: 'https://www.xiaoyuzhoufm.com', description: '三人聊经典著作（在小宇宙App内搜索）' },
    { name: '《放学以后》', url: 'https://www.xiaoyuzhoufm.com', description: '学习/工作/女性议题（在小宇宙App内搜索）' },
  ]},

  // ================================================================
  // 语言学习
  // ================================================================
  { id: 'lang', icon: '🌐', title: '语言学习', description: '英语+二外考试与学习', links: [
    { name: '雅思中国官网', url: 'https://www.chinaielts.org', description: '报名+免费样题' },
    { name: '托福中国官网', url: 'https://www.toefl.cn', description: '报名+官方备考' },
    { name: 'IELTS Buddy', url: 'https://www.ieltsbuddy.com', description: '听说读写分项练习' },
    { name: 'YouGlish', url: 'https://www.youglish.com', description: '视频学单词真实发音' },
    { name: '多邻国 Duolingo', url: 'https://www.duolingo.com', description: '免费入门' },
    { name: 'DW 学德语', url: 'https://learngerman.dw.com', description: '免费A1-B2' },
    { name: 'NHK Easy Japanese', url: 'https://www3.nhk.or.jp/news/easy/', description: '简明日语新闻' },
    { name: 'MOJiTest', url: 'https://www.mojitest.com', description: '日语N5-N1真题' },
    { name: 'JLPT 中国官网', url: 'https://www.jlpt.neea.cn', description: '日语能力考报名' },
  ]},

  // ================================================================
  // 证书认证
  // ================================================================
  { id: 'certs', icon: '📜', title: '证书认证', description: '行业认可的核心证书', links: [
    { name: '软考 ruankao', url: 'https://www.ruankao.org.cn', description: '人社部+工信部，职称/积分落户' },
    { name: 'CET-4/6 四六级', url: 'https://www.cet.neea.edu.cn', description: '国内求职基本门槛' },
    { name: '教师资格证 NTCE', url: 'https://www.ntce.neea.edu.cn', description: '师范/非师范均可' },
    { name: 'CATTI 翻译资格', url: 'https://www.catticenter.com', description: '翻译行业准入' },
    { name: '法律职业资格(法考)', url: 'https://www.moj.gov.cn', description: '法官/检察官/律师执业' },
    { name: 'CPA 注册会计师', url: 'https://www.cicpa.org.cn', description: '财会金字证书' },
    { name: 'CFA 特许金融分析师', url: 'https://www.cfainstitute.org', description: '投资/金融国际认证' },
    { name: '医师资格证', url: 'https://www.nmec.org.cn', description: '临床执业必备' },
    { name: 'NISP 信息安全', url: 'https://www.nisp.org.cn', description: '校园版CISP' },
    { name: 'CKA Kubernetes', url: 'https://www.cncf.io/training/certification/cka/', description: 'DevOps最有价值证书' },
    { name: 'AWS 认证', url: 'https://www.aws.amazon.com/certification', description: '云计算行业标准' },
  ]},

  // ================================================================
  // 志愿者
  // ================================================================
  { id: 'volunteer', icon: '🤝', title: '志愿者', description: '志愿服务/社会实践', links: [
    { name: '志愿汇', url: 'https://www.zyh.org.cn', description: '8800万注册志愿者' },
    { name: '中国志愿服务网', url: 'https://www.chinavolunteer.mca.gov.cn', description: '民政部官方' },
    { name: '志愿中国', url: 'https://www.zyz.org.cn', description: '青年志愿服务' },
    { name: '到梦空间 App', url: 'https://www.5idream.net', description: '校园活动+学分认证' },
  ]},
];
