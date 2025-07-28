# Portfolio Manager

## 项目描述
Portfolio Manager 是一个全栈 JavaScript 应用，旨在帮助用户管理和展示他们的投资组合。该项目包含客户端和服务器端，使用 Express.js 作为后端框架，React.js 作为前端框架。

## 文件结构
```
portfolio-manager
├── client
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── App.js
│   │   └── components
│   │       └── Header.js
│   └── package.json
├── server
│   ├── src
│   │   ├── app.js
│   │   ├── controllers
│   │   │   └── index.js
│   │   ├── routes
│   │   │   └── index.js
│   │   └── models
│   │       └── User.js
│   └── package.json
├── README.md
└── package.json
```

## 安装
1. 克隆项目到本地：
   ```
   git clone https://github.com/peterluvCS/portfolio-manager.git
   ```
2. 进入项目目录：
   ```
   cd portfolio-manager
   ```
3. 安装服务器依赖：
   ```
   cd server
   npm install
   ```
4. 安装客户端依赖：
   ```
   cd ../client
   npm install
   ```

## 使用
1. 启动服务器：
   ```
   cd server
   npm start
   ```
2. 启动客户端：
   ```
   cd ../client
   npm start
   ```

3. 前端运行端口：3000
4. 后端运行端口：8081