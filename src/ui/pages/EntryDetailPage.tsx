import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEntryById } from '../../db/entries'
import type { Entry } from '../../domain/entry'

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadEntry(id)
    }
  }, [id])

  async function loadEntry(entryId: string) {
    try {
      setLoading(true)
      const found = await getEntryById(entryId)
      if (found) {
        setEntry(found)
        setError(null)
      } else {
        setError('日記が見つかりません')
      }
    } catch {
      setError('データの読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  if (error || !entry) {
    return (
      <div style={styles.container}>
        <Link to="/" style={styles.backLink}>← 一覧に戻る</Link>
        <p style={styles.error}>{error || '日記が見つかりません'}</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>← 一覧に戻る</Link>
        <h1 style={styles.date}>{entry.date}</h1>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>本文</h2>
        <div style={styles.body}>{entry.body}</div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>要約</h2>
        {entry.summaryStatus === 'pending' ? (
          <p style={styles.pending}>要約を生成中...</p>
        ) : entry.summaryStatus === 'failed' ? (
          <p style={styles.failed}>要約の生成に失敗しました</p>
        ) : entry.summary ? (
          <div style={styles.summary}>{entry.summary}</div>
        ) : (
          <p style={styles.noSummary}>要約はありません</p>
        )}
      </section>

      <footer style={styles.footer}>
        <small style={styles.meta}>
          作成: {new Date(entry.createdAt).toLocaleString()}
          {entry.updatedAt !== entry.createdAt && (
            <> / 更新: {new Date(entry.updatedAt).toLocaleString()}</>
          )}
        </small>
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
    marginBottom: '1.5rem',
  },
  backLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  date: {
    margin: '0.5rem 0 0 0',
    fontSize: '1.5rem',
  },
  error: {
    color: '#d00',
    marginTop: '1rem',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
    fontWeight: 'normal',
  },
  body: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
  },
  summary: {
    padding: '1rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    lineHeight: 1.6,
  },
  pending: {
    color: '#666',
    fontStyle: 'italic',
  },
  failed: {
    color: '#d00',
  },
  noSummary: {
    color: '#999',
  },
  footer: {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee',
  },
  meta: {
    color: '#999',
    fontSize: '0.8rem',
  },
}
