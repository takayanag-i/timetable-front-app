import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        時間割結果が見つかりませんでした
      </h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        指定されたIDの時間割結果は存在しないか、削除された可能性があります。
      </p>
      <Link
        href="/curriculum"
        style={{
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0066cc',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        カリキュラム設定画面に戻る
      </Link>
    </div>
  )
}
