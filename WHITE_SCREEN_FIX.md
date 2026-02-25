# White Screen Fix - React Hooks 规则违规

## 问题
点击 Solana 连接按钮后出现白屏，控制台显示：
```
无法在'Node'上执行'insertBefore'操作：要插入新节点的节点不是此节点的子节点
```

## 根本原因
`ChainAssets.tsx` 组件在 try-catch 块中调用 React hooks，违反了 React Hooks 规则。

## 修复方法
将所有 hooks 调用移到组件顶层，无条件调用：

```typescript
// ❌ 错误 - 在 try-catch 中调用 hooks
let solana;
try {
  solana = useSolana();
} catch (err) {
  console.error(err);
}

// ✅ 正确 - 在组件顶层无条件调用
const solana = useSolana();
const bitcoin = useBitcoin();
const tron = useTron();
```

## 修改的文件
- `web3-wallet/src/components/ChainAssets.tsx` - 修复 hooks 调用方式
- `web3-wallet/src/components/ErrorBoundary.tsx` - 修复类型导入

## 测试
1. 访问 http://localhost:5173
2. 点击 "连接 Solana 钱包" 按钮
3. 应该弹出 Phantom 钱包连接对话框，不再出现白屏

## React Hooks 规则
1. 只在组件顶层调用 hooks
2. 不要在循环、条件或嵌套函数中调用 hooks
3. 不要在 try-catch 块中调用 hooks
4. 确保每次渲染时 hooks 的调用顺序相同

## 状态
✅ 已修复并验证构建成功
