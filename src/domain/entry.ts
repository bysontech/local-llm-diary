/**
 * Entry: 日記エントリの型定義
 */

export type SummaryStatus = 'none' | 'pending' | 'done' | 'failed'

export interface Entry {
  id: string           // UUID v4
  date: string         // ISO 8601 日付 (YYYY-MM-DD)
  body: string         // 本文
  summary?: string     // 要約（生成済みの場合）
  summaryStatus: SummaryStatus
  createdAt: number    // Unix timestamp (ms)
  updatedAt: number    // Unix timestamp (ms)
}

/**
 * 新規Entry作成用のパラメータ
 */
export interface CreateEntryParams {
  date: string
  body: string
}

/**
 * Entry更新用のパラメータ
 */
export interface UpdateEntryParams {
  date?: string
  body?: string
  summary?: string
  summaryStatus?: SummaryStatus
}
