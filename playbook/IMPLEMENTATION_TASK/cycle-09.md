# IMPLEMENTATION TASK – Cycle 9  
**PoCクローズ（README / Decisions / Releaseメモ）**

---

## Goal
PoCを「完成」と言える状態にするため、ドキュメントと判断材料を整える。  
機能追加は行わない。

---

## Scope

### Must include

#### 1) README.md 更新
以下のセクションを追加/整理する：

- Overview（1段落）
- Features（PoCでできること）
  - オフラインPWA日記（IndexedDB）
  - 作成/編集/削除
  - 検索
  - 月の振り返り（Review）
  - 要約（端末内・ルールベース）
  - エクスポート/インポート
  - 暗号化バックアップ（パスワード）
- Privacy / Security（短く）
  - 日記本文を外部送信しない
  - データは端末内に保存
  - 例外：アプリ配信と（もしあるなら）静的アセット取得のみ
- Setup
  - npm install
  - npm run dev
  - npm run build
  - npm run preview
- Verification checklist（最小）
  - CRUD
  - 永続化
  - オフライン
  - 検索
  - Review
  - バックアップ（通常/暗号化）
- Out of scope（やらないこと）
  - クラウド同期/ログイン
  - 外部API要約
  - WebGPU/LLM本格導入（将来検討）
  - 感情推定/週月要約/分析

#### 2) docs/DECISIONS.md 追記（Lightweight ADR）
追加する決定（例）：
- Local-first（IndexedDB）を採用した理由
- 外部送信をしない方針の理由
- 要約はルールベースをデフォルトにした理由（端末差/安定性）
- 暗号化バックアップの方式と理由（AES-GCM + PBKDF2）
- 注意点：
  - パスワードを忘れると復元できない
  - 暗号化は端末/実装の安全性に依存（脅威モデルは限定的）

#### 3) playbook/RELEASE.md（存在しなければ新規作成）
最短のPoCデプロイ手順を記載：
- Cloudflare Pagesへの基本手順（ビルド成果物、設定項目）
- 環境変数が不要であること（本PoC）
- CSP/headersを設定している場合、その場所（_headers等）を明記

### Must NOT include
- 機能追加
- 依存追加
- 外部通信追加

---

## Acceptance Criteria
- [ ] READMEがPoCの説明として過不足ない
- [ ] docs/DECISIONS.md に主要判断が残っている
- [ ] RELEASE.md にPoC公開の最短手順がある
- [ ] 既存動作が壊れていない（軽い起動確認でOK）

---

## Notes
- 文章は短く、箇条書き中心でOK
- “理想論”よりも「何をした/しない」を明確に