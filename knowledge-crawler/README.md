# Career Maze 知识库爬虫

借鉴 [weekly-hotspot](https://github.com/dreamnight16/weekly-hotspot) 架构，
自动搜索 + AI 提取 + 输出结构化职业规划数据。

## 流水线

```
Phase 0: 搜索 → 多引擎并行搜索 (DDG + Bing)
Phase 1: 提取 → DeepSeek AI 从搜索结果中提取结构化 KnowledgeAtom
Phase 2: 输出 → 写入 .ts 文件 + 更新注册表
```

## 7 大数据维度

| 维度 | 搜索内容 | 输出目录 |
|------|---------|---------|
| salary | 城市×行业×学历×经验薪资 | `salary/` |
| education | 升学路径门槛/费用/时间 | `education/` |
| employment | 招聘需求/学历门槛/公司偏好 | `employment/` |
| trend | 行业趋势/替代风险评估 | `trend/` |
| policy | 落户/签证/选调政策 | `policy/` |
| cost | 城市生活成本基准 | `cost/` |
| life | 工作文化/职业天花板 | `life/` |

## 用法

```bash
# 安装依赖
pip install -r requirements.txt

# 设置 API Key
export DEEPSEEK_API_KEY=sk-...
export BING_API_KEY=...  # 可选，启用 Bing 搜索

# 运行全部
python main.py

# 只爬某个维度
python main.py --category salary

# 预演（不写文件）
python main.py --dry-run

# 跳过搜索（用缓存重试提取）
python main.py --skip-search
```

## 输出格式

每条数据输出为 `src/data/knowledge/{category}/{id}.ts`：

```ts
import type { KnowledgeAtom } from '@/types';

const atom: KnowledgeAtom = {
  id: "shanghai-cs-bachelor-foreign-2024",
  category: "salary",
  title: "上海计算机本科应届外企薪资 (2024)",
  content: "上海外企计算机本科应届生起薪中位数约...",
  data: { city: "上海", salaryRange: { min: 10000, max: 15000 }, ... },
  tags: ["上海", "计算机", "本科", "外企", "薪资"],
  sourceUrl: "https://...",
  trustLevel: "ai-inferred",
  lastUpdated: "2026-07-16",
};

export default atom;
```

## 后续

- 爬取批量数据后，将 `.ts` 文件放入 `src/data/knowledge/` 对应目录
- 在 `src/data/knowledge/index.ts` 的 `atomModules` 中注册新条目
- Wiki/社区化之前，爬虫是知识库的主要数据来源
