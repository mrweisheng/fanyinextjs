'use client'

import { useState, useEffect } from 'react'
import TypewriterText from '@/components/TypewriterText'
import './slider-styles.css'

export default function AudioSynthesisPage() {
  const [inputText, setInputText] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [voiceId, setVoiceId] = useState('moss_audio_107106b4-8d24-11f0-9aaa-e2737c68e713')
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(1)

  // 页面加载时恢复状态
  useEffect(() => {
    const savedInputText = localStorage.getItem('audio-synthesis-inputText')
    const savedVoiceId = localStorage.getItem('audio-synthesis-voiceId')
    const savedSpeed = localStorage.getItem('audio-synthesis-speed')
    const savedVolume = localStorage.getItem('audio-synthesis-volume')
    
    if (savedInputText) {
      setInputText(savedInputText)
    }
    if (savedVoiceId) {
      setVoiceId(savedVoiceId)
    }
    if (savedSpeed) {
      setSpeed(parseFloat(savedSpeed))
    }
    if (savedVolume) {
      setVolume(parseFloat(savedVolume))
    }
  }, [])

  // 保存输入文本到localStorage
  useEffect(() => {
    if (inputText) {
      localStorage.setItem('audio-synthesis-inputText', inputText)
    } else {
      localStorage.removeItem('audio-synthesis-inputText')
    }
  }, [inputText])

  // 保存语音参数到localStorage
  useEffect(() => {
    localStorage.setItem('audio-synthesis-voiceId', voiceId)
  }, [voiceId])

  useEffect(() => {
    localStorage.setItem('audio-synthesis-speed', speed.toString())
  }, [speed])

  useEffect(() => {
    localStorage.setItem('audio-synthesis-volume', volume.toString())
  }, [volume])

  const handleGenerate = async () => {
    if (!inputText.trim()) return
    
    setIsGenerating(true)
    setAudioUrl('')
    
    try {
      const response = await fetch('/api/audio-synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          voiceId: voiceId,
          speed: speed,
          vol: volume,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '音频生成失败');
      }

      const data = await response.json();
      if (!data.audio) {
        throw new Error('无效的音频数据');
      }

      setAudioUrl(`data:audio/mp3;base64,${data.audio}`);

    } catch (error: any) {
      console.error('音频生成失败:', error.message);
      alert(error.message);
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      setAudioUrl('') // 粘贴时清空音频
    } catch (error) {
      console.error('粘贴失败:', error)
    }
  }

  const handleClear = () => {
    setInputText('')
    setAudioUrl('') // 清除时清空音频
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = 'synthesized-audio.mp3'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* 头部标题 */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 md:mb-4">
            智能语音合成器
          </h1>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
            支持指定音色粤语语音合成
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
            
            {/* 左侧：文本输入与结果展示 */}
            <div className="lg:col-span-2 flex flex-col h-full">
              {/* 文本输入卡片 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">文</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">文本输入</h2>
                <div className="ml-auto flex items-center gap-2">
                  <div className="text-sm text-gray-500">
                    {inputText.length}/2000
                  </div>
                  <button onClick={handlePaste} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="粘贴">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </button>
                  <button onClick={handleClear} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="清除">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 flex-1 min-h-[400px] flex flex-col">
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value)
                    setAudioUrl('')
                  }}
                  placeholder="请输入您要转换为语音的文本内容仅支持粤语..."
                  className="w-full flex-1 p-0 bg-transparent border-none focus:outline-none resize-none text-gray-800 placeholder-gray-400"
                  maxLength={2000}
                />
                <div className="mt-4 text-xs text-gray-400 text-right">
                  支持最多2000字符
                </div>
              </div>

              {/* 生成结果展示和操作按钮 */}
              <div className="mt-6 md:mt-8">
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-4">
                  {isGenerating && !audioUrl ? (
                    <div className="flex items-center justify-center gap-3 py-8">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">
                        <TypewriterText text="正在生成语音..." speed={150} />
                      </span>
                    </div>
                  ) : audioUrl ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                        </div>
                        <span className="text-gray-700 font-medium text-sm">生成成功!</span>
                      </div>
                      <audio controls src={audioUrl} className="flex-1 min-w-0">
                        您的浏览器不支持音频播放。
                      </audio>
                      <button onClick={handleDownload} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium flex-shrink-0">
                        下载
                      </button>
                      <button onClick={handleGenerate} disabled={!inputText.trim() || isGenerating} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm flex-shrink-0">
                        重新生成
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <button onClick={handleGenerate} disabled={!inputText.trim() || isGenerating} className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <TypewriterText text="生成中..." speed={120} />
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 12a3 3 0 106 0v-3a3 3 0 00-6 0v3z" /></svg>
                              生成语音
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：语音参数配置与生成按钮 */}
            <div className="flex flex-col h-full">
              {/* 参数调节卡片 */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">设</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">参数调节</h2>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-6 space-y-8 flex-1 min-h-[400px] flex flex-col justify-start pt-12">
                {/* 音色选择 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">音色选择</label>
                  <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 font-medium">
                    <option value="moss_audio_107106b4-8d24-11f0-9aaa-e2737c68e713">明哥</option>
                    <option value="moss_audio_ecdd2991-8a01-11f0-9602-7aacfe011ce5">coco</option>
                  </select>
                </div>
                {/* 语速调节 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">语速: {speed}x</label>
                  <div className="relative">
                    <input type="range" min="0.5" max="1.5" step="0.1" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((speed - 0.5) / (1.5 - 0.5)) * 100}%, #e5e7eb ${((speed - 0.5) / (1.5 - 0.5)) * 100}%, #e5e7eb 100%)`, WebkitAppearance: 'none', height: '8px' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>慢</span>
                    <span>正常</span>
                    <span>快</span>
                  </div>
                </div>
                {/* 音量调节 */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">音量: {volume}x</label>
                  <div className="relative">
                    <input type="range" min="0.1" max="1.9" step="0.1" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider" style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((volume - 0.1) / (1.9 - 0.1)) * 100}%, #e5e7eb ${((volume - 0.1) / (1.9 - 0.1)) * 100}%, #e5e7eb 100%)`, WebkitAppearance: 'none', height: '8px' }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>小声</span>
                    <span>正常</span>
                    <span>大声</span>
                  </div>
                </div>
              </div>


            </div>

          </div>
        </div>
      </div>
    </div>
  )
}