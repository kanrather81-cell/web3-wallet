# 第五阶段第8步实现指南：内置钱包功能

## ⚠️ 重要提示

在开始之前，请阅读 `PHASE_5_STEP_8_SECURITY_WARNING.md` 了解安全风险。

## 实现概述

由于这是一个复杂且安全敏感的功能，建议分阶段实现：

### 阶段 1：基础架构（推荐先完成）
1. 加密工具 (`encryption.ts`)
2. 简单的密钥存储测试

### 阶段 2：钱包管理
1. 助记词生成（使用 OKX SDK）
2. 地址派生（多链支持）
3. 钱包存储管理

### 阶段 3：用户界面
1. 创建钱包页面
2. 解锁钱包页面
3. 钱包管理页面

### 阶段 4：集成
1. 全局状态管理
2. 与现有功能集成
3. 测试和优化

## 推荐的替代方案

考虑到安全性和复杂度，强烈建议：

### 方案 A：仅地址导入（推荐）
- 允许用户导入地址（不存储私钥）
- 仅用于查看余额和交易历史
- 交易仍使用外部钱包签名
- **安全性高，实现简单**

### 方案 B：使用 WalletConnect
- 集成 WalletConnect 协议
- 支持移动钱包连接
- 不在浏览器存储私钥
- **行业标准方案**

### 方案 C：浏览器扩展
- 将钱包功能做成浏览器扩展
- 独立的安全上下文
- 更好的安全隔离
- **更安全的架构**

## 如果仍要实现内置钱包

### 所需依赖

已安装的 OKX SDK 包：
```json
{
  "@okxweb3/crypto-lib": "^2.0.5",
  "@okxweb3/coin-base": "^2.0.6",
  "@okxweb3/coin-ethereum": "^2.4.10",
  "@okxweb3/coin-bitcoin": "^2.4.9",
  "@okxweb3/coin-solana": "^2.4.8",
  "@okxweb3/coin-tron": "^2.4.9"
}
```

### 核心文件结构

```
src/lib/wallet/
├── encryption.ts          # 加密工具（Web Crypto API）
├── walletManager.ts       # 钱包管理（基于 OKX SDK）
└── keyDerivation.ts       # 密钥派生（多链支持）

src/pages/
├── CreateWalletPage.tsx   # 创建钱包流程
├── UnlockWalletPage.tsx   # 解锁钱包
└── ImportWalletPage.tsx   # 导入钱包

src/contexts/
└── WalletContext.tsx      # 全局钱包状态

src/components/wallet/
├── MnemonicDisplay.tsx    # 助记词显示
├── MnemonicVerify.tsx     # 助记词验证
└── PasswordSetup.tsx      # 密码设置
```

### 参考 OKX SDK 文档

请参考 OKX Web3 SDK 的官方文档：
- GitHub: https://github.com/okx/js-wallet-sdk
- 文档: https://www.okx.com/web3/build/docs/sdks/chains/introduction

### 关键 API 使用示例

根据 OKX SDK 公开文档，主要使用以下模块：

1. **助记词生成** - 使用 `@okxweb3/crypto-lib`
2. **以太坊地址派生** - 使用 `@okxweb3/coin-ethereum`
3. **Solana 地址派生** - 使用 `@okxweb3/coin-solana`
4. **Bitcoin 地址派生** - 使用 `@okxweb3/coin-bitcoin`
5. **Tron 地址派生** - 使用 `@okxweb3/coin-tron`

### 实现步骤

#### 步骤 1：创建加密工具框架

文件：`src/lib/wallet/encryption.ts`

需要实现的功能：
- `deriveKey(password, salt)` - 使用 PBKDF2 派生密钥
- `encrypt(data, password)` - AES-GCM 加密
- `decrypt(encryptedData, password)` - AES-GCM 解密
- `generateSalt()` - 生成随机 salt

#### 步骤 2：创建钱包管理器框架

文件：`src/lib/wallet/walletManager.ts`

需要实现的功能：
- `generateMnemonic()` - 生成助记词（调用 OKX SDK）
- `deriveAddresses(mnemonic)` - 派生多链地址（调用 OKX SDK）
- `saveWallet(wallet, password)` - 加密保存钱包
- `loadWallet(password)` - 解密加载钱包
- `lockWallet()` - 锁定钱包
- `unlockWallet(password)` - 解锁钱包

#### 步骤 3：创建 UI 组件

根据需要创建各个页面和组件。

## 最小可行实现（MVP）

如果要快速实现一个可用版本，建议：

1. **仅支持一条链**（如 Ethereum）
2. **简化 UI**（单页面流程）
3. **基础加密**（Web Crypto API）
4. **明确的测试网警告**

这样可以大大减少代码量，同时保持核心功能。

## 测试建议

1. **仅在测试网测试**
   - Ethereum Sepolia
   - Solana Devnet
   - Bitcoin Testnet
   - Tron Shasta

2. **使用小额测试资金**
   - 从水龙头获取测试币
   - 不要使用真实资产

3. **安全测试**
   - 测试密码强度验证
   - 测试加密/解密流程
   - 测试浏览器刷新后的状态

## 后续优化

如果基础功能工作正常，可以考虑：

1. 多账户支持
2. 账户导入/导出
3. 硬件钱包集成
4. 生物识别解锁（WebAuthn）
5. 助记词分片备份

## 总结

内置钱包是一个复杂的功能，建议：

1. **优先考虑安全性**
2. **从简单开始**（MVP）
3. **充分测试**
4. **明确警告用户**
5. **考虑替代方案**

如果您决定继续实现，请确保：
- 理解所有安全风险
- 仅在测试网使用
- 参考 OKX SDK 官方文档
- 进行充分的安全测试

---

**需要帮助？**

如果在实现过程中遇到问题，可以：
1. 查阅 OKX SDK 官方文档
2. 参考 MetaMask 等开源钱包的实现
3. 咨询安全专家
4. 进行代码审计

**再次提醒：此功能仅用于学习和测试目的！**
