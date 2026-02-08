import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { isSummaryEnabled, setSummaryEnabled } from '../../db/settings'
import { clearEntries } from '../../db/entries'
import { exportData, importData, downloadJson } from '../../db/backup'

export function SettingsPage() {
  const [summaryOn, setSummaryOn] = useState(true)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  async function handleExport() {
    setExporting(true)
    setMessage(null)
    try {
      const json = await exportData()
      const date = new Date().toISOString().split('T')[0]
      downloadJson(json, `diary-backup-${date}.json`)
      setMessage('エクスポートしました')
    } catch {
      setMessage('エクスポートに失敗しました')
    } finally {
      setExporting(false)
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイル選択をリセット（同じファイルを再選択可能に）
    e.target.value = ''

    const confirmed = window.confirm(
      'インポートすると現在のデータが全て上書きされます。\n続行しますか？'
    )
    if (!confirmed) return

    setImporting(true)
    setMessage(null)

    try {
      const text = await file.text()
      await importData(text)
      // 設定を再読み込み
      await loadSettings()
      setMessage('インポートしました')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'インポートに失敗しました'
      setMessage(errorMessage)
    } finally {
      setImporting(false)
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
        <h2 style={styles.sectionTitle}>バックアップ</h2>
        <div style={styles.buttonRow}>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={styles.button}
          >
            {exporting ? 'エクスポート中...' : 'エクスポート'}
          </button>
          <button
            onClick={handleImportClick}
            disabled={importing}
            style={styles.button}
          >
            {importing ? 'インポート中...' : 'インポート'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            style={styles.hiddenInput}
          />
        </div>
        <p style={styles.hint}>
          日記と設定をJSONファイルでバックアップできます。
          インポートすると現在のデータは上書きされます。
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
  buttonRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
  },
  hiddenInput: {
    display: 'none',
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
