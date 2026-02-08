/**
 * バックアップ（エクスポート/インポート）機能
 */
import { db } from './index'
import type { Entry } from '../domain/entry'

const BACKUP_VERSION = 1
const ENCRYPTED_BACKUP_VERSION = 1
const KDF_ITERATIONS = 100000

interface BackupData {
  version: number
  exportedAt: string
  entries: Entry[]
  settings: Array<{ key: string; value: unknown }>
}

interface EncryptedBackup {
  type: 'encrypted-backup'
  version: number
  kdf: {
    algorithm: 'PBKDF2'
    hash: 'SHA-256'
    iterations: number
    salt: string // base64
  }
  cipher: {
    algorithm: 'AES-GCM'
    iv: string // base64
  }
  data_b64: string // 暗号文（base64）
  exportedAt: string
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

// ===== 暗号化バックアップ =====

/**
 * ArrayBuffer を base64 文字列に変換
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * base64 文字列を ArrayBuffer に変換
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * パスワードから暗号化キーを導出（PBKDF2）
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: KDF_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * 暗号化エクスポート
 */
export async function exportDataEncrypted(password: string): Promise<string> {
  const entries = await db.entries.toArray()
  const settings = await db.settings.toArray()

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
    settings,
  }

  const plaintext = JSON.stringify(backup)
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)

  // salt と iv を生成
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  // キー導出
  const key = await deriveKey(password, salt)

  // 暗号化
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const encryptedBackup: EncryptedBackup = {
    type: 'encrypted-backup',
    version: ENCRYPTED_BACKUP_VERSION,
    kdf: {
      algorithm: 'PBKDF2',
      hash: 'SHA-256',
      iterations: KDF_ITERATIONS,
      salt: arrayBufferToBase64(salt.buffer),
    },
    cipher: {
      algorithm: 'AES-GCM',
      iv: arrayBufferToBase64(iv.buffer),
    },
    data_b64: arrayBufferToBase64(ciphertext),
    exportedAt: new Date().toISOString(),
  }

  return JSON.stringify(encryptedBackup, null, 2)
}

/**
 * 暗号化バックアップの形式チェック
 */
function validateEncryptedBackup(data: unknown): data is EncryptedBackup {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>

  if (obj.type !== 'encrypted-backup') {
    return false
  }

  if (typeof obj.version !== 'number') {
    return false
  }

  if (typeof obj.kdf !== 'object' || obj.kdf === null) {
    return false
  }

  const kdf = obj.kdf as Record<string, unknown>
  if (kdf.algorithm !== 'PBKDF2' || kdf.hash !== 'SHA-256') {
    return false
  }
  if (typeof kdf.iterations !== 'number' || typeof kdf.salt !== 'string') {
    return false
  }

  if (typeof obj.cipher !== 'object' || obj.cipher === null) {
    return false
  }

  const cipher = obj.cipher as Record<string, unknown>
  if (cipher.algorithm !== 'AES-GCM' || typeof cipher.iv !== 'string') {
    return false
  }

  if (typeof obj.data_b64 !== 'string') {
    return false
  }

  return true
}

/**
 * 暗号化インポート
 */
export async function importDataEncrypted(jsonString: string, password: string): Promise<void> {
  let data: unknown
  try {
    data = JSON.parse(jsonString)
  } catch {
    throw new Error('JSONの解析に失敗しました')
  }

  if (!validateEncryptedBackup(data)) {
    throw new Error('暗号化バックアップの形式が正しくありません')
  }

  // salt と iv を復元
  const salt = new Uint8Array(base64ToArrayBuffer(data.kdf.salt))
  const iv = new Uint8Array(base64ToArrayBuffer(data.cipher.iv))
  const ciphertext = base64ToArrayBuffer(data.data_b64)

  // キー導出（iterations はファイルから取得）
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: data.kdf.iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )

  // 復号
  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    )
  } catch {
    throw new Error('パスワードが正しくないか、データが破損しています')
  }

  const decoder = new TextDecoder()
  const jsonData = decoder.decode(plaintext)

  let backupData: unknown
  try {
    backupData = JSON.parse(jsonData)
  } catch {
    throw new Error('復号されたデータの解析に失敗しました')
  }

  if (!validateBackupData(backupData)) {
    throw new Error('復号されたバックアップデータの形式が正しくありません')
  }

  // entries 全削除 → インポートデータ投入
  await db.entries.clear()
  if (backupData.entries.length > 0) {
    await db.entries.bulkAdd(backupData.entries)
  }

  // settings 更新
  await db.settings.clear()
  if (backupData.settings.length > 0) {
    await db.settings.bulkAdd(backupData.settings)
  }
}
