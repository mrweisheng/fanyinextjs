import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import BackgroundEffects from '@/components/BackgroundEffects'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '多功能工具平台',
  description: '专业的普通话短视频文案转香港粤语翻译工具，支持多平台短视频下载',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
          {/* 导航栏 */}
          <Navigation />
          
          {/* 背景特效 */}
          <BackgroundEffects />

          {/* 主要内容 */}
          {children}
        </div>
      </body>
    </html>
  )
}
