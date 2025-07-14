# Fixed Points Frontend

React + TypeScript + Vite + Chakra UIで構築されたフロントエンドアプリケーションです。

## 必要な環境

- Node.js 18以上
- npm または yarn

## セットアップ手順

1. リポジトリをクローンします：
```bash
git clone [repository-url]
cd fixed-points-frontend
```

2. 依存関係をインストールします：
```bash
npm install
```

## 起動方法

### 開発サーバーの起動

```bash
npm run dev
```

デフォルトでは http://localhost:5173 でアクセスできます。

### プロダクションビルド

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

### プレビューサーバーの起動

```bash
npm run preview
```

## WSL環境での注意事項

WSL (Windows Subsystem for Linux) を使用している場合、ブラウザからアクセスできない場合があります。

### 解決方法

1. PowerShellを**管理者として実行**します

2. 以下のコマンドを実行してポートフォワーディングを設定します：
```powershell
$wslIp = (wsl hostname -I).Trim().Split()[0]; netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=$wslIp
```

3. ブラウザで http://localhost:5173 にアクセスします

### ポートフォワーディング設定の確認

```powershell
netsh interface portproxy show all
```

### ポートフォワーディング設定の削除

```powershell
netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0
```

## スクリプト一覧

- `npm run dev` - 開発サーバーを起動（ホットリロード有効）
- `npm run build` - プロダクション用にビルド
- `npm run preview` - ビルドしたアプリをプレビュー
- `npm run lint` - ESLintでコードをチェック

## 技術スタック

- **React** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速なビルドツール
- **Chakra UI** - コンポーネントライブラリ
- **ESLint** - コード品質管理

## プロジェクト構造

```
fixed-points-frontend/
├── src/
│   ├── components/     # 再利用可能なコンポーネント
│   ├── pages/          # ページコンポーネント
│   ├── services/       # API通信などのサービス
│   ├── hooks/          # カスタムフック
│   ├── types/          # TypeScript型定義
│   ├── utils/          # ユーティリティ関数
│   ├── App.tsx         # メインアプリケーションコンポーネント
│   └── main.tsx        # エントリーポイント
├── public/             # 静的ファイル
├── dist/               # ビルド出力ディレクトリ
└── vite.config.ts      # Vite設定ファイル
```