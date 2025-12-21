import { Sidebar } from '@/components/shared/Sidebar'

import styles from './layout.module.css'

/**
 * プライベートエリア用レイアウト
 *
 * @param children - ページコンテンツ
 * @returns サイドバー付きレイアウト
 */
export default function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  )
}
