// src/components/Auth/LoginForm.tsx

import { loginAtom, sendVerificationCodeAtom, smsLoginAtom } from '@/store/auth'
import type { LoginRequest, SmsLoginRequest } from '@/typings/user'
import { useAtom } from 'jotai'
import { useState, useEffect } from 'react'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onSwitchToForgotPassword: () => void
  onSuccess: () => void
}

export default function LoginForm({ onSwitchToRegister, onSwitchToForgotPassword, onSuccess }: LoginFormProps) {
  const [, login] = useAtom(loginAtom)
  const [, smsLogin] = useAtom(smsLoginAtom)
  const [, sendCode] = useAtom(sendVerificationCodeAtom)
  
  const [loginType, setLoginType] = useState<'password' | 'sms'>('password')
  const [formData, setFormData] = useState<LoginRequest | SmsLoginRequest>({
    usernameOrPhone: '',
    password: ''
  })
  
  const [errors, setErrors] = useState<Partial<LoginRequest | SmsLoginRequest>>({})
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginRequest | SmsLoginRequest> = {}
    
    if (!formData.usernameOrPhone) {
      newErrors.usernameOrPhone = '请输入用户名或手机号'
    }
    
    if (loginType === 'password') {
      if (!formData.password) {
        newErrors.password = '请输入密码'
      }
    } else if (loginType === 'sms') {
      if (!('code' in formData) || !(formData as SmsLoginRequest).code) {
        newErrors.password = '请输入验证码'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 清除对应字段的错误信息
    if (errors[name as keyof (LoginRequest | SmsLoginRequest)]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      let result
      if (loginType === 'password') {
        result = await login(formData as LoginRequest)
      } else {
        result = await smsLogin({
          phone: (formData as LoginRequest).usernameOrPhone,
          code: (formData as { password: string }).password
        })
      }
      
      if (result.success) {
        onSuccess()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('登录失败，请稍后重试')
    }
  }

  const handleSendCode = async () => {
    if (!(formData as LoginRequest).usernameOrPhone) {
      setErrors(prev => ({ ...prev, usernameOrPhone: '请先输入手机号' }))
      return
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test((formData as LoginRequest).usernameOrPhone)) {
      setErrors(prev => ({ ...prev, usernameOrPhone: '请输入正确的中国大陆手机号码' }))
      return
    }
    
    try {
      const result = await sendCode((formData as LoginRequest).usernameOrPhone)
      if (result.success) {
        setCountdown(60) // 60秒倒计时
        alert(result.message)
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Send code error:', error)
      alert('发送验证码失败，请稍后重试')
    }
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow dark:bg-gray-800">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">用户登录</h2>
      
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => setLoginType('password')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
            loginType === 'password'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          密码登录
        </button>
        <button
          type="button"
          onClick={() => setLoginType('sms')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${
            loginType === 'sms'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          验证码登录
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="usernameOrPhone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {loginType === 'password' ? '用户名或手机号' : '手机号'}
          </label>
          <input
            type="text"
            id="usernameOrPhone"
            name="usernameOrPhone"
            value={formData.usernameOrPhone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.usernameOrPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="请输入用户名或手机号"
          />
          {errors.usernameOrPhone && <p className="mt-1 text-sm text-red-500">{errors.usernameOrPhone}</p>}
        </div>
        
        {loginType === 'password' ? (
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="请输入密码"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
              >
                {showPassword ? '隐藏' : '显示'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
        ) : (
          <div>
            <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              验证码
            </label>
            <div className="flex">
              <input
                type="text"
                id="code"
                name="password" // 使用password字段存储验证码，因为SmsLoginRequest复用了LoginRequest的结构
                value={formData.password}
                onChange={handleChange}
                className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
                } dark:bg-gray-700 dark:text-white`}
                placeholder="请输入验证码"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className={`px-4 py-2 text-sm font-medium text-white rounded-r-lg focus:outline-none ${
                  countdown > 0 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                }`}
              >
                {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
        )}
        
        {loginType === 'password' && (
          <div className="text-right">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              忘记密码？
            </button>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loginType === 'password' ? '登录' : '验证码登录'}
        </button>
      </form>
      
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          立即注册
        </button>
      </div>
    </div>
  )
}