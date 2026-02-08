/**
 * Entry CRUD操作
 */
import { db } from './index'
import type { Entry, CreateEntryParams, UpdateEntryParams } from '../domain/entry'

/**
 * UUID v4 生成（crypto.randomUUID利用）
 */
function generateId(): string {
  return crypto.randomUUID()
}

/**
 * 新規Entry作成
 */
export async function addEntry(params: CreateEntryParams): Promise<Entry> {
  const now = Date.now()
  const entry: Entry = {
    id: generateId(),
    date: params.date,
    body: params.body,
    summaryStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  await db.entries.add(entry)
  return entry
}

/**
 * IDでEntry取得
 */
export async function getEntryById(id: string): Promise<Entry | undefined> {
  return db.entries.get(id)
}

/**
 * 全Entry取得（日付降順）
 */
export async function listEntriesByDateDesc(): Promise<Entry[]> {
  return db.entries.orderBy('date').reverse().toArray()
}

/**
 * Entry更新
 */
export async function updateEntry(id: string, patch: UpdateEntryParams): Promise<void> {
  await db.entries.update(id, {
    ...patch,
    updatedAt: Date.now(),
  })
}

/**
 * Entry削除
 */
export async function deleteEntry(id: string): Promise<void> {
  await db.entries.delete(id)
}

/**
 * 全Entry削除
 */
export async function clearEntries(): Promise<void> {
  await db.entries.clear()
}
