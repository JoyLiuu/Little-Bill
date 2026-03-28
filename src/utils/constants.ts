// 支出分类
export const EXPENSE_CATEGORIES = [
  { id: 'food', name: '餐饮', icon: '\ue600', color: '#FF6B6B', type: 'expense' as const },
  { id: 'shopping', name: '购物', icon: '\ue601', color: '#4ECDC4', type: 'expense' as const },
  { id: 'transport', name: '交通', icon: '\ue602', color: '#45B7D1', type: 'expense' as const },
  { id: 'entertainment', name: '娱乐', icon: '\ue603', color: '#96CEB4', type: 'expense' as const },
  { id: 'medical', name: '医疗', icon: '\ue604', color: '#FFEAA7', type: 'expense' as const },
  { id: 'housing', name: '居住', icon: '\ue605', color: '#DDA0DD', type: 'expense' as const },
  { id: 'education', name: '教育', icon: '\ue606', color: '#98D8C8', type: 'expense' as const },
  { id: 'other', name: '其他', icon: '\ue607', color: '#F7DC6F', type: 'expense' as const },
]

// 收入分类
export const INCOME_CATEGORIES = [
  { id: 'salary', name: '工资', icon: '\ue608', color: '#4CAF50', type: 'income' as const },
  { id: 'bonus', name: '奖金', icon: '\ue609', color: '#8BC34A', type: 'income' as const },
  { id: 'investment', name: '理财', icon: '\ue60a', color: '#CDDC39', type: 'income' as const },
  { id: 'parttime', name: '兼职', icon: '\ue60b', color: '#FFC107', type: 'income' as const },
  { id: 'other_income', name: '其他', icon: '\ue60c', color: '#FF9800', type: 'income' as const },
]

// 所有分类
export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

// 资金池颜色选项
export const FUND_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
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
