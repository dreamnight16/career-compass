"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown, ChevronUp, TrendingUp, Minus, TrendingDown } from "lucide-react";
import type { Career } from "@/types";

// ── Career Data ──────────────────────────────────────────────
//
// 96+ careers sourced from existing salary explorer data.
// Priority careers (first block) include full skills + positions;
// remaining careers preserve original salaryRange/requirements/tags/outlook
// with placeholder summary/skills/positions/salaryNote.

const CAREERS: Career[] = [
  // ================================================================
  //  FULLY FILLED (skills + positions) — 32 priority careers
  // ================================================================

  // ── 互联网/科技 (13) ──────────────────────────────────────────

  {
    id: "algorithm-engineer",
    title: "算法工程师",
    industry: "互联网/AI",
    summary: "设计并实现机器学习和大模型算法，将数学理论转化为工业级 AI 产品",
    skills: [
      "Python/C++",
      "机器学习/深度学习",
      "PyTorch/TensorFlow",
      "数据结构与算法",
      "数学基础（线代/概率/优化）",
      "大规模数据处理",
      "模型部署（ONNX/TensorRT）",
    ],
    positions: [
      { title: "算法实习生", level: "entry", dailyWork: "在 mentor 指导下复现论文、清洗数据、跑实验" },
      { title: "算法工程师", level: "mid", dailyWork: "独立负责模型训练与调优，参与线上 A/B 实验" },
      { title: "高级算法工程师", level: "senior", dailyWork: "主导核心算法方案设计，跨团队推动模型落地" },
      { title: "算法专家/研究员", level: "lead", dailyWork: "定义算法方向，发表论文，带领小组攻克前沿问题" },
      { title: "首席科学家", level: "expert", dailyWork: "制定公司级 AI 战略，建设研究团队，代表技术品牌" },
    ],
    requirements: ["硕士及以上（博士优先）", "扎实的数学和编程基础", "有顶会论文或竞赛成绩加分"],
    salaryRange: [25000, 60000],
    salaryNote: "大模型风口，顶尖人才薪资上不封顶",
    outlook: "rising",
    tags: ["AI", "高薪", "技术", "大模型"],
  },

  {
    id: "frontend-engineer",
    title: "前端开发工程师",
    industry: "互联网",
    summary: "构建 Web 应用的用户界面与交互体验，是用户看到和使用的一切的创造者",
    skills: [
      "HTML/CSS",
      "JavaScript/TypeScript",
      "React/Vue/Angular",
      "Node.js",
      "前端工程化（Webpack/Vite）",
      "性能优化",
      "系统架构设计",
    ],
    positions: [
      { title: "初级前端开发", level: "entry", dailyWork: "在指导下完成页面开发和 bug 修复，学习框架和团队规范" },
      { title: "中级前端开发", level: "mid", dailyWork: "独立负责模块开发，参与技术方案评审，指导新人" },
      { title: "高级前端开发", level: "senior", dailyWork: "负责核心模块架构设计，性能优化，技术选型，跨团队协作" },
      { title: "前端架构师", level: "lead", dailyWork: "制定前端技术规范和架构方向，解决疑难技术问题" },
      { title: "技术总监/前端负责人", level: "expert", dailyWork: "管理前端团队，把控技术方向，对齐业务目标" },
    ],
    requirements: ["本科及以上", "扎实的计算机基础", "有实习或项目经验"],
    salaryRange: [12000, 30000],
    salaryNote: "初级岗位受 AI 冲击，高级前端仍稀缺",
    outlook: "declining",
    tags: ["技术", "互联网", "Web"],
  },

  {
    id: "backend-engineer",
    title: "后端开发工程师",
    industry: "互联网",
    summary: "设计并实现服务端架构、API 和数据处理管道，是互联网产品的骨架和引擎",
    skills: [
      "Go/Java/Python",
      "数据库（MySQL/PostgreSQL/Redis）",
      "微服务与分布式系统",
      "消息队列（Kafka/RabbitMQ）",
      "云原生（K8s/Docker）",
      "系统设计（高并发/高可用）",
      "API 设计与安全",
    ],
    positions: [
      { title: "初级后端开发", level: "entry", dailyWork: "在指导下完成 CRUD 接口开发，学习代码规范和业务逻辑" },
      { title: "中级后端开发", level: "mid", dailyWork: "独立负责服务模块，参与技术方案设计与评审" },
      { title: "高级后端开发", level: "senior", dailyWork: "负责核心系统架构设计，性能调优，技术选型，跨团队协作" },
      { title: "技术专家/架构师", level: "lead", dailyWork: "制定技术规范，推动基础设施建设，解决全链路疑难问题" },
      { title: "技术总监/CTO", level: "expert", dailyWork: "管理技术团队，制定技术战略，对齐公司业务目标" },
    ],
    requirements: ["本科及以上", "计算机基础扎实", "有项目经验优先"],
    salaryRange: [15000, 35000],
    salaryNote: "Go/Java/Python 后端，云原生和微服务方向需求稳定",
    outlook: "stable",
    tags: ["技术", "互联网", "后端"],
  },

  {
    id: "data-scientist",
    title: "数据科学家",
    industry: "互联网/金融",
    summary: "从海量数据中提炼商业洞察，构建数据模型驱动业务决策",
    skills: [
      "Python/R",
      "SQL 与数据仓库",
      "统计学与概率论",
      "机器学习",
      "数据可视化（Tableau/ECharts）",
      "A/B 实验设计",
      "商业分析思维",
    ],
    positions: [
      { title: "数据分析师", level: "entry", dailyWork: "取数、做报表、协助业务方理解数据" },
      { title: "数据科学家", level: "mid", dailyWork: "独立承担分析项目，构建预测模型，输出策略建议" },
      { title: "高级数据科学家", level: "senior", dailyWork: "主导跨部门数据项目，设计指标体系，推动数据驱动决策" },
      { title: "数据总监", level: "lead", dailyWork: "搭建数据团队，制定数据战略，推动数据平台建设" },
      { title: "首席数据官（CDO）", level: "expert", dailyWork: "公司级数据治理与资产化，数据驱动的商业模式创新" },
    ],
    requirements: ["硕士及以上", "统计/数学/计算机背景", "有业务分析经验"],
    salaryRange: [18000, 45000],
    salaryNote: "AI 时代对数据人才需求持续增长",
    outlook: "rising",
    tags: ["大数据", "AI", "高薪", "分析"],
  },

  {
    id: "product-manager",
    title: "产品经理",
    industry: "互联网",
    summary: "定义产品方向，协调技术、设计、运营，把用户需求转化为可落地的产品方案",
    skills: [
      "需求分析与用户研究",
      "产品原型设计（Figma/Axure）",
      "数据分析（SQL/Excel）",
      "项目管理（Scrum/OKR）",
      "商业思维与竞品分析",
      "技术理解力",
      "跨部门沟通协调",
    ],
    positions: [
      { title: "产品助理/实习生", level: "entry", dailyWork: "写需求文档、做竞品调研、跟进小功能迭代" },
      { title: "产品经理", level: "mid", dailyWork: "独立负责一条产品线，主导需求到上线的全流程" },
      { title: "高级产品经理", level: "senior", dailyWork: "负责核心产品模块，制定季度路线图，跨部门资源协调" },
      { title: "产品总监", level: "lead", dailyWork: "管理产品团队，制定年度产品战略，对业务指标负责" },
      { title: "CPO/产品VP", level: "expert", dailyWork: "公司级产品方向决策，产品矩阵布局，组织建设" },
    ],
    requirements: ["本科及以上（不限专业）", "逻辑清晰、沟通能力强", "有产品实习或项目经验"],
    salaryRange: [15000, 35000],
    salaryNote: "越往高层走，商业判断力越比技术背景重要",
    outlook: "stable",
    tags: ["综合", "沟通", "产品"],
  },

  {
    id: "ui-ux-designer",
    title: "UI/UX设计师",
    industry: "互联网",
    summary: "设计产品的视觉界面与交互流程，平衡美学与可用性，让用户用得舒服、看得舒服",
    skills: [
      "Figma/Sketch",
      "用户研究与可用性测试",
      "交互设计原则",
      "设计系统搭建",
      "动效设计（Principle/Lottie）",
      "基础 HTML/CSS",
      "数据驱动的设计优化",
    ],
    positions: [
      { title: "初级 UI/UX 设计师", level: "entry", dailyWork: "在指导下完成页面设计、切图、跟进设计还原度" },
      { title: "UI/UX 设计师", level: "mid", dailyWork: "独立负责产品模块的设计全流程，参与用户调研" },
      { title: "高级 UI/UX 设计师", level: "senior", dailyWork: "主导设计规范和组件库建设，推动设计驱动产品创新" },
      { title: "设计总监", level: "lead", dailyWork: "管理设计团队，制定品牌设计语言，把控全线产品体验" },
      { title: "CDO/设计VP", level: "expert", dailyWork: "公司级设计战略，设计组织建设，设计文化推广" },
    ],
    requirements: ["本科及以上（设计相关专业优先）", "有作品集", "B 端 SaaS 设计经验更受欢迎"],
    salaryRange: [12000, 28000],
    salaryNote: "B 端 SaaS 和出海产品设计师需求增长明显",
    outlook: "stable",
    tags: ["设计", "创意", "UX"],
  },

  {
    id: "security-engineer",
    title: "网络安全工程师",
    industry: "信息安全",
    summary: "保护企业和用户的数据安全，抵御网络攻击，构建纵深防御体系",
    skills: [
      "网络协议（TCP/IP/HTTP/DNS）",
      "渗透测试与漏洞挖掘",
      "安全架构设计（零信任）",
      "逆向工程与恶意代码分析",
      "密码学基础",
      "SOC/SIEM 运营",
      "云安全（AWS/阿里云）",
    ],
    positions: [
      { title: "安全运维/安服工程师", level: "entry", dailyWork: "安全事件响应、漏洞扫描、安全设备运维" },
      { title: "安全工程师", level: "mid", dailyWork: "独立承担渗透测试/代码审计/安全加固项目" },
      { title: "高级安全工程师", level: "senior", dailyWork: "设计安全架构，制定安全规范，应急响应指挥" },
      { title: "安全专家/安全负责人", level: "lead", dailyWork: "建设安全团队，制定安全战略，推动安全合规" },
      { title: "CSO/信息安全VP", level: "expert", dailyWork: "公司级安全治理，董事会级安全风险管理" },
    ],
    requirements: ["本科及以上（计算机/信息安全相关）", "有 CTF 或挖洞经验加分", "CISP/CISSP 证书加分"],
    salaryRange: [15000, 35000],
    salaryNote: "企业数字化转型安全需求激增，供不应求",
    outlook: "rising",
    tags: ["安全", "技术", "合规"],
  },

  {
    id: "devops-engineer",
    title: "DevOps/SRE工程师",
    industry: "互联网",
    summary: "搭建和维护 CI/CD 流水线，保障线上服务高可用，让开发部署像呼吸一样自然",
    skills: [
      "Linux 系统管理",
      "Docker/Kubernetes",
      "CI/CD（Jenkins/GitHub Actions/ArgoCD）",
      "监控告警（Prometheus/Grafana）",
      "IaC（Terraform/Ansible）",
      "脚本编程（Shell/Python/Go）",
      "故障排查与容量规划",
    ],
    positions: [
      { title: "初级运维/DevOps 工程师", level: "entry", dailyWork: "协助部署上线、写运维脚本、处理告警" },
      { title: "DevOps/SRE 工程师", level: "mid", dailyWork: "独立负责服务集群运维，搭建监控体系，写自动化工具" },
      { title: "高级 SRE 工程师", level: "senior", dailyWork: "设计多活/容灾架构，主导全链路压测，推动稳定性建设" },
      { title: "基础设施负责人", level: "lead", dailyWork: "搭建基础设施团队，制定云战略，成本优化" },
      { title: "基础架构VP", level: "expert", dailyWork: "公司级技术基础设施规划，多数据中心与混合云管理" },
    ],
    requirements: ["本科及以上（计算机相关）", "熟悉 Linux 和至少一门脚本语言", "有线上故障处理经验优先"],
    salaryRange: [18000, 40000],
    salaryNote: "云原生普及推动需求上升约 20%",
    outlook: "rising",
    tags: ["运维", "云原生", "自动化"],
  },

  {
    id: "game-developer",
    title: "游戏开发工程师",
    industry: "游戏/娱乐",
    summary: "使用 Unity/Unreal 等引擎开发游戏逻辑、渲染效果和玩法系统",
    skills: [
      "C#/C++",
      "Unity/Unreal Engine",
      "3D 数学与图形学基础",
      "游戏物理学与碰撞检测",
      "性能优化（DrawCall/内存）",
      "网络同步（帧同步/状态同步）",
      "图形 API（OpenGL/Vulkan/DirectX）",
    ],
    positions: [
      { title: "初级游戏开发", level: "entry", dailyWork: "在指导下实现游戏功能模块、修 bug、写 gameplay 逻辑" },
      { title: "游戏开发工程师", level: "mid", dailyWork: "独立负责核心玩法或 UI 系统开发，参与性能优化" },
      { title: "高级游戏开发/技术美术", level: "senior", dailyWork: "主导渲染管线或物理引擎开发，攻克技术难点" },
      { title: "技术总监/主程", level: "lead", dailyWork: "制定项目技术方案，管理开发团队，把控技术质量" },
      { title: "工作室技术VP", level: "expert", dailyWork: "多项目技术管理，引擎选型，技术品牌建设" },
    ],
    requirements: ["本科及以上（计算机或相关专业）", "有游戏项目或 Demo 作品", "热爱游戏行业"],
    salaryRange: [15000, 40000],
    salaryNote: "出海和独立游戏是新机会，大厂项目奖金可观",
    outlook: "stable",
    tags: ["游戏", "技术", "引擎"],
  },

  {
    id: "blockchain-developer",
    title: "区块链开发工程师",
    industry: "Web3/金融",
    summary: "开发区块链智能合约、DApp 和底层基础设施，推动去中心化应用落地",
    skills: [
      "Solidity/Rust（Move）",
      "以太坊/EVM 原理",
      "智能合约安全审计",
      "共识机制与密码学",
      "Web3.js/Ethers.js",
      "DeFi/NFT 协议理解",
      "Go/Node.js 后端",
    ],
    positions: [
      { title: "区块链实习生/初级开发", level: "entry", dailyWork: "学习 Solidity，写简单合约，协助 DApp 前端对接" },
      { title: "区块链开发工程师", level: "mid", dailyWork: "独立开发并部署智能合约，参与协议设计" },
      { title: "高级区块链工程师", level: "senior", dailyWork: "主导公链/二层网络模块开发，智能合约安全审计" },
      { title: "区块链架构师", level: "lead", dailyWork: "设计整体链架构，制定技术路线图，管理工程团队" },
      { title: "CTO/联合创始人", level: "expert", dailyWork: "公司级 Web3 战略，生态建设，融资与对外技术品牌" },
    ],
    requirements: ["本科及以上（计算机/数学相关）", "有智能合约开发经验", "理解区块链底层原理"],
    salaryRange: [20000, 50000],
    salaryNote: "Web3 和数字人民币推动需求，Token 激励是额外收入",
    outlook: "rising",
    tags: ["区块链", "高薪", "Web3"],
  },

  {
    id: "ic-engineer",
    title: "集成电路工程师",
    industry: "半导体",
    summary: "设计、验证和测试芯片电路，是半导体产业的核心技术力量",
    skills: [
      "Verilog/VHDL",
      "数字/模拟电路设计",
      "EDA 工具（Synopsys/Cadence）",
      "FPGA 原型验证",
      "半导体工艺理解",
      "版图设计",
      "信号完整性分析",
    ],
    positions: [
      { title: "初级 IC 设计工程师", level: "entry", dailyWork: "在指导下完成模块级电路设计，写验证 testbench" },
      { title: "IC 设计工程师", level: "mid", dailyWork: "独立负责子系统设计，参与流片和验证" },
      { title: "高级 IC 设计工程师", level: "senior", dailyWork: "主导芯片架构设计，攻克时序/功耗瓶颈，指导团队" },
      { title: "芯片架构师", level: "lead", dailyWork: "定义芯片整体架构，制定设计规范，把控流片风险" },
      { title: "芯片VP/CTO", level: "expert", dailyWork: "公司级芯片路线图，核心 IP 决策，产学研合作" },
    ],
    requirements: ["硕士及以上（微电子/电子工程）", "有流片经验优先", "扎实的半导体物理基础"],
    salaryRange: [20000, 50000],
    salaryNote: "国产替代带来巨大人才缺口，薪资年涨幅 15-25%",
    outlook: "rising",
    tags: ["芯片", "硬科技", "高薪"],
  },

  {
    id: "embedded-engineer",
    title: "嵌入式系统工程师",
    industry: "物联网/汽车",
    summary: "开发运行在硬件设备上的固件和底层软件，让硬件有灵魂",
    skills: [
      "C/C++",
      "ARM/RISC-V 架构",
      "RTOS（FreeRTOS/Zephyr）",
      "Linux 驱动开发",
      "通信协议（I2C/SPI/UART/CAN）",
      "硬件调试（示波器/逻辑分析仪）",
      "低功耗设计",
    ],
    positions: [
      { title: "初级嵌入式工程师", level: "entry", dailyWork: "在开发板上跑 Demo，写驱动，协助硬件调试" },
      { title: "嵌入式工程师", level: "mid", dailyWork: "独立负责模块固件开发，编写 BSP，参与系统集成" },
      { title: "高级嵌入式工程师", level: "senior", dailyWork: "主导嵌入式系统架构设计，攻克实时性和稳定性难题" },
      { title: "嵌入式系统架构师", level: "lead", dailyWork: "定义产品技术路线，管理固件团队，跨部门技术协调" },
      { title: "硬件技术总监", level: "expert", dailyWork: "公司级 IoT/汽车电子技术战略，平台化建设" },
    ],
    requirements: ["本科及以上（电子/计算机/自动化）", "有 MCU 或 Linux 嵌入式项目经验", "能看懂原理图"],
    salaryRange: [15000, 35000],
    salaryNote: "物联网和智能汽车推动需求持续增长",
    outlook: "rising",
    tags: ["硬件", "IoT", "嵌入式"],
  },

  // ── 金融/商业 (4) ───────────────────────────────────────────

  {
    id: "quant-researcher",
    title: "量化研究员",
    industry: "金融",
    summary: "用数学模型和算法驱动交易决策，在市场中寻找 Alpha",
    skills: [
      "Python/C++",
      "数学建模与统计分析",
      "机器学习/时间序列分析",
      "金融市场微观结构",
      "回测框架开发",
      "大数据处理（pandas/Spark）",
      "低延迟系统编程",
    ],
    positions: [
      { title: "量化研究员（初级）", level: "entry", dailyWork: "清洗行情数据，复现论文策略，辅助回测" },
      { title: "量化研究员", level: "mid", dailyWork: "独立开发交易策略，跑回测，优化参数" },
      { title: "高级量化研究员", level: "senior", dailyWork: "主导策略研发方向，设计因子体系，管理小团队" },
      { title: "量化策略总监", level: "lead", dailyWork: "制定策略研发路线图，管理 PM 和研究团队" },
      { title: "量化合伙人/CIO", level: "expert", dailyWork: "公司级投资策略，资金分配，风险管理" },
    ],
    requirements: ["硕士及以上（数学/物理/计算机/金融工程）", "编程能力强", "有量化竞赛或实盘经验加分"],
    salaryRange: [25000, 80000],
    salaryNote: "奖金可达底薪数倍，顶尖人才年薪数百万",
    outlook: "rising",
    tags: ["金融", "量化", "高薪"],
  },

  {
    id: "investment-banking-analyst",
    title: "投资银行分析师",
    industry: "金融",
    summary: "执行 IPO、并购、债券发行等投行业务，连接资本市场与企业",
    skills: [
      "财务建模与估值（DCF/LBO/可比公司）",
      "Excel/PowerPoint 高级技能",
      "行业研究分析",
      "尽职调查",
      "交易结构设计",
      "投资者沟通",
      "法律合规知识",
    ],
    positions: [
      { title: "投行分析师（Analyst）", level: "entry", dailyWork: "做 Pitchbook、搭财务模型、行业研究，日均工作 14-16 小时" },
      { title: "投行经理（Associate）", level: "mid", dailyWork: "带领分析师团队，与客户沟通，主导执行交易" },
      { title: "投行副总裁（VP）", level: "senior", dailyWork: "主导项目执行，维护客户关系，参与项目承揽" },
      { title: "投行董事/执行董事（D/ED）", level: "lead", dailyWork: "负责客户覆盖和项目承揽，对 P&L 负责" },
      { title: "投行董事总经理（MD）", level: "expert", dailyWork: "制定业务战略，管理行业组，最高级别客户关系" },
    ],
    requirements: ["硕士及以上（金融/经济/会计优先）", "CFA/CPA 加分", "极强的抗压能力和沟通能力"],
    salaryRange: [20000, 60000],
    salaryNote: "IPO 和并购业务，强度极大但回报极高，奖金通常超过底薪",
    outlook: "stable",
    tags: ["金融", "高薪", "高压"],
  },

  {
    id: "management-consultant",
    title: "管理咨询顾问",
    industry: "咨询",
    summary: "为企业高层提供战略、运营和组织转型建议，解决最复杂的商业问题",
    skills: [
      "结构化思维与问题拆解",
      "数据分析与商业建模",
      "PPT/故事线制作",
      "行业研究方法论",
      "利益相关方管理",
      "访谈与引导技巧",
      "变革管理",
    ],
    positions: [
      { title: "商业分析师（BA）", level: "entry", dailyWork: "做行业研究、数据分析、画 PPT、支持顾问团队" },
      { title: "咨询顾问（Associate/Consultant）", level: "mid", dailyWork: "独立负责工作模块，与客户中层沟通，输出交付物" },
      { title: "项目经理/资深顾问（Manager）", level: "senior", dailyWork: "管理项目团队，把控交付质量和进度，维护客户关系" },
      { title: "合伙人/副合伙人（Partner/AP）", level: "lead", dailyWork: "客户开发和关系维护，项目承揽，团队建设" },
      { title: "资深合伙人/全球合伙人", level: "expert", dailyWork: "公司战略制定，全球大客户管理，行业思想领导力" },
    ],
    requirements: ["硕士/MBA 优先", "逻辑清晰、沟通能力强", "能适应高强度出差（每周 4 天）"],
    salaryRange: [18000, 45000],
    salaryNote: "MBB+四大咨询，高薪高压力高成长，exit option 优秀",
    outlook: "stable",
    tags: ["咨询", "高薪", "战略"],
  },

  {
    id: "cpa-accountant",
    title: "注册会计师",
    industry: "财务审计",
    summary: "审计企业财务报表、提供税务筹划和财务咨询，是资本市场的守门人",
    skills: [
      "会计准则（CAS/IFRS/US GAAP）",
      "审计方法与程序",
      "税务法规与筹划",
      "财务尽职调查",
      "内控与风险管理",
      "Excel/审计软件",
      "项目管理",
    ],
    positions: [
      { title: "审计员（Associate）", level: "entry", dailyWork: "执行审计程序、抽凭、发函证、写底稿" },
      { title: "高级审计员（Senior）", level: "mid", dailyWork: "带队做小项目，复核底稿，与客户财务对接" },
      { title: "审计经理（Manager）", level: "senior", dailyWork: "管理多个审计项目，把控风险，维护客户关系，签报告" },
      { title: "高级经理/总监", level: "lead", dailyWork: "开发新客户，管理大项目，部门运营管理" },
      { title: "合伙人（Partner）", level: "expert", dailyWork: "负责客户组合的 P&L，事务所战略决策，行业影响力" },
    ],
    requirements: ["本科及以上（会计/财务相关）", "需通过 CPA 考试", "四大/内资所/企业财务三条路径"],
    salaryRange: [10000, 30000],
    salaryNote: "考出 CPA 后薪资跳涨明显，四大晋升路径清晰",
    outlook: "stable",
    tags: ["财务", "证书", "稳定"],
  },

  // ── 医疗健康 (4) ────────────────────────────────────────────

  {
    id: "clinical-doctor",
    title: "临床医生",
    industry: "医疗健康",
    summary: "诊断疾病、制定治疗方案、实施手术，是医疗体系的核心力量",
    skills: [
      "临床诊断思维",
      "疾病诊疗指南掌握",
      "手术/操作技能",
      "医患沟通",
      "病历书写与管理",
      "急危重症识别与处理",
      "循证医学与文献检索",
    ],
    positions: [
      { title: "住院医师", level: "entry", dailyWork: "写病历、管床、值夜班、跟手术，完成规培" },
      { title: "主治医师", level: "mid", dailyWork: "独立管病区，带住院医，出门诊，决定治疗方案" },
      { title: "副主任医师", level: "senior", dailyWork: "负责专科疑难病例，带组查房，开展新技术" },
      { title: "主任医师/科主任", level: "lead", dailyWork: "管理科室，制定学科发展方向，培养人才梯队" },
      { title: "院长/学科带头人", level: "expert", dailyWork: "医院管理，学科建设，学术影响力，对外合作" },
    ],
    requirements: ["硕士及以上 + 规培证 + 执业医师证", "3-8 年规培和临床经验", "持续学习能力和抗压能力"],
    salaryRange: [10000, 30000],
    salaryNote: "规培+执业医师，周期长（8-11年）但社会地位高、越老越吃香",
    outlook: "stable",
    tags: ["医疗", "高门槛", "稳定"],
  },

  {
    id: "dentist",
    title: "口腔医生",
    industry: "医疗健康",
    summary: "诊断和治疗口腔疾病，开展修复、正畸、种植等专科治疗",
    skills: [
      "口腔临床诊断",
      "修复/正畸/种植专科技术",
      "口腔影像判读",
      "麻醉与无菌操作",
      "医患沟通与咨询",
      "诊所运营管理",
      "美学修复理念",
    ],
    positions: [
      { title: "口腔全科医生/进修医生", level: "entry", dailyWork: "在带教下完成基础治疗（补牙、拔牙、洗牙）" },
      { title: "口腔全科医生", level: "mid", dailyWork: "独立接诊全科患者，开展修复和简单种植" },
      { title: "专科口腔医生", level: "senior", dailyWork: "专注一个亚专科（正畸/种植/美学），技术精湛" },
      { title: "口腔诊所负责人/合伙人", level: "lead", dailyWork: "经营管理诊所，组建医生团队，把控医疗质量" },
      { title: "连锁口腔品牌创始人/CEO", level: "expert", dailyWork: "品牌战略，融资扩张，多诊所连锁管理" },
    ],
    requirements: ["硕士及以上 + 执业医师证", "2-5 年临床经验", "专科培训证书（正畸/种植等）"],
    salaryRange: [15000, 50000],
    salaryNote: "口腔医疗市场化程度最高，收入上限高，可开诊所做老板",
    outlook: "rising",
    tags: ["医疗", "高薪", "市场化"],
  },

  {
    id: "pharmaceutical-rd",
    title: "药学研发",
    industry: "制药",
    summary: "发现和开发新药，从靶点筛选到临床试验，把科学发现变成治病救人的药物",
    skills: [
      "药物化学/有机合成",
      "药理学与毒理学",
      "分析化学（HPLC/LC-MS）",
      "生物化学与分子生物学",
      "GMP/GLP 规范",
      "临床试验设计",
      "注册申报（IND/NDA）",
    ],
    positions: [
      { title: "研发助理/实验员", level: "entry", dailyWork: "在指导下完成合成/分析实验，记录实验数据" },
      { title: "研发工程师/研究员", level: "mid", dailyWork: "独立承担研发课题，设计实验方案，撰写研究报告" },
      { title: "项目经理/资深研究员", level: "senior", dailyWork: "主导研发管线项目，制定研发计划，管理跨部门协作" },
      { title: "研发总监", level: "lead", dailyWork: "管理研发团队和项目组合，制定研发策略，把控关键节点" },
      { title: "CSO/研发VP", level: "expert", dailyWork: "公司级研发管线决策，技术平台建设，国际化合作" },
    ],
    requirements: ["硕士及以上（药学/化学/生物学）", "有合成或分析实验经验", "英语文献阅读能力"],
    salaryRange: [12000, 30000],
    salaryNote: "创新药研发投入加大，CRO 行业扩张带来更多就业机会",
    outlook: "rising",
    tags: ["医药", "研发", "创新药"],
  },

  {
    id: "nurse",
    title: "护理学/护士",
    industry: "医疗健康",
    summary: "执行医嘱、护理患者、进行健康宣教，是医疗体系中数量最大的专业群体",
    skills: [
      "基础护理操作（输液/导尿/换药）",
      "急救技能（CPR/除颤）",
      "病情观察与评估",
      "患者心理护理与沟通",
      "护理文书书写",
      "感染控制",
      "专科护理（ICU/手术室/急诊）",
    ],
    positions: [
      { title: "护士（N0-N1）", level: "entry", dailyWork: "在带教下完成基础护理操作，轮转各科室学习" },
      { title: "护师（N2）", level: "mid", dailyWork: "独立负责患者护理，参与危重症护理，指导实习护士" },
      { title: "主管护师（N3）", level: "senior", dailyWork: "负责病区护理质量管理，制定护理计划，带教低年资护士" },
      { title: "副主任护师/护士长", level: "lead", dailyWork: "管理科室护理团队，制定护理规范，质量控制" },
      { title: "主任护师/护理部主任", level: "expert", dailyWork: "医院护理管理决策，护理学科建设，对外学术交流" },
    ],
    requirements: ["本科及以上 + 护士执业证", "0-5 年临床经验", "耐心细致、抗压能力强"],
    salaryRange: [7000, 18000],
    salaryNote: "老龄化推动需求增长，男护士尤其紧缺，薪资有上涨趋势",
    outlook: "rising",
    tags: ["医疗", "刚需", "护理"],
  },

  // ── 能源/制造 (1) ───────────────────────────────────────────

  {
    id: "electrical-engineer",
    title: "电气工程师",
    industry: "电力/能源",
    summary: "设计、建设和维护电力系统及电气设备，支撑现代社会的能源基础设施",
    skills: [
      "电力系统分析",
      "继电保护原理",
      "PLC/SCADA 编程",
      "高低压配电设计",
      "电气 CAD（AutoCAD/Eplan）",
      "新能源并网技术",
      "电气安全规范",
    ],
    positions: [
      { title: "助理电气工程师", level: "entry", dailyWork: "协助图纸绘制、现场调试、设备选型、整理技术文档" },
      { title: "电气工程师", level: "mid", dailyWork: "独立完成电气系统设计，负责项目施工管理" },
      { title: "高级电气工程师", level: "senior", dailyWork: "主导大型项目电气方案，审核设计图纸，技术决策" },
      { title: "电气总工/技术负责人", level: "lead", dailyWork: "制定技术标准，管理工程团队，把控项目质量和安全" },
      { title: "设计院院长/工程公司副总", level: "expert", dailyWork: "公司级技术战略，大客户关系，行业标准制定" },
    ],
    requirements: ["本科及以上（电气工程/自动化）", "有注册电气工程师证书加分", "能适应短期出差"],
    salaryRange: [12000, 28000],
    salaryNote: "新能源和智能电网推动需求增长，新兴领域薪资更高",
    outlook: "rising",
    tags: ["能源", "绿牌", "基础设施"],
  },

  // ── 教育/学术 (2) ───────────────────────────────────────────

  {
    id: "university-teacher",
    title: "高校教师",
    industry: "教育",
    summary: "从事教学和科研工作，培养下一代人才，推动学科知识前沿",
    skills: [
      "学科专业知识",
      "教学设计能力",
      "科研方法（实验/调研/建模）",
      "学术论文写作",
      "基金申请书撰写",
      "学术演讲与汇报",
      "研究生指导能力",
    ],
    positions: [
      { title: "助教", level: "entry", dailyWork: "辅助教授上课、批改作业、带实验课" },
      { title: "讲师", level: "mid", dailyWork: "独立授课，开展科研，发表论文" },
      { title: "副教授", level: "senior", dailyWork: "主持科研项目，指导研究生，参与学科建设" },
      { title: "教授/学科带头人", level: "lead", dailyWork: "带领科研团队，申请国家级项目，制定学科发展规划" },
      { title: "院士/校长", level: "expert", dailyWork: "引领学科方向，学校管理决策，国家级学术影响力" },
    ],
    requirements: ["博士优先", "有科研成果（论文/专利/项目）", "热爱教学和科研"],
    salaryRange: [8000, 20000],
    salaryNote: "寒暑假+稳定编制是核心吸引力，科研项目和横向课题有额外收入",
    outlook: "stable",
    tags: ["教育", "学术", "编制"],
  },

  {
    id: "school-teacher",
    title: "中小学教师",
    industry: "教育",
    summary: "教授学科知识、引导学生成长，是基础教育体系的中坚力量",
    skills: [
      "学科专业知识",
      "课堂教学与班级管理",
      "学生心理辅导",
      "课程设计与教案编写",
      "家校沟通",
      "信息技术应用（多媒体教学）",
      "教育评价与反馈",
    ],
    positions: [
      { title: "实习教师/见习教师", level: "entry", dailyWork: "跟岗实习、辅助教学、批改作业、学习班级管理" },
      { title: "二级教师/初级教师", level: "mid", dailyWork: "独立带班上课，参与教研活动，承担班主任工作" },
      { title: "一级教师/骨干教师", level: "senior", dailyWork: "在学科组承担教学示范，指导青年教师，参与校本课程开发" },
      { title: "高级教师/教研组长", level: "lead", dailyWork: "负责学科教学质量，主持教研课题，担任教学督导" },
      { title: "正高级教师/校长", level: "expert", dailyWork: "学校管理，教育政策建议，区域学科引领" },
    ],
    requirements: ["本科及以上 + 教师资格证", "0-3 年教学经验", "热爱教育事业，有耐心和责任心"],
    salaryRange: [6000, 15000],
    salaryNote: "编制内教师稳定，但出生率下降影响长期需求",
    outlook: "stable",
    tags: ["教育", "稳定", "编制"],
  },

  // ── 政府/公共 (1) ───────────────────────────────────────────

  {
    id: "civil-service",
    title: "公务员/选调生",
    industry: "政府",
    summary: "执行国家政策、提供公共服务，是政府运转和社会治理的核心力量",
    skills: [
      "政策理解与分析",
      "公文写作",
      "行政法律法规",
      "沟通协调能力",
      "应急处突能力",
      "数据分析与调研",
      "公共服务意识",
    ],
    positions: [
      { title: "科员/一级科员", level: "entry", dailyWork: "写材料、做报表、跑腿办事、学习政策法规" },
      { title: "四级-一级主任科员/副科长", level: "mid", dailyWork: "独立负责业务条线，起草重要文件，协调对接" },
      { title: "副处长/三级-一级调研员", level: "senior", dailyWork: "统筹分管领域工作，制定工作方案，管理科室" },
      { title: "处长/二级巡视员", level: "lead", dailyWork: "全面负责处室工作，参与决策讨论，对外联络" },
      { title: "厅局级及以上", level: "expert", dailyWork: "制定区域/领域政策，重大决策参与，高层协调" },
    ],
    requirements: ["本科及以上（通过国考/省考/选调）", "政治素养好", "文字功底和沟通能力"],
    salaryRange: [8000, 15000],
    salaryNote: "国考/省考/选调三条路径，稳定性无可匹敌，计算机专业选调需求增加",
    outlook: "stable",
    tags: ["体制", "稳定", "编制"],
  },

  // ── 法律 (2) ─────────────────────────────────────────────────

  {
    id: "lawyer-litigation",
    title: "律师(诉讼)",
    industry: "法律",
    summary: "代理民事和刑事诉讼案件，在法庭上为当事人争取合法权益",
    skills: [
      "法律研究与检索",
      "诉讼文书写作（起诉状/答辩状/代理词）",
      "证据规则与举证质证",
      "庭审辩论技巧",
      "客户沟通与案件评估",
      "法律谈判",
      "法条理解与适用",
    ],
    positions: [
      { title: "实习律师/律师助理", level: "entry", dailyWork: "整理案卷、写法律文书初稿、陪同出庭做记录" },
      { title: "执业律师", level: "mid", dailyWork: "独立代理诉讼案件，与客户沟通，制定诉讼策略" },
      { title: "主办律师/合伙人助理", level: "senior", dailyWork: "代理重大复杂案件，管理案件团队，开发客户" },
      { title: "合伙人（非权益/权益合伙人）", level: "lead", dailyWork: "管理律师团队，负责客户组合，对律所利润分成" },
      { title: "高级合伙人/律所主任", level: "expert", dailyWork: "律所战略管理，品牌建设，行业影响力" },
    ],
    requirements: ["本科及以上 + 法律职业资格证", "2-5 年执业经验", "逻辑严密、表达能力强"],
    salaryRange: [12000, 40000],
    salaryNote: "法考是硬门槛，诉讼方向竞争激烈但独立执业后收入上不封顶",
    outlook: "stable",
    tags: ["法律", "高门槛", "抗辩"],
  },

  {
    id: "corporate-legal",
    title: "企业法务",
    industry: "法律",
    summary: "处理企业日常法律事务，防范法律风险，支持业务合规运营",
    skills: [
      "合同法/公司法/劳动法",
      "合同起草与审查",
      "企业合规管理",
      "知识产权管理",
      "争议解决与诉讼管理",
      "商务谈判支持",
      "行业监管法规",
    ],
    positions: [
      { title: "法务专员/助理", level: "entry", dailyWork: "审核合同、整理法律文件、协助处理知识产权事务" },
      { title: "法务主管/法务经理", level: "mid", dailyWork: "独立处理合同谈判、劳动纠纷、合规审查" },
      { title: "高级法务经理", level: "senior", dailyWork: "负责公司级合规体系搭建，重大交易法律支持，管理外部律师" },
      { title: "法务总监", level: "lead", dailyWork: "公司法务战略制定，重大风险管理，管理法务团队" },
      { title: "首席法务官（CLO）/总法律顾问", level: "expert", dailyWork: "董事会级法律合规建议，公司治理，监管应对" },
    ],
    requirements: ["本科及以上 + 法律职业资格证", "2-5 年法务或律所经验", "良好的商业思维和沟通能力"],
    salaryRange: [12000, 30000],
    salaryNote: "大企业和互联网公司法务需求稳步增长，工作生活平衡优于律所",
    outlook: "stable",
    tags: ["法律", "企业", "合规"],
  },

  // ── 媒体/艺术/设计 (2) ──────────────────────────────────────

  {
    id: "new-media-ops",
    title: "新媒体运营",
    industry: "传媒",
    summary: "策划和创作内容，运营社交媒体账号，通过内容驱动品牌增长和用户转化",
    skills: [
      "内容策划与选题",
      "文案写作（种草文案/公众号/短视频脚本）",
      "短视频拍摄与剪辑",
      "数据分析（阅读量/转化率）",
      "用户增长与社群运营",
      "热点追踪与事件营销",
      "平台规则理解（抖音/小红书/公众号）",
    ],
    positions: [
      { title: "新媒体运营专员", level: "entry", dailyWork: "写推文、做海报、回复评论、整理数据报表" },
      { title: "新媒体运营主管", level: "mid", dailyWork: "制定月度内容计划，管理 1-2 个平台，带领小编团队" },
      { title: "新媒体运营经理", level: "senior", dailyWork: "负责全渠道内容策略，统筹选题和资源分配，对增长指标负责" },
      { title: "内容总监", level: "lead", dailyWork: "制定内容战略和品牌调性，管理内容团队，跨部门协作" },
      { title: "首席内容官/CMO", level: "expert", dailyWork: "公司级品牌和内容战略，市场定位，预算管理" },
    ],
    requirements: ["本科及以上（不限专业）", "会写会拍、网感好", "有个人账号或作品集加分"],
    salaryRange: [8000, 20000],
    salaryNote: "短视频+直播赛道持续扩大，头部达人孵化团队高薪抢人",
    outlook: "rising",
    tags: ["内容", "创意", "新媒体"],
  },

  {
    id: "animator",
    title: "动画师",
    industry: "娱乐/游戏",
    summary: "创造角色动画、特效和视觉叙事，让静态画面活起来",
    skills: [
      "Maya/Blender/3ds Max",
      "动画十二原则",
      "角色绑定与蒙皮",
      "动力学与粒子特效",
      "分镜与叙事节奏",
      "动作捕捉数据处理",
      "渲染与合成（Arnold/Redshift）",
    ],
    positions: [
      { title: "初级动画师", level: "entry", dailyWork: "做中间帧、修动作、整理素材库" },
      { title: "动画师", level: "mid", dailyWork: "独立完成镜头动画制作，参与动作设计和角色表演" },
      { title: "高级动画师", level: "senior", dailyWork: "负责重场戏动画，搭建动画管线，指导 junior" },
      { title: "动画总监/视效总监", level: "lead", dailyWork: "把控全片动画质量和风格，管理动画团队" },
      { title: "导演/创意总监", level: "expert", dailyWork: "定义作品视觉风格和叙事方向，全流程艺术决策" },
    ],
    requirements: ["本科及以上（动画/数媒相关）", "有作品集/Demo Reel", "热爱动画艺术"],
    salaryRange: [10000, 28000],
    salaryNote: "国漫崛起+游戏出海，动画人才需求旺盛，外包和原创两条路径",
    outlook: "rising",
    tags: ["动画", "创意", "影视"],
  },

  // ── 交通/航空 (1) ───────────────────────────────────────────

  {
    id: "pilot",
    title: "飞行员",
    industry: "航空",
    summary: "驾驶民航飞机安全运送旅客和货物，是航空运输的核心执行者",
    skills: [
      "飞行操作与驾驶技能",
      "航空气象与导航",
      "空中交通管制沟通",
      "飞行程序与检查单执行",
      "CRM 机组资源管理",
      "应急程序与决策",
      "航空英语（ICAO 4 级以上）",
    ],
    positions: [
      { title: "飞行学员", level: "entry", dailyWork: "地面理论学习 + 飞行训练，积累飞行小时" },
      { title: "副驾驶（First Officer）", level: "mid", dailyWork: "协助机长完成飞行任务，积累航线经验" },
      { title: "机长（Captain）", level: "senior", dailyWork: "全面负责航班安全，指挥机组，决策飞行方案" },
      { title: "教员机长/飞行部经理", level: "lead", dailyWork: "培训新飞行员，管理飞行中队，制定安全规范" },
      { title: "总飞行师/飞行副总", level: "expert", dailyWork: "公司飞行安全管理，技术标准制定，局方对接" },
    ],
    requirements: ["本科及以上 + 飞行执照（ATPL）", "体检一级合格", "良好的英语和决策能力"],
    salaryRange: [20000, 60000],
    salaryNote: "民航需求恢复+低空经济爆发，机长薪资随飞行小时稳定增长",
    outlook: "rising",
    tags: ["航空", "高薪", "高门槛"],
  },

  // ── 环保 (1) ────────────────────────────────────────────────

  {
    id: "environmental-engineer",
    title: "环境工程师",
    industry: "环保",
    summary: "治理污染、修复生态、推动绿色转型，是实现双碳目标的技术力量",
    skills: [
      "水/气/固废处理技术",
      "环境监测与分析",
      "环境影响评价（EIA）",
      "环境法规与标准",
      "工程设计与项目管理",
      "碳核算与碳交易",
      "GIS 与环境大数据",
    ],
    positions: [
      { title: "助理环境工程师", level: "entry", dailyWork: "采样监测、数据整理、协助写环评报告" },
      { title: "环境工程师", level: "mid", dailyWork: "独立负责环保工程项目，写环评和验收报告" },
      { title: "高级环境工程师", level: "senior", dailyWork: "主持大型环保项目技术方案，ESG 咨询，政府对接" },
      { title: "环境咨询总监/技术总工", level: "lead", dailyWork: "管理咨询团队，开发 ESG/碳中和服务产品" },
      { title: "首席可持续发展官（CSO）", level: "expert", dailyWork: "公司级 ESG 战略，碳中和路线图，绿色金融" },
    ],
    requirements: ["本科及以上（环境工程/科学）", "有环评工程师证书加分", "了解碳市场/ESG 优先"],
    salaryRange: [10000, 22000],
    salaryNote: "碳中和目标驱动，ESG 人才需求爆发式增长",
    outlook: "rising",
    tags: ["环保", "绿色", "ESG"],
  },

  // ── 健康/心理 (1) ───────────────────────────────────────────

  {
    id: "psychologist",
    title: "心理咨询师",
    industry: "健康/教育",
    summary: "评估和改善来访者心理健康状态，提供专业的心理咨询与治疗服务",
    skills: [
      "心理评估与诊断",
      "心理咨询流派（CBT/精神分析/人本）",
      "倾听与共情技巧",
      "个案概念化",
      "危机干预",
      "伦理与法律知识",
      "个人体验与督导",
    ],
    positions: [
      { title: "实习咨询师", level: "entry", dailyWork: "在督导下接轻度个案，写咨询记录，参加团体督导" },
      { title: "心理咨询师", level: "mid", dailyWork: "独立接个案，积累咨询小时数，选择流派深化" },
      { title: "资深心理咨询师", level: "senior", dailyWork: "处理复杂个案，提供督导，开工作坊和培训" },
      { title: "咨询中心负责人/督导师", level: "lead", dailyWork: "管理咨询机构，制定服务规范，培养新人" },
      { title: "临床心理学家/行业专家", level: "expert", dailyWork: "学术研究，教材编写，行业标准制定，媒体发声" },
    ],
    requirements: ["硕士及以上（心理学相关）", "完成系统培训 + 督导时长", "个人体验和自我成长"],
    salaryRange: [8000, 25000],
    salaryNote: "心理健康意识提升，需求快速增加，独立执业后收入上不封顶",
    outlook: "rising",
    tags: ["健康", "成长", "心理"],
  },

  // ── 影视 (1) ─────────────────────────────────────────────────

  {
    id: "photographer-director",
    title: "摄影师/导演",
    industry: "影视/广告",
    summary: "用镜头语言讲述故事，把控画面美学和叙事节奏",
    skills: [
      "摄影/摄像技术（构图/布光/色彩）",
      "导演与调度能力",
      "后期剪辑（Premiere/DaVinci）",
      "调色与视觉风格把控",
      "脚本分镜与叙事",
      "设备管理与维护",
      "客户沟通与提案",
    ],
    positions: [
      { title: "摄影助理/场务", level: "entry", dailyWork: "布灯、架设备、跟焦、整理器材" },
      { title: "摄影师/剪辑师", level: "mid", dailyWork: "独立掌机拍摄，或完成后期剪辑和调色" },
      { title: "资深摄影师/导演", level: "senior", dailyWork: "主导商业项目全流程，从创意提案到成片交付" },
      { title: "摄影指导/创意总监", level: "lead", dailyWork: "把控项目视觉风格，管理制作团队，开发客户" },
      { title: "导演/制片人", level: "expert", dailyWork: "影视项目总负责人，融资、选角、发行全流程掌控" },
    ],
    requirements: ["本科及以上（影视/美术相关优先）", "有作品集/Showreel", "能扛设备和长时间工作"],
    salaryRange: [10000, 30000],
    salaryNote: "短视频/直播/广告/影视四轮驱动，项目制收入弹性大",
    outlook: "stable",
    tags: ["影视", "创意", "视觉"],
  },

  // ================================================================
  //  PLACEHOLDER — remaining 65 careers
  //  Existing data preserved: salaryRange, requirements, tags, outlook, industry, title
  //  New fields with minimal data: summary = old desc, skills = [], positions = [], salaryNote = ""
  // ================================================================

  // ── 半导体/硬件 (remaining) ────────────────────────────────

  {
    id: "hardware-test-engineer",
    title: "硬件测试工程师",
    industry: "电子制造",
    summary: "电子产品测试验证，入门门槛相对低",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-3年经验"],
    salaryRange: [10000, 22000],
    salaryNote: "",
    outlook: "stable",
    tags: ["硬件", "测试"],
  },

  {
    id: "optoelectronic-engineer",
    title: "光电工程师",
    industry: "光电子",
    summary: "光通信和激光应用需求增长",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [15000, 30000],
    salaryNote: "",
    outlook: "rising",
    tags: ["光电子", "技术"],
  },

  {
    id: "rf-engineer",
    title: "射频工程师",
    industry: "通信",
    summary: "5G/6G和卫星通信驱动需求",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "2-5年经验"],
    salaryRange: [18000, 40000],
    salaryNote: "",
    outlook: "rising",
    tags: ["通信", "高频"],
  },

  {
    id: "power-electronics-engineer",
    title: "电力电子工程师",
    industry: "新能源",
    summary: "光伏逆变器/储能/电动车充电桩需求爆发",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [15000, 35000],
    salaryNote: "",
    outlook: "rising",
    tags: ["电力", "新能源"],
  },

  // ── 能源/制造 (remaining) ──────────────────────────────────

  {
    id: "mechanical-engineer",
    title: "机械工程师",
    industry: "制造/汽车",
    summary: "智能制造+新能源汽车推动需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "rising",
    tags: ["制造", "绿牌"],
  },

  {
    id: "materials-engineer",
    title: "材料工程师",
    industry: "新材料",
    summary: "半导体材料/电池材料/航空材料是三大热点",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [12000, 28000],
    salaryNote: "",
    outlook: "rising",
    tags: ["材料", "硬科技"],
  },

  {
    id: "chemical-engineer",
    title: "化工工程师",
    industry: "化工/能源",
    summary: "精细化工和新能源材料是新增长点",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [10000, 22000],
    salaryNote: "",
    outlook: "stable",
    tags: ["化工", "传统"],
  },

  {
    id: "automotive-engineer",
    title: "汽车工程师",
    industry: "汽车",
    summary: "新能源+智能驾驶，整车和零部件需求旺盛",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [12000, 28000],
    salaryNote: "",
    outlook: "rising",
    tags: ["汽车", "新能源"],
  },

  {
    id: "aerospace-engineer",
    title: "航空航天工程师",
    industry: "航空航天",
    summary: "商业航天爆发，民企入局带来新机会",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [15000, 30000],
    salaryNote: "",
    outlook: "rising",
    tags: ["航天", "高端"],
  },

  {
    id: "mining-engineer",
    title: "采矿工程师",
    industry: "矿业",
    summary: "薪资高但工作环境艰苦，人才供不应求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [12000, 25000],
    salaryNote: "",
    outlook: "stable",
    tags: ["矿业", "资源"],
  },

  {
    id: "nuclear-engineer",
    title: "核工程技术人员",
    industry: "核能",
    summary: "核电重启+核技术应用扩大",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [15000, 35000],
    salaryNote: "",
    outlook: "rising",
    tags: ["核能", "高端"],
  },

  // ── 医疗健康 (remaining) ──────────────────────────────────

  {
    id: "anesthesiologist",
    title: "麻醉医师",
    industry: "医疗健康",
    summary: "麻醉医生全国性短缺，薪资溢价明显",
    skills: [],
    positions: [],
    requirements: ["硕士+执业", "2-5年经验"],
    salaryRange: [15000, 35000],
    salaryNote: "",
    outlook: "rising",
    tags: ["医疗", "紧缺"],
  },

  {
    id: "rehabilitation-therapist",
    title: "康复治疗师",
    industry: "医疗健康",
    summary: "老龄化+运动康复意识提升推动需求",
    skills: [],
    positions: [],
    requirements: ["本科+执业", "0-5年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "rising",
    tags: ["康复", "增长"],
  },

  {
    id: "medical-imaging-technician",
    title: "医学影像技师",
    industry: "医疗健康",
    summary: "影像设备普及，操作技师需求稳定",
    skills: [],
    positions: [],
    requirements: ["本科+执业", "0-5年经验"],
    salaryRange: [8000, 18000],
    salaryNote: "",
    outlook: "stable",
    tags: ["医疗", "技术"],
  },

  {
    id: "public-health-specialist",
    title: "公共卫生专员",
    industry: "政府/医疗",
    summary: "疫情后公共卫生体系加强，疾控/卫健委需求增加",
    skills: [],
    positions: [],
    requirements: ["硕士优先", "0-3年经验"],
    salaryRange: [8000, 18000],
    salaryNote: "",
    outlook: "rising",
    tags: ["公卫", "政策"],
  },

  {
    id: "veterinarian",
    title: "兽医",
    industry: "农业/宠物",
    summary: "宠物经济爆发，连锁宠物医院快速扩张",
    skills: [],
    positions: [],
    requirements: ["本科+执业", "1-5年经验"],
    salaryRange: [8000, 25000],
    salaryNote: "",
    outlook: "rising",
    tags: ["宠物", "医疗"],
  },

  // ── 金融/商业 (remaining) ──────────────────────────────────

  {
    id: "actuary",
    title: "精算师",
    industry: "保险",
    summary: "考试周期长但通过后薪资水平高",
    skills: [],
    positions: [],
    requirements: ["本科+精算考试", "2-8年经验"],
    salaryRange: [15000, 40000],
    salaryNote: "",
    outlook: "stable",
    tags: ["保险", "证书"],
  },

  {
    id: "risk-manager",
    title: "风险管理师",
    industry: "金融",
    summary: "银行/保险/券商都需要，FRM/CFA加分",
    skills: [],
    positions: [],
    requirements: ["硕士+FRM", "2-5年经验"],
    salaryRange: [15000, 35000],
    salaryNote: "",
    outlook: "stable",
    tags: ["金融", "风控"],
  },

  {
    id: "supply-chain-manager",
    title: "供应链管理",
    industry: "物流/制造",
    summary: "跨境电商+智能制造推动供应链管理需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "1-5年经验"],
    salaryRange: [12000, 28000],
    salaryNote: "",
    outlook: "rising",
    tags: ["物流", "管理"],
  },

  {
    id: "insurance-underwriter",
    title: "保险精算/核保",
    industry: "保险",
    summary: "保险深度提升带来精算和核保人才需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "stable",
    tags: ["保险", "稳定"],
  },

  // ── 教育/学术 (remaining) ──────────────────────────────────

  {
    id: "special-education-teacher",
    title: "特殊教育教师",
    industry: "教育",
    summary: "国家投入持续增加，人才缺口大",
    skills: [],
    positions: [],
    requirements: ["本科+教资", "0-3年经验"],
    salaryRange: [6000, 15000],
    salaryNote: "",
    outlook: "rising",
    tags: ["教育", "公益"],
  },

  {
    id: "corporate-trainer",
    title: "教育培训师",
    industry: "教育/企业",
    summary: "企业内训和职业技能培训需求稳定",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "1-5年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "stable",
    tags: ["培训", "企业"],
  },

  {
    id: "chinese-teacher-abroad",
    title: "对外汉语教师",
    industry: "教育/国际",
    summary: "中文国际化推动需求，海外就业机会多",
    skills: [],
    positions: [],
    requirements: ["本科+教资", "0-3年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "rising",
    tags: ["教育", "国际"],
  },

  // ── 政府/公共 (remaining) ──────────────────────────────────

  {
    id: "fire-commander",
    title: "消防指挥",
    industry: "应急管理",
    summary: "应急管理体系完善带来新增岗位",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-3年经验"],
    salaryRange: [8000, 15000],
    salaryNote: "",
    outlook: "stable",
    tags: ["应急", "稳定"],
  },

  {
    id: "diplomat",
    title: "外交官/国际组织",
    industry: "外交/国际",
    summary: "外交部/国际组织，稳定性高且有海外经历",
    skills: [],
    positions: [],
    requirements: ["硕士+外语", "0-3年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "stable",
    tags: ["外交", "国际"],
  },

  {
    id: "urban-planner",
    title: "城市规划师",
    industry: "政府/设计",
    summary: "城市更新和智慧城市规划需求增加",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [10000, 22000],
    salaryNote: "",
    outlook: "stable",
    tags: ["规划", "城市"],
  },

  // ── 媒体/艺术/设计 (remaining) ─────────────────────────────

  {
    id: "industrial-designer",
    title: "工业设计师",
    industry: "制造/设计",
    summary: "消费电子和智能硬件推动工业设计需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "stable",
    tags: ["设计", "制造"],
  },

  {
    id: "curator",
    title: "策展人/画廊管理",
    industry: "艺术",
    summary: "艺术品市场持续增长，策展和管理人才需求稳定",
    skills: [],
    positions: [],
    requirements: ["硕士优先", "2-5年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "stable",
    tags: ["艺术", "文化"],
  },

  {
    id: "music-producer",
    title: "音乐制作/录音师",
    industry: "娱乐",
    summary: "音乐流媒体和短视频推动音频内容需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "1-5年经验"],
    salaryRange: [8000, 25000],
    salaryNote: "",
    outlook: "stable",
    tags: ["音乐", "创意"],
  },

  // ── 法律/社会 (remaining) ──────────────────────────────────

  {
    id: "social-worker",
    title: "社会工作者",
    industry: "NGO/社区",
    summary: "社会治理现代化推动社工职业化",
    skills: [],
    positions: [],
    requirements: ["本科+社工证", "0-3年经验"],
    salaryRange: [6000, 15000],
    salaryNote: "",
    outlook: "rising",
    tags: ["公益", "社会"],
  },

  {
    id: "ip-agent",
    title: "知识产权代理",
    industry: "法律",
    summary: "企业IP意识增强，专利和商标代理需求增长",
    skills: [],
    positions: [],
    requirements: ["本科+专利代理", "1-5年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "rising",
    tags: ["法律", "IP"],
  },

  // ── 农业/食品/环境 (remaining) ─────────────────────────────

  {
    id: "food-rd-engineer",
    title: "食品研发工程师",
    industry: "食品/快消",
    summary: "预制菜/功能性食品/植物基是新增长点",
    skills: [],
    positions: [],
    requirements: ["硕士及以上", "1-5年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "stable",
    tags: ["食品", "研发"],
  },

  {
    id: "agronomist",
    title: "农艺师",
    industry: "农业",
    summary: "智慧农业和种业振兴推动需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [8000, 18000],
    salaryNote: "",
    outlook: "stable",
    tags: ["农业", "科研"],
  },

  {
    id: "aquaculture-technician",
    title: "水产养殖技术员",
    industry: "渔业",
    summary: "深远海养殖和智慧渔业是新方向",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "stable",
    tags: ["水产", "养殖"],
  },

  {
    id: "forestry-manager",
    title: "森林资源管理",
    industry: "林业",
    summary: "碳汇交易和国家公园建设带来新机会",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-3年经验"],
    salaryRange: [7000, 15000],
    salaryNote: "",
    outlook: "stable",
    tags: ["林业", "生态"],
  },

  // ── 交通/物流/旅游 (remaining) ─────────────────────────────

  {
    id: "marine-engineer",
    title: "航海技术/轮机工程",
    industry: "航运",
    summary: "高薪但需海上作业，适合愿意吃苦换高收入",
    skills: [],
    positions: [],
    requirements: ["本科+船员证", "0-5年经验"],
    salaryRange: [15000, 40000],
    salaryNote: "",
    outlook: "stable",
    tags: ["航运", "高薪"],
  },

  {
    id: "hotel-manager",
    title: "酒店管理",
    industry: "旅游",
    summary: "高端酒店和度假村管理，国际品牌机会多",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "1-5年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "stable",
    tags: ["旅游", "服务"],
  },

  {
    id: "logistics-manager",
    title: "物流管理",
    industry: "物流/电商",
    summary: "跨境电商+智慧物流推动需求",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "1-5年经验"],
    salaryRange: [10000, 22000],
    salaryNote: "",
    outlook: "rising",
    tags: ["物流", "电商"],
  },

  // ── 特殊/小众 (all remaining) ───────────────────────────────

  {
    id: "jewelry-appraiser",
    title: "珠宝鉴定师",
    industry: "奢侈品",
    summary: "奢侈品和珠宝市场持续增长",
    skills: [],
    positions: [],
    requirements: ["本科+鉴定证", "2-5年经验"],
    salaryRange: [10000, 30000],
    salaryNote: "",
    outlook: "stable",
    tags: ["鉴定", "专业"],
  },

  {
    id: "sports-event-manager",
    title: "体育赛事管理",
    industry: "体育",
    summary: "职业联赛+全民健身推动体育产业",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "1-5年经验"],
    salaryRange: [10000, 25000],
    salaryNote: "",
    outlook: "rising",
    tags: ["体育", "管理"],
  },

  {
    id: "funeral-service",
    title: "殡葬服务管理",
    industry: "社会服务",
    summary: "老龄化推动需求，专业人才稀缺薪资较高",
    skills: [],
    positions: [],
    requirements: ["专科/本科", "0-3年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "stable",
    tags: ["特殊", "刚需"],
  },

  {
    id: "wine-brewer",
    title: "葡萄酒酿造",
    industry: "饮品",
    summary: "中国葡萄酒产业发展，从种植到品鉴全链条",
    skills: [],
    positions: [],
    requirements: ["本科及以上", "0-5年经验"],
    salaryRange: [8000, 20000],
    salaryNote: "",
    outlook: "rising",
    tags: ["饮品", "专业"],
  },

  {
    id: "pet-groomer",
    title: "宠物美容/训导师",
    industry: "宠物",
    summary: "宠物经济分支，门槛低但天花板高",
    skills: [],
    positions: [],
    requirements: ["专科/培训", "0-3年经验"],
    salaryRange: [6000, 20000],
    salaryNote: "",
    outlook: "rising",
    tags: ["宠物", "服务"],
  },

  {
    id: "esports-ops",
    title: "电竞运营/解说",
    industry: "游戏/传媒",
    summary: "电子竞技产业规范化，职业路径逐渐清晰",
    skills: [],
    positions: [],
    requirements: ["专科/本科", "0-3年经验"],
    salaryRange: [8000, 30000],
    salaryNote: "",
    outlook: "rising",
    tags: ["电竞", "新职业"],
  },

  // ================================================================
  //  NEW careers not in original 96 — 3 careers from the brief
  // ================================================================

  {
    id: "software-test-engineer",
    title: "软件测试工程师",
    industry: "互联网",
    summary: "通过自动化测试和手工测试保障软件质量，是产品上线前的最后一道防线",
    skills: [
      "测试方法论（黑盒/白盒/探索性）",
      "自动化测试（Selenium/Playwright/Appium）",
      "接口测试（Postman/JMeter）",
      "性能测试（JMeter/Locust）",
      "Python/Java 脚本编写",
      "SQL 与数据库验证",
      "CI/CD 集成测试",
    ],
    positions: [
      { title: "初级测试工程师", level: "entry", dailyWork: "执行测试用例、提 Bug、回归验证、写简单测试脚本" },
      { title: "测试工程师", level: "mid", dailyWork: "独立设计测试方案，编写自动化脚本，参与需求评审" },
      { title: "高级测试工程师", level: "senior", dailyWork: "搭建测试框架和平台，制定测试策略，推动质量流程" },
      { title: "测试架构师/质量负责人", level: "lead", dailyWork: "制定公司级质量规范，建设测试基础设施，管理 QA 团队" },
      { title: "质量VP/测试总监", level: "expert", dailyWork: "公司质量文化建设，全流程质量管理，跨部门质量协同" },
    ],
    requirements: ["本科及以上（计算机相关）", "细心、逻辑清晰", "有自动化测试经验优先"],
    salaryRange: [10000, 25000],
    salaryNote: "AI 辅助测试让效率大幅提升，但测试设计能力不可替代",
    outlook: "stable",
    tags: ["测试", "质量", "互联网"],
  },

  {
    id: "system-architect",
    title: "系统架构师",
    industry: "互联网",
    summary: "设计大规模分布式系统的整体架构，平衡性能、成本、可维护性和业务需求",
    skills: [
      "分布式系统设计（CAP/Paxos/Raft）",
      "微服务与领域驱动设计（DDD）",
      "数据库架构（分库分表/读写分离）",
      "消息队列与事件驱动架构",
      "缓存策略（Redis/Memcached/CDN）",
      "安全架构与合规",
      "技术选型与成本评估",
    ],
    positions: [
      { title: "高级开发工程师（架构预备）", level: "entry", dailyWork: "在架构师指导下实现架构方案，参与技术选型讨论" },
      { title: "架构师", level: "mid", dailyWork: "主导单系统或模块的架构设计，制定技术方案和演进路线" },
      { title: "高级架构师", level: "senior", dailyWork: "负责业务线或技术域的架构治理，推动技术债务清理" },
      { title: "首席架构师", level: "lead", dailyWork: "制定公司级技术架构规范和标准，评审重大技术决策" },
      { title: "CTO/技术VP", level: "expert", dailyWork: "公司技术战略制定，技术品牌建设，工程文化塑造" },
    ],
    requirements: ["本科及以上（计算机相关）", "5+ 年开发经验", "有大型分布式系统设计经验"],
    salaryRange: [25000, 60000],
    salaryNote: "需要深厚的技术广度和深度，通常由资深后端晋升",
    outlook: "rising",
    tags: ["架构", "技术", "高端"],
  },

  {
    id: "marketing-specialist",
    title: "市场营销专员",
    industry: "快消/互联网",
    summary: "策划和执行市场营销活动，提升品牌知名度和产品销量",
    skills: [
      "市场调研与消费者洞察",
      "品牌策划与定位",
      "数字营销（SEM/SEO/信息流）",
      "内容营销与社交媒体",
      "活动策划与执行",
      "数据分析与 ROI 评估",
      "渠道管理与商务谈判",
    ],
    positions: [
      { title: "市场助理/专员", level: "entry", dailyWork: "协助执行营销活动，整理市场数据，对接供应商" },
      { title: "市场营销经理", level: "mid", dailyWork: "独立策划并管理营销项目，制定推广方案和预算" },
      { title: "高级市场经理", level: "senior", dailyWork: "负责产品线或区域的整体营销策略，管理品牌资产" },
      { title: "市场总监", level: "lead", dailyWork: "制定年度营销战略，管理市场团队，把控品牌方向" },
      { title: "CMO/市场营销VP", level: "expert", dailyWork: "公司级营销战略，品牌顶层设计，全渠道增长" },
    ],
    requirements: ["本科及以上（市场营销/商科优先）", "有营销实习或项目经验", "创意+数据分析双重能力"],
    salaryRange: [8000, 22000],
    salaryNote: "数字营销和私域运营能力是薪资分水岭",
    outlook: "stable",
    tags: ["营销", "品牌", "创意"],
  },
];

// ── Helpers ──────────────────────────────────────────────────

const OUTLOOK_ICON: Record<string, { icon: typeof TrendingUp; color: string; label: string }> = {
  rising: { icon: TrendingUp, color: "text-green-600", label: "上升期" },
  stable: { icon: Minus, color: "text-yellow-600", label: "稳定期" },
  declining: { icon: TrendingDown, color: "text-red-500", label: "下滑期" },
};

const LEVEL_LABELS: Record<string, string> = {
  entry: "初级",
  mid: "中级",
  senior: "高级",
  lead: "资深/负责人",
  expert: "专家",
};

const LEVEL_COLORS: Record<string, string> = {
  entry: "bg-blue-50 text-blue-700",
  mid: "bg-cyan-50 text-cyan-700",
  senior: "bg-purple-50 text-purple-700",
  lead: "bg-orange-50 text-orange-700",
  expert: "bg-red-50 text-red-700",
};

// ── Component ────────────────────────────────────────────────

export function CareerExplorer() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [outlookFilter, setOutlookFilter] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const industries = useMemo(
    () => [...new Set(CAREERS.map((c) => c.industry))].sort(),
    []
  );

  const filtered = useMemo(() => {
    let result = CAREERS;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q)) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (industryFilter) result = result.filter((c) => c.industry === industryFilter);
    if (outlookFilter) result = result.filter((c) => c.outlook === outlookFilter);
    return result;
  }, [search, industryFilter, outlookFilter]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatSalary = (range: [number, number]) =>
    `${Math.round(range[0] / 1000)}k-${Math.round(range[1] / 1000)}k`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-1">路径探索</h2>
        <p className="text-sm text-muted-foreground">
          了解每个职业方向需要学什么、能做什么、能走到哪里
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索职业、技能、标签..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="text-sm border border-border rounded-lg bg-background px-3 py-2"
        >
          <option value="">全部行业</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        <select
          value={outlookFilter}
          onChange={(e) => setOutlookFilter(e.target.value)}
          className="text-sm border border-border rounded-lg bg-background px-3 py-2"
        >
          <option value="">全部趋势</option>
          <option value="rising">上升期</option>
          <option value="stable">稳定期</option>
          <option value="declining">下滑期</option>
        </select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} 个职业
        </span>
      </div>

      {/* Career Cards */}
      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">
          没有匹配的职业方向，试试调整搜索条件
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((career) => {
            const isExpanded = expandedIds.has(career.id);
            const outlook = OUTLOOK_ICON[career.outlook];
            const OutlookIcon = outlook.icon;

            return (
              <div
                key={career.id}
                className="border border-border rounded-xl bg-card hover:shadow-md transition-shadow"
              >
                {/* Card Header — always visible */}
                <button
                  onClick={() => toggleExpand(career.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {career.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {career.summary}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                  </div>

                  {/* Skills preview (collapsed) — only show if skills exist */}
                  {!isExpanded && career.skills.length > 0 && (
                    <div className="mt-3">
                      <span className="text-xs text-muted-foreground">
                        技能树{" "}
                      </span>
                      <span className="text-xs text-foreground/80">
                        {career.skills.slice(0, 3).join(" → ")}
                        {career.skills.length > 3 ? " ..." : ""}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {career.industry}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${outlook.color} bg-background border border-border`}
                    >
                      <OutlookIcon className="h-3 w-3" />
                      {outlook.label}
                    </span>
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border space-y-4 pt-4">
                    {/* Skills — full (only if skills exist) */}
                    {career.skills.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          技能树
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {career.skills.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Positions (only if positions exist) */}
                    {career.positions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          典型岗位路径
                        </h4>
                        <div className="space-y-2">
                          {career.positions.map((pos, i) => (
                            <div key={pos.title} className="flex items-start gap-2">
                              {i > 0 && (
                                <div className="flex items-center justify-center w-5 flex-shrink-0">
                                  <div className="w-0.5 h-3 bg-border" />
                                </div>
                              )}
                              {i === 0 && <div className="w-5 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">
                                    {pos.title}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${LEVEL_COLORS[pos.level] || "bg-gray-100 text-gray-600"}`}
                                  >
                                    {LEVEL_LABELS[pos.level] || pos.level}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {pos.dailyWork}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Requirements */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        入门条件
                      </h4>
                      <ul className="list-disc list-inside space-y-0.5">
                        {career.requirements.map((req) => (
                          <li key={req} className="text-sm text-foreground/80">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Salary — auxiliary, small text */}
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        参考薪资：{formatSalary(career.salaryRange)}/月
                        {career.salaryNote ? `（${career.salaryNote}）` : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
