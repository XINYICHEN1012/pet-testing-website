# Pet Testing Website

一个帮助用户了解宠物性格特征的测试网站。

## 项目介绍

这个项目是一个互动式的宠物性格测试网站，帮助潜在的宠物主人：
- 了解不同宠物的性格特征
- 测试最适合自己的宠物类型
- 浏览各种宠物产品信息

## 功能特点

- 宠物性格测试
- 产品展示页面
- 用户登录系统
- 响应式设计，支持多设备访问

## 技术栈

- 前端：HTML5, CSS3, JavaScript
- 部署：Netlify
- 版本控制：Git
- 包管理：npm

## 安装说明

1. 克隆项目
```bash
git clone https://github.com/XINYICHEN1012/pet-testing-website.git
cd pet-testing-website
```

2. 安装依赖
```bash
npm install
```

3. 环境配置
- 复制 `.env.example` 到 `.env`
- 配置必要的环境变量

## 项目结构

```
pet-testing-website/
├── home.html          # 首页
├── login.html         # 登录页面
├── product.html       # 产品展示页
├── pet personality test.html  # 宠物性格测试页面
├── scripts/          # JavaScript 脚本
├── data/            # 数据文件
├── .github/         # GitHub 配置文件
└── netlify.toml     # Netlify 配置
```

## 开发指南

1. 确保已安装 Node.js
2. 安装项目依赖：`npm install`
3. 本地开发：使用 Live Server 或其他本地服务器

## 部署

项目使用 Netlify 自动部署：
1. 推送到 GitHub 主分支会自动触发部署
2. 部署配置在 `netlify.toml` 文件中

## 贡献指南

欢迎提交 Pull Requests：
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 