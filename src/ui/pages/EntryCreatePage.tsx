import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { addEntry, updateEntry } from '../../db/entries'
import { isSummaryEnabled } from '../../db/settings'
import { summarizeRuleBased } from '../../llm/rule-based'

export function EntryCreatePage() {
  const navigate = useNavigate()

  const [date, setDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  )
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!body.trim()) {
      setError('本文を入力してください')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const summaryEnabled = await isSummaryEnabled()

      // Entry作成（summaryStatus=pending）→ DB保存
      const entry = await addEntry({ date, body: body.trim() })

      // 保存後は一覧へ戻す（要約更新は裏で）
      navigate('/')

      if (summaryEnabled) {
        // 要約ON: 要約生成 → updateEntry で summary と summaryStatus=done 更新
        try {
          const summary = summarizeRuleBased(body.trim())
          await updateEntry(entry.id, {
            summary,
            summaryStatus: 'done',
          })
        } catch {
          // 要約失敗時は summaryStatus=failed
          await updateEntry(entry.id, { summaryStatus: 'failed' })
        }
      } else {
        // 要約OFF: summaryStatus = 'none'
        await updateEntry(entry.id, { summaryStatus: 'none' })
      }
    } catch {
      setError('保存に失敗しました')
      setSaving(false)
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>← 戻る</Link>
        <h1 style={styles.title}>新規作成</h1>
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
            placeholder="今日の出来事や気持ちを書いてください..."
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
