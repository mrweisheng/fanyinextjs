'use client'

import { useState, useEffect } from 'react'
import TypewriterText from '@/components/TypewriterText'

export default function ExtractPage() {
  const [videoUrl, setVideoUrl] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [organizedText, setOrganizedText] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultType, setResultType] = useState('')

  // 页面加载时恢复状态
  useEffect(() => {
    const savedVideoUrl = localStorage.getItem('extract-videoUrl')
    const savedOriginalText = localStorage.getItem('extract-originalText')
    const savedOrganizedText = localStorage.getItem('extract-organizedText')
    const savedResultType = localStorage.getItem('extract-resultType')
    
    if (savedVideoUrl) {
      setVideoUrl(savedVideoUrl)
    }
    if (savedOriginalText) {
      setOriginalText(savedOriginalText)
    }
    if (savedOrganizedText) {
      setOrganizedText(savedOrganizedText)
    }
    if (savedResultType) {
      setResultType(savedResultType)
    }
  }, [])

  // 保存视频链接到localStorage
  useEffect(() => {
    if (videoUrl) {
      localStorage.setItem('extract-videoUrl', videoUrl)
    } else {
      localStorage.removeItem('extract-videoUrl')
    }
  }, [videoUrl])

  // 保存原文到localStorage
  useEffect(() => {
    if (originalText) {
      localStorage.setItem('extract-originalText', originalText)
    } else {
      localStorage.removeItem('extract-originalText')
    }
  }, [originalText])

  // 保存整理版本到localStorage
  useEffect(() => {
    if (organizedText) {
      localStorage.setItem('extract-organizedText', organizedText)
    } else {
      localStorage.removeItem('extract-organizedText')
    }
  }, [organizedText])

  // 保存结果类型到localStorage
  useEffect(() => {
    if (resultType) {
      localStorage.setItem('extract-resultType', resultType)
    } else {
      localStorage.removeItem('extract-resultType')
    }
  }, [resultType])

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      showResult('请输入有效的短视频链接', 'error')
      return
    }

    try {
      setIsProcessing(true)
      setOriginalText('')
      setOrganizedText('')
      showResult('正在提取视频文案，请稍候...', 'success')
      
      // 调用Coze API
      const response = await fetch(process.env.NEXT_PUBLIC_COZE_API_URL || 'https://api.coze.cn/v1/workflow/stream_run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COZE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          "workflow_id": process.env.NEXT_PUBLIC_COZE_WORKFLOW_ID_EXTRACT || "7511939386046218291",
          "parameters": {
            "input": videoUrl
          }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let hasReceivedContent = false
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        
        // 处理SSE事件
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''
        
        for (const event of events) {
          console.log('处理事件:', event)
          
          if (!event.includes('data:')) continue
          
          try {
            // 解析事件行
            const lines = event.split('\n')
            let eventType = ''
            let eventData = ''
            
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.substring(6).trim()
              } else if (line.startsWith('data:')) {
                eventData = line.substring(5).trim()
              }
            }
            
            console.log('事件类型:', eventType, '事件数据:', eventData)
            
            // 处理 Message 事件
            if (eventType === 'Message' && eventData) {
              const data = JSON.parse(eventData)
              console.log('收到Message事件数据:', data)
              
              if (data.content && data.node_is_finish) {
                hasReceivedContent = true
                console.log('收到完整内容:', data.content)
                
                // 解析内容，分离原文和整理后的文案
                const content = data.content
                // 尝试多种分隔符
                let parts = content.split('————————')
                if (parts.length < 2) {
                  parts = content.split('\n- ———\n整理:')
                }
                if (parts.length < 2) {
                  parts = content.split('\n————————\n整理：')
                }
                
                if (parts.length >= 2) {
                  const original = parts[0].replace('原文：', '').replace('原文:', '').trim()
                  const organized = parts[1].replace('整理：', '').replace('整理:', '').trim()
                  
                  setOriginalText(original)
                  setOrganizedText(organized)
                  showResult('文案提取完成！', 'success')
                } else {
                  // 如果没有分隔符，直接显示全部内容
                  setOriginalText(content)
                  setOrganizedText('')
                  showResult('文案提取完成！', 'success')
                }
                return
              }
            }
          } catch (e) {
            console.log('解析事件失败:', e, '事件内容:', event)
          }
        }
      }
      
      if (!hasReceivedContent) {
        showResult('未获取到文案内容', 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showResult(`
        <h3 class="text-xl font-semibold text-red-600 mb-2">提取失败</h3>
        <p class="text-gray-600">${errorMessage}</p>
      `, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const showResult = (message: string, type: string) => {
    setResultType(type)
  }

  const handleClear = () => {
    setVideoUrl('')
    setOriginalText('')
    setOrganizedText('')
    setResultType('')
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* 头部标题 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 md:mb-4">
            文案提取工具
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
            智能提取抖音短视频的完整文案内容，支持原文和整理版本
          </p>
        </div>

        {/* 提取界面 */}
        <div className="max-w-6xl mx-auto">
          {/* 输入区域 */}
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6">
              <div className="mb-4">
                <label htmlFor="videoUrl" className="block text-lg font-semibold text-gray-800 mb-3">
                  短视频分享链接
                </label>
                <textarea
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="例如: https://v.douyin.com/xxxxx"
                  className="w-full h-20 p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-4">
                <button
                  onClick={handleClear}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-300"
                >
                  清空内容
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      提取中...
                    </span>
                  ) : (
                    '开始提取文案'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 结果显示 */}
          {(originalText || organizedText) && (
            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* 原文区域 */}
              {originalText && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">原</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">原文内容</h2>
                    <button
                      onClick={() => handleCopy(originalText)}
                      className="ml-auto px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                    >
                      复制
                    </button>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 min-h-80">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap h-full">
                      {originalText}
                    </div>
                  </div>
                </div>
              )}

              {/* 整理后文案区域 */}
              {organizedText && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">整</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">整理版本</h2>
                    <button
                      onClick={() => handleCopy(organizedText)}
                      className="ml-auto px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-600 transition-colors"
                    >
                      复制
                    </button>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 min-h-80">
                    <div className="text-gray-800 leading-relaxed whitespace-pre-wrap h-full">
                      {organizedText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 状态提示 */}
          {resultType && !originalText && !organizedText && (
            <div className={`p-6 rounded-xl ${
              resultType === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="text-center">
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">
                      <TypewriterText text="正在提取文案..." speed={150} />
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-600">
                    {resultType === 'success' ? '文案提取完成！' : '提取失败，请重试'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
