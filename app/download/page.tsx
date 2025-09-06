'use client'

import { useState } from 'react'

export default function DownloadPage() {
  const [videoUrl, setVideoUrl] = useState('')
  const [result, setResult] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultType, setResultType] = useState('')

  const handleSubmit = async () => {
    if (!videoUrl.trim()) {
      showResult('请输入有效的短视频链接', 'error')
      return
    }

    try {
      setIsProcessing(true)
      showResult('正在获取下载链接，请稍候...', 'success')
      
      // 调用Coze API
      const response = await fetch('https://api.coze.cn/v1/workflows/chat', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sat_E6Nr9kleEW22WDXoO73Thz06C4Goj37CHshG6Rf2TRXEsSp90BCxwWjVNrlaJvMm',
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          "workflow_id": "7527869690576699430",
          "parameters": {
            "input": videoUrl
          },
          "additional_messages": [
            {
              "content_type": "text",
              "role": "user",
              "type": "question"
            }
          ]
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
            
            // 只处理 conversation.message.delta 事件
            if (eventType === 'conversation.message.delta' && eventData) {
              console.log('处理delta事件')
              const data = JSON.parse(eventData)
              console.log('收到delta事件数据:', data)
              
              if (data.content) {
                console.log('解析content字符串:', data.content)
                const content = JSON.parse(data.content)
                console.log('解析content对象:', content)
                
                if (content.output) {
                  console.log('找到下载链接:', content.output)
                  console.log('链接长度:', content.output.length)
                  console.log('链接类型:', typeof content.output)
                  
                  // 验证链接格式
                  if (content.output.startsWith('http')) {
                    console.log('链接格式正确，以http开头')
                  } else {
                    console.log('链接格式异常，不以http开头')
                  }
                  
                  showResult(`
                    <h3 class="text-xl font-semibold text-gray-800 mb-4">下载链接已生成</h3>
                    <p class="text-gray-600 mb-4">点击下方链接下载视频：</p>
                    <a href="${content.output}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-decoration-none font-semibold hover:shadow-lg transition-all duration-300">
                      前往下载页面
                    </a>
                    <p class="mt-4 text-sm text-gray-500">
                      请在播放页面手动下载视频
                    </p>
                  `, 'success')
                  return
                } else {
                  console.log('content中没有output字段:', content)
                }
              } else {
                console.log('data中没有content字段:', data)
              }
            } else {
              console.log('跳过事件类型:', eventType)
            }
          } catch (e) {
            console.log('解析事件失败:', e, '事件内容:', event)
          }
        }
      }
      
      showResult('未找到下载链接', 'error')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      showResult(`
        <h3 class="text-xl font-semibold text-red-600 mb-2">请求失败</h3>
        <p class="text-gray-600">${errorMessage}</p>
      `, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const showResult = (message: string, type: string) => {
    setResult(message)
    setResultType(type)
  }

  const handleClear = () => {
    setVideoUrl('')
    setResult('')
    setResultType('')
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col justify-center">
      <div className="container mx-auto px-4 py-8">
        {/* 头部标题 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 md:mb-4">
            短视频下载工具
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
            抖音平台短视频下载，快速获取高清视频资源
          </p>
        </div>

        {/* 下载界面 */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-8">
            {/* 输入区域 */}
            <div className="mb-6">
              <label htmlFor="videoUrl" className="block text-lg font-semibold text-gray-800 mb-3">
                短视频分享链接
              </label>
              <textarea
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="例如: https://v.douyin.com/xxxxx"
                className="w-full h-32 p-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 mb-6">
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
                    处理中...
                  </span>
                ) : (
                  '生成下载链接'
                )}
              </button>
            </div>

            {/* 结果显示 */}
            {result && (
              <div className={`p-6 rounded-xl ${
                resultType === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div dangerouslySetInnerHTML={{ __html: result }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
