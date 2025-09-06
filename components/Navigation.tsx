'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="relative z-20 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              <Link
                href="/translate"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  pathname === '/translate'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'
                }`}
              >
                粤语翻译
              </Link>
              <Link
                href="/extract"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  pathname === '/extract'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'
                }`}
              >
                文案提取
              </Link>
              <Link
                href="/download"
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  pathname === '/download'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-white/30 hover:text-gray-900'
                }`}
              >
                短视频下载
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
