# 路由更新总结

## 更新时间
2026-02-26

## 更新内容

### 1. 添加了带 tokenAddress 参数的路由

在 `src/App.tsx` 中添加了以下新路由，同时保持向后兼容：

```typescript
// Token Detail 路由
<Route path="/token/:chainId" element={<MainLayout showBack><TokenDetailPage /></MainLayout>} />
<Route path="/token/:chainId/:tokenAddress" element={<MainLayout showBack><TokenDetailPage /></MainLayout>} />

// Receive 路由
<Route path="/receive/:chainId" element={<MainLayout showBack showBottomNav={false}><ReceivePage /></MainLayout>} />
<Route path="/receive/:chainId/:tokenAddress" element={<MainLayout showBack showBottomNav={false}><ReceivePage /></MainLayout>} />

// Send 路由
<Route path="/send" element={<MainLayout showBack showBottomNav={false}><SendPage /></MainLayout>} />
<Route path="/send/:chainId/:tokenAddress" element={<MainLayout showBack showBottomNav={false}><SendPage /></MainLayout>} />
```

### 2. 更新了 TokenDetailPage

**文件**: `src/pages/TokenDetailPage.tsx`

**更改**:
- 添加了 `tokenAddress` URL 参数支持
- 更新了发送和接收按钮的导航逻辑，使用新的路由格式

```typescript
// 更新前
const { chainId } = useParams<{ chainId: string }>();
navigate(`/send?chain=${chainId}`);
navigate(`/receive/${chainId}`);

// 更新后
const { chainId, tokenAddress } = useParams<{ chainId: string; tokenAddress?: string }>();
const token = tokenAddress || 'native';
navigate(`/send/${chainId}/${token}`);
navigate(`/receive/${chainId}/${token}`);
```

### 3. 更新了 ReceivePage

**文件**: `src/pages/ReceivePage.tsx`

**更改**:
- 添加了 `tokenAddress` URL 参数支持
- 更新了页面标题以显示代币类型
- 将 `QRCode` 组件改为 `QRCodeCanvas`

```typescript
// 更新前
const { chainId } = useParams<{ chainId: string }>();
import QRCode from 'qrcode.react';

// 更新后
const { chainId, tokenAddress } = useParams<{ chainId: string; tokenAddress?: string }>();
import { QRCodeCanvas } from 'qrcode.react';
```

### 4. 更新了 SendPage

**文件**: `src/pages/SendPage.tsx`

**更改**:
- 添加了 `chainId` 和 `tokenAddress` URL 参数支持
- 使用 URL 参数初始化选中的链和代币地址
- 重命名 URL 参数以避免与状态变量冲突

```typescript
// 更新前
const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
const [tokenAddress, setTokenAddress] = useState('');

// 更新后
const { chainId: urlChainId, tokenAddress: urlTokenAddress } = useParams<{ chainId?: string; tokenAddress?: string }>();
const [selectedChain, setSelectedChain] = useState<ChainType>(urlChainId as ChainType || 'ethereum');
const [tokenAddress, setTokenAddress] = useState(urlTokenAddress || '');
```

## 路由格式说明

### Token Detail 页面
- **旧格式**: `/token/:chainId`
- **新格式**: `/token/:chainId/:tokenAddress`
- **示例**:
  - `/token/ethereum` - 查看以太坊原生币
  - `/token/ethereum/native` - 查看以太坊原生币（显式）
  - `/token/ethereum/0x...` - 查看以太坊上的 ERC20 代币

### Receive 页面
- **旧格式**: `/receive/:chainId`
- **新格式**: `/receive/:chainId/:tokenAddress`
- **示例**:
  - `/receive/ethereum` - 接收以太坊原生币
  - `/receive/ethereum/native` - 接收以太坊原生币（显式）
  - `/receive/ethereum/0x...` - 接收以太坊上的 ERC20 代币

### Send 页面
- **旧格式**: `/send` 或 `/send?chain=ethereum`
- **新格式**: `/send/:chainId/:tokenAddress`
- **示例**:
  - `/send` - 发送（默认以太坊）
  - `/send/ethereum/native` - 发送以太坊原生币
  - `/send/solana/native` - 发送 Solana 原生币
  - `/send/ethereum/0x...` - 发送以太坊上的 ERC20 代币

