# 真实余额测试指南

## 快速测试步骤

### 准备工作

1. **确保已安装钱包**
   - Phantom (Solana): https://phantom.app/
   - Unisat/Xverse/Leather (Bitcoin)
   - TronLink (Tron): https://www.tronlink.org/

2. **启动开发服务器**
   ```bash
   cd web3-wallet
   npm run dev
   ```

3. **打开浏览器**
   - 访问 http://localhost:5173
   - 打开开发者工具（F12）查看控制台日志

## 测试 Solana 余额

### 步骤 1: 连接钱包
1. 点击页面上的 "Solana" 标签页
2. 查看调试信息：
   - Window: ✅
   - Phantom: ✅ 已安装
   - 版本号显示
3. 点击 "连接 Phantom 钱包"
4. 在 Phantom 弹窗中点击 "连接"

### 步骤 2: 验证余额
1. **检查显示的余额**
   - 应该显示格式: `X.XXXXXX SOL`
   - 例如: `1.234567 SOL`

2. **对比 Phantom 钱包**
   - 打开 Phantom 扩展
   - 查看 SOL 余额
   - ✅ 两者应该一致

3. **查看控制台日志**
   ```
   🔗 开始连接 Phantom...
   ✅ 连接成功: {publicKey: ...}
   📍 地址: ABC...XYZ
   ```

### 步骤 3: 测试余额刷新
1. 在 Phantom 中发送少量 SOL（或接收）
2. 等待交易确认（约5-10秒）
3. ✅ 应用中的余额应该自动更新

### 预期结果
- ✅ 显示真实 SOL 余额
- ✅ 余额与 Phantom 一致
- ✅ 余额自动刷新
- ✅ 无控制台错误

## 测试 Bitcoin 余额

### 步骤 1: 连接钱包
1. 点击 "Bitcoin" 标签页
2. 选择你安装的钱包：
   - Unisat
   - Xverse
   - Leather
3. 点击 "连接" 按钮
4. 在钱包弹窗中授权

### 步骤 2: 验证余额
1. **检查显示的余额**
   - 应该显示格式: `X.XXXXXXXX BTC`
   - 例如: `0.12345678 BTC`

2. **对比钱包应用**
   - 打开你的 Bitcoin 钱包
   - 查看 BTC 余额
   - ✅ 两者应该一致

3. **验证 Blockstream**
   - 复制你的 Bitcoin 地址
   - 访问 https://blockstream.info/
   - 粘贴地址搜索
   - ✅ 余额应该一致

### 步骤 3: 测试余额刷新
1. 等待 60 秒（自动刷新间隔）
2. 或者刷新页面
3. ✅ 余额应该重新获取

### 预期结果
- ✅ 显示真实 BTC 余额
- ✅ 余额与钱包一致
- ✅ 余额与 Blockstream 一致
- ✅ 每60秒自动刷新

## 测试 Tron 余额

### 步骤 1: 连接钱包
1. 点击 "Tron" 标签页
2. 点击 "连接 TronLink"
3. 在 TronLink 弹窗中点击 "接受"

### 步骤 2: 验证余额
1. **检查显示的余额**
   - 应该显示格式: `X.XXXXXX TRX`
   - 例如: `100.123456 TRX`

2. **对比 TronLink**
   - 打开 TronLink 扩展
   - 查看 TRX 余额
   - ✅ 两者应该一致

3. **验证 TronScan**
   - 复制你的 Tron 地址
   - 访问 https://tronscan.org/
   - 粘贴地址搜索
   - ✅ 余额应该一致

### 步骤 3: 测试余额刷新
1. 等待 30 秒（自动刷新间隔）
2. 或者刷新页面
3. ✅ 余额应该重新获取

### 预期结果
- ✅ 显示真实 TRX 余额
- ✅ 余额与 TronLink 一致
- ✅ 余额与 TronScan 一致
- ✅ 每30秒自动刷新

## 控制台日志示例

