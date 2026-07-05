// src/typings/user.ts

export interface User {
  id: string
  username: string
  phone: string
  email?: string
  createdAt: Date
  updatedAt: Date
}

export interface RegisterRequest {
  username: string
  phone: string
  password: string
  confirmPassword: string
}

export interface LoginRequest {
  usernameOrPhone: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface VerifyPhoneRequest {
  phone: string
  code: string
}

export interface ResetPasswordRequest {
  phone: string
  code: string
  newPassword: string
  confirmNewPassword: string
}

export interface SmsLoginRequest {
  phone: string
  code: string
}