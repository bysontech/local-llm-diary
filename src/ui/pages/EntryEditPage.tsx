import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getEntryById, updateEntry } from '../../db/entries'
import { isSummaryEnabled } from '../../db/settings'
import { summarizeRuleBased } from '../../llm/rule-based'
import type { Entry } from '../../domain/entry'

export function EntryEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [entry, setEntry] = useState<Entry | null>(null)
  const [date, setDate] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setDate(found.date)
        setBody(found.body)
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

  async function handleSave() {
    if (!entry || !id) return

    if (!body.trim()) {
      setError('本文を入力してください')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const summaryEnabled = await isSummaryEnabled()

      if (summaryEnabled) {
        // 要約ON: 要約を再生成
        await updateEntry(id, {
          date,
          body: body.trim(),
          summaryStatus: 'pending',
        })

        // 詳細画面へ戻す
        navigate(`/entry/${id}`)

        // 要約生成（裏で実行）
        try {
          const summary = summarizeRuleBased(body.trim())
          await updateEntry(id, {
            summary,
            summaryStatus: 'done',
          })
        } catch {
          await updateEntry(id, { summaryStatus: 'failed' })
        }
      } else {
        // 要約OFF: summaryStatus = 'none'、summary は保持しない
        await updateEntry(id, {
          date,
          body: body.trim(),
          summary: undefined,
          summaryStatus: 'none',
        })
        navigate(`/entry/${id}`)
      }
    } catch {
      setError('保存に失敗しました')
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  if (error && !entry) {
    return (
      <div style={styles.container}>
        <Link to="/" style={styles.backLink}>← 一覧に戻る</Link>
        <p style={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to={`/entry/${id}`} style={styles.backLink}>← 戻る</Link>
        <h1 style={styles.title}>編集</h1>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.form}>
        <label style={styles.label}>
          日付
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={styles.dateInput}
          />
        </label>

        <label style={styles.label}>
          本文
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={styles.textarea}
            rows={10}
          />
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
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
    marginBottom: '1rem',
  },
  backLink: {
    color: '#666',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  title: {
    margin: '0.5rem 0 0 0',
    fontSize: '1.5rem',
  },
  error: {
    color: '#d00',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  dateInput: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  textarea: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  saveButton: {
    padding: '0.75rem',
    fontSize: '1rem',
    marginTop: '0.5rem',
  },
}
