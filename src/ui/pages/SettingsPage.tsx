import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { isSummaryEnabled, setSummaryEnabled } from '../../db/settings'
import { clearEntries } from '../../db/entries'

export function SettingsPage() {
  const [summaryOn, setSummaryOn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const enabled = await isSummaryEnabled()
      setSummaryOn(enabled)
    } catch {
      // 読み込み失敗時はデフォルト値を使用
    } finally {
      setLoading(false)
    }
  }

  async function handleSummaryToggle() {
    const newValue = !summaryOn
    setSummaryOn(newValue)
    try {
      await setSummaryEnabled(newValue)
      setMessage(newValue ? '要約をONにしました' : '要約をOFFにしました')
    } catch {
      setSummaryOn(!newValue) // 元に戻す
      setMessage('設定の保存に失敗しました')
    }
  }

  async function handleClearAll() {
    const confirmed = window.confirm(
      '全ての日記データを削除しますか？\nこの操作は取り消せません。'
    )
    if (!confirmed) return

    setClearing(true)
    setMessage(null)
    try {
      await clearEntries()
      setMessage('全データを削除しました')
    } catch {
      setMessage('削除に失敗しました')
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return <div style={styles.container}>読み込み中...</div>
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>← 一覧に戻る</Link>
        <h1 style={styles.title}>設定</h1>
      </header>

      {message && <p style={styles.message}>{message}</p>}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>要約機能</h2>
        <label style={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={summaryOn}
            onChange={handleSummaryToggle}
            style={styles.checkbox}
          />
          <span>要約を自動生成する</span>
        </label>
        <p style={styles.hint}>
          OFFにすると、新規作成・編集時に要約が生成されません。
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>データ管理</h2>
        <button
          onClick={handleClearAll}
          disabled={clearing}
          style={styles.dangerButton}
        >
          {clearing ? '削除中...' : '全データを削除'}
        </button>
        <p style={styles.hint}>
          全ての日記を削除します。設定は保持されます。
        </p>
      </section>
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
  title: {
    margin: '0.5rem 0 0 0',
    fontSize: '1.5rem',
  },
  message: {
    padding: '0.5rem',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    marginBottom: '0.75rem',
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
  },
  hint: {
    color: '#666',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  dangerButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#d00',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
}
