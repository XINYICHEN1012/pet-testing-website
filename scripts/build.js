const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 确保dist目录存在
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 复制所有HTML文件
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
htmlFiles.forEach(file => {
  fs.copyFileSync(file, path.join(distDir, file));
  console.log(`Copied ${file} to dist/`);
});

// 复制其他资源
const assetDirs = ['images', 'assets', 'scripts'];
assetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    execSync(`cp -r ${dir} ${distDir}/`);
    console.log(`Copied ${dir} to dist/`);
  }
});

console.log('Build completed successfully!');