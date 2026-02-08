import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listEntriesByDateDesc } from '../../db/entries'
import type { Entry } from '../../domain/entry'

export function EntryListPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      setLoading(true)
      const list = await listEntriesByDateDesc()
      setEntries(list)
      setError(null)
    } catch {
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>日記一覧</h1>
        <Link to="/new" style={styles.newButton}>新規作成</Link>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      {entries.length === 0 ? (
        <p style={styles.empty}>まだ日記がありません</p>
      ) : (
        <ul style={styles.list}>
          {entries.map((entry) => (
            <li key={entry.id} style={styles.listItem}>
              <Link to={`/entry/${entry.id}`} style={styles.entryLink}>
                <span style={styles.date}>{entry.date}</span>
                <span style={styles.preview}>
                  {entry.body.slice(0, 50)}{entry.body.length > 50 ? '...' : ''}
                </span>
                <span style={styles.status}>
                  {entry.summaryStatus === 'done' ? '[要約済]' :
                   entry.summaryStatus === 'pending' ? '[要約中]' :
                   entry.summaryStatus === 'failed' ? '[要約失敗]' : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer style={styles.footer}>
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
}
