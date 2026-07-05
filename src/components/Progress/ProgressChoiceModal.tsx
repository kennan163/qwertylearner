// src/components/Progress/ProgressChoiceModal.tsx

import { loadProgressAtom } from '@/store/progress'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'

interface ProgressChoiceModalProps {
  userId: string
  dictionaryId: string
  chapterIndex: number
  isVisible: boolean
  onSelect: (choice: 'restart' | 'continue') => void
}

export default function ProgressChoiceModal({
  userId,
  dictionaryId,
  chapterIndex,
  isVisible,
  onSelect
}: ProgressChoiceModalProps) {
  const [, loadProgress] = useAtom(loadProgressAtom)
  const [hasPreviousProgress, setHasPreviousProgress] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isVisible && userId && dictionaryId) {
      const fetchProgress = async () => {
        setLoading(true)
        try {
          const result = await loadProgress(userId, dictionaryId)
          setHasPreviousProgress(!!result.progress)
        } catch (error) {
          console.error('Failed to load progress:', error)
          setHasPreviousProgress(false)
        } finally {
          setLoading(false)
        }
      }

      fetchProgress()
    }
  }, [isVisible, userId, dictionaryId, loadProgress])

  if (!isVisible || loading) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          选择练习方式
        </h3>
        
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          您在当前词典中有学习记录，选择继续练习的方式：
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => onSelect('continue')}
            disabled={!hasPreviousProgress}
            className={`w-full px-4 py-3 text-left rounded-lg border ${
              hasPreviousProgress
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 cursor-pointer'
                : 'border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className="font-medium">从上次进度继续练习</div>
            <div className="text-sm mt-1">
              {hasPreviousProgress 
                ? '继续从上次练习的位置开始' 
                : '暂无历史进度，无法使用此选项'}
            </div>
          </button>
          
          <button
            onClick={() => onSelect('restart')}
            className="w-full px-4 py-3 text-left rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <div className="font-medium">重头开始练习</div>
            <div className="text-sm mt-1 text-gray-500 dark:text-gray-400">
              清空当前练习模块的所有历史进度数据，从该练习模块的第一个单词开始重新启动学习流程
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}