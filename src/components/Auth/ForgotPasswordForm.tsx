// src/components/Auth/ForgotPasswordForm.tsx

import { resetPasswordAtom, sendVerificationCodeAtom } from '@/store/auth'
import type { ResetPasswordRequest } from '@/typings/user'
import { useAtom } from 'jotai'
import { useState, useEffect } from 'react'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export default function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [, resetPassword] = useAtom(resetPasswordAtom)
  const [, sendCode] = useAtom(sendVerificationCodeAtom)
  
  const [formData, setFormData] = useState<ResetPasswordRequest>({
    phone: '',
    code: '',
    newPassword: '',
    confirmNewPassword: ''
  })
  
  const [errors, setErrors] = useState<Partial<ResetPasswordRequest>>({}
  const [countdown, setCountdown] = useState(0)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordRequest> = {}
    
    if (!formData.phone) {
      newErrors.phone = '请输入手机号'
    } else {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = '请输入正确的中国大陆手机号码'
      }
    }
    
    if (!formData.code) {
      newErrors.code = '请输入验证码'
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码'
    } else {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/
      if (!passwordRegex.test(formData.newPassword)) {
        newErrors.newPassword = '新密码必须为8-20位，包含字母、数字和特殊字符'
      }
    }
    
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = '请确认新密码'
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = '两次输入的新密码不一致'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 清除对应字段的错误信息
    if (errors[name as keyof ResetPasswordRequest]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const result = await resetPassword(formData)
      if (result.success) {
        alert(result.message)
        onBackToLogin()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      alert('重置密码失败，请稍后重试')
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
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">重置密码</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            手机号
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
            } dark:bg-gray-700 dark:text-white`}
            placeholder="请输入中国大陆手机号"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>
        
        <div>
          <label htmlFor="code" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            验证码
          </label>
          <div className="flex">
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 ${
                errors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
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
          {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            新密码
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
              placeholder="请输入新密码"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
            >
              {showNewPassword ? '隐藏' : '显示'}
            </button>
          </div>
          {errors.newPassword && <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            密码必须为8-20位，包含字母、数字和特殊字符
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            确认新密码
          </label>
          <div className="relative">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmNewPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500 dark:border-gray-600'
              } dark:bg-gray-700 dark:text-white`}
              placeholder="请再次输入新密码"
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
            >
              {showConfirmNewPassword ? '隐藏' : '显示'}
            </button>
          </div>
          {errors.confirmNewPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmNewPassword}</p>}
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          重置密码
        </button>
      </form>
      
      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          返回登录
        </button>
      </div>
    </div>
  )
}