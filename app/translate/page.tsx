'use client'

import { useState } from 'react'
import TypewriterText from '@/components/TypewriterText'

// 测试自动部署

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    
    setIsTranslating(true)
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText.trim()
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setOutputText(data.result)
      } else {
        setOutputText(`翻译失败：${data.error}`)
      }
    } catch (error) {
      console.error('翻译请求失败:', error)
      setOutputText('翻译请求失败，请检查网络连接或稍后重试')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      setOutputText('') // 粘贴时清空输出
    } catch (error) {
      console.error('粘贴失败:', error)
      // 可以添加用户提示
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('') // 清除时清空输出
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8">
        {/* 头部标题 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 md:mb-4">
            普通话转粤语翻译器
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
            将普通话内容转换为地道的香港粤语表达
          </p>
        </div>

        {/* 翻译界面 */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
            {/* 输入区域 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">普</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">普通话输入</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {inputText.length}/1000
                  </div>
                  {/* 粘贴和清除按钮 */}
                  <button
                    onClick={handlePaste}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    title="粘贴"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </button>
                  <button
                    onClick={handleClear}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="清除"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    setOutputText('') // 输入变化时自动清空输出
                  }}
                  placeholder="请输入您的普通话短视频文案..."
                  className="w-full h-64 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
                  maxLength={1000}
                />
                <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                  支持最多1000字符
                </div>
              </div>
            </div>

            {/* 输出区域 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">粤</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">粤语输出</h2>
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="ml-auto px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                  >
                    复制
                  </button>
                )}
              </div>
              
              <div className="relative">
                <div className="w-full h-64 p-6 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                  {isTranslating ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">
                          <TypewriterText text="正在翻译中..." speed={150} />
                        </span>
                      </div>
                    </div>
                  ) : outputText ? (
                    <div className="text-gray-800 leading-relaxed h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                      {outputText}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic h-full flex items-center justify-center">
                      翻译结果将显示在这里...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 翻译按钮 */}
          <div className="flex justify-center mt-6 md:mt-8">
            <button
              onClick={handleTranslate}
              disabled={!inputText.trim() || isTranslating}
              className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm md:text-base"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isTranslating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <TypewriterText text="翻译中..." speed={120} />
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    开始翻译
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
