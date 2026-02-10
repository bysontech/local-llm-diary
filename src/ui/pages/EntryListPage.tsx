import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listEntriesByDateDesc } from '../../db/entries'
import { isOnboardingDismissed, setOnboardingDismissed } from '../../db/settings'
import type { Entry } from '../../domain/entry'


export function EntryListPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const list = await listEntriesByDateDesc()
        if (!cancelled) {
          setEntries(list)
          setError(null)
        }
      } catch {
        if (!cancelled) setError('データの読み込みに失敗しました')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    async function checkOnboarding() {
      try {
        const dismissed = await isOnboardingDismissed()
        if (!cancelled && !dismissed) setShowOnboarding(true)
      } catch {
        // エラー時は表示しない
      }
    }
    load()
    checkOnboarding()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleDismissOnboarding() {
    setShowOnboarding(false)
    try {
      await setOnboardingDismissed()
    } catch {
      // 保存失敗しても閉じる
    }
  }

  // 検索フィルタリング（body と summary を対象、大文字小文字無視）
  const filteredEntries = useMemo(() => {
    if (!query.trim()) {
      return entries
    }
    const lowerQuery = query.toLowerCase()
    return entries.filter((entry) => {
      const bodyMatch = entry.body.toLowerCase().includes(lowerQuery)
      const summaryMatch = entry.summary?.toLowerCase().includes(lowerQuery) ?? false
      return bodyMatch || summaryMatch
    })
  }, [entries, query])

  if (loading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  return (
    <div style={styles.container}>
      {showOnboarding && (
        <div style={styles.onboarding}>
          <p style={styles.onboardingText}>
            このアプリはあなたの日記を<strong>端末内のみ</strong>に保存します。
            外部サーバーへの送信はありません。
            設定画面からバックアップ（暗号化可）ができます。
          </p>
          <button onClick={handleDismissOnboarding} style={styles.onboardingButton}>
            OK
          </button>
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>日記一覧</h1>
        <Link to="/new" style={styles.newButton}>新規作成</Link>
      </header>

      <div style={styles.searchBox}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="検索..."
          style={styles.searchInput}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={styles.clearButton}
            aria-label="検索をクリア"
          >
            ×
          </button>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {entries.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>まだ日記がありません</p>
          <Link to="/new" style={styles.emptyButton}>最初の日記を書く</Link>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div style={styles.emptyBox}>
          <p style={styles.emptyText}>「{query}」に該当する日記がありません</p>
          <button onClick={() => setQuery('')} style={styles.emptyButtonSecondary}>
            検索をクリア
          </button>
        </div>
      ) : (
        <ul style={styles.list}>
          {filteredEntries.map((entry) => (
            <li key={entry.id} style={styles.listItem}>
              <Link to={`/entry/${entry.id}`} style={styles.entryLink}>
                <span style={styles.date}>{entry.date}</span>
                <span style={styles.preview}>
                  {entry.body.slice(0, 50)}{entry.body.length > 50 ? '...' : ''}
                </span>
                <span style={styles.status}>
                  {SUMMARY_STATUS_LABEL[entry.summaryStatus]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer style={styles.footer}>
        <Link to="/review" style={styles.settingsLink}>振り返り</Link>
        <span style={styles.footerSeparator}>|</span>
        <Link to="/settings" style={styles.settingsLink}>設定</Link>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  onboarding: {
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  onboardingText: {
    margin: '0 0 0.75rem 0',
    fontSize: '0.9rem',
    lineHeight: 1.5,
    color: '#1565c0',
  },
  onboardingButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  newButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem',
    paddingRight: '2rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    color: '#999',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  error: {
    color: '#d00',
    marginBottom: '1rem',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
  },
  emptyText: {
    color: '#666',
    margin: '0 0 1rem 0',
  },
  emptyButton: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  emptyButtonSecondary: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    borderBottom: '1px solid #eee',
  },
  entryLink: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 0',
    textDecoration: 'none',
    color: 'inherit',
  },
  date: {
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  preview: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#666',
  },
  status: {
    fontSize: '0.8rem',
    color: '#999',
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  settingsLink: {
    color: '#666',
    fontSize: '0.9rem',
  },
  footerSeparator: {
    color: '#ccc',
    margin: '0 0.5rem',
  },
}
