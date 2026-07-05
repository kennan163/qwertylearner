// src/typings/progress.ts

export interface LearningProgress {
  id: string // 用户ID
  userId: string
  dictionaryId: string
  chapterIndex: number
  wordIndex: number
  learnedWords: string[] // 已学会的单词列表
  unmasteredWords: string[] // 未掌握的单词列表
  totalPracticeCount: number // 总练习次数
  correctRate: number // 正确率
  lastPracticedAt: Date // 最后练习时间
  createdAt: Date
  updatedAt: Date
}

export interface SaveProgressRequest {
  userId: string
  dictionaryId: string
  chapterIndex: number
  wordIndex: number
  learnedWords?: string[]
  unmasteredWords?: string[]
  totalPracticeCount?: number
  correctRate?: number
}

export interface LoadProgressRequest {
  userId: string
  dictionaryId: string
}