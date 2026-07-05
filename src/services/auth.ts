// src/services/auth.ts

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SmsLoginRequest,
  VerifyPhoneRequest,
} from '@/typings/user'
import { generateSignature, verifySignature } from '@/utils/crypto'

const API_BASE_URL = '/api'
const SECRET_KEY = process.env.API_SECRET_KEY || 'default_secret_key_for_demo' // 实际项目中应从安全的地方获取

class AuthService {
  async register(data: RegisterRequest): Promise<{ success: boolean; message: string }> {
    // 密码强度验证
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/
    if (!passwordRegex.test(data.password)) {
      throw new Error('密码必须为8-20位，包含字母、数字和特殊字符')
    }

    if (data.password !== data.confirmPassword) {
      throw new Error('两次输入的密码不一致')
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(data.phone)) {
      throw new Error('请输入正确的中国大陆手机号码')
    }

    // 生成API签名
    const timestamp = Date.now()
    const signature = generateSignature(data, timestamp, SECRET_KEY)

    // 模拟API调用
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '注册失败')
      }

      return { success: true, message: '注册成功' }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    // 生成API签名
    const timestamp = Date.now()
    const signature = generateSignature(data, timestamp, SECRET_KEY)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '登录失败')
      }

      const result: LoginResponse = await response.json()
      // 存储token到localStorage
      localStorage.setItem('token', result.token)
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async smsLogin(data: SmsLoginRequest): Promise<LoginResponse> {
    // 生成API签名
    const timestamp = Date.now()
    const signature = generateSignature(data, timestamp, SECRET_KEY)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/sms-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '短信登录失败')
      }

      const result: LoginResponse = await response.json()
      // 存储token到localStorage
      localStorage.setItem('token', result.token)
      return result
    } catch (error) {
      console.error('SMS Login error:', error)
      throw error
    }
  }

  async sendVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      throw new Error('请输入正确的中国大陆手机号码')
    }

    // 生成API签名
    const timestamp = Date.now()
    const data = { phone }
    const signature = generateSignature(data, timestamp, SECRET_KEY)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '发送验证码失败')
      }

      return { success: true, message: '验证码已发送' }
    } catch (error) {
      console.error('Send verification code error:', error)
      throw error
    }
  }

  async verifyPhone(data: VerifyPhoneRequest): Promise<{ success: boolean; message: string }> {
    // 生成API签名
    const timestamp = Date.now()
    const signature = generateSignature(data, timestamp, SECRET_KEY)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '验证失败')
      }

      return { success: true, message: '验证成功' }
    } catch (error) {
      console.error('Verify phone error:', error)
      throw error
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> {
    // 密码强度验证
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/
    if (!passwordRegex.test(data.newPassword)) {
      throw new Error('新密码必须为8-20位，包含字母、数字和特殊字符')
    }

    if (data.newPassword !== data.confirmNewPassword) {
      throw new Error('两次输入的新密码不一致')
    }

    // 生成API签名
    const timestamp = Date.now()
    const signature = generateSignature(data, timestamp, SECRET_KEY)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Timestamp': timestamp.toString(),
          'X-Signature': signature,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '重置密码失败')
      }

      return { success: true, message: '密码重置成功' }
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }

  logout(): void {
    localStorage.removeItem('token')
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    const token = this.getCurrentUser()
    // 这里可以添加token过期检查逻辑
    return !!token
  }
}

export const authService = new AuthService()