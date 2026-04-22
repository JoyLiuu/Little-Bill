import fsExtra from 'fs-extra'
import path from 'path'

const { copySync, existsSync, mkdirSync } = fsExtra

function copyStaticFiles() {
  const sourceDir = path.join(process.cwd(), 'static')
  const targetDir = path.join(process.cwd(), 'dist', 'dev', 'mp-weixin', 'static')

  // 确保目标目录存在
  if (!existsSync(path.join(process.cwd(), 'dist', 'dev', 'mp-weixin'))) {
    mkdirSync(path.join(process.cwd(), 'dist', 'dev', 'mp-weixin'), { recursive: true })
  }

  // 复制 static 文件夹
  if (existsSync(sourceDir)) {
    copySync(sourceDir, targetDir, { overwrite: true })
    console.log('✅ Static files copied to dist/dev/mp-weixin/static')
  }
}

export function copyStaticPlugin() {
  return {
    name: 'copy-static',
    apply: 'serve',
    configureServer() {
      // 服务器启动时复制
      setTimeout(() => {
        copyStaticFiles()
      }, 3000) // 延迟3秒等待目录创建
    },
    buildStart() {
      // 构建开始时复制
      setTimeout(() => {
        copyStaticFiles()
      }, 3000)
    },
    handleHotUpdate({ file }) {
      // 当 static 文件夹中的文件变化时，重新复制
      if (file.includes('/static/')) {
        copyStaticFiles()
      }
    }
  }
}
