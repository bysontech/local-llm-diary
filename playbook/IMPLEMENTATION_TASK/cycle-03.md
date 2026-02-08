# IMPLEMENTATION_TASK（Cycle 3）

## 対象テンプレ
- B（Cloudflare Pages + Vite + React + TypeScript + PWA）

## 目的（1〜2日）
- PWAの更新体験を安定化する
- エクスポート/インポート（JSON）でデータ保全を提供する
- Cycle 1/2 の挙動を壊さない

---

## 今回のスコープ（Must）

### 1) PWA（更新はprompt）
- `vite-plugin-pwa` を導入済みなら設定調整、未導入なら導入する
- 更新時はユーザー確認（prompt）で適用する（勝手に更新しない）
- オフライン起動できる（インストール済み想定でOK）
- 更新後もIndexedDBのデータが残る

### 2) エクスポート/インポート（JSON）
- 設定画面に以下を追加
  - エクスポート：entries + settings を1つのJSONにしてダウンロード
  - インポート：JSONを選択して復元
- インポート方式は **上書き** とする（MVP）
  - 手順：entries全削除 → importデータ投入
- settings（要約ON/OFF）も復元する
- 本文・要約をconsole.log等で出力しない

---

## 今回やらないこと（厳守）
- 暗号化
- クラウド同期・ログイン
- WebGPU/モデルDL
- 検索高度化（転置インデックスなど）
- UI作り込み（最低限のボタンと説明でOK）

---

## 守るべき前提
- 外部通信を追加しない（PWA導入に伴う必要最小の範囲のみ）
- 依存追加は最小（PWA導入が未導入の場合の vite-plugin-pwa は許可）
- Cycle 1/2 の動作を壊さない

---

## 実装タスク（順番）

### (1) PWA導入/調整
- vite-plugin-pwa を導入または設定調整
- 更新は prompt にする
- キャッシュ戦略は “App Shell（静的アセット）” を中心に最小で良い
- 外部CDNキャッシュ（モデル等）は今回入れない

### (2) Export/Import 用のユーティリティを作成
- exportData(): { entries: Entry[], settings: Record<string, unknown>, exportedAt: number, version: number }
- importData(data): 上書き復元（entries全削除→投入、settings更新）

※ 破壊的処理（clear）前に、最低限の形式チェックをする

### (3) SettingsPage にUI追加
- エクスポートボタン
- インポート（ファイル選択 + 実行）
- インポートは confirm あり
- 成功/失敗メッセージを1行で表示

---

## 追加/編集してよいファイル（例）
- vite.config.ts（PWA導入）
- src/ui/pages/SettingsPage.tsx
- src/db/entries.ts（clearEntries等が未整備なら）
- src/db/settings.ts
- src/infra/exportImport.ts（新規）
- README か playbook に簡単な動作確認手順を追記

---

## DoD（完了条件）
- [ ] PWAがprompt更新で動作する（更新があれば確認が出る）
- [ ] オフライン起動ができる（インストール済み想定）
- [ ] エクスポートしたJSONをインポートして復元できる
- [ ] settings（要約ON/OFF）が復元される
- [ ] 本文・要約がログに出ない