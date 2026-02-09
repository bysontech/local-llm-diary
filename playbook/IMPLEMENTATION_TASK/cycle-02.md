# IMPLEMENTATION_TASK（Cycle 2）

## 対象テンプレ
- B（Cloudflare Pages + Vite + React + TypeScript + PWA）

## このCycleの目的（1〜2日）
- 日記として「最低限使い切れる」状態にする
- **編集・削除・設定（最小）** を追加する
- Cycle 1 の挙動を壊さない

---

## 今回のスコープ（Must）

### 1. 編集（Edit）
- 既存 Entry の date / body を編集できる
- 編集後に保存できる
- 保存時の挙動：
  - 要約ONの場合：
    - summary を再生成
    - summaryStatus を pending → done / failed に更新
  - 要約OFFの場合：
    - summary は保持しない
    - summaryStatus = 'none'

### 2. 削除（Delete）
- EntryDetail から削除できる
- 削除後は一覧へ戻る
- 一覧から該当 Entry が消える（DBから削除）

### 3. 設定（最小）
- 要約 ON / OFF 切り替え
  - IndexedDB（settings）に永続化
- 全データ削除（リセット）
  - entries を全削除
  - settings は保持してもよい（仕様を統一する）

---

## 今回やらないこと（厳守）
- WebGPU / WASM 推論
- モデルファイルのダウンロード
- 全文検索
- 感情タグ
- 週 / 月要約
- クラウド同期・ログイン
- UI作り込み・デザイン調整

---

## 守るべき前提（破るなら停止）
- 日記本文・要約を外部送信しない
- console.log に本文・要約を出さない
- 依存ライブラリを追加しない
- Cycle 1 の挙動を壊さない

---

## 仕様の確定事項（重要）

### 要約OFF時の扱い
- 保存時：
  - summary = undefined（または空文字）
  - summaryStatus = 'none'
- 過去に生成済みの summary は表示しない

### 日付の扱い
- 同一日付の Entry は **複数存在してよい**
- 一覧は date + createdAt の降順

---

## 実装タスク（順番）

1. 編集画面の実装
   - EntryEditPage を作成 or 既存枠を実装
   - 初期値として既存 Entry を表示
   - 保存時の分岐（要約ON / OFF）

2. DB層の拡張
   - updateEntry の再利用 or 拡張
   - deleteEntry(id) の追加
   - clearEntries() の追加

3. 設定機能
   - settings テーブルを利用
   - getSetting(key)
   - setSetting(key, value)
   - 要約ON/OFF を SettingsPage で切り替え

4. UI接続
   - EntryDetail → 編集 → 保存 → 詳細に戻る
   - EntryDetail → 削除 → 一覧に戻る
   - 設定変更が新規作成・編集時に反映される

5. 最低限のUX
   - 削除時に confirm ダイアログ
   - 要約再生成中は「要約中…」表示

6. エラーハンドリング
   - DB操作失敗時もアプリが落ちない
   - 要約失敗時は summaryStatus = 'failed'

---

## 今回作る・編集してよいファイル

- src/ui/pages/EntryEditPage.tsx
- src/ui/pages/EntryDetailPage.tsx
- src/ui/pages/SettingsPage.tsx
- src/db/entries.ts
- src/db/settings.ts（新規 or 既存）
- src/domain/entry.ts（型追加が必要なら）
- src/App.tsx（ルーティング追加）

---

## 完了条件（DoD）

- [ ] Entry を編集して保存できる
- [ ] 編集後、要約ONなら summary が再生成される
- [ ] 要約OFFなら summary が表示されない
- [ ] Entry を削除でき、一覧から消える
- [ ] 要約ON/OFF が永続化される
- [ ] 全データ削除が動作する
- [ ] 外部通信が増えていない
- [ ] 本文・要約がログに出ていない

---

## 動作確認（最低限）

- Chrome 最新版
- Safari 最新版
- Firefox 最新版
- オフライン状態で Edit / Delete / 設定が動作する