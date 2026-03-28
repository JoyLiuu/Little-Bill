import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// 配置 dayjs
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

// 格式化日期为 YYYY-MM-DD
export function formatDate(date: dayjs.ConfigType): string {
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化日期为 YYYY年MM月DD日
export function formatDateCN(date: dayjs.ConfigType): string {
  return dayjs(date).format('YYYY年M月D日')
}

// 格式化日期为 MM月DD日
export function formatDateShort(date: dayjs.ConfigType): string {
  return dayjs(date).format('M月D日')
}

// 获取年月
export function getYearMonth(date: dayjs.ConfigType): { year: number; month: number } {
  const d = dayjs(date)
  return {
    year: d.year(),
    month: d.month() + 1,
  }
}

// 获取月份第一天
export function getFirstDayOfMonth(year: number, month: number): Date {
  return dayjs(`${year}-${month}-01`).startOf('month').toDate()
}

// 获取月份最后一天
export function getLastDayOfMonth(year: number, month: number): Date {
  return dayjs(`${year}-${month}-01`).endOf('month').toDate()
}

// 获取月份天数
export function getDaysInMonth(year: number, month: number): number {
  return dayjs(`${year}-${month}-01`).daysInMonth()
}

// 获取当前月份剩余天数
export function getRemainingDaysInMonth(): number {
  const now = dayjs()
  const endOfMonth = now.endOf('month')
  return endOfMonth.diff(now, 'day') + 1
}

// 判断是否为同一天
export function isSameDay(date1: dayjs.ConfigType, date2: dayjs.ConfigType): boolean {
  return dayjs(date1).isSame(date2, 'day')
}

// 判断是否为同一月
export function isSameMonth(date1: dayjs.ConfigType, date2: dayjs.ConfigType): boolean {
  return dayjs(date1).isSame(date2, 'month')
}

// 获取相对日期描述
export function getRelativeDateDesc(date: dayjs.ConfigType): string {
  const target = dayjs(date)
  const today = dayjs()
  
  if (target.isSame(today, 'day')) {
    return '今天'
  }
  
  if (target.isSame(today.subtract(1, 'day'), 'day')) {
    return '昨天'
  }
  
  if (target.isSame(today.add(1, 'day'), 'day')) {
    return '明天'
  }
  
  return formatDateShort(target)
}

// 生成日期范围
export function generateDateRange(start: dayjs.ConfigType, end: dayjs.ConfigType): string[] {
  const dates: string[] = []
  let current = dayjs(start)
  const endDate = dayjs(end)
  
  while (current.isSameOrBefore(endDate, 'day')) {
    dates.push(current.format('YYYY-MM-DD'))
    current = current.add(1, 'day')
  }
  
  return dates
}

export { dayjs }
