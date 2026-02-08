/**
 * Dexie (IndexedDB) 初期化
 */
import Dexie, { type EntityTable } from 'dexie'
import type { Entry } from '../domain/entry'

export interface Setting {
  key: string
  value: unknown
}

const db = new Dexie('LocalLLMDiaryDB') as Dexie & {
  entries: EntityTable<Entry, 'id'>
  settings: EntityTable<Setting, 'key'>
}

db.version(2).stores({
  entries: 'id, date, createdAt, updatedAt, summaryStatus',
  settings: 'key'
})

export { db }
