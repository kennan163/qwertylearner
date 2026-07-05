// src/store/progress.ts

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { progressService } from '@/services/progress'
import type { LearningProgress, SaveProgressRequest } from '@/typings/progress'

// 学习进度状态
export interface ProgressState {
  currentProgress: LearningProgress | null
  isLoading: boolean
  error: string | null
  hasUnsavedChanges: boolean
}

// 初始化状态
const initialState: ProgressState = {
  currentProgress: null,
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,
}

// 学习进度状态原子
export const progressAtom = atomWithStorage<ProgressState>('learningProgress', {
  ...initialState,
})

// 加载进度
export const loadProgressAtom = atom(null, async (get, set, userId: string, dictionaryId: string) => {
  const current = get(progressAtom)
  set(progressAtom, { ...current, isLoading: true, error: null })

  try {
    const progress = await progressService.loadProgress({ userId, dictionaryId })
    set(progressAtom, {
      ...current,
      currentProgress: progress,
      isLoading: false,
      error: null,
    })
    return { success: true, progress }
  } catch (error: any) {
    const errorMessage = error.message || '加载进度失败'
    set(progressAtom, { ...current, isLoading: false, error: errorMessage })
    return { success: false, error: errorMessage }
  }
})

// 保存进度
export const saveProgressAtom = atom(null, async (get, set, progressData: SaveProgressRequest) => {
  const current = get(progressAtom)
  set(progressAtom, { ...current, isLoading: true, error: null })

  try {
    const result = await progressService.saveProgress(progressData)
    set(progressAtom, {
      ...current,
      currentProgress: {
        ...progressData,
        id: progressData.userId + '_' + progressData.dictionaryId, // 模拟ID生成
        userId: progressData.userId,
        dictionaryId: progressData.dictionaryId,
        learnedWords: progressData.learnedWords || [],
        unmasteredWords: progressData.unmasteredWords || [],
        totalPracticeCount: progressData.totalPracticeCount || 0,
        correctRate: progressData.correctRate || 0,
        lastPracticedAt: new Date(),
        createdAt: current.currentProgress?.createdAt || new Date(),
        updatedAt: new Date(),
      } as LearningProgress,
      isLoading: false,
      error: null,
      hasUnsavedChanges: false,
    })
    return result
  } catch (error: any) {
    const errorMessage = error.message || '保存进度失败'
    set(progressAtom, { ...current, isLoading: false, error: errorMessage })
    return { success: false, message: errorMessage }
  }
})

// 更新未掌握单词
export const updateUnmasteredWordsAtom = atom(null, async (get, set, userId: string, dictionaryId: string, unmasteredWords: string[]) => {
  try {
    await progressService.updateUnmasteredWords(userId, dictionaryId, unmasteredWords)
    
    // 更新本地状态
    const current = get(progressAtom)
    if (current.currentProgress) {
      set(progressAtom, {
        ...current,
        currentProgress: {
          ...current.currentProgress,
          unmasteredWords,
          updatedAt: new Date(),
        },
      })
    }
    
    return { success: true, message: '未掌握单词列表已更新' }
  } catch (error: any) {
    return { success: false, message: error.message || '更新未掌握单词失败' }
  }
})

// 重置进度
export const resetProgressAtom = atom(null, async (get, set, userId: string, dictionaryId: string) => {
  const current = get(progressAtom)
  set(progressAtom, { ...current, isLoading: true, error: null })

  try {
    const result = await progressService.resetProgress(userId, dictionaryId)
    set(progressAtom, {
      ...initialState,
      isLoading: false,
    })
    return result
  } catch (error: any) {
    const errorMessage = error.message || '重置进度失败'
    set(progressAtom, { ...current, isLoading: false, error: errorMessage })
    return { success: false, message: errorMessage }
  }
})

// 设置未保存更改状态
export const setHasUnsavedChangesAtom = atom(
  (get) => get(progressAtom).hasUnsavedChanges,
  (get, set, hasChanges: boolean) => {
    const current = get(progressAtom)
    set(progressAtom, { ...current, hasUnsavedChanges: hasChanges })
  }
)