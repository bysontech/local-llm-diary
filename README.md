# Local LLM Diary

プライバシーを重視した日記・感情ログPWA。すべてのデータは端末内（IndexedDB）に保存され、外部サーバーへの送信は一切ありません。オフラインでも動作し、暗号化バックアップにも対応しています。

## Features

- **日記CRUD**: 作成・閲覧・編集・削除
- **自動要約**: ルールベースで日記の要点を抽出（端末内処理）
- **検索**: 本文・要約を対象としたキーワード検索
- **振り返り（Review）**: 月単位で日記を一覧表示
- **PWA**: オフライン対応、ホーム画面に追加可能
- **バックアップ**: JSON形式でエクスポート/インポート
- **暗号化バックアップ**: AES-256-GCM + PBKDF2でパスワード保護

## Privacy / Security

- **外部送信なし**: すべてのデータは端末内のIndexedDBに保存
- **ネットワーク不要**: オフラインでも全機能が動作
- **暗号化オプション**: バックアップファイルをパスワードで保護可能
- **要約処理**: 外部APIを使用せず、端末内でルールベース処理

## Setup

```bash
# 依存インストール
npm ci

# 本番ビルド時: 正canonical URL を設定（任意）
# .env.example をコピーして .env を作成し、VITE_APP_ORIGIN を編集する。
# 未設定時は空文字となり、canonical / PWA / OG で利用する際に設定が必要。
cp .env.example .env

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## Verification Checklist

動作確認用チェックリスト:

- [ ] **CRUD**: 日記の作成・表示・編集・削除ができる
- [ ] **永続化**: リロード後もデータが残る
- [ ] **オフライン**: DevTools > Network > Offlineでも動作する
- [ ] **検索**: キーワードで日記を絞り込める
- [ ] **Review**: 振り返り画面で月別に日記を確認できる
- [ ] **バックアップ**: エクスポート → データ削除 → インポートで復元できる
- [ ] **暗号化バックアップ**: パスワード付きでエクスポート/インポートできる
- [ ] **初回ガイド**: 初回起動時にプライバシー説明が表示される

## Out of Scope (PoC)

以下は本PoCの範囲外です:

- クラウド同期・マルチデバイス対応
- 外部API（OpenAI等）による要約
- WebGPU/WebLLMによるローカルLLM推論
- 感情分析・グラフ表示
- ユーザー認証・ログイン機能
- 週単位の振り返り・期間集計

## Tech Stack

- Vite + React + TypeScript
- PWA (vite-plugin-pwa)
- IndexedDB (Dexie.js)
- WebCrypto API (AES-GCM, PBKDF2)
