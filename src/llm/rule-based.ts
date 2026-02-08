/**
 * ルールベース要約
 * - 最大200文字
 * - 段落区切りを考慮
 * - 空なら空文字を返す
 */

const MAX_LENGTH = 200

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

  // 200文字以内ならそのまま返す
  if (trimmed.length <= MAX_LENGTH) {
    return trimmed
  }

  // 段落区切りで分割（改行2つ以上、または改行1つ）
  const paragraphs = trimmed.split(/\n\n+/)

  // 最初の段落が200文字以内ならそれを返す
  const firstParagraph = paragraphs[0].trim()
  if (firstParagraph.length <= MAX_LENGTH) {
    return firstParagraph
  }

  // 最初の段落も長い場合、文単位で切り出す
  // 句点（。！？）で区切る
  const sentences = firstParagraph.split(/(?<=[。！？])/g)

  let result = ''
  for (const sentence of sentences) {
    if (result.length + sentence.length <= MAX_LENGTH) {
      result += sentence
    } else {
      break
    }
  }

  // 文単位で区切れなかった場合（句点がない長文）
  if (result.length === 0) {
    return trimmed.slice(0, MAX_LENGTH - 3) + '...'
  }

  return result
}
