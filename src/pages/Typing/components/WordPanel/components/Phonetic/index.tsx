import { isTextSelectableAtom, phoneticConfigAtom } from '@/store'
import type { Word, WordWithIndex } from '@/typings'
import { useAtomValue } from 'jotai'

export type PhoneticProps = {
  word: WordWithIndex | Word
}

function Phonetic({ word }: PhoneticProps) {
  const phoneticConfig = useAtomValue(phoneticConfigAtom)
  const isTextSelectable = useAtomValue(isTextSelectableAtom)

  // 检查是否有美式和英式音标
  const hasUsPhonetic = word.usphone && word.usphone.length > 1
  const hasUkPhonetic = word.ukphone && word.ukphone.length > 1

  return (
    <div
      className={`space-x-5 text-center text-sm font-normal text-gray-600 transition-colors duration-300 dark:text-gray-400 ${
        isTextSelectable && 'select-text'
      }`}
    >
      {/* 根据配置决定如何显示音标 */}
      {phoneticConfig.type === 'both' ? (
        // 同时显示美式和英式音标，按要求先显示英式再显示美式
        <div className="flex flex-wrap justify-center gap-2 md:gap-4">
          {hasUkPhonetic && (
            <span className="inline-flex items-center whitespace-nowrap">
              <span className="mr-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded dark:bg-green-900 dark:text-green-100">英</span>
              <span>[{word.ukphone}]</span>
            </span>
          )}
          {hasUsPhonetic && (
            <span className="inline-flex items-center whitespace-nowrap">
              <span className="mr-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-100">美</span>
              <span>[{word.usphone}]</span>
            </span>
          )}
        </div>
      ) : (
        // 只显示选定类型的音标
        <>
          {phoneticConfig.type === 'us' && hasUsPhonetic && (
            <span>{`美: [${word.usphone}]`}</span>
          )}
          {phoneticConfig.type === 'uk' && hasUkPhonetic && (
            <span>{`英: [${word.ukphone}]`}</span>
          )}
        </>
      )}
    </div>
  )
}

export default Phonetic
