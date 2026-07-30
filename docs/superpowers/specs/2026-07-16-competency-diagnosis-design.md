# 歧点能力诊断功能设计文档

> 版本: v1.0 | 日期: 2026-07-16 | 状态: 设计确认

## 1. 问题定义

### 当前产品缺口

歧点帮助学生了解职业路线和权衡，但存在「知道→做到」的断层：

1. **知道路线 ≠ 知道自己缺什么** — 学生了解了职业路径，但不知道离目标差多远
2. **知道缺什么 ≠ 知道怎么补** — 即便知道要提升的能力，也不清楚具体怎么训练
3. **知道怎么补 ≠ 真的去做了** — 缺乏持续的引导和进度感知

### 目标

将歧点从「路线图展示器」升级为「能力成长教练」——在保持 H-I-P 核心哲学（AI 教决策不替决策）的前提下，增加能力差距诊断和精准资源匹配。

### 产品边界（明确不做的事）

- **不建教学平台**：不做课程播放器、不做在线评测系统、不做练习环境
- **不建社区（现阶段）**：社区共建是规模扩大后的方向，初期纯 AI 驱动
- **不存用户数据服务端**：现阶段前端本地存储，不引入后端数据库

---

## 2. 理论基础

设计基于以下经过验证的框架：

### 2.1 冰山模型（McClelland, 1973; Spencer & Spencer, 1993）

能力分为可见层和隐藏层：
- **水上（可见）**：技能 Skills + 知识 Knowledge — 易观察、易训练
- **水下（隐藏）**：自我认知 + 特质 + 动机 — 决定 80-90% 的卓越表现差异，需长期培养

设计决策：能力画像同时覆盖水上和水下层，不回避软能力。

### 2.2 Bloom 认知分类学（Anderson & Krathwohl 修订版, 2001）

6 级认知层次：记忆 → 理解 → 应用 → 分析 → 评价 → 创造

设计决策：能力水平标尺简化为 5 级（Bloom 6 层 + 中国国家职业技能 5 级取交集）。

### 2.3 SFIA 7 级责任层级

Follow → Assist → Apply → Enable → Advise → Influence → Set Strategy

设计决策：参考其「每一级有明确行为描述」的做法，5 级标尺每级都有具体行为锚定。

### 2.4 中国大学生就业能力 6 维模型

综合 2023-2025 年多项实证研究（鲍威&万义辉, 2025; 程海彧等, 2024; 衣明丽, 2024; 史秋衡&任可欣, 2023），6 个核心维度形成高度共识：

1. **专业素养** — 专业理论、前沿动态、实际运用
2. **可迁移能力** — 沟通、合作、问题解决、批判性思维
3. **数智素养** — 数字思维、AI 工具使用、数据分析（2024 年兴起的新维度）
4. **职业发展能力** — 职业规划、求职技能、生涯管理
5. **情绪管理** — 抗压、情绪调节、心理韧性
6. **自我效能** — 自信、自我认知、社会责任感

设计决策：这 6 维作为能力分类的顶层标签。

### 2.5 技能差距分析标准方法论（业界共识 7 步法）

定义角色 → 建立能力框架 → 映射所需能力 → 测量当前水平 → 量化差距 → 优先级排序 → 匹配干预措施

设计决策：差距分析流程直接对应这 7 步。

### 2.6 中国本土标准

- 《中华人民共和国职业分类大典（2022年版）》：完整职业分类体系
- 约 600 个国家职业标准：定义每个职业的「工作要求」
- 职业技能等级：初级（五级）、中级（四级）、高级（三级）
- 超过 1000 个职业有技能等级认定

设计决策：能力条目关联职业分类大典编码；5 级标尺与国家职业技能等级对齐。

---

## 3. 数据模型

### 3.1 能力冰山结构

```typescript
interface CompetencyIceberg {
  visible: {
    skills: Skill[];
    knowledge: Knowledge[];
    certifications: Cert[];
  };
  hidden: {
    selfConcept: string[];  // 自我认知、职业认同、价值观
    traits: string[];       // 责任心、抗压力、适应性
    motives: string[];      // 成就动机、权力动机、亲和动机
  };
}
```

