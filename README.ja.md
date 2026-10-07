**言語 / Language:** [English](README.en.md) | [简体中文](README.md) | [繁體中文](README.zh-Hant.md) | [日本語](README.ja.md)

# 歧点（Divergence）— それぞれの道の姿を見る

> どの道を選ぶべきかを教えるのではなく、それぞれの道が実際にどのようなものかを見せる——そしてあなた自身が決める。

[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-orange)](https://ui.shadcn.com/)

---

## なぜこれを作ったのか

多くの大学生は三年生になるまで「自分は何をしたいのか」を考え始めません。大学院？就職？公務員？留学？どの道にも賛成派と反対派がいて、誰の言うことが正しいのかわかりません。

小紅書や知乎には「非エリート校から一流大学院へ逆転合格」や「○○専攻は終わった」といった極端な事例ばかり。投稿するのは極端なケースで、沈黙する大多数の声は見えてきません。

このプロジェクトがやることはシンプルです：**それぞれの道の本当の姿を見せること**——判断を下したり、標準的な答えを出したりはしません。

---

## コア原則

| 原則 | 意味 |
|------|------|
| **H-I-P（人間主導の計画）** | アシスタントは各ルートの利点と負担を並べます。決めるのはあなたです |
| **ロールカード** | 8次元の段階的な情報収集。6/8次元が埋まるまでは推奨しません |
| **意思決定フレームワーク** | 次に同じような選択に直面したときに自分で分析する方法を教えます |
| **データ追跡可能性** | 引用したデータには知識エントリIDがあり、元の情報を確認できます |
| **生存者バイアス対策** | データが極端な例外である場合は明示的に指摘します |

---

## クイックスタート

### 必要条件

- Node.js ≥ 18
- npm ≥ 9

### インストールと実行

```bash
git clone https://github.com/dreamnight16/career-compass.git
cd career-compass

npm install

cp .env.example .env
# .envを編集し、ANTHROPIC_API_KEYを設定

npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて開始。

### 開発コマンド

```bash
npm run dev        # 開発モード
npm run build      # 本番ビルド
npm run start      # 本番サーバー
npm run typecheck  # TypeScript型チェック
npm run lint       # ESLint
```

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| [Next.js 14](https://nextjs.org/) | フルスタックフレームワーク (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | 型安全性 |
| [shadcn/ui](https://ui.shadcn.com/) | UIコンポーネントライブラリ |
| [Tailwind CSS](https://tailwindcss.com/) | スタイリングシステム |
| [Claude API](https://docs.anthropic.com/) | AIチャットエンジン |
| [lucide-react](https://lucide.dev/) | アイコンライブラリ |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | セッションストレージ |

---

## リソースインデックス

**310以上のキュレーションリンク**を内蔵：
- 13の教育部学科分野
- 84の教育部認定コンテスト
- 45の業界別求人プラットフォーム
- 研究インターンシップ、学会、論文発表
- GitHub Awesomeコレクション（30以上のリポジトリ）

**設計原則：データをコピーせず、「どこで見つけられるか」を索引する。**

---

## ナレッジクローラー

```bash
cd knowledge-crawler
pip install -r requirements.txt
export DEEPSEEK_API_KEY=sk-...

# ユーザープロファイルによる動的検索
python main.py --profile '{"major":"金融学","targetCity":"上海","budget":200000}'

# バッチプリセット検索
python main.py
```

---

## コントリビューション

貢献を歓迎します！詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

貢献方法：
- リソースリンクの追加・修正
- 知識ベースの原子データの改善
- AIプロンプトの改良
- バグ報告や機能リクエスト

---

## ライセンス

[MIT](./LICENSE)
