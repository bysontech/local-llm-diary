# IMPLEMENTATION_TASK（Cycle 1）

## 対象テンプレ
- B（Cloudflare Pages + Vite + React + TypeScript + PWA）

## このCycleの目的（2日で完了）
- 縦切り1本をオフラインで成立させる  
  「新規作成 → 保存 → 一覧表示 → 詳細表示」
- 外部通信は発生させない（Cloudflare Pages 配信以外）

## 今回のスコープ（Mustのみ）
- Entry を IndexedDB（Dexie）に保存できる
- 一覧で日付順に表示できる
- 詳細で本文と要約を表示できる
- ルールベース要約を実装し、保存後に生成できる
- summaryStatus を pending / done / failed / none で管理できる
- 設定画面はまだ作らない（次Cycle）

## やらないこと（厳守）
- WebGPU / WASM 推論
- モデルファイルのダウンロード
- ルールベース以外の要約方式
- 全文検索・感情タグ・週月要約
- クラウド同期・ログイン・外部API
- UIの作り込み（最低限でOK）

## 守るべき前提（破るなら理由を書いて停止）
- 日記本文・要約を外部送信しない
- console.log に本文・要約を出さない
- 依存追加は最小限。追加する場合は理由をコメントで明示
- React の責務分離（ui / domain / db / llm / infra）を守る

---

## データ仕様（固定）

### Entry

    SummaryStatus:
      - 'none'
      - 'pending'
      - 'done'
      - 'failed'

    Entry:
      id: string            // uuid
      date: string          // YYYY-MM-DD
      body: string
      summary?: string
      summaryStatus: SummaryStatus
      createdAt: number
      updatedAt: number
      tags?: string[]       // MVPでは使用しない（保持のみ）

### Dexie スキーマ（v1）
- entries: id, date, createdAt, updatedAt, summaryStatus

---

## 画面（最低限）

### 1) 一覧（EntryListPage）
- 日付降順で表示（最新が上）
- 各行に date（YYYY-MM-DD）と summaryStatus を小さく表示
- タップで詳細へ遷移
- 「＋ 新規作成」ボタンを表示

### 2) 新規作成（EntryCreatePage）
- date（初期値は今日、編集可）
- body（textarea）
- 保存ボタン
- 保存時の処理順：
  1. Entry を作成（summaryStatus = pending）
  2. IndexedDB に保存
  3. ルールベース要約を非同期で生成
  4. summary と summaryStatus を更新（done / failed）
  5. 一覧へ戻る（要約更新は裏で続行してOK）

### 3) 詳細（EntryDetailPage）
- date
- summary（存在すれば表示）
- summaryStatus が pending の場合「要約中…」表示
- body
- 「編集」ボタン（遷移のみでもOK、実装は次Cycle）

※ 編集画面の本実装は次Cycleに回してよい

---

## ルールベース要約（MVP実装）

### 目的
- 全端末で必ず動く要約を提供
- LLM推論が未実装でも価値を出す

### 実装ルール例
- body が空の場合は summary を空文字、status を done
- 改行（段落）を優先して先頭部分を抽出
- 最大 200 文字（超過時は「…」）
- 余裕があれば簡易キーワード抽出を末尾に付与（任意）

### 期待する関数仕様

    summarizeRuleBased(body: string) -> string

---

## 実装タスク（順番厳守）

1. ルーティング作成（一覧 / 新規 / 詳細 / 設定の枠）
2. Dexie セットアップ（db/index）
3. Entry CRUD 最小実装
   - addEntry
   - getEntryById
   - listEntriesByDateDesc
   - updateEntry（summary 更新用）
4. ルールベース要約実装（llm/rule-based）
5. 新規作成 → 保存 → 要約更新の流れを通す
6. 一覧 → 詳細表示を通す
7. 最低限のエラーハンドリング
   - DB失敗時：ユーザーに1行表示
   - 要約失敗時：summaryStatus を failed
8. 本文・要約がログ出力されていないことを確認

---

## 今回作るディレクトリ（最小）

- src/domain/entry.ts
- src/db/index.ts
- src/db/entries.ts
- src/llm/rule-based.ts
- src/ui/pages/EntryListPage.tsx
- src/ui/pages/EntryCreatePage.tsx
- src/ui/pages/EntryDetailPage.tsx
- src/ui/pages/SettingsPage.tsx（空でもOK）
- src/App.tsx（ルーティング）

---

## 完了条件（DoD）

- オフラインで「新規作成 → 保存 → 一覧 → 詳細」が動作する
- IndexedDB に永続化され、リロード後もデータが残る
- 保存後に要約が生成され、summaryStatus が done になる
- 要約失敗時もアプリが落ちない（failed になる）
- 本文・要約が外部送信されない
- 本文・要約がログに出力されない

---

## 動作確認（最低限）

- Chrome 最新版
- Safari 最新版
- Firefox 最新版

（PWA完全対応・Lighthouse対応は次Cycle以降）
