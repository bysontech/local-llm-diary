import { useState, useEffect } from 'react'
import { db } from './db'

function App() {
  const [count, setCount] = useState(0)
  const [dbStatus, setDbStatus] = useState<string>('checking...')

  useEffect(() => {
    db.open()
      .then(() => setDbStatus('IndexedDB ready'))
      .catch((err) => setDbStatus(`IndexedDB error: ${err.message}`))
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Template B PWA</h1>
      <p>Client-only PWA with IndexedDB (Dexie)</p>
      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </div>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        DB Status: {dbStatus}
      </p>
    </div>
  )
}

export default App
