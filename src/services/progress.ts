// src/services/progress.ts

import type { LearningProgress, LoadProgressRequest, SaveProgressRequest } from '@/typings/progress'
import { validateProgressData, fixProgressData, createDefaultProgress } from '@/utils/progressValidation'

class ProgressService {
  /**
   * 保存用户学习进度
   */
  async saveProgress(data: SaveProgressRequest): Promise<{ success: boolean; message: string }> {
    try {
      // 验证必要参数
      if (!data.userId || !data.dictionaryId) {
        throw new Error('用户ID和词典ID不能为空')
      }

      // 构建进度数据
      const progressData: Omit<LearningProgress, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: data.userId,
        dictionaryId: data.dictionaryId,
        chapterIndex: data.chapterIndex ?? 0,
        wordIndex: data.wordIndex ?? 0,
        learnedWords: data.learnedWords ?? [],
        unmasteredWords: data.unmasteredWords ?? [],
        totalPracticeCount: data.totalPracticeCount ?? 0,
        correctRate: data.correctRate ?? 0,
        lastPracticedAt: new Date(),
        createdAt: new Date(), // 在实际实现中，这应该是从数据库获取的时间
        updatedAt: new Date(),
      }

      // 验证进度数据
      const validation = validateProgressData(progressData as LearningProgress)
      if (!validation.isValid) {
        console.warn('Invalid progress data detected:', validation.message)
        // 尝试修复数据
        const fixedData = fixProgressData(progressData as LearningProgress)
        console.info('Progress data fixed:', fixedData)
      }

      // 在实际项目中，这里会调用后端API
      // 模拟API调用
      const response = await fetch('/api/progress/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 假设使用JWT token
        },
        body: JSON.stringify(progressData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '保存进度失败')
      }

      return { success: true, message: '进度保存成功' }
    } catch (error) {
      console.error('Save progress error:', error)
      throw error
    }
  }

  /**
   * 加载用户学习进度
   */
  async loadProgress(request: LoadProgressRequest): Promise<LearningProgress | null> {
    try {
      // 验证必要参数
      if (!request.userId || !request.dictionaryId) {
        throw new Error('用户ID和词典ID不能为空')
      }

      // 在实际项目中，这里会调用后端API
      // 模拟API调用
      const response = await fetch(`/api/progress/load?userId=${request.userId}&dictionaryId=${request.dictionaryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // 假设使用JWT token
        },
      })

      if (!response.ok) {
        // 如果找不到进度数据，返回null而不是抛出错误
        if (response.status === 404) {
          return null
        }
        const errorData = await response.json()
        throw new Error(errorData.message || '加载进度失败')
      }

      let progressData: LearningProgress = await response.json()
      
      // 验证加载的进度数据
      const validation = validateProgressData(progressData)
      if (!validation.isValid) {
        console.warn('Invalid progress data loaded:', validation.message)
        
        // 尝试修复数据
        progressData = fixProgressData(progressData)
        console.info('Loaded progress data fixed:', progressData)
        
        // 如果修复后仍然无效，返回默认进度
        const fixedValidation = validateProgressData(progressData)
        if (!fixedValidation.isValid) {
          console.error('Failed to fix progress data, returning default progress')
          return createDefaultProgress(request.userId, request.dictionaryId)
        }
      }

      return progressData
    } catch (error) {
      console.error('Load progress error:', error)
      // 发生错误时返回默认进度
      return createDefaultProgress(request.userId, request.dictionaryId)
    }
  }

  /**
   * 获取用户的未掌握单词列表
   */
  async getUnmasteredWords(userId: string, dictionaryId: string): Promise<string[]> {
    try {
      const progress = await this.loadProgress({ userId, dictionaryId })
      return progress?.unmasteredWords || []
    } catch (error) {
      console.error('Get unmastered words error:', error)
      return []
    }
  }

  /**
   * 更新未掌握单词列表
   */
  async updateUnmasteredWords(userId: string, dictionaryId: string, unmasteredWords: string[]): Promise<void> {
    try {
      const currentProgress = await this.loadProgress({ userId, dictionaryId })
      
      if (currentProgress) {
        // 更新现有进度
        await this.saveProgress({
          userId,
          dictionaryId,
          chapterIndex: currentProgress.chapterIndex,
          wordIndex: currentProgress.wordIndex,
          unmasteredWords,
        })
      } else {
        // 创建新进度
        await this.saveProgress({
          userId,
          dictionaryId,
          chapterIndex: 0,
          wordIndex: 0,
          unmasteredWords,
        })
      }
    } catch (error) {
      console.error('Update unmastered words error:', error)
      throw error
    }
  }

  /**
   * 重置用户在指定词典中的学习进度
   */
  async resetProgress(userId: string, dictionaryId: string): Promise<{ success: boolean; message: string }> {
    try {
      // 在实际项目中，这里会调用后端API
      // 模拟API调用
      const response = await fetch(`/api/progress/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ userId, dictionaryId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '重置进度失败')
      }

      return { success: true, message: '进度重置成功' }
    } catch (error) {
      console.error('Reset progress error:', error)
      throw error
    }
  }
}

export const progressService = new ProgressService()