// src/components/Auth/RegisterForm.tsx

import { registerAtom, sendVerificationCodeAtom } from '@/store/auth'
import type { RegisterRequest } from '@/typings/user'
import { useAtom } from 'jotai'
import { useState, useEffect } from 'react'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onSuccess: () => void
}

export default function RegisterForm({ onSwitchToLogin, onSuccess }: RegisterFormProps) {
  const [, register] = useAtom(registerAtom)
  const [, sendCode] = useAtom(sendVerificationCodeAtom)
  
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<Partial<RegisterRequest>>({})
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {}
    
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名'
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = '用户名长度应在3-20位之间'
    }
    
    if (!formData.phone) {
      newErrors.phone = '请输入手机号'
    } else {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '请输入正确的中国大陆手机号码'
      }
    }
    
    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = '密码必须为8-20位，包含字母、数字和特殊字符'
      }
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 清除对应字段的错误信息
    if (errors[name as keyof RegisterRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const result = await register(formData)
      if (result.success) {
        alert(result.message)
        onSuccess()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('注册失败，请稍后重试')
    }
  }

  const handleSendCode = async () => {
    if (!formData.phone) {
      setErrors(prev => ({ ...prev, phone: '请先输入手机号' }))
      return
    }
    
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(formData.phone)) {
      setErrors(prev => ({ ...prev, phone: '请输入正确的中国大陆手机号码' }))
      return
    }
    
    try {
      const result = await sendCode(formData.phone)
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
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">用户注册</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            用户名
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="请输入用户名"
          />
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
        </div>
        
        <div>
          <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            手机号
          </label>
          <div className="flex">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 ${
                errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
              placeholder="请输入中国大陆手机号"
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
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
        
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
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            密码必须为8-20位，包含字母、数字和特殊字符
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            确认密码
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
              placeholder="请再次输入密码"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
            >
              {showConfirmPassword ? '隐藏' : '显示'}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          注册
        </button>
      </form>
      
      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          已有账号？立即登录
        </button>
      </div>
    </div>
  )
}