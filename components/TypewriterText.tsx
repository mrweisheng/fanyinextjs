'use client'

import { useState, useEffect } from 'react'

interface TypewriterTextProps {
  text: string;
  speed?: number;
  loop?: boolean;
}

export default function TypewriterText({ text, speed = 100, loop = true }: TypewriterTextProps) {
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