### 3.2 能力条目

```typescript
interface Competency {
  id: string;
  name: string;                // "法律检索与文书写作"

  // 冰山分层
  layer: 'skill' | 'knowledge' | 'cert' | 'self_concept' | 'trait' | 'motive';

  // 6 维分类（对齐中国大学生就业能力模型）
  type: 'professional' | 'transferable' | 'digital' | 'career_dev' | 'emotional' | 'self_efficacy';

  // 5 级能力水平标尺（对齐 Bloom + 中国职业技能等级）
  proficiencyLevels: {
    '1_awareness': string;    // 了解：知道概念，没做过 (Bloom: Remember)
    '2_guided': string;       // 辅助：有人指导能完成 (Bloom: Understand+Apply入门)
    '3_independent': string;  // 独立：能自主交付 (Bloom: Apply)
    '4_analysis': string;     // 分析：能拆解、对比、改进 (Bloom: Analyze+Evaluate)
    '5_creation': string;     // 创新：能设计新方案、指导他人 (Bloom: Create)
  };

  relatedOccupations: string[];     // 关联职业（对标职业分类大典编码）
  weightInOccupation: number;       // 0-1，在当前目标职业中的重要性
  importanceRationale: string;      // AI 生成的重要性解释
}
```

### 3.3 学生能力画像

```typescript
interface StudentCompetencyProfile {
  selfAssessments: {
    competencyId: string;
    currentLevel: 1 | 2 | 3 | 4 | 5;
    evidence: string;                  // 学生自述的证据
    lastUpdated: string;
  }[];

  // AI 从对话中推断的能力信号
  inferredSignals: {
    competencyId: string;
    inferredLevel: 1 | 2 | 3 | 4 | 5;
    confidence: number;  // 0-1
    source: string;      // 推断依据
  }[];
}
```

### 3.4 差距分析结果

```typescript
interface CompetencyGapAnalysis {
  targetOccupation: string;

  gaps: {
    competency: Competency;
    currentLevel: 1 | 2 | 3 | 4 | 5;
    targetLevel: 1 | 2 | 3 | 4 | 5;
    gap: number;  // target - current
    priority: 'blocker' | 'critical' | 'important' | 'nice_to_have';
    // blocker: 不掌握就进不了门槛（如司法考试资格证）
    // critical: 影响核心竞争力
    // important: 提升竞争力但非必须
    // nice_to_have: 锦上添花
  }[];

  resourceMatches: {
    competencyId: string;
    resources: ResourceLink[];
    suggestedSequence: number;
    rationale: string;
  }[];
}
```

---

## 4. 用户交互设计

### 4.1 三条入口路径

| 路径 | 触发方式 | 适用场景 |
|------|---------|---------|
| 职业导向 | 学生输入/选择目标职业 | 已有明确方向的学生 |
| 画像导向 | 从 8 维画像推断目标职业 | 方向模糊但画像完善的学生 |
| 对话自然引导 | 聊天中 AI 发现能力缺口主动提示 | 探索中的学生 |

### 4.2 核心交互：能力画像卡片

主界面展示目标职业的能力全景图：
- 总匹配度百分比
- 按 6 维分类的能力条目列表，每条显示：名称、当前/目标水平对比条、差距状态标签
- 门槛证书单独高亮
- 底部「优先补强」排序推荐

### 4.3 能力详情展开

点击任一能力条目：
- 该能力在此职业中为什么重要（一句话）
- 当前水平行为描述 vs 目标水平行为描述
- 3-5 个精准匹配的学习资源（标注平台、预计投入时间、建议学习顺序）

### 4.4 用户成长模式选择

学生可以选择自己偏好的成长方式：
- **自主模式**：自己看能力卡片、选资源、定计划，系统只提供框架
- **教练模式**：AI 持续跟进，对话中检查进度、调整建议
- **同伴模式**（未来社区化后开放）：学生之间互相督促

### 4.5 整体流程节奏

