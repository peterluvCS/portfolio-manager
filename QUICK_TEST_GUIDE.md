# ⚡ Portfolio Manager 快速测试指南

## 🚀 5分钟快速启动

### 1. 启动后端

**Windows系统**：
```cmd
cd server
npm start
```

**macOS/Linux系统**：
```bash
cd server
npm start
```

✅ 看到：`Server is running on http://localhost:8081`

### 2. 启动前端

**Windows系统**：
```cmd
cd client  
npm start
```

**macOS/Linux系统**：
```bash
cd client  
npm start
```

✅ 看到：浏览器打开 `http://localhost:3000`

**如果Windows启动失败，尝试以下解决方案**：

**方案1：使用PowerShell**
```powershell
cd client
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm start
```

**方案2：手动设置环境变量**
```cmd
cd client
set NODE_OPTIONS=--openssl-legacy-provider
npm start
```

**方案3：使用cross-env（推荐）**
```cmd
cd client
npm install cross-env --save-dev
```
然后修改package.json中的start脚本为：
```json
"start": "cross-env NODE_OPTIONS=--openssl-legacy-provider react-scripts start"
```

## 🎯 核心功能测试（10分钟）

### ✅ 必测项目

#### 1. Dashboard页面
- [ ] 访问 `http://localhost:3000`
- [ ] 确认看到4个卡片：总价值、总盈亏、现金余额、资产数量
- [ ] 确认看到持仓列表表格

#### 2. 页面导航
- [ ] 点击侧边栏"Portfolio" → 确认跳转
- [ ] 点击侧边栏"Trading" → 确认跳转  
- [ ] 点击侧边栏"History" → 确认跳转

#### 3. 交易功能
- [ ] 在Trading页面选择"Buy"
- [ ] 选择资产：AAPL
- [ ] 输入数量：5
- [ ] 点击"BUY AAPL"
- [ ] 确认显示成功消息

#### 4. 数据更新
- [ ] 返回Dashboard页面
- [ ] 确认持仓数据更新
- [ ] 检查History页面显示新交易

## 🐛 常见问题检查

### 问题1：页面空白
**检查**：
- 后端是否运行在8081端口
- 浏览器控制台是否有错误

### 问题2：交易失败  
**检查**：
- 现金余额是否足够
- 资产代码是否正确

### 问题3：价格不更新
**检查**：
- 后端控制台是否显示定时任务日志
- 等待5分钟看价格是否更新

### 问题4：Windows系统特殊问题
**检查**：
- 是否以管理员身份运行命令提示符
- 防火墙是否阻止了端口访问
- Node.js和npm是否正确安装

### 问题5：Windows npm start失败
**解决方案**：
1. 使用PowerShell而不是cmd
2. 手动设置环境变量
3. 安装cross-env包实现跨平台兼容

## 📊 测试结果记录

```
测试时间：_________
测试人员：_________
操作系统：Windows/macOS/Linux

✅ 正常功能：
❌ 问题功能：
📝 备注：
```

## 🆘 紧急联系

如有问题，请提供：
1. 浏览器控制台错误截图
2. 后端服务器日志截图
3. 具体操作步骤
4. 操作系统信息（Windows/macOS/Linux）

## 💡 Windows用户提示

- 使用 **命令提示符(cmd)** 或 **PowerShell** 运行命令
- 如果curl命令不可用，可以直接在浏览器中访问API地址测试
- 确保Node.js已正确安装（在cmd中运行 `node --version` 检查）
- 如果npm start失败，尝试使用PowerShell或手动设置环境变量

---

*这个快速指南帮助你在10分钟内完成核心功能测试，支持Windows、macOS和Linux系统* 