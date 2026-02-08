# claude-ops-template

Template for Claude code

## How to use

1. Create a new repository using this template
2. Copy files into your project repository
3. Edit `CLAUDE.local.md` for project-specific settings
4. (Optional) Run `scripts/init-claude-ops.sh`

## ローカル動作確認

```bash
npm ci
npm run dev
```

ブラウザで `http://localhost:5173` を開き、以下を確認：
1. 「新規作成」から日記を保存
2. 一覧に表示され、詳細画面で要約が表示される
3. リロード後もデータが残る（IndexedDB永続化）
4. DevToolsのNetworkタブでOfflineにしても動作する（PWA）
