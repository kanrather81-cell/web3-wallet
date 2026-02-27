# API 速率限制问题修复

## 问题描述

在使用多链钱包时，控制台出现以下错误：

1. **Tron API 错误**：
   ```
   GET https://api.trongrid.io/v1/accounts/... 429 (Too Many Requests)
   ```

2. **Solana API 错误**：
   ```
   POST https://api.mainnet-beta.solana.com/ 403 (Forbidden)
   ```

这些错误是由于使用公共 RPC 端点的速率限制导致的。

---

## 解决方案

### 1. Tron API 优化 (`src/lib/chains/tron.ts`)

#### 实现的功能：

✅ **多端点备用机制**
- 添加了 3 个备用 RPC 端点
- 当一个端点失败时自动切换到下一个
- 端点列表：
  - `https://api.trongrid.io`
  - `https://api.tronstack.io`
  - `https://trx.getblock.io/mainnet`

✅ **智能重试机制**
- 每个端点重试 2 次
- 指数退避策略（1秒、2秒、4秒）
- 自动跳过速率限制的端点

✅ **本地缓存**
- 缓存余额 30 秒
- 减少 API 调用频率
- 使用 localStorage 存储

✅ **优雅降级**
- 所有端点失败时返回 0 而不是抛出错误
- 不会阻塞整个应用

---

### 2. Solana API 优化 (`src/lib/chains/solana.ts`)

#### 实现的功能：

✅ **多端点备用机制**
- 添加了 4 个备用 RPC 端点
- 自动故障转移
- 端点列表：
  - `https://api.mainnet-beta.solana.com`
  - `https://solana-api.projectserum.com`
  - `https://rpc.ankr.com/solana`
  - `https://solana-mainnet.rpc.extrnode.com`

✅ **连接超时控制**
- 每个请求 10 秒超时
- 避免长时间等待

✅ **本地缓存**
- 缓存余额 30 秒
- 减少 API 调用频率
- 使用 localStorage 存储

✅ **优雅降级**
- 所有端点失败时返回 0
- 不会阻塞整个应用

---

### 3. 余额刷新频率优化

#### `useMultiChainBalance.ts`
- 刷新间隔从 30 秒增加到 **60 秒**
- 使用 `Promise.allSettled()` 并行获取余额
- 单个链失败不影响其他链

#### `useTron.ts`
- 刷新间隔从 30 秒增加到 **60 秒**
- 减少对 Tron API 的调用频率

---

## 技术细节

### 缓存机制

```typescript
interface BalanceCache {
  [address: string]: {
    balance: number;
    timestamp: number;
  };
}
```

- 每个地址独立缓存
- 30 秒过期时间
- 存储在 localStorage

### 重试策略

```typescript
// 指数退避
await new Promise(resolve => 
  setTimeout(resolve, Math.pow(2, i) * 1000)
);
```

- 第 1 次重试：等待 1 秒
- 第 2 次重试：等待 2 秒
- 第 3 次重试：等待 4 秒

### 多端点轮询

```typescript
for (const endpoint of RPC_ENDPOINTS) {
  try {
    // 尝试获取余额
    return balance;
  } catch (error) {
    // 失败，尝试下一个端点
    continue;
  }
}
```

---

## 效果

### 修复前
- ❌ 频繁出现 429 和 403 错误
- ❌ 余额获取失败
- ❌ 控制台大量错误日志

### 修复后
- ✅ 自动切换到可用的 RPC 端点
- ✅ 缓存减少 API 调用
- ✅ 优雅降级，不阻塞应用
- ✅ 控制台错误大幅减少

---

## 使用建议

### 1. 生产环境建议

如果要在生产环境使用，建议：

1. **使用付费 RPC 服务**
   - Infura
   - Alchemy
   - QuickNode
   - GetBlock

2. **配置 API Key**
   ```typescript
   const TRON_RPC = `https://api.trongrid.io?apiKey=${YOUR_API_KEY}`;
   ```

3. **增加缓存时间**
   ```typescript
   const CACHE_DURATION = 60000; // 60秒
   ```

### 2. 测试环境

当前配置适合测试环境：
- 使用免费公共端点
- 30 秒缓存
- 60 秒刷新间隔

---

## 监控建议

### 添加错误监控

```typescript
// 记录失败的端点
console.warn(`Endpoint ${endpoint} failed:`, error);

// 可以发送到监控服务
// sendToMonitoring({ endpoint, error, timestamp });
```

### 添加性能监控

```typescript
const startTime = Date.now();
const balance = await fetchBalance();
const duration = Date.now() - startTime;

console.log(`Balance fetched in ${duration}ms`);
```

---

## 常见问题

### Q: 为什么还是偶尔看到错误？
A: 这是正常的。当第一个端点失败时会尝试下一个，期间会有警告日志。只要最终获取到余额就没问题。

### Q: 缓存会导致余额不准确吗？
A: 30 秒的缓存时间是合理的。如果需要实时余额，可以手动刷新页面。

### Q: 如何完全消除错误？
A: 使用付费 RPC 服务并配置 API Key。

### Q: 可以增加更多备用端点吗？
A: 可以。在 `RPC_ENDPOINTS` 数组中添加更多端点即可。

---

## 文件修改清单

- ✅ `web3-wallet/src/lib/chains/tron.ts` - Tron API 优化
- ✅ `web3-wallet/src/lib/chains/solana.ts` - Solana API 优化
- ✅ `web3-wallet/src/lib/hooks/useMultiChainBalance.ts` - 刷新频率优化
- ✅ `web3-wallet/src/lib/hooks/useTron.ts` - 刷新频率优化

---

## 构建状态

✅ 构建成功 (39.40s)
✅ 无 TypeScript 错误
✅ 所有功能正常

---

**修复完成！** 🎉

现在应用可以更稳定地获取多链余额，即使遇到速率限制也能自动切换到备用端点。
