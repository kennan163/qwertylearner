// src/utils/crypto.ts

import bcrypt from 'bcryptjs'

/**
 * 对密码进行哈希处理
 * @param password 明文密码
 * @returns 哈希后的密码
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 哈希后的密码
 * @returns 验证结果
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * 生成随机盐值
 * @returns 随机盐值
 */
export const generateSalt = async (): Promise<string> => {
  const saltRounds = 10
  return await bcrypt.genSalt(saltRounds)
}

/**
 * 生成API签名
 * @param data 请求数据
 * @param timestamp 时间戳
 * @param secretKey 秘钥
 * @returns 签名字符串
 */
export const generateSignature = (data: any, timestamp: number, secretKey: string): string => {
  // 将数据转换为字符串并排序
  const sortedData = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('&')
  
  // 拼接时间戳和秘钥
  const signStr = `${sortedData}&timestamp=${timestamp}&secret=${secretKey}`
  
  // 使用简单的哈希算法生成签名（实际项目中应该使用更安全的算法如HMAC-SHA256）
  // 这里我们使用一个模拟的哈希函数，实际项目中需要引入crypto库
  return btoa(signStr).substring(0, 16) // Base64编码并截取前16位作为示例
}

/**
 * 验证API签名
 * @param data 请求数据
 * @param timestamp 时间戳
 * @param signature 签名
 * @param secretKey 秘钥
 * @returns 验证结果
 */
export const verifySignature = (data: any, timestamp: number, signature: string, secretKey: string): boolean => {
  // 检查时间戳是否在有效期内（例如5分钟内）
  const currentTime = Date.now()
  if (Math.abs(currentTime - timestamp) > 5 * 60 * 1000) {
    console.error('Signature expired')
    return false
  }
  
  // 生成签名并比较
  const expectedSignature = generateSignature(data, timestamp, secretKey)
  return signature === expectedSignature
}