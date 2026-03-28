// 分类类型
export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: 'expense' | 'income'
}

// 记账记录类型
export interface Record {
  id: string
  amount: number
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  type: 'expense' | 'income'
  date: string
  remark?: string
  images?: string[]
  createTime: number
}

// 资金池类型
export interface FundPool {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  color: string
  status: 'active' | 'completed'
  createTime: number
}

// 资金池操作记录
export interface FundOperation {
  id: string
  fundId: string
  type: 'deposit' | 'withdraw'
  amount: number
  date: string
  remark?: string
  createTime: number
}

// 用户信息
export interface UserInfo {
  avatarUrl: string
  nickName: string
  registerTime: number
}

// 预算设置
export interface Budget {
  monthlyBudget: number
  year: number
  month: number
}

// 统计数据
export interface StatisticsData {
  totalExpense: number
  totalIncome: number
  categoryStats: CategoryStat[]
  dailyStats: DailyStat[]
  monthlyStats: MonthlyStat[]
}

export interface CategoryStat {
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  amount: number
  percentage: number
  count: number
}

export interface DailyStat {
  date: string
  expense: number
  income: number
}

export interface MonthlyStat {
  year: number
  month: number
  expense: number
  income: number
}

// 年度报告数据
export interface AnnualReport {
  year: number
  totalExpense: number
  totalIncome: number
  fundDepositTotal: number
  categoryStats: CategoryStat[]
  monthlyStats: MonthlyStat[]
  fundStats: FundStat[]
}

export interface FundStat {
  fundId: string
  fundName: string
  targetAmount: number
  currentAmount: number
  depositTotal: number
  status: 'active' | 'completed'
}
