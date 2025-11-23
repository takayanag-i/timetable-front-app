import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

// グローバルCSS
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// メタ情報
export const metadata: Metadata = {
  title: '時間割アプリ',
  description: '時間割アプリのフロントエンドです。',
}

// RootLayout 全ページに適用されるレイアウト
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
