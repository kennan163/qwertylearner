// src/utils/progressValidation.ts

import type { LearningProgress } from '@/typings/progress'

/**
 * 校验学习进度数据的完整性
 * @param progress 学习进度数据
 * @returns 验证结果
 */
export const validateProgressData = (progress: LearningProgress | null): { isValid: boolean; message: string } => {
  if (!progress) {
    return { isValid: false, message: '进度数据为空' }
  }

  // 检查必要字段是否存在
  if (!progress.userId || !progress.dictionaryId) {
    return { isValid: false, message: '用户ID或词典ID缺失' }
  }

  // 检查索引值是否为有效数字
  if (typeof progress.chapterIndex !== 'number' || progress.chapterIndex < 0) {
    return { isValid: false, message: '章节索引无效' }
  }

  if (typeof progress.wordIndex !== 'number' || progress.wordIndex < 0) {
    return { isValid: false, message: '单词索引无效' }
  }

  // 检查数组字段
  if (!Array.isArray(progress.learnedWords)) {
    return { isValid: false, message: '已学会单词列表格式错误' }
  }

  if (!Array.isArray(progress.unmasteredWords)) {
    return { isValid: false, message: '未掌握单词列表格式错误' }
  }

  // 检查数值范围
  if (typeof progress.totalPracticeCount !== 'number' || progress.totalPracticeCount < 0) {
    return { isValid: false, message: '总练习次数无效' }
  }

  if (typeof progress.correctRate !== 'number' || progress.correctRate < 0 || progress.correctRate > 100) {
    return { isValid: false, message: '正确率超出有效范围(0-100%)' }
  }

  // 检查日期字段
  if (!(progress.lastPracticedAt instanceof Date) || isNaN(progress.lastPracticedAt.getTime())) {
    return { isValid: false, message: '最后练习时间无效' }
  }

  if (!(progress.createdAt instanceof Date) || isNaN(progress.createdAt.getTime())) {
    return { isValid: false, message: '创建时间无效' }
  }

  if (!(progress.updatedAt instanceof Date) || isNaN(progress.updatedAt.getTime())) {
    return { isValid: false, message: '更新时间无效' }
  }

  return { isValid: true, message: '进度数据验证通过' }
}

/**
 * 修复损坏的进度数据
 * @param progress 原始进度数据
 * @returns 修复后的进度数据
 */
export const fixProgressData = (progress: LearningProgress | null): LearningProgress => {
  if (!progress) {
    // 返回默认进度数据
    return createDefaultProgress('')
  }

  // 修复数值字段
  const fixedChapterIndex = typeof progress.chapterIndex === 'number' && progress.chapterIndex >= 0 
    ? progress.chapterIndex 
    : 0

  const fixedWordIndex = typeof progress.wordIndex === 'number' && progress.wordIndex >= 0 
    ? progress.wordIndex 
    : 0

  const fixedTotalPracticeCount = typeof progress.totalPracticeCount === 'number' && progress.totalPracticeCount >= 0 
    ? progress.totalPracticeCount 
    : 0

  const fixedCorrectRate = typeof progress.correctRate === 'number' && progress.correctRate >= 0 && progress.correctRate <= 100 
    ? progress.correctRate 
    : 0

  // 修复数组字段
  const fixedLearnedWords = Array.isArray(progress.learnedWords) ? progress.learnedWords : []
  const fixedUnmasteredWords = Array.isArray(progress.unmasteredWords) ? progress.unmasteredWords : []

  // 修复日期字段
  const fixedLastPracticedAt = progress.lastPracticedAt instanceof Date && !isNaN(progress.lastPracticedAt.getTime())
    ? progress.lastPracticedAt
    : new Date()

  const fixedCreatedAt = progress.createdAt instanceof Date && !isNaN(progress.createdAt.getTime())
    ? progress.createdAt
    : new Date()

  const fixedUpdatedAt = progress.updatedAt instanceof Date && !isNaN(progress.updatedAt.getTime())
    ? progress.updatedAt
    : new Date()

  return {
    ...progress,
    chapterIndex: fixedChapterIndex,
    wordIndex: fixedWordIndex,
    learnedWords: fixedLearnedWords,
    unmasteredWords: fixedUnmasteredWords,
    totalPracticeCount: fixedTotalPracticeCount,
    correctRate: fixedCorrectRate,
    lastPracticedAt: fixedLastPracticedAt,
    createdAt: fixedCreatedAt,
    updatedAt: fixedUpdatedAt,
  }
}

/**
 * 创建默认进度数据
 * @param userId 用户ID
 * @param dictionaryId 词典ID
 * @returns 默认进度数据
 */
export const createDefaultProgress = (userId: string, dictionaryId: string = ''): LearningProgress => {
  return {
    id: `${userId}_${dictionaryId}`,
    userId,
    dictionaryId,
    chapterIndex: 0,
    wordIndex: 0,
    learnedWords: [],
    unmasteredWords: [],
    totalPracticeCount: 0,
    correctRate: 0,
    lastPracticedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * 检查进度数据是否过期
 * @param progress 学习进度数据
 * @param daysThreshold 天数阈值，默认30天
 * @returns 是否过期
 */
export const isProgressExpired = (progress: LearningProgress, daysThreshold: number = 30): boolean => {
  const now = new Date()
  const lastPracticeTime = new Date(progress.lastPracticedAt)
  const diffInDays = (now.getTime() - lastPracticeTime.getTime()) / (1000 * 60 * 60 * 24)
  return diffInDays > daysThreshold
}