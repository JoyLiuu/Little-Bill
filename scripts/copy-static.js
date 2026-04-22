#!/usr/bin/env node
import { copySync, existsSync, mkdirSync } from 'fs-extra'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const sourceDir = join(rootDir, 'static')
const targetDir = join(rootDir, 'dist', 'dev', 'mp-weixin', 'static')

// 确保目标目录存在
if (!existsSync(dirname(targetDir))) {
  mkdirSync(dirname(targetDir), { recursive: true })
}

// 复制 static 文件夹
if (existsSync(sourceDir)) {
  copySync(sourceDir, targetDir, { overwrite: true })
  console.log('✅ Static files copied successfully!')
} else {
  console.log('⚠️ Source static directory not found')
}
