'use client'

import { useState, useEffect } from 'react'

// 打字机效果组件
interface TypewriterTextProps {
  text: string;
  speed?: number;
  loop?: boolean;
}

const TypewriterText = ({ text, speed = 100, loop = true }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else if (loop) {
      // 循环效果：等待一段时间后重新开始
      const resetTimer = setTimeout(() => {
        setDisplayText('')
        setCurrentIndex(0)
      }, 1500) // 减少等待时间，让循环更流畅
      return () => clearTimeout(resetTimer)
    }
  }, [currentIndex, text, speed, loop])

  // 添加光标效果
  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* 粒子特效背景 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 原有背景装饰 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        
        {/* 高级粒子特效 */}
        <div className="particles-container">
          {/* 大粒子层 */}
          <div className="particle large-particle particle-1" data-x="10" data-y="20"></div>
          <div className="particle large-particle particle-2" data-x="80" data-y="30"></div>
          <div className="particle large-particle particle-3" data-x="20" data-y="60"></div>
          <div className="particle large-particle particle-4" data-x="70" data-y="70"></div>
          <div className="particle large-particle particle-5" data-x="50" data-y="40"></div>
          
          {/* 中粒子层 */}
          <div className="particle medium-particle particle-6" data-x="15" data-y="60"></div>
          <div className="particle medium-particle particle-7" data-x="60" data-y="15"></div>
          <div className="particle medium-particle particle-8" data-x="80" data-y="80"></div>
          <div className="particle medium-particle particle-9" data-x="30" data-y="25"></div>
          <div className="particle medium-particle particle-10" data-x="85" data-y="55"></div>
          
          {/* 小粒子层 */}
          <div className="particle small-particle particle-11" data-x="25" data-y="40"></div>
          <div className="particle small-particle particle-12" data-x="75" data-y="45"></div>
          <div className="particle small-particle particle-13" data-x="40" data-y="75"></div>
          <div className="particle small-particle particle-14" data-x="90" data-y="20"></div>
          <div className="particle small-particle particle-15" data-x="5" data-y="85"></div>
          
          {/* 气泡层 */}
          <div className="bubbles-container">
            <div className="bubble bubble-1"></div>
            <div className="bubble bubble-2"></div>
            <div className="bubble bubble-3"></div>
            <div className="bubble bubble-4"></div>
            <div className="bubble bubble-5"></div>
            <div className="bubble bubble-6"></div>
            <div className="bubble bubble-7"></div>
            <div className="bubble bubble-8"></div>
            <div className="bubble bubble-9"></div>
            <div className="bubble bubble-10"></div>
            <div className="bubble bubble-11"></div>
            <div className="bubble bubble-12"></div>
            <div className="bubble bubble-13"></div>
            <div className="bubble bubble-14"></div>
            <div className="bubble bubble-15"></div>
          </div>
          
          {/* 光效层 */}
          <div className="glow-effects">
            <div className="glow-effect glow-1"></div>
            <div className="glow-effect glow-2"></div>
            <div className="glow-effect glow-3"></div>
            <div className="glow-effect glow-4"></div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
        <div className="container mx-auto px-4 py-8">
          {/* 头部标题 */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 md:mb-4">
              普通话转粤语翻译器
            </h1>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
              专业的短视频文案翻译工具，将普通话内容转换为地道的香港粤语表达
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
    </div>
  )
}
