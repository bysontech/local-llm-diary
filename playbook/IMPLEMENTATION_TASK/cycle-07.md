# IMPLEMENTATION TASK – Cycle 7  
**振り返り（Review）画面：月単位の最小実装**

---

## Goal
月単位で日記を振り返れる画面を追加し、  
「書くだけ」から「振り返りに使える」体験を作る。

---

## Context
### Background
- 既存機能（CRUD / 検索 / PWA / バックアップ / 暗号化 / 要約）は完成済み
- 要約はルールベース強化済み（Cycle 6）

### Current behavior
- 一覧と詳細で「日ごと」には見られるが、「まとまり（週/月）」で見られない

### Desired behavior
- 月を選ぶだけで、その月の日記を要約ベースでまとめて眺められる

---

## Scope

### Must include
1) Review画面の追加（新規ページ）
- 画面名：Review（振り返り）
- 月選択（YYYY-MM）
- 選択月のエントリ件数表示
- 選択月のエントリを日付降順で表示
  - 行表示：`date` + `summary`（なければ `body` 先頭の短縮）
  - クリックで既存の詳細画面へ遷移

2) DB層：月で取得できる関数を追加
- 例：`getEntriesByMonth(yyyyMm: string): Promise<Entry[]>`
- Dexieの`where('date').between(...)` か、prefix一致で実装（どちらでもOK）
- 返却は必ず日付降順に整列（UIで並べ替えでもOK）

3) 既存機能を壊さない
- 作成/編集/削除/検索
- エクスポート/インポート
- 暗号化バックアップ
- PWA/オフライン

### Must NOT include
- 週単位の範囲計算（今回はやらない）
- 期間全体の“1つの要約”生成（LLM/ルール問わず）
- グラフ/統計（件数表示以上は不要）
- 依存ライブラリ追加
- 外部通信追加

---

## Constraints
- Tech constraints:
  - 外部通信なし
  - 依存追加なし
  - オフラインで動作
  - console.logに本文/要約を出さない
- Do not touch:
  - 既存のデータモデルを破壊的に変更しない（Entryのdate文字列形式は維持）

---

## Acceptance Criteria
- [ ] Review画面に遷移できる導線がある（ヘッダー/メニュー/設定のどれでも良い）
- [ ] 月（YYYY-MM）を選ぶと該当エントリが表示される
- [ ] 表示順が日付降順
- [ ] クリックで詳細画面に遷移できる
- [ ] 0件の月は「該当する日記がありません」
- [ ] オフラインで動作する
- [ ] CI（もしあるなら）とビルドが通る

---

## Notes / Links
- Related docs:
  - playbook/ARCHITECTURE.md
  - playbook/CYCLE_PLAN/cycle-07.md
- UIは最小でOK。機能優先。
- body短縮は `slice(0, 60)` 程度で良い（末尾に`…`）