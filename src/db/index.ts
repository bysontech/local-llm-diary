/**
 * Dexie (IndexedDB) 初期化
 */
import Dexie, { type EntityTable } from 'dexie'
import type { Entry } from '../domain/entry'

const db = new Dexie('LocalLLMDiaryDB') as Dexie & {
  entries: EntityTable<Entry, 'id'>
}

db.version(1).stores({
  entries: 'id, date, createdAt, updatedAt, summaryStatus'
})

export { db }
