/**
 * バックアップ（エクスポート/インポート）機能
 */
import { db } from './index'
import type { Entry } from '../domain/entry'

const BACKUP_VERSION = 1

interface BackupData {
  version: number
  exportedAt: string
  entries: Entry[]
  settings: Array<{ key: string; value: unknown }>
}

/**
 * 全データをJSON形式でエクスポート
 */
export async function exportData(): Promise<string> {
  const entries = await db.entries.toArray()
  const settings = await db.settings.toArray()

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
    settings,
  }

  return JSON.stringify(backup, null, 2)
}

/**
 * バックアップデータの形式チェック
 */
export function validateBackupData(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>

  if (typeof obj.version !== 'number') {
    return false
  }

  if (!Array.isArray(obj.entries)) {
    return false
  }

  if (!Array.isArray(obj.settings)) {
    return false
  }

  // entries の各要素をチェック
  for (const entry of obj.entries) {
    if (typeof entry !== 'object' || entry === null) {
      return false
    }
    const e = entry as Record<string, unknown>
    if (typeof e.id !== 'string' || typeof e.date !== 'string' || typeof e.body !== 'string') {
      return false
    }
  }

  // settings の各要素をチェック
  for (const setting of obj.settings) {
    if (typeof setting !== 'object' || setting === null) {
      return false
    }
    const s = setting as Record<string, unknown>
    if (typeof s.key !== 'string') {
      return false
    }
  }

  return true
}

/**
 * JSONからデータをインポート（上書き復元）
 */
export async function importData(jsonString: string): Promise<void> {
  let data: unknown
  try {
    data = JSON.parse(jsonString)
  } catch {
    throw new Error('JSONの解析に失敗しました')
  }

  if (!validateBackupData(data)) {
    throw new Error('バックアップデータの形式が正しくありません')
  }

  // entries 全削除 → インポートデータ投入
  await db.entries.clear()
  if (data.entries.length > 0) {
    await db.entries.bulkAdd(data.entries)
  }

  // settings 更新
  await db.settings.clear()
  if (data.settings.length > 0) {
    await db.settings.bulkAdd(data.settings)
  }
}

/**
 * JSONファイルをダウンロード
 */
export function downloadJson(jsonString: string, filename: string): void {
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
