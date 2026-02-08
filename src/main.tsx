import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// PWA更新プロンプト処理
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('新しいバージョンがあります。更新しますか？')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // オフライン準備完了時は特に通知しない
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
