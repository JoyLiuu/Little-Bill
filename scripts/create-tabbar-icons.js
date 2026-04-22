// 创建 Tabbar 图标
import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const size = 48; // tabbar 图标建议尺寸

// 定义图标配置
const icons = [
  // 首页 - 房子形状
  {
    name: 'home',
    draw: (image, color) => {
      // 房子主体
      for (let x = 14; x < 34; x++) {
        for (let y = 20; y < 38; y++) {
          image.setPixelColor(color, x, y);
        }
      }
      // 屋顶
      for (let y = 10; y < 20; y++) {
        const width = (y - 10) * 1.5;
        for (let x = 24 - width; x < 24 + width; x++) {
          image.setPixelColor(color, Math.floor(x), y);
        }
      }
    }
  },
  // 记账本 - 笔记本形状
  {
    name: 'ledger',
    draw: (image, color) => {
      // 书本主体
      for (let x = 12; x < 36; x++) {
        for (let y = 8; y < 40; y++) {
          image.setPixelColor(color, x, y);
        }
      }
      // 书脊
      for (let y = 8; y < 40; y++) {
        image.setPixelColor(0xCCCCCCFF, 18, y);
      }
      // 线条
      for (let x = 22; x < 34; x++) {
        image.setPixelColor(0xFFFFFFFF, x, 16);
        image.setPixelColor(0xFFFFFFFF, x, 24);
        image.setPixelColor(0xFFFFFFFF, x, 32);
      }
    }
  },
  // 统计 - 图表形状
  {
    name: 'chart',
    draw: (image, color) => {
      // 坐标轴
      for (let y = 8; y < 40; y++) {
        image.setPixelColor(color, 8, y);
      }
      for (let x = 8; x < 40; x++) {
        image.setPixelColor(color, x, 36);
      }
      // 柱状图
      for (let y = 28; y < 36; y++) {
        image.setPixelColor(color, 14, y);
        image.setPixelColor(color, 15, y);
      }
      for (let y = 20; y < 36; y++) {
        image.setPixelColor(color, 22, y);
        image.setPixelColor(color, 23, y);
      }
      for (let y = 16; y < 36; y++) {
        image.setPixelColor(color, 30, y);
        image.setPixelColor(color, 31, y);
      }
    }
  },
  // 资金池 - 钱袋形状
  {
    name: 'funds',
    draw: (image, color) => {
      // 钱袋主体（圆形）
      const centerX = 24;
      const centerY = 26;
      const radius = 14;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const dx = x - centerX;
          const dy = y - centerY;
          if (dx * dx + dy * dy <= radius * radius && y > 14) {
            image.setPixelColor(color, x, y);
          }
        }
      }
      // 钱袋口
      for (let x = 18; x < 30; x++) {
        image.setPixelColor(color, x, 12);
        image.setPixelColor(color, x, 13);
      }
      // ￥符号
      image.setPixelColor(0xFFFFFFFF, 22, 24);
      image.setPixelColor(0xFFFFFFFF, 26, 24);
      image.setPixelColor(0xFFFFFFFF, 24, 26);
      image.setPixelColor(0xFFFFFFFF, 24, 28);
      image.setPixelColor(0xFFFFFFFF, 24, 30);
    }
  },
  // 我的 - 人形
  {
    name: 'profile',
    draw: (image, color) => {
      // 头部（圆形）
      const headCenterX = 24;
      const headCenterY = 16;
      const headRadius = 8;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const dx = x - headCenterX;
          const dy = y - headCenterY;
          if (dx * dx + dy * dy <= headRadius * headRadius) {
            image.setPixelColor(color, x, y);
          }
        }
      }
      // 身体（半圆形）
      const bodyCenterY = 42;
      const bodyRadius = 16;
      for (let x = 0; x < size; x++) {
        for (let y = 26; y < size; y++) {
          const dx = x - headCenterX;
          const dy = y - bodyCenterY;
          if (dx * dx + dy * dy <= bodyRadius * bodyRadius) {
            image.setPixelColor(color, x, y);
          }
        }
      }
    }
  }
];

// 生成图标
async function generateIcons() {
  const outputDir = path.join(__dirname, '../static/tabbar');

  for (const icon of icons) {
    // 生成未选中状态（灰色）
    const normalImage = new Jimp(size, size, 0x00000000);
    icon.draw(normalImage, 0x999999FF);
    await normalImage.writeAsync(path.join(outputDir, `${icon.name}.png`));

    // 生成选中状态（绿色）
    const activeImage = new Jimp(size, size, 0x00000000);
    icon.draw(activeImage, 0x4CAF50FF);
    await activeImage.writeAsync(path.join(outputDir, `${icon.name}-active.png`));

    console.log(`生成图标: ${icon.name}.png 和 ${icon.name}-active.png`);
  }

  console.log('所有图标生成完成！');
}

generateIcons().catch(console.error);