### Solana 成功连接
```
🔍 Simple Solana Debug: {
  hasWindow: true,
  hasPhantom: true,
  phantomVersion: "1.0.0",
  solanaObject: {...},
  isConnected: true
}
🔗 开始连接 Phantom...
✅ 连接成功: {publicKey: PublicKey}
📍 地址: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### Bitcoin 余额获取
```
获取Bitcoin余额: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
API响应: {
  chain_stats: {
    funded_txo_sum: 12345678,
    spent_txo_sum: 0
  }
}
BTC余额: 0.12345678
```

### Tron 余额获取
```
获取Tron余额: TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf
API响应: {
  data: [{
    balance: 100123456
  }]
}
TRX余额: 100.123456
```

## 故障排查

### 问题 1: Solana 余额显示 0
**检查清单**:
- [ ] Phantom 钱包是否已连接？
- [ ] 钱包中是否有 SOL？
- [ ] 控制台是否有错误？
- [ ] RPC 节点是否可访问？

**解决方案**:
```javascript
// 在控制台手动测试
const { Connection, PublicKey } = window.solanaWeb3;
const connection = new Connection('https://api.mainnet-beta.solana.com');
const balance = await connection.getBalance(
  new PublicKey('你的地址')
);
console.log('余额 (SOL):', balance / 1e9);
```

### 问题 2: Bitcoin 余额获取失败
**检查清单**:
- [ ] 地址格式是否正确？
- [ ] Blockstream API 是否可访问？
- [ ] 是否被限流？

**解决方案**:
```javascript
// 手动测试 API
fetch('https://blockstream.info/api/address/你的地址')
  .then(r => r.json())
  .then(data => {
    console.log('API响应:', data);
    const balance = (
      data.chain_stats.funded_txo_sum - 
      data.chain_stats.spent_txo_sum
    ) / 1e8;
    console.log('BTC余额:', balance);
  });
```

### 问题 3: Tron 余额获取失败
**检查清单**:
- [ ] TronLink 是否已连接？
- [ ] 地址格式是否正确（以T开头）？
- [ ] TronGrid API 是否可访问？

**解决方案**:
```javascript
// 手动测试 API
fetch('https://api.trongrid.io/v1/accounts/你的地址')
  .then(r => r.json())
  .then(data => {
    console.log('API响应:', data);
    const balance = (data.data?.[0]?.balance || 0) / 1e6;
    console.log('TRX余额:', balance);
  });
```

## 测试用例

### 测试用例 1: 零余额账户
**目的**: 验证零余额显示正确

**步骤**:
1. 使用一个没有余额的新地址
2. 连接钱包
3. ✅ 应该显示 `0.000000`

### 测试用例 2: 小额余额
**目的**: 验证小数位精度

**步骤**:
1. 使用有少量余额的地址（如 0.001 BTC）
2. 连接钱包
3. ✅ 应该显示完整的小数位

### 测试用例 3: 大额余额
**目的**: 验证大数字显示

**步骤**:
1. 使用有大量余额的地址（如 1000+ TRX）
2. 连接钱包
3. ✅ 应该正确显示，无溢出

### 测试用例 4: 网络切换
**目的**: 验证多账户支持

**步骤**:
1. 连接第一个账户
2. 在钱包中切换到另一个账户
3. ✅ 余额应该自动更新为新账户的余额

### 测试用例 5: 断开重连
**目的**: 验证连接状态管理

**步骤**:
1. 连接钱包
2. 点击 "断开"
3. 重新连接
4. ✅ 余额应该重新获取并显示

## 性能测试

### 测试 1: 余额获取速度
**预期**:
- Solana: < 1 秒
- Bitcoin: < 2 秒
- Tron: < 1 秒

**测试方法**:
```javascript
console.time('Solana Balance');
await getSolanaBalance(address);
console.timeEnd('Solana Balance');
```

### 测试 2: 并发获取
**预期**: 同时获取3条链的余额 < 3 秒

**测试方法**:
```javascript
console.time('All Balances');
await Promise.all([
  getSolanaBalance(solAddress),
  getBitcoinBalance(btcAddress),
  getTronBalance(tronAddress)
]);
console.timeEnd('All Balances');
```

### 测试 3: 自动刷新性能
**预期**: 刷新不影响 UI 响应

**测试方法**:
1. 连接所有钱包
2. 等待自动刷新触发
3. ✅ UI 应该保持流畅，无卡顿

## 总结检查清单

### Solana ✅
- [ ] 可以连接 Phantom 钱包
- [ ] 显示真实 SOL 余额
- [ ] 余额与 Phantom 一致
- [ ] 余额自动刷新
- [ ] 可以断开连接

### Bitcoin ✅
- [ ] 可以连接 Bitcoin 钱包
- [ ] 显示真实 BTC 余额
- [ ] 余额与钱包一致
- [ ] 余额与 Blockstream 一致
- [ ] 每60秒自动刷新

### Tron ✅
- [ ] 可以连接 TronLink
- [ ] 显示真实 TRX 余额
- [ ] 余额与 TronLink 一致
- [ ] 余额与 TronScan 一致
- [ ] 每30秒自动刷新

---

**测试完成后，所有链的余额数据都应该是真实的，直接从区块链获取！** 🎉
