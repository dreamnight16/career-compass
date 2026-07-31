**語言 / Language:** [English](README.en.md) | [简体中文](README.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md)

# 歧點 — 看清每條岔路的樣子

> 不是告訴你該選哪條路，而是讓你看清楚每條路的樣子，然後自己決定。

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-orange)](https://ui.shadcn.com/)

---

## 為什麼要做這個

上大學的時候，很多人到大三才開始想「我到底要幹嘛」。考研？工作？考公？出國？每條路都有人說好有人說坑，不知道誰說的是真的。

小紅書和知乎上到處都是「雙非逆襲985」和「XX專業已死」，發帖的都是極端案例，沉默的大多數根本看不到。

這個項目做的事很簡單：**把每條路真實的樣子展示出來**——不替你判斷，也不會給出什麼標準答案。

---

## 核心原則

| 原則 | 含義 |
|------|------|
| **H-I-P（人主導規劃）** | AI 不替你做決定。它說「A路優勢X風險Y，B路優勢W風險Z」 |
| **角色卡機制** | 8 維度漸進式資訊收集，資訊不足 6 維度不推薦 |
| **教決策框架** | 教你下次遇到類似問題時自己分析 |
| **數據可追溯** | 每條 AI 引用的數據標註知識條目 ID，可點擊驗證來源 |
| **反倖存者偏差** | 數據是極端個例時明確指出 |

---

## 快速開始

### 環境要求

- Node.js ≥ 18
- npm ≥ 9

### 安裝與執行

```bash
git clone https://github.com/sixtdreanight/career-compass.git
cd career-compass

npm install

cp .env.example .env
# 編輯 .env，填入 ANTHROPIC_API_KEY

npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000) 開始使用。

### 開發指令

```bash
npm run dev        # 開發模式
npm run build      # 生產構建
npm run start      # 生產執行
npm run typecheck  # TypeScript 類型檢查
npm run lint       # ESLint 檢查
```

---

## 技術棧

| 技術 | 用途 |
|------|------|
| [Next.js 14](https://nextjs.org/) | 全棧框架 (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | 類型安全 |
| [shadcn/ui](https://ui.shadcn.com/) | UI 組件庫 |
| [Tailwind CSS](https://tailwindcss.com/) | 樣式系統 |
| [Claude API](https://docs.anthropic.com/) | AI 對話引擎 |
| [lucide-react](https://lucide.dev/) | 圖標庫 |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | 會話存儲 |

---

## 資源索引

內建 **310+ 策展連結**，覆蓋：
- 13 個教育部學科門類
- 84 項教育部白名單競賽
- 45 個行業垂直招聘平台
- 科研暑研/學術會議/論文發表
- GitHub Awesome 系列（30+ 倉庫）

**設計原則：不搬運數據，只索引「去哪找」。**

---

## 知識庫爬蟲

```bash
cd knowledge-crawler
pip install -r requirements.txt
export DEEPSEEK_API_KEY=sk-...

# 根據用戶畫像動態搜索
python main.py --profile '{"major":"金融學","targetCity":"上海","budget":200000}'

# 批量預置搜索
python main.py
```

---

## 貢獻

歡迎貢獻！詳見 [CONTRIBUTING.md](./CONTRIBUTING.md)。

貢獻方式：
- 新增/修正資源連結
- 完善知識庫原子數據
- 改進 AI 提示詞
- 報告 Bug 或提出功能請求

---

## License

[MIT](./LICENSE)