```
选择目标职业（或从对话推断）
  → AI 生成该职业能力画像（约 15-25 个能力条目）
  → 学生自评各能力水平（可跳过，AI 后续逐步推断）
  → 系统展示差距全景卡片 + 优先级排序
  → 点击任意差距 → 展开资源匹配 + 学习路径建议
  → 持续：随对话深入，AI 动态更新推断，推荐调整
```

---

## 5. 系统架构

### 5.1 新增模块

```
src/
├── types/competency.ts              # 能力相关类型定义 (新建)
├── lib/
│   ├── competency-generator.ts      # AI 生成职业能力画像 (新建)
│   ├── competency-extractor.ts      # 从对话中提取能力信号 (新建)
│   └── resource-matcher.ts          # 能力 → 学习资源匹配 (新建)
├── components/chat/
│   ├── CompetencyCard.tsx            # 能力画像卡片(全局视图) (新建)
│   └── GapPanel.tsx                 # 差距详情面板 (新建)
```

### 5.2 需修改的文件

| 文件 | 改动 |
|------|------|
| `src/types/index.ts` | 引入 competency 类型 |
| `src/lib/profile-extractor.ts` | 加入能力信号提取规则 |
| `src/lib/rag.ts` | buildSystemPrompt 中加入能力上下文 |
| `src/components/chat/ChatInterface.tsx` | 集成 CompetencyCard 和 GapPanel |
| `src/data/resources.ts` | 渐进给资源链接加能力标签 |

### 5.3 数据流

```
用户消息 ─→ 能力信号提取器 ─→ 更新学生能力画像
目标职业 ─→ 能力生成器 ─→ 结构化能力画像 JSON
学生自评 ─→ 差距计算 ─→ 差距卡片
资源库   ─→ 资源匹配器 ─→ 学习路径推荐
```

### 5.4 设计决策

| 决策 | 理由 |
|------|------|
| AI Prompt 驱动而非向量数据库 | 当前系统已是 prompt 驱动；Claude 对主流职业能力要求有充分训练知识；保持架构一致 |
| 前端本地存储而非服务端数据库 | 现阶段不引入后端复杂度；后期需要跨设备时再加 |
| 标签匹配先于语义搜索 | 资源库已有 29 个分类标签，先硬匹配验证效果，再考虑 embedding |
| 能力自评可跳过 | 降低启动门槛；AI 在对话中逐步补全 |

---

## 6. 实现阶段

### 第一阶段：能力画像生成（后端先行）
- 定义 competency.ts 类型
- 实现 competency-generator.ts
- 对 5+ 不同职业验证生成质量

### 第二阶段：差距展示（前端）
- 对话 Tab 内新增能力诊断入口
- CompetencyCard 组件
- 学生自评交互
- 前端差距计算

### 第三阶段：资源匹配
- resources.ts 增量加能力标签
- resource-matcher.ts 实现
- 差距卡片中展示资源推荐

### 第四阶段：对话深度整合
- 扩展 profile-extractor 的能力信号提取
- buildSystemPrompt 注入能力上下文
- AI 主动识别和讨论能力差距

---

## 7. 成功指标

- 学生能完成能力自评（至少评估 60% 的生成条目）
- 能力画像生成质量：5 个以上不同专业（医、法、金融、CS、师范）的人工评审通过
- 资源匹配准确率：至少 70% 的匹配建议被学生标记为「相关」
- 不背离 H-I-P 哲学：能力卡片展示差距而不推荐特定路径，资源推荐标注多选项

---

## 8. 风险 & 缓解

| 风险 | 缓解 |
|------|------|
| AI 生成的能力画像不准确（尤其冷门专业） | 每项能力标注「AI 推断」信任级别；后期社区纠正 |
| 学生自评偏差大（过度自信或过度谦虚） | 双通道：自评 + AI 对话推断交叉验证 |
| 资源库覆盖不全（某些专业学习资源少） | AI 实时搜索补充外部资源链接 |
| token 消耗大（每次对话都注入能力上下文） | 能力画像缓存 + 仅注入最高优先级的 3-5 个差距 |
