import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getEntriesByMonth } from '../../db/entries'
import type { Entry } from '../../domain/entry'

/**
 * 現在の年月を YYYY-MM 形式で取得
 */
function getCurrentYearMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * 表示用テキストを取得（summary優先、なければbody短縮）
 */
function getDisplayText(entry: Entry, maxLength: number = 60): string {
  const text = entry.summary || entry.body
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength) + '...'
}

export function ReviewPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth())
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true)
      const list = await getEntriesByMonth(selectedMonth)
      setEntries(list)
      setError(null)
    } catch {
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>← 戻る</Link>
        <h1 style={styles.title}>振り返り</h1>
      </header>

      <div style={styles.monthSelector}>
        <label htmlFor="month-select" style={styles.label}>月を選択：</label>
        <input
          id="month-select"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={styles.monthInput}
        />
      </div>

      <div style={styles.countBox}>
        {loading ? (
          <span>読み込み中...</span>
        ) : (
          <span>{selectedMonth} の日記: {entries.length} 件</span>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {!loading && entries.length === 0 ? (
        <p style={styles.empty}>この月の日記はありません</p>
      ) : (
        <ul style={styles.list}>
          {entries.map((entry) => (
            <li key={entry.id} style={styles.listItem}>
              <Link to={`/entry/${entry.id}`} style={styles.entryLink}>
                <span style={styles.date}>{entry.date}</span>
                <span style={styles.summary}>{getDisplayText(entry)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
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
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  backLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  monthSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  label: {
    fontSize: '0.9rem',
    color: '#333',
  },
  monthInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  countBox: {
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.95rem',
    color: '#333',
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
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.75rem 0',
    textDecoration: 'none',
    color: 'inherit',
  },
  date: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  summary: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: 1.4,
  },
}