## 向后兼容性

所有旧的路由格式仍然有效：
- ✅ `/token/:chainId` - 仍然工作
- ✅ `/receive/:chainId` - 仍然工作
- ✅ `/send` - 仍然工作

新的路由格式提供了更多的灵活性：
- ✅ `/token/:chainId/:tokenAddress` - 支持特定代币
- ✅ `/receive/:chainId/:tokenAddress` - 支持特定代币
- ✅ `/send/:chainId/:tokenAddress` - 支持特定代币

## 参数说明

### chainId
链的标识符，支持的值：
- `ethereum` - 以太坊
- `polygon` - Polygon
- `optimism` - Optimism
- `arbitrum` - Arbitrum
- `base` - Base
- `solana` - Solana
- `bitcoin` - Bitcoin
- `tron` - Tron

### tokenAddress
代币地址，可选值：
- `native` - 原生币（ETH, SOL, BTC, TRX 等）
- `0x...` - ERC20/TRC20 代币合约地址
- Solana 代币的 mint 地址
- 如果省略，默认为 `native`

## 使用示例

### 从资产列表跳转到代币详情
```typescript
// 点击 ETH
navigate(`/token/ethereum/native`);

// 点击 USDT (ERC20)
navigate(`/token/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7`);

// 点击 SOL
navigate(`/token/solana/native`);
```

### 从代币详情跳转到发送页面
```typescript
// TokenDetailPage.tsx
const handleSend = () => {
  const token = tokenAddress || 'native';
  navigate(`/send/${chainId}/${token}`);
};
```

### 从代币详情跳转到接收页面
```typescript
// TokenDetailPage.tsx
const handleReceive = () => {
  const token = tokenAddress || 'native';
  navigate(`/receive/${chainId}/${token}`);
};
```

## TypeScript 类型检查

✅ 所有文件通过 TypeScript 类型检查
✅ 无编译错误
✅ 无类型警告

## 测试建议

1. **测试原生币流程**:
   - 访问 `/token/ethereum`
   - 点击"发送"按钮，应跳转到 `/send/ethereum/native`
   - 点击"接收"按钮，应跳转到 `/receive/ethereum/native`

2. **测试代币流程**:
   - 访问 `/token/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7`
   - 点击"发送"按钮，应跳转到 `/send/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7`
   - 点击"接收"按钮，应跳转到 `/receive/ethereum/0xdac17f958d2ee523a2206206994597c13d831ec7`

3. **测试向后兼容性**:
   - 访问 `/token/ethereum` - 应正常显示
   - 访问 `/receive/ethereum` - 应正常显示
   - 访问 `/send` - 应正常显示

4. **测试多链支持**:
   - 测试 Ethereum: `/token/ethereum/native`
   - 测试 Solana: `/token/solana/native`
   - 测试 Bitcoin: `/token/bitcoin/native`
   - 测试 Tron: `/token/tron/native`

## 注意事项

1. **tokenAddress 参数是可选的**
   - 如果省略，默认为 `native`
   - 页面需要处理 `undefined` 的情况

2. **chainId 参数验证**
   - 应验证 chainId 是否为支持的链
   - 如果不支持，应显示错误或重定向

3. **代币地址验证**
   - 应验证代币地址格式是否正确
   - ERC20: 以 `0x` 开头的 42 字符地址
   - Solana: Base58 编码的地址
   - 如果格式不正确，应显示错误

4. **QRCodeCanvas 组件**
   - 已从 `QRCode` 更新为 `QRCodeCanvas`
   - 确保 `qrcode.react` 包已安装
   - 版本: `qrcode.react@4.2.0`

## 相关文件

- `web3-wallet/src/App.tsx` - 路由配置
- `web3-wallet/src/pages/TokenDetailPage.tsx` - 代币详情页
- `web3-wallet/src/pages/ReceivePage.tsx` - 接收页面
- `web3-wallet/src/pages/SendPage.tsx` - 发送页面

## 下一步

1. ✅ 路由配置完成
2. ✅ 页面参数支持完成
3. ✅ TypeScript 类型检查通过
4. 🔄 测试所有路由和导航
5. 🔄 添加错误处理和验证
6. 🔄 优化用户体验
