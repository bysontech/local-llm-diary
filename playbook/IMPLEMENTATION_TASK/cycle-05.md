## FILE: playbook/IMPLEMENTATION_TASK/cycle-05.md

## 目的（1〜2日）
- JSONバックアップをパスワードで暗号化してエクスポートできるようにする
- 暗号化バックアップを復号して復元できるようにする
- 既存機能（PWA/CRUD/Search/ExportImport）を壊さない

---

## 今回のスコープ（Must）

### 1) 暗号化エクスポート（Encrypted Export）
- entries + settings をまとめたバックアップオブジェクトを作る
- ユーザーのパスワードで暗号化する
- 暗号化されたJSONファイルをダウンロードできる
- 出力ファイルに平文のbody/summaryが含まれない

### 2) 暗号化インポート（Encrypted Import）
- 暗号化バックアップJSONを読み込む
- パスワードで復号する
- 復号できたら上書き復元する（既存データ全削除→投入）
- パスワードが間違っている/形式が不正なら復元しない（エラー表示）

### 3) UI（SettingsPage 最小）
- 暗号化バックアップ（エクスポート）
  - パスワード入力（確認入力も推奨）
  - 実行ボタン
- 暗号化バックアップをインポート
  - ファイル選択
  - パスワード入力
  - 実行ボタン（confirm付き）
- 成功/失敗を1行で表示（本文は表示しない）

---

## 暗号仕様（固定・MVP）

### 使用API
- WebCrypto（window.crypto.subtle）

### アルゴリズム
- AES-GCM（256bit）

### 鍵導出
- PBKDF2 + SHA-256
- salt: 16 bytes（毎回ランダム）
- iterations: 200,000（目安。重すぎる場合は100,000まで下げてOK）
- derivedKey: AES-GCM用に生成

### IV
- 12 bytes（毎回ランダム）

### エンコード
- 平文はUTF-8（TextEncoder）
- cipherText は base64 化してJSONに格納

---

## 暗号化バックアップJSON形式（v1）

- 平文を含めない（entries/settingsの生データは入れない）
- 形式例（キー名はこの通りにする）

  {
    "type": "diary-encrypted-backup",
    "version": 1,
    "kdf": {
      "name": "PBKDF2",
      "hash": "SHA-256",
      "iterations": 200000,
      "salt_b64": "..."
    },
    "cipher": {
      "name": "AES-GCM",
      "iv_b64": "..."
    },
    "data_b64": "..." ,
    "exportedAt": 1730000000000
  }

- data_b64 の中身（復号後の平文）は次の形（既存のexport形式を流用してよい）

  {
    "version": 1,
    "entries": [...],
    "settings": {...},
    "exportedAt": 1730000000000
  }

---

## 実装タスク（順番）

1. 暗号ユーティリティを追加（新規）
- src/infra/crypto.ts
  - deriveKeyFromPassword(password, salt, iterations)
  - encryptJson(password, obj) -> encryptedPayload
  - decryptJson(password, encryptedPayload) -> obj
  - base64 encode/decode helpers（Uint8Array <-> base64）
  - 注意：本文/要約をログに出さない

2. 暗号化エクスポート実装
- SettingsPageから呼び出す関数を作る（例：exportEncryptedBackup）
- 既存のexportData()があるならそれを利用して「平文バックアップobj」を作成 → encryptJson へ
- encrypted-backup-YYYY-MM-DD.json のダウンロード実装

3. 暗号化インポート実装
- ファイル読み込み → JSON parse → 形式チェック（type/version必須）
- decryptJson → 平文バックアップobjを得る
- confirm → 既存データ全削除 → importData(平文obj)
- 復号失敗（例：OperationError）時は「パスワードが違うかファイルが壊れています」と表示

4. UX最小
- パスワード確認入力（エクスポート側だけでもOK）
- インポートはconfirm必須（上書き復元のため）

---

## やらないこと（厳守）
- パスワードを保存する（IndexedDB/localStorage等に保存しない）
- 鍵をエクスポートする
- 外部通信を追加する
- 暗号方式の独自実装（WebCrypto以外）
- 依存ライブラリ追加（基本なしでいける）

---

## 変更してよいファイル（例）
- src/ui/pages/SettingsPage.tsx
- src/infra/crypto.ts（新規）
- src/infra/exportImport.ts（既存があれば、encrypted用の薄いラッパー追加）
- src/db/*（必要なら再利用）

---

## DoD（完了条件）
- [ ] 暗号化バックアップJSONをエクスポートできる
- [ ] ファイル内に平文のentries/body/summaryが含まれない
- [ ] 正しいパスワードで復号して復元できる（上書き）
- [ ] 間違ったパスワードなら復元されない（エラー表示）
- [ ] パスワードを保存していない
- [ ] 本文・要約がログに出ていない