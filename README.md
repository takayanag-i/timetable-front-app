# Front-App - 時間割アプリ フロントエンド

Next.js 15を使用した時間割管理アプリケーションのフロントエンドです。

## 📚 ドキュメント

### リファクタリング提案

プロジェクトの改善提案とベストプラクティスについては、以下のドキュメントを参照してください：

- **[リファクタリング提案の全体像](./REFACTORING_PROPOSAL.md)** - 問題点と改善案
- **[実装例とコードサンプル](./REFACTORING_EXAMPLES.md)** - 具体的な実装方法
- **[推奨ディレクトリ構造](./DIRECTORY_STRUCTURE.md)** - ファイル配置のベストプラクティス
- **[ドキュメント一覧](./docs/README.md)** - すべてのドキュメントの案内

## Getting Started

### 開発サーバーの起動

```bash
npm install  # 初回のみ
npm run dev
```

ブラウザで [http://localhost:3001](http://localhost:3001) を開きます。

### スクリプト

```bash
npm run dev         # 開発サーバーを起動
npm run build       # プロダクションビルド
npm run start       # プロダクションサーバーを起動
npm run lint        # ESLintでコードをチェック
npm run format      # Prettierでコードをフォーマット
npm run format:check # フォーマットのチェックのみ
```

## プロジェクト構成

```
front-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (private)/          # プライベートルート
│   │   │   └── curriculum/     # カリキュラム管理機能
│   │   ├── api/                # API Routes（BFF層）
│   │   └── ...
│   ├── components/             # 共有UIコンポーネント
│   │   └── shared/
│   ├── core/                   # コアドメインロジック
│   │   └── domain/
│   │       └── entity/         # エンティティ定義
│   ├── lib/                    # ユーティリティとヘルパー
│   └── constants/              # 定数
├── docs/                       # プロジェクトドキュメント
└── public/                     # 静的ファイル
```

詳細は [DIRECTORY_STRUCTURE.md](./DIRECTORY_STRUCTURE.md) を参照してください。

## 技術スタック

- **フレームワーク**: Next.js 15.4.5 (App Router)
- **UI**: React 19.1.0
- **言語**: TypeScript 5.x
- **スタイリング**: CSS Modules
- **リンター**: ESLint + Prettier
- **バックエンド連携**: GraphQL (via BFF API Routes)

## 開発ガイドライン

プロジェクトの開発ガイドラインは `.github/instructions/nextjs.instructions.md` を参照してください。

### コーディング規約

- TypeScriptを使用し、型を明示する
- CSS Modulesでスタイルをスコープ化
- Server ComponentsとClient Componentsを適切に分離
- エイリアス（`@/`）を使用してインポート

### コミット前のチェックリスト

- [ ] `npm run lint` でエラーがないことを確認
- [ ] `npm run format` でコードをフォーマット
- [ ] 変更内容をテスト（手動または自動）

## 環境変数

`.env.example` を参考に `.env.local` を作成してください：

```bash
cp .env.example .env.local
```

## トラブルシューティング

### ビルドエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### 型エラー

```bash
# TypeScriptのキャッシュをクリア
rm -rf .next
npm run build
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
