// 本地存储工具函数

export const storage = {
  // 设置缓存
  set<T>(key: string, value: T): void {
    try {
      uni.setStorageSync(key, value)
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  // 获取缓存
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = uni.getStorageSync(key)
      return value !== undefined && value !== null ? value : defaultValue
    } catch (e) {
      console.error('Storage get error:', e)
      return defaultValue
    }
  },

  // 移除缓存
  remove(key: string): void {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },

  // 清空缓存
  clear(): void {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  },
}
