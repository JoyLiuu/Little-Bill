// 主题色配置
export const THEME_COLORS = {
  // 背景色
  headerBg: '#EAF4FD',
  subBg: '#F2F9FE',
  navBarBg: '#F7FBFE',

  // 主色
  primary: '#3E8FD4',
  primaryLight: '#C5DFF5',

  // 边框/分割线
  cardBorder: '#D6EAFA',
  rowDivider: '#EDF4FB',

  // 文字
  primaryText: '#0C3D6B',
  listItemText: '#1C3A5A',
  secondaryText: '#4D85B8',
  hintText: '#7AADCC',

  // 功能色
  expenseRed: '#D94F3A',
  incomeGreen: '#1A8F68',
  iconBg: '#E6F1FB',
  incomeIconBg: '#EBF6F0',
}

// 支出分类 - 使用新配色
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: 'bag-fill', color: '#3E8FD4', type: 'expense' as const },
  { id: 'shopping', name: '购物', icon: 'shopping-cart-fill', color: '#4D85B8', type: 'expense' as const },
  { id: 'transport', name: '交通', icon: 'car-fill', color: '#5A9BD5', type: 'expense' as const },
  { id: 'entertainment', name: '娱乐', icon: 'play-circle-fill', color: '#6BA3D6', type: 'expense' as const },
  { id: 'medical', name: '医疗', icon: 'heart-fill', color: '#7AADCC', type: 'expense' as const },
  { id: 'housing', name: '居住', icon: 'home-fill', color: '#8BB8D4', type: 'expense' as const },
  { id: 'education', name: '教育', icon: 'file-text-fill', color: '#9CC3DA', type: 'expense' as const },
  { id: 'other', name: '其他', icon: 'grid-fill', color: '#0C3D6B', type: 'expense' as const },
]

// 收入分类 - 使用新配色
export const INCOME_CATEGORIES = [
  { id: 'salary', name: '工资', icon: 'rmb-circle-fill', color: '#1A8F68', type: 'income' as const },
  { id: 'bonus', name: '奖金', icon: 'gift-fill', color: '#2A9F78', type: 'income' as const },
  { id: 'investment', name: '理财', icon: 'coupon-fill', color: '#3AAF88', type: 'income' as const },
  { id: 'parttime', name: '兼职', icon: 'account-fill', color: '#4ABF98', type: 'income' as const },
  { id: 'other_income', name: '其他', icon: 'plus-circle-fill', color: '#5ACFA8', type: 'income' as const },
]

// 所有分类
export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

// 资金池颜色选项 - 蓝色系
export const FUND_COLORS = [
  '#3E8FD4',
  '#4D85B8',
  '#5A9BD5',
  '#6BA3D6',
  '#7AADCC',
  '#8BB8D4',
]

// 存储键名
export const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  RECORDS: 'records',
  FUND_POOLS: 'fund_pools',
  FUND_OPERATIONS: 'fund_operations',
  BUDGET: 'budget',
}

// 默认月预算
export const DEFAULT_MONTHLY_BUDGET = 5000
