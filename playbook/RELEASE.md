# Release / Deploy Guide

Cloudflare Pagesへのデプロイ手順。

## 前提条件

- Cloudflareアカウント
- GitHubリポジトリへのpush権限

## 最短デプロイ手順

### 1. Cloudflare Pagesプロジェクト作成

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. Workers & Pages > Create application > Pages
3. Connect to Git > GitHubリポジトリを選択

### 2. ビルド設定

| 項目 | 値 |
|------|-----|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` (デフォルト) |
| Node.js version | 20.x（Environment variables で `NODE_VERSION=20` を設定） |

### 3. デプロイ

- 設定完了後、「Save and Deploy」でデプロイ開始
- 以降、mainブランチへのpushで自動デプロイ

## ビルド出力

```
dist/
├── index.html
├── manifest.webmanifest
├── sw.js                    # Service Worker
├── workbox-*.js
└── assets/
    ├── index-*.js           # メインバンドル（約300KB）
    └── index-*.css
```

## 設定ポイント

### PWA対応

`vite.config.ts` で以下を設定済み:

- `registerType: 'prompt'` - ユーザーに更新確認を促す
- `manifest` - アプリ名・アイコン・テーマカラー

### SPA対応

Cloudflare Pagesはデフォルトで`/index.html`へのフォールバックを行うため、`_redirects`ファイルは不要。

### キャッシュ制御（オプション）

必要に応じて `public/_headers` を作成:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/sw.js
  Cache-Control: no-cache
```

現在このファイルは未作成（Cloudflareデフォルトで動作）。

## ローカルでのビルド確認

```bash
# ビルド
npm run build

# ビルド結果をローカルでプレビュー
npm run preview
```

`http://localhost:4173` でビルド済みアプリを確認可能。

## トラブルシューティング

### ビルド失敗: Node.jsバージョン

Cloudflare Pagesのデフォルトは古いNode.jsのため、Environment variablesで `NODE_VERSION=20` を設定。

### PWAが更新されない

1. DevTools > Application > Service Workers で「Update on reload」を有効化
2. または「Unregister」してリロード

### IndexedDBデータが消えた

- ブラウザのストレージ削除、またはプライベートモード使用が原因
- 設定画面からバックアップを推奨
