import { Link } from 'react-router-dom'

export function SettingsPage() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <Link to="/" style={styles.backLink}>← 一覧に戻る</Link>
        <h1 style={styles.title}>設定</h1>
      </header>

      <p style={styles.placeholder}>
        設定機能は今後のアップデートで追加予定です。
      </p>
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
  placeholder: {
    color: '#666',
    textAlign: 'center',
    padding: '2rem',
  },
}
