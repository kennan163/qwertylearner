import { SoundIcon } from './SoundIcon'
import { DualPronunciationIcon } from './DualPronunciationIcon'
import usePronunciationSound from '@/hooks/usePronunciation'
import { phoneticConfigAtom, pronunciationConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import { useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import React from 'react'

export const WordPronunciationIcon = React.forwardRef<
  WordPronunciationIconRef,
  { word: Word; lang: string; className?: string; iconClassName?: string }
>(({ word, lang, className, iconClassName }, ref) => {
  const currentWord = () => {
    if (lang === 'hapin') {
      if (/[\u0400-\u04FF]/.test(word.notation || '')) {
        // 哈萨克语西里尔文字
        return word.notation || ''
      } else {
        // 哈萨克语老文字
        return word.trans[2]
      }
    } else {
      return word.name
    }
  }
  
  const pronunciationConfig = useAtomValue(pronunciationConfigAtom)
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  
  // 如果发音类型是both，使用连续播放英式和美式发音的组件
  if (pronunciationConfig.type === 'both' || phoneticConfig.type === 'both') {
    const dualRef = useRef<DualPronunciationIconRef>(null)
    
    const dualPlaySound = useCallback(() => {
      dualRef.current?.play()
    }, [])
    
    useImperativeHandle(
      ref,
      () => ({
        play: dualPlaySound,
      }),
      [dualPlaySound],
    )
    
    return (
      <DualPronunciationIcon 
        word={word} 
        className={className} 
        iconClassName={iconClassName}
        ref={dualRef}
      />
    )
  }
  
  // 否则使用原来的播放逻辑
  const { play, stop, isPlaying } = usePronunciationSound(currentWord())

  const playSound = useCallback(() => {
    stop()
    play()
  }, [play, stop])

  useEffect(() => {
    return stop
  }, [word, stop])

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

WordPronunciationIcon.displayName = 'WordPronunciationIcon'

export type WordPronunciationIconRef = {
  play: () => void
}
