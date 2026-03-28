# 微信记账小程序

一款基于 Vue3 + TypeScript + Pinia + TailwindCSS + Day.js 开发的个人记账微信小程序。

## 技术栈

- **框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **CSS 框架**: TailwindCSS
- **日期处理**: Day.js
- **UI 框架**: Uni-app
- **构建工具**: Vite

## 第三方库说明

### TailwindCSS
- 原子化 CSS 框架，提供丰富的工具类
- 配置自定义主题色（primary: #4CAF50, danger: #ff5252 等）
- 响应式设计和暗色模式支持

### Day.js
- 轻量级日期处理库（仅 2KB）
- 替代原生 Date 对象，提供链式调用
- 支持中文本地化
- 插件系统（relativeTime, isSameOrBefore 等）

## 功能特性

### 首页
- 用户头像和昵称展示
- 当月预算进度环（预算总额、已支出、剩余金额）
- 今日可用额度计算
- "记一笔"大按钮快速记账
- 6个常用分类快捷记账
- 今日已记账列表（最多5条）
- 昨日支出对比

### 记账本
- 月份选择器（左右箭头切换年月）
- 当月总支出金额展示
- 按日期分组展示记账记录
- 左滑编辑/删除记录
- 悬浮"记一笔"按钮

### 统计页
- 年/月切换标签
- 分类统计饼图
- 分类排行榜（前5个分类）
- 月度趋势柱状图（年视图）
- 每日趋势折线图（月视图）
- 平均线显示
- 年度报告快捷入口

### 资金池页
- 年度资金池总览（总投入、数量统计）
- 资金池卡片列表（进度条、状态标签）
- 存入/取出操作
- 新建资金池

### 个人中心
- 用户信息（头像、昵称、注册时间）
- 预算设置
- 年度报告入口
- 分类管理（查看所有分类）
- 数据导出
- 使用帮助
- 关于我们

### 年度报告
- 年份选择器
- 日常消费总额卡片
- 资金池存入总额卡片
- 月度消费趋势图
- 消费分类排行
- 资金池总结
- 分享功能

## 项目结构

```
wx-accounting/
├── src/
│   ├── components/          # 公共组件
│   │   ├── AmountInput.vue  # 金额输入组件
│   │   ├── CategorySelector.vue  # 分类选择器
│   │   ├── DatePicker.vue   # 日期选择器
│   │   ├── RecordModal.vue  # 记账弹窗
│   │   ├── FundModal.vue    # 资金池弹窗
│   │   └── FundOperationModal.vue  # 资金池操作弹窗
│   ├── pages/               # 页面
│   │   ├── index/           # 首页
│   │   ├── ledger/          # 记账本
│   │   ├── statistics/      # 统计页
│   │   ├── funds/           # 资金池页
│   │   ├── profile/         # 个人中心
│   │   └── annual-report/   # 年度报告
│   ├── stores/              # Pinia Store
│   │   ├── user.ts          # 用户状态
│   │   ├── record.ts        # 记账记录状态
│   │   └── fund.ts          # 资金池状态
│   ├── styles/              # 样式文件
│   │   └── tailwind.css     # TailwindCSS 入口
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   │   ├── constants.ts     # 常量定义
│   │   ├── storage.ts       # 本地存储
│   │   ├── date.ts          # 日期处理（Day.js）
│   │   └── format.ts        # 格式化函数
│   ├── App.vue              # 应用入口
│   ├── main.ts              # 主入口文件
│   ├── env.d.ts             # 环境类型声明
│   └── uni.scss             # 全局 SCSS 变量
├── static/                  # 静态资源
├── tailwind.config.js       # TailwindCSS 配置
├── postcss.config.js        # PostCSS 配置
├── pages.json               # 页面配置
├── manifest.json            # 应用配置
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 项目依赖
```

## TailwindCSS 使用示例

```vue
<template>
  <!-- 使用 TailwindCSS 工具类 -->
  <view class="min-h-screen bg-gradient-to-b from-primary to-gray-100">
    <view class="flex items-center justify-between px-4 py-6">
      <text class="text-2xl font-bold text-white">记账小程序</text>
      <button class="bg-white/20 rounded-full px-4 py-2 text-white">
        设置
      </button>
    </view>
    
    <!-- 卡片样式 -->
    <view class="bg-white rounded-2xl shadow-lg p-6 m-4">
      <text class="text-lg font-medium text-gray-800">月预算</text>
      <text class="text-3xl font-bold text-primary mt-2">¥5,000</text>
    </view>
  </view>
</template>
```

## Day.js 使用示例

```typescript
import { dayjs, formatDate, isSameDay } from '@/utils/date'

// 格式化日期
const today = formatDate(dayjs()) // '2024-01-15'

// 相对时间
const yesterday = dayjs().subtract(1, 'day')

// 判断是否同一天
const isToday = isSameDay('2024-01-15', dayjs())

// 获取月份天数
const daysInMonth = dayjs('2024-02-01').daysInMonth() // 29
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 使用 HBuilderX 运行

1. 打开 HBuilderX
2. 导入项目文件夹
3. 点击运行 -> 运行到小程序模拟器 -> 微信开发者工具

### 3. 使用命令行运行

```bash
# 运行到微信小程序
npm run dev:mp-weixin
```

## 数据存储

所有数据存储在本地，使用 `uni.setStorageSync` 进行持久化存储：

- `user_info`: 用户信息
- `records`: 记账记录
- `fund_pools`: 资金池列表
- `fund_operations`: 资金池操作记录
- `budget`: 预算设置

## 分类说明

### 支出分类
- 餐饮、购物、交通、娱乐、医疗、居住、教育、其他

### 收入分类
- 工资、奖金、理财、兼职、其他

## 注意事项

1. 首次使用需要设置月预算
2. 数据存储在本地，建议定期导出备份
3. 图片上传功能在微信小程序中需要配置域名
4. TailwindCSS 在小程序中使用时需要注意部分属性可能不兼容

## License

MIT
