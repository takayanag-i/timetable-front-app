/**
 * 統一的なロギングユーティリティ
 *
 * 本番環境では適切なログレベルで出力し、
 * 開発環境では詳細なログを出力します。
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isLoggingEnabled = (): boolean => {
  return process.env.ENABLE_LOGGING !== 'false'
}

/**
 * ログレベルに応じた出力を行う
 */
function log(
  level: LogLevel,
  message: string,
  context?: LogContext | Error
): void {
  if (!isLoggingEnabled()) {
    return
  }

  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    message,
    ...(context instanceof Error
      ? {
          error: {
            name: context.name,
            message: context.message,
            stack: isDevelopment ? context.stack : undefined,
          },
        }
      : context),
  }

  // 本番環境では構造化ログとして出力
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logEntry))
    return
  }

  // 開発環境では読みやすい形式で出力
  const prefix = `[${level.toUpperCase()}] ${timestamp}`
  switch (level) {
    case 'debug':
      if (isDevelopment) {
        console.debug(prefix, message, context || '')
      }
      break
    case 'info':
      console.info(prefix, message, context || '')
      break
    case 'warn':
      console.warn(prefix, message, context || '')
      break
    case 'error':
      console.error(prefix, message, context || '')
      break
  }
}

/**
 * 統一的なロガーオブジェクト
 */
export const logger = {
  /**
   * デバッグログ（開発環境のみ）
   */
  debug(message: string, context?: LogContext): void {
    if (isDevelopment) {
      log('debug', message, context)
    }
  },

  /**
   * 情報ログ
   */
  info(message: string, context?: LogContext): void {
    log('info', message, context)
  },

  /**
   * 警告ログ
   */
  warn(message: string, context?: LogContext | Error): void {
    log('warn', message, context)
  },

  /**
   * エラーログ
   */
  error(message: string, error?: Error | LogContext): void {
    log('error', message, error)
  },

  /**
   * APIリクエストログ
   */
  logApiRequest(endpoint: string, method: string, body?: unknown): void {
    if (!isDevelopment && process.env.ENABLE_API_LOGGING !== 'true') {
      return
    }

    this.debug('API Request', {
      endpoint,
      method,
      ...(body !== undefined && { body }),
    })
  },

  /**
   * APIレスポンスログ
   */
  logApiResponse(endpoint: string, status: number, body?: unknown): void {
    if (!isDevelopment && process.env.ENABLE_API_LOGGING !== 'true') {
      return
    }

    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info'
    log(level, 'API Response', {
      endpoint,
      status,
      ...(body !== undefined && { body }),
    })
  },
}
