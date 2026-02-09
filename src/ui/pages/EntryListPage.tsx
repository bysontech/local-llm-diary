import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listEntriesByDateDesc } from '../../db/entries'
import type { Entry, SummaryStatus } from '../../domain/entry'

const SUMMARY_STATUS_LABEL: Record<SummaryStatus, string> = {
  done: '[要約済]',
  pending: '[要約中]',
  failed: '[要約失敗]',
  none: '',
}

export function EntryListPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

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
    load()
    return () => {
      cancelled = true
    }
  }, [])

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
        <p style={styles.empty}>まだ日記がありません</p>
      ) : filteredEntries.length === 0 ? (
        <p style={styles.empty}>該当する日記がありません</p>
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
  empty: {
    color: '#666',
    textAlign: 'center',
    padding: '2rem',
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
