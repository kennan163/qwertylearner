// src/store/auth.ts

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { authService } from '@/services/auth'
import type { LoginRequest, RegisterRequest, ResetPasswordRequest, SmsLoginRequest } from '@/typings/user'

// 用户状态
export interface AuthState {
  user: {
    id: string
    username: string
    phone: string
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// 初始化状态
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// 认证状态原子
export const authAtom = atomWithStorage<AuthState>('auth', {
  ...initialState,
  isAuthenticated: authService.isAuthenticated(),
  // 注意：这里我们不从localStorage恢复用户信息，因为需要验证token的有效性
  user: null,
})

// 加载状态原子
export const authLoadingAtom = atom(
  (get) => get(authAtom).isLoading,
  (get, set, isLoading: boolean) => {
    const current = get(authAtom)
    set(authAtom, { ...current, isLoading })
  }
)

// 注册功能
export const registerAtom = atom(null, async (get, set, registerData: RegisterRequest) => {
  const current = get(authAtom)
  set(authAtom, { ...current, isLoading: true, error: null })

  try {
    await authService.register(registerData)
    set(authAtom, { ...initialState, isLoading: false })
    return { success: true, message: '注册成功，请登录' }
  } catch (error: any) {
    const errorMessage = error.message || '注册失败'
    set(authAtom, { ...current, isLoading: false, error: errorMessage })
    return { success: false, message: errorMessage }
  }
})

// 登录功能
export const loginAtom = atom(null, async (get, set, loginData: LoginRequest) => {
  const current = get(authAtom)
  set(authAtom, { ...current, isLoading: true, error: null })

  try {
    const response = await authService.login(loginData)
    set(authAtom, {
      user: {
        id: response.user.id,
        username: response.user.username,
        phone: response.user.phone,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
    return { success: true, message: '登录成功' }
  } catch (error: any) {
    const errorMessage = error.message || '登录失败'
    set(authAtom, { ...current, isLoading: false, error: errorMessage })
    return { success: false, message: errorMessage }
  }
})

// 短信登录功能
export const smsLoginAtom = atom(null, async (get, set, loginData: SmsLoginRequest) => {
  const current = get(authAtom)
  set(authAtom, { ...current, isLoading: true, error: null })

  try {
    const response = await authService.smsLogin(loginData)
    set(authAtom, {
      user: {
        id: response.user.id,
        username: response.user.username,
        phone: response.user.phone,
      },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
    return { success: true, message: '登录成功' }
  } catch (error: any) {
    const errorMessage = error.message || '登录失败'
    set(authAtom, { ...current, isLoading: false, error: errorMessage })
    return { success: false, message: errorMessage }
  }
})

// 登出功能
export const logoutAtom = atom(null, (get, set) => {
  authService.logout()
  set(authAtom, { ...initialState, isAuthenticated: false })
})

// 发送验证码
export const sendVerificationCodeAtom = atom(null, async (get, set, phone: string) => {
  try {
    return await authService.sendVerificationCode(phone)
  } catch (error: any) {
    return { success: false, message: error.message || '发送验证码失败' }
  }
})

// 重置密码
export const resetPasswordAtom = atom(null, async (get, set, resetData: ResetPasswordRequest) => {
  try {
    return await authService.resetPassword(resetData)
  } catch (error: any) {
    return { success: false, message: error.message || '重置密码失败' }
  }
})