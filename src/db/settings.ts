/**
 * Settings CRUD操作
 */
import { db } from './index'

/** 設定キー定義 */
export const SETTING_KEYS = {
  SUMMARY_ENABLED: 'summaryEnabled',
} as const

/**
 * 設定値を取得
 */
export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const setting = await db.settings.get(key)
  if (setting === undefined) {
    return defaultValue
  }
  return setting.value as T
}

/**
 * 設定値を保存
 */
export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db.settings.put({ key, value })
}

/**
 * 要約機能が有効かどうかを取得（デフォルト: true）
 */
export async function isSummaryEnabled(): Promise<boolean> {
  return getSetting(SETTING_KEYS.SUMMARY_ENABLED, true)
}

/**
 * 要約機能の有効/無効を設定
 */
export async function setSummaryEnabled(enabled: boolean): Promise<void> {
  await setSetting(SETTING_KEYS.SUMMARY_ENABLED, enabled)
}
