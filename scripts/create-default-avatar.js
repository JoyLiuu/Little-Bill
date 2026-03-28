// 创建默认头像图片
import Jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const size = 200;

// 创建绿色背景
const image = new Jimp(size, size, 0x4CAF50FF);

// 绘制白色圆形（头像背景）
const centerX = size / 2;
const centerY = size / 2;
const radius = size / 2 - 10;

// 创建圆形遮罩
image.scan(0, 0, size, size, function(x, y, idx) {
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > radius) {
    // 圆形外的像素设为透明
    this.bitmap.data[idx + 3] = 0;
  }
});

// 绘制用户图标 - 头部（白色圆形）
const headCenterX = centerX;
const headCenterY = centerY - 20;
const headRadius = 45;

image.scan(0, 0, size, size, function(x, y, idx) {
  const dx = x - headCenterX;
  const dy = y - headCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance <= headRadius) {
    // 白色头部
    this.bitmap.data[idx] = 255;     // R
    this.bitmap.data[idx + 1] = 255; // G
    this.bitmap.data[idx + 2] = 255; // B
    this.bitmap.data[idx + 3] = 255; // A
  }
});

// 绘制用户图标 - 身体（白色半圆形）
const bodyCenterY = centerY + 50;
const bodyRadius = 60;

image.scan(0, 0, size, size, function(x, y, idx) {
  if (y < bodyCenterY) return; // 只绘制下半部分
  
  const dx = x - centerX;
  const dy = y - bodyCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance <= bodyRadius) {
    // 白色身体
    this.bitmap.data[idx] = 255;     // R
    this.bitmap.data[idx + 1] = 255; // G
    this.bitmap.data[idx + 2] = 255; // B
    this.bitmap.data[idx + 3] = 255; // A
  }
});

// 保存图片
const outputPath = path.join(__dirname, '../static/default-avatar.png');
await image.writeAsync(outputPath);

console.log('默认头像已创建:', outputPath);
