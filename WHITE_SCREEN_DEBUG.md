# 白屏问题调试指南

## 问题描述
页面显示白屏，无内容显示。

## 已完成的修复步骤

### 1. 重新创建 AssetHomeTP.tsx
- ✅ 文件已重新创建
- ✅ 使用硬编码数据（避免 hook 依赖问题）
- ✅ 正确导出组件
- ✅ 无语法错误

### 2. 重启开发服务器
- ✅ 服务器已重启
- ✅ 运行在 http://localhost:5173/
- ✅ HMR 热更新已触发

## 调试步骤

### 步骤 1: 强制刷新浏览器
```
Windows: Ctrl + F5
Mac: Cmd + Shift + R
```

### 步骤 2: 检查浏览器控制台
1. 打开开发者工具（F12）
2. 切换到 Console 标签页
3. 查看是否有错误信息

### 步骤 3: 检查 Network 标签页
1. 切换到 Network 标签页
2. 刷新页面
3. 查看是否有失败的请求（红色）
4. 特别注意 JavaScript 文件的加载状态

### 步骤 4: 检查 Elements 标签页
1. 切换到 Elements 标签页
2. 查看 `<div id="root">` 是否有内容
3. 如果为空，说明 React 没有渲染

## 常见错误及解决方案

### 错误 1: Module not found
```
Error: Cannot find module './components/home/AssetHomeTP'
```
**解决方案**: 检查文件路径和导入语句是否正确

### 错误 2: Export not found
```
The requested module does not provide an export named 'AssetHomeTP'
```
**解决方案**: 确保组件使用 `export function AssetHomeTP()` 导出

### 错误 3: Hook 错误
```
Error: Invalid hook call
```
**解决方案**: 确保 hooks 只在函数组件内部调用

### 错误 4: Tailwind CSS 类名不生效
```
页面显示但样式丢失
```
**解决方案**: 
- 检查 `tailwind.config.js` 配置
- 确保 `index.css` 中有 Tailwind 指令
- 重启开发服务器

### 错误 5: 路由问题
```
页面空白但无错误
```
**解决方案**: 检查 `App.tsx` 中的路由配置

## 当前配置验证

### AssetHomeTP.tsx
- ✅ 文件存在
- ✅ 正确导出
- ✅ 使用硬编码数据（临时）
- ✅ 无语法错误

### App.tsx
- ✅ 正确导入 AssetHomeTP
- ✅ 路由配置正确
- ✅ TPLayout 包含 BottomNavFive

### 开发服务器
- ✅ 运行中
- ✅ 端口: 5173
- ✅ HMR 已启用

## 下一步操作

### 如果页面仍然白屏：

1. **检查浏览器控制台错误**
   - 打开 F12
   - 查看 Console 标签页
   - 复制所有错误信息

2. **检查网络请求**
   - 打开 Network 标签页
   - 刷新页面
   - 查看是否有失败的请求

3. **尝试访问其他页面**
   - http://localhost:5173/market
   - http://localhost:5173/swap
   - http://localhost:5173/discover
   - http://localhost:5173/profile

4. **清除浏览器缓存**
   ```
   Chrome: Ctrl + Shift + Delete
   选择"缓存的图片和文件"
   点击"清除数据"
   ```

5. **重启开发服务器**
   ```bash
   # 停止服务器 (Ctrl+C)
   # 然后重新启动
   cd web3-wallet
   npm run dev
   ```

## 临时解决方案

如果问题持续，可以尝试：

### 方案 1: 使用简化版组件
创建一个最简单的测试组件：

```tsx
// src/components/home/AssetHomeTP.tsx
export function AssetHomeTP() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">测试页面</h1>
      <p>如果你能看到这个，说明路由和组件加载正常</p>
    </div>
  );
}
```

### 方案 2: 检查依赖
```bash
cd web3-wallet
npm install
```

### 方案 3: 清除构建缓存
```bash
cd web3-wallet
rm -rf node_modules/.vite
rm -rf dist
npm run dev
```

## 联系信息

如果以上步骤都无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. Network 标签页的截图
3. 开发服务器终端的输出

---
创建时间: 2026-02-26
最后更新: 2026-02-26 18:41
