# Decisions (Lightweight ADR)

Record notable decisions to reduce back-and-forth.

## Template
- Date:
- Decision:
- Context:
- Options considered:
- Rationale:
- Consequences:

---

## ADR-001: Local-first (IndexedDB) 採用

- Date: 2025-01
- Decision: データ永続化にIndexedDB（Dexie.js）を採用し、サーバーを使用しない
- Context: プライバシー重視の日記アプリとして、ユーザーデータを外部に送信しない設計が必要
- Options considered:
  1. IndexedDB（クライアント完結）
  2. SQLite + Cloudflare D1
  3. Firebase/Supabase等のBaaS
- Rationale:
  - ユーザーの日記データは機密性が高く、外部サーバーへの保存はプライバシーリスク
  - PWAとしてオフライン動作が必須であり、IndexedDBは標準でオフライン対応
  - サーバー運用コストがゼロ
  - Dexie.jsにより型安全なクエリが可能
- Consequences:
  - マルチデバイス同期は不可（将来的にはCRDT等で対応可能）
  - ブラウザのストレージ削除でデータ消失リスク → バックアップ機能で対応

---

## ADR-002: 外部送信を一切行わない

- Date: 2025-01
- Decision: アプリから外部サーバーへのネットワーク通信を行わない
- Context: 日記・感情ログは極めて個人的なデータであり、漏洩リスクを最小化したい
- Options considered:
  1. 完全クライアント完結（外部通信なし）
  2. 匿名化してサーバー送信
  3. オプトインでクラウド同期
- Rationale:
  - 「外部送信しない」は最もシンプルで説明しやすいプライバシーポリシー
  - 初回ガイドで明示することでユーザーの信頼を得られる
  - サーバー側のセキュリティ対策・運用が不要
- Consequences:
  - 外部APIを使った高度な機能（LLM要約、感情分析）は利用不可
  - 将来的にWebLLM等で端末内LLM推論を検討可能

---

## ADR-003: ルールベース要約をデフォルトに採用

- Date: 2025-01
- Decision: 日記の要約機能はルールベース（キーワードスコアリング）で実装
- Context: 外部API不使用の制約下で、日記の要点抽出機能を提供したい
- Options considered:
  1. ルールベース（キーワード・文長スコアリング）
  2. WebLLM/ONNX Runtime等のクライアントLLM
  3. 要約機能なし
- Rationale:
  - WebLLMは初回モデルダウンロードが数GB、起動時間も長くPoC段階では過剰
  - ルールベースは軽量で即時動作、日本語の感情・行動キーワードを対象にすれば実用的
  - 将来的にWebLLMへ移行する余地を残す設計（summarize関数の差し替えで対応可能）
- Consequences:
  - LLMほどの精度は出ないが、キーワードベースで「それらしい」要約は可能
  - 短文では効果が薄い → 140文字以下はそのまま返却

---

## ADR-004: 暗号化バックアップ（AES-GCM + PBKDF2）

- Date: 2025-01
- Decision: バックアップファイルをAES-256-GCM + PBKDF2で暗号化するオプションを提供
- Context: バックアップファイルをクラウドストレージに保存する場合、平文では漏洩リスクがある
- Options considered:
  1. 平文JSONのみ
  2. AES-GCM + PBKDF2（WebCrypto API）
  3. 外部暗号化ツール（GPG等）に委ねる
- Rationale:
  - WebCrypto APIは標準でブラウザに搭載、外部依存なし
  - AES-256-GCMは認証付き暗号で改ざん検知可能
  - PBKDF2（100,000 iterations）でパスワードから鍵導出、ブルートフォース耐性を確保
  - Salt（16バイト）・IV（12バイト）をファイル内に保存し、同一パスワードでも異なる暗号文を生成
- Consequences:
  - **パスワード忘れは復元不可**（鍵導出に必要）
  - クライアントのみで完結するため、パスワードリセット機能は提供不可
  - 暗号強度はパスワード強度に依存

### 脅威モデル（PoC範囲）

本PoCで想定する脅威と対策:

| 脅威 | 対策 | 備考 |
|------|------|------|
| バックアップファイルの漏洩 | AES-256-GCM暗号化 | パスワード強度に依存 |
| パスワード総当たり | PBKDF2（100,000回） | オフライン攻撃には限界あり |
| 暗号文の改ざん | GCMの認証タグ | 改ざん検知で復号失敗 |
| 端末紛失 | 対象外 | 端末ロック・暗号化はOS依存 |
| メモリ上のデータ漏洩 | 対象外 | ブラウザのセキュリティに依存 |
| XSS/CSRF | 対象外（外部通信なし） | 静的サイトのみ |

**注意**: 本実装は企業グレードのセキュリティ監査を受けていません。機密性の高いデータには追加の対策を検討してください。
