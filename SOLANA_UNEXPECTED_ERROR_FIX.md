# Solana "意外错误" 修复

## 问题描述

用户在尝试连接 Solana 钱包时看到"意外错误"提示。

## 根本原因

`useSolana` hook 在初始化时没有正确处理以下情况：
1. `window` 对象不可用（SSR 环境）
2. `window.solana` 不存在（未安装 Phantom）
3. 事件监听器注册失败
4. 余额获取失败影响连接状态

## 修复内容

### 1. 改进 `connect` 函数错误处理

```typescript
// 添加 window 对象检查
if (typeof window === 'undefined') {
  throw new Error('Window object not available');
}

// 添加 publicKey 验证
if (!response?.publicKey) {
  throw new Error('Failed to get public key from wallet');
}

// 余额获取失败不影响连接状态
try {
  const bal = await getSolanaBalance(publicKey);
  setBalance(bal);
} catch (balErr) {
  console.error('Failed to fetch balance:', balErr);
  setBalance(0);
}
```

### 2. 改进 `disconnect` 函数

```typescript
try {
  if (typeof window === 'undefined') return;
  
  const { solana } = window as any;
  
  if (solana && typeof solana.disconnect === 'function') {
    solana.disconnect();
  }
} catch (err) {
  console.error('Error disconnecting Solana wallet:', err);
}
```

### 3. 改进 `useEffect` 错误处理

```typescript
useEffect(() => {
  try {
    // 安全地访问 window.solana
    if (typeof window === 'undefined') return;
    
    const { solana } = window as any;
    if (!solana) return;
    
    // ... 其他逻辑
  } catch (err) {
    console.error('Error in useSolana effect:', err);
    // 不设置错误状态，只是静默失败
  }
}, []);
```

## 测试步骤

### 1. 清除浏览器缓存
```
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"
```

### 2. 检查控制台
打开浏览器控制台（F12），查看是否有以下错误：
- ❌ `Cannot read property 'solana' of undefined`
- ❌ `window is not defined`
- ❌ `Unexpected error`

### 3. 测试连接流程
1. 访问 http://localhost:5173
2. 点击 "Solana" 标签页
3. 查看调试信息：
   - Window: ✅
   - Phantom: ✅ 已安装
   - 版本号显示
4. 点击 "连接 Phantom 钱包"
5. 在弹出窗口中授权连接

### 4. 验证连接成功
- ✅ 显示 "Solana 已连接"
- ✅ 显示钱包地址
- ✅ 显示 SOL 余额（或 0.000000）
- ✅ 显示 "断开" 按钮

## 可能的错误情况

### 错误 1: "Window object not available"
**原因**: 在服务端渲染环境中运行
**解决**: 确保只在客户端环境中使用

### 错误 2: "Please install Phantom wallet"
**原因**: 未安装 Phantom 钱包扩展
**解决**: 访问 https://phantom.app/ 安装

### 错误 3: "Failed to get public key from wallet"
**原因**: Phantom 钱包返回了无效的响应
**解决**: 
1. 重启浏览器
2. 重新安装 Phantom 扩展
3. 检查 Phantom 版本是否最新

### 错误 4: "用户拒绝了连接请求"
**原因**: 用户在 Phantom 弹窗中点击了"取消"
**解决**: 重新点击连接按钮并授权

### 错误 5: 余额显示 0.000000
**原因**: 
1. 钱包确实没有 SOL
2. RPC 节点连接失败
3. 余额查询 API 失败

**解决**: 
1. 检查钱包是否有 SOL
2. 检查网络连接
3. 查看控制台是否有 "Failed to fetch balance" 错误

## 调试技巧

### 1. 手动测试 Phantom 连接
在浏览器控制台中运行：
```javascript
// 检查 Phantom 是否安装
console.log('Phantom installed:', window.solana?.isPhantom);

// 手动连接
window.solana.connect().then(response => {
  console.log('Connected:', response.publicKey.toString());
}).catch(err => {
  console.error('Connection failed:', err);
});
```

### 2. 检查事件监听器
```javascript
// 检查 Phantom 是否支持事件
console.log('Has .on method:', typeof window.solana?.on === 'function');
console.log('Has .off method:', typeof window.solana?.off === 'function');
```

### 3. 查看 Phantom 版本
```javascript
console.log('Phantom version:', window.solana?.version);
```

## 预期结果

✅ 无 "意外错误" 提示
✅ 可以正常连接 Phantom 钱包
✅ 显示钱包地址
✅ 显示 SOL 余额（即使是 0）
✅ 可以正常断开连接
✅ 控制台无错误信息

## 后续优化

如果问题仍然存在，可以考虑：

1. **添加重试机制**: 连接失败时自动重试
2. **添加超时处理**: 连接超过 10 秒自动取消
3. **添加详细日志**: 记录每一步的执行状态
4. **添加用户提示**: 显示更友好的错误信息
5. **添加降级方案**: 如果 hook 失败，使用 SimpleSolanaConnect 组件

---

**修复时间**: 2024
**修复文件**: `src/lib/hooks/useSolana.ts`
**影响组件**: 
- `ChainAssets.tsx` (使用 useSolana hook)
- `SolanaConnectButton.tsx` (使用 useSolana hook)
