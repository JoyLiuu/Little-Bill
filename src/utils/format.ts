// 格式化工具函数

// 格式化金额
export function formatAmount(amount: number | string | undefined | null): string {
  // 将输入转换为数字
  const num = Number(amount)
  // 如果不是有效数字，返回 0.00
  if (isNaN(num)) return '0.00'
  return num.toFixed(2)
}

// 格式化金额（带千分位）
export function formatAmountWithComma(amount: number | string | undefined | null): string {
  // 将输入转换为数字
  const num = Number(amount)
  // 如果不是有效数字，返回 0.00
  if (isNaN(num)) return '0.00'
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// 格式化百分比
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return Math.round((value / total) * 100) + '%'
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 限制文本长度
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
