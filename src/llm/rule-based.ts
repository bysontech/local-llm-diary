/**
 * 全文把握型ルールベース要約
 * - 日記全文から重要文を抽出
 * - 文スコアリング（加点方式）
 * - 最大1〜3文、140〜220文字程度
 */

const MAX_LENGTH = 200
const MIN_LENGTH = 140
const MAX_SENTENCES = 3

// 感情・重要キーワード
const KEYWORDS = [
  '思う', '思った', '感じる', '感じた',
  '不安', '心配', '嬉しい', '嬉しかった', '楽しい', '楽しかった',
  '悲しい', '悲しかった', '疲れた', '疲れ', '辛い', '辛かった',
  '反省', '改善', '決めた', '決意', '目標',
  '明日', '予定', '計画', '約束',
  '大切', '重要', '必要', '気づいた', '学んだ', '分かった',
  'ありがとう', '感謝', '頑張', 'がんば',
]

interface ScoredSentence {
  text: string
  score: number
  paragraphIndex: number
  isFirst: boolean // 段落先頭かどうか
}

/**
 * 文を分割する
 * 。！？ および改行で区切る
 */
function splitSentences(text: string): { sentence: string; paragraphIndex: number; isFirst: boolean }[] {
  const paragraphs = text.split(/\n\n+/)
  const result: { sentence: string; paragraphIndex: number; isFirst: boolean }[] = []

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx].trim()
    if (!para) continue

    // 改行で行に分割
    const lines = para.split(/\n/)

    let isFirstInParagraph = true
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue

      // 。！？で文に分割
      const sentences = trimmedLine.split(/(?<=[。！？])/)

      for (const s of sentences) {
        const trimmed = s.trim()
        if (trimmed.length > 0) {
          result.push({
            sentence: trimmed,
            paragraphIndex: pIdx,
            isFirst: isFirstInParagraph,
          })
          isFirstInParagraph = false
        }
      }
    }
  }

  return result
}

/**
 * 文のスコアを計算
 */
function scoreSentence(s: { sentence: string; paragraphIndex: number; isFirst: boolean }): ScoredSentence {
  let score = 0
  const text = s.sentence

  // 文長スコア（適度な長さに加点）
  const len = text.length
  if (len >= 15 && len <= 60) {
    score += 3 // 適度な長さ
  } else if (len >= 10 && len <= 80) {
    score += 1 // まあまあ
  } else if (len < 5) {
    score -= 2 // 短すぎ
  } else if (len > 100) {
    score -= 1 // 長すぎ
  }

  // キーワードスコア
  for (const kw of KEYWORDS) {
    if (text.includes(kw)) {
      score += 2
    }
  }

  // 数字・時刻があれば加点
  if (/\d/.test(text)) {
    score += 1
  }
  if (/\d{1,2}[時:：]\d{0,2}/.test(text)) {
    score += 1 // 時刻形式
  }

  // 英数字混在も軽く加点（固有名詞の可能性）
  if (/[A-Za-z]/.test(text) && /[ぁ-んァ-ン]/.test(text)) {
    score += 1
  }

  // 段落先頭は控えめに加点（冒頭固定を避ける）
  if (s.isFirst && s.paragraphIndex === 0) {
    score += 0.5 // 最初の段落の先頭のみ微加点
  }

  // 疑問文は少し減点（質問より結論を優先）
  if (text.endsWith('？') || text.endsWith('?')) {
    score -= 1
  }

  return {
    text,
    score,
    paragraphIndex: s.paragraphIndex,
    isFirst: s.isFirst,
  }
}

/**
 * 簡易的な共通語チェック（重複回避用）
 * 選択済み文と共通する文字が多い場合は true
 */
function hasHighOverlap(candidate: string, selected: string[]): boolean {
  if (selected.length === 0) return false

  // 候補文の文字セット
  const candidateChars = new Set(candidate.split(''))

  for (const s of selected) {
    const sChars = new Set(s.split(''))
    let commonCount = 0
    for (const c of candidateChars) {
      if (sChars.has(c) && c.length > 0 && !/[\s。、！？「」『』（）]/.test(c)) {
        commonCount++
      }
    }
    // 共通文字が候補文字数の50%以上なら重複とみなす
    const ratio = commonCount / candidateChars.size
    if (ratio > 0.5) {
      return true
    }
  }

  return false
}

/**
 * ルールベースで本文を要約する
 * @param body 日記本文
 * @returns 要約テキスト
 */
export function summarizeRuleBased(body: string): string {
  if (!body || body.trim().length === 0) {
    return ''
  }

  const trimmed = body.trim()

  // 短い文章ならそのまま返す
  if (trimmed.length <= MIN_LENGTH) {
    return trimmed
  }

  // 文分割
  const sentences = splitSentences(trimmed)

  if (sentences.length === 0) {
    // 文分割できなかった場合は先頭を返す
    return trimmed.slice(0, MAX_LENGTH)
  }

  // 文が1つだけの場合
  if (sentences.length === 1) {
    const text = sentences[0].sentence
    if (text.length <= MAX_LENGTH) {
      return text
    }
    return text.slice(0, MAX_LENGTH - 3) + '...'
  }

  // スコアリング
  const scored = sentences.map(scoreSentence)

  // スコア降順でソート
  const sorted = [...scored].sort((a, b) => b.score - a.score)

  // 上位文を選択（重複回避しながら）
  const selected: string[] = []
  let totalLength = 0

  for (const s of sorted) {
    if (selected.length >= MAX_SENTENCES) break
    if (totalLength + s.text.length > MAX_LENGTH) {
      // 1文も選んでいない場合は最初の1文を追加
      if (selected.length === 0) {
        if (s.text.length <= MAX_LENGTH) {
          selected.push(s.text)
          totalLength += s.text.length
        } else {
          selected.push(s.text.slice(0, MAX_LENGTH - 3) + '...')
        }
      }
      continue
    }

    // 重複チェック
    if (hasHighOverlap(s.text, selected)) {
      continue
    }

    selected.push(s.text)
    totalLength += s.text.length
  }

  // 選択された文がない場合（スコアが全て低い場合など）
  if (selected.length === 0) {
    const first = sentences[0].sentence
    if (first.length <= MAX_LENGTH) {
      return first
    }
    return first.slice(0, MAX_LENGTH - 3) + '...'
  }

  // 元の文順に並び替え
  const sentenceOrder = sentences.map((s) => s.sentence)
  selected.sort((a, b) => {
    const aIdx = sentenceOrder.indexOf(a)
    const bIdx = sentenceOrder.indexOf(b)
    return aIdx - bIdx
  })

  return selected.join('')
}
