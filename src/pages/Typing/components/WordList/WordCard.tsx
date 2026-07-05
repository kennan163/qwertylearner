import type { WordPronunciationIconRef } from '@/components/WordPronunciationIcon'
import { WordPronunciationIcon } from '@/components/WordPronunciationIcon'
import { currentDictInfoAtom, phoneticConfigAtom } from '@/store'
import type { Word } from '@/typings'
import { useAtomValue } from 'jotai'
import { useCallback, useRef } from 'react'

export default function WordCard({ word, isActive }: { word: Word; isActive: boolean }) {
  const wordPronunciationIconRef = useRef<WordPronunciationIconRef>(null)
  const currentLanguage = useAtomValue(currentDictInfoAtom).language
  const phoneticConfig = useAtomValue(phoneticConfigAtom)

  const handlePlay = useCallback(() => {
    wordPronunciationIconRef.current?.play()
  }, [])

  // 检查是否有美式和英式音标
  const hasUsPhonetic = word.usphone && word.usphone.length > 1
  const hasUkPhonetic = word.ukphone && word.ukphone.length > 1

  return (
    <div
      className={`mb-2 flex cursor-pointer select-text items-center rounded-xl p-4 shadow focus:outline-none ${
        isActive ? 'bg-indigo-50 dark:bg-indigo-800 dark:bg-opacity-20' : 'bg-white dark:bg-gray-700 dark:bg-opacity-20'
      }   `}
      key={word.name}
      onClick={handlePlay}
    >
      <div className="flex-1">
        <p className="select-all font-mono text-xl font-normal leading-6 dark:text-gray-50">
          {['romaji', 'hapin'].includes(currentLanguage) ? word.notation : word.name}
        </p>
        <div className="mt-2 max-w-sm font-sans text-sm text-gray-400">{word.trans.join('；')}</div>
        {/* 显示音标，只有在音标开关打开时才显示 */}
        {phoneticConfig.isOpen && (
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            {hasUkPhonetic && (
              <span className="inline-flex items-center">
                <span className="mr-1 text-[10px] bg-green-100 text-green-800 px-1 rounded dark:bg-green-900 dark:text-green-100">英</span>
                <span className="text-gray-600 dark:text-gray-300">[{word.ukphone}]</span>
              </span>
            )}
            {hasUsPhonetic && (
              <span className="inline-flex items-center">
                <span className="mr-1 text-[10px] bg-blue-100 text-blue-800 px-1 rounded dark:bg-blue-900 dark:text-blue-100">美</span>
                <span className="text-gray-600 dark:text-gray-300">[{word.usphone}]</span>
              </span>
            )}
          </div>
        )}
      </div>
      <WordPronunciationIcon word={word} lang={currentLanguage} className="h-8 w-8" ref={wordPronunciationIconRef} />
    </div>
  )
}
