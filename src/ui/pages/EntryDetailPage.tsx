import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getEntryById, deleteEntry } from '../../db/entries'
import type { Entry, SummaryStatus } from '../../domain/entry'

const SUMMARY_SECTION: Record<
  SummaryStatus,
  { message: string; styleKey: 'pending' | 'failed' | 'noSummary' }
> = {
  pending: { message: '要約を生成中...', styleKey: 'pending' },
  failed: { message: '要約の生成に失敗しました', styleKey: 'failed' },
  none: { message: '要約はOFFです', styleKey: 'noSummary' },
  done: { message: '要約はありません', styleKey: 'noSummary' },
}

export function EntryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [entry, setEntry] = useState<Entry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setEntry(null)
      setError('IDが指定されていません')
      return
    }
    let cancelled = false
    async function load(entryId: string) {
      try {
        setLoading(true)
        const found = await getEntryById(entryId)
        if (cancelled) return
        if (found) {
          setEntry(found)
          setError(null)
        } else {
          setError('日記が見つかりません')
        }
      } catch {
        if (!cancelled) setError('データの読み込みに失敗しました')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load(id)
    return () => {
      cancelled = true
    }
  }, [id])

  async function handleDelete() {
    if (!id) return

    const confirmed = window.confirm('この日記を削除しますか？')
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteEntry(id)
      navigate('/')
    } catch {
      setError('削除に失敗しました')
      setDeleting(false)
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
        {entry.summaryStatus === 'done' && entry.summary ? (
          <div style={styles.summary}>{entry.summary}</div>
        ) : (
          <p style={styles[SUMMARY_SECTION[entry.summaryStatus].styleKey]}>
            {entry.summaryStatus === 'done'
              ? '要約はありません'
              : SUMMARY_SECTION[entry.summaryStatus].message}
          </p>
        )}
      </section>

      <div style={styles.actions}>
        <Link to={`/edit/${entry.id}`} style={styles.editButton}>編集</Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={styles.deleteButton}
        >
          {deleting ? '削除中...' : '削除'}
        </button>
      </div>

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
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  editButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1a1a1a',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d00',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
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
