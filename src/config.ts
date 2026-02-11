/**
 * アプリ設定（環境変数由来）
 * canonical / PWA / OG などで利用する正URLはここから参照する。
 * ドメイン変更時は .env の VITE_APP_ORIGIN を1行変更するだけでよい。
 */
export const APP_ORIGIN: string =
  typeof import.meta.env.VITE_APP_ORIGIN === 'string' &&
  import.meta.env.VITE_APP_ORIGIN.length > 0
    ? import.meta.env.VITE_APP_ORIGIN.replace(/\/$/, '')
    : ''
