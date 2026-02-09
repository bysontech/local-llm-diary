import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { EntryListPage } from './ui/pages/EntryListPage'
import { EntryCreatePage } from './ui/pages/EntryCreatePage'
import { EntryDetailPage } from './ui/pages/EntryDetailPage'
import { EntryEditPage } from './ui/pages/EntryEditPage'
import { SettingsPage } from './ui/pages/SettingsPage'
import { ReviewPage } from './ui/pages/ReviewPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryListPage />} />
        <Route path="/new" element={<EntryCreatePage />} />
        <Route path="/entry/:id" element={<EntryDetailPage />} />
        <Route path="/edit/:id" element={<EntryEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/review" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
