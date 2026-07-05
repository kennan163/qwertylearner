import { SoundIcon } from './SoundIcon'
import { pronunciationConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { generateWordSoundSrc } from '@/hooks/usePronunciation'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import React from 'react'

export const DualPronunciationIcon = React.forwardRef<
  DualPronunciationIconRef,
  { word: Word; className?: string; iconClassName?: string }
>(({ word, className, iconClassName }, ref) => {
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const playSound = useCallback(() => {
    // 如果已经有音频在播放，停止它
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // 创建新的音频对象
    const audio = new Audio()
    audioRef.current = audio
    
    // 设置音量
    audio.volume = pronunciationConfig.volume
    
    // 首先播放英式发音
    if (word.ukphone && word.ukphone.length > 1) {
      audio.src = generateWordSoundSrc(word.name, 'uk')
    } else if (word.usphone && word.usphone.length > 1) {
      // 如果没有英式发音，播放美式发音
      audio.src = generateWordSoundSrc(word.name, 'us')
      audio.play().catch(e => console.error('Error playing audio:', e))
      return
    } else {
      // 如果都没有，直接返回
      return
    }

    // 监听第一个音频播放结束事件
    audio.addEventListener('ended', () => {
      // 播放完英式发音后，播放美式发音
      if (word.usphone && word.usphone.length > 1) {
        audio.src = generateWordSoundSrc(word.name, 'us')
        audio.play().catch(e => console.error('Error playing US audio:', e))
        
        // 监听美式发音结束事件
        audio.addEventListener('ended', () => {
          setIsPlaying(false)
          audioRef.current = null
        }, { once: true })
      } else {
        // 如果没有美式发音，直接设置为非播放状态
        setIsPlaying(false)
        audioRef.current = null
      }
    })

    // 开始播放
    setIsPlaying(true)
    audio.play().catch(e => {
      console.error('Error playing UK audio:', e)
      setIsPlaying(false)
      audioRef.current = null
    })
  }, [word, pronunciationConfig.volume])

  useEffect(() => {
    return () => {
      // 清理音频对象
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      play: playSound,
    }),
    [playSound],
  )

  return (
    <SoundIcon
      animated={isPlaying}
      onClick={playSound}
      className={`cursor-pointer text-gray-600 ${className}`}
      iconClassName={iconClassName}
    />
  )
})

DualPronunciationIcon.displayName = 'DualPronunciationIcon'

export type DualPronunciationIconRef = {
  play: () => void
}