# 钱包创建功能测试指南

## 🚀 快速开始

开发服务器已经在运行：`http://localhost:5173`

## 📝 测试步骤

### 测试1：访问钱包设置页面

1. 打开浏览器访问：
   ```
   http://localhost:5173/wallet-setup
   ```

2. 验证页面显示：
   - ✅ 欢迎标题
   - ✅ 两个选项卡：创建新钱包 / 导入现有钱包
   - ✅ 安全提示
   - ✅ 外部钱包连接选项

### 测试2：创建新钱包流程

#### 步骤1：生成助记词

1. 点击"创建新钱包"卡片或访问：
   ```
   http://localhost:5173/create-wallet
   ```

2. 阅读安全警告
3. 点击"生成助记词"按钮
4. 验证：
   - ✅ 显示12个单词
   - ✅ 每个单词都有编号（1-12）
   - ✅ 单词格式正确（小写英文）

#### 步骤2：验证助记词

1. 点击"复制助记词"按钮（可选）
2. 记录显示的3个需要验证的单词位置
3. 在输入框中输入对应的单词
4. 测试错误输入：
   - 输入错误的单词
   - 验证是否显示错误提示
5. 输入正确的单词
6. 点击"下一步"

#### 步骤3：设置密码

1. 输入钱包名称（例如："测试钱包"）
2. 输入密码，测试不同强度：
   - 弱密码：`12345678` → 应显示"弱"
   - 中等密码：`Test1234` → 应显示"中"
   - 强密码：`Test@1234` → 应显示"强"
3. 在"确认密码"中输入相同的密码
4. 勾选"我已理解..."复选框
5. 点击"创建钱包"
6. 等待创建完成（应该很快）

#### 步骤4：完成

1. 验证成功页面显示：
   - ✅ 成功图标（✅）
   - ✅ "钱包创建成功！"消息
   - ✅ 下一步指引
2. 点击"开始使用"
3. 应该跳转到主页面（`/`）

### 测试3：验证钱包数据

1. 打开浏览器开发者工具（F12）
2. 切换到"控制台"（Console）标签
3. 执行以下代码：

```javascript
// 查看存储的钱包数据
const walletData = localStorage.getItem('multichain_wallet_data');
if (walletData) {
  const parsed = JSON.parse(walletData);
  console.log('钱包数据:', parsed);
  console.log('钱包名称:', parsed.wallet.name);
  console.log('Ethereum 地址:', parsed.wallet.addresses.ethereum);
  console.log('Solana 地址:', parsed.wallet.addresses.solana);
  console.log('Bitcoin 地址:', parsed.wallet.addresses.bitcoin);
  console.log('Tron 地址:', parsed.wallet.addresses.tron);
} else {
  console.log('未找到钱包数据');
}
```

4. 验证输出：
   - ✅ 钱包名称正确
   - ✅ Ethereum 地址以 `0x` 开头
   - ✅ Solana 地址存在
   - ✅ Bitcoin 地址存在
   - ✅ Tron 地址以 `T` 开头

### 测试4：解锁钱包

1. 刷新页面（F5）
2. 访问：
   ```
   http://localhost:5173/unlock-wallet
   ```
3. 输入创建时设置的密码
4. 点击"解锁"
5. 验证：
   - ✅ 解锁成功
   - ✅ 跳转到主页面
   - ✅ 可以看到钱包地址

### 测试5：查看多链地址

1. 在主页面（`/`），查看各链的地址
2. 验证地址格式：
   - Ethereum: `0x` + 40个十六进制字符
   - Solana: Base58 编码，约32-44个字符
   - Bitcoin: 以 `1`, `3`, 或 `bc1` 开头
   - Tron: `T` + 33个字符

## 🧪 高级测试

### 测试密码强度验证

测试不同的密码组合：

| 密码 | 预期强度 | 说明 |
|------|---------|------|
| `123` | 弱 | 太短 |
| `12345678` | 弱 | 只有数字 |
| `abcdefgh` | 弱 | 只有小写字母 |
| `Test1234` | 中 | 有大小写和数字 |
| `Test@123` | 强 | 有大小写、数字和特殊字符 |
| `MyWallet@2024` | 强 | 长度足够，包含所有类型 |

### 测试助记词验证

1. 在验证步骤故意输入错误的单词
2. 验证是否显示错误提示
3. 验证是否阻止进入下一步

### 测试密码确认

1. 在"密码"和"确认密码"中输入不同的密码
2. 点击"创建钱包"
3. 验证是否显示"两次输入的密码不一致"错误

### 测试安全协议

1. 不勾选"我已理解..."复选框
2. 点击"创建钱包"
3. 验证是否显示错误提示

## 🔍 调试技巧

### 查看加密数据

```javascript
// 查看加密的助记词
const walletData = JSON.parse(localStorage.getItem('multichain_wallet_data'));
console.log('加密数据:', walletData.encryptedMnemonic);
console.log('密文:', walletData.encryptedMnemonic.ciphertext);
console.log('IV:', walletData.encryptedMnemonic.iv);
console.log('盐值:', walletData.encryptedMnemonic.salt);
```

### 查看会话状态

```javascript
// 查看是否已解锁
const isUnlocked = sessionStorage.getItem('multichain_wallet_session');
console.log('解锁状态:', isUnlocked);
```

### 清除钱包数据

```javascript
// 清除所有钱包数据（用于重新测试）
localStorage.removeItem('multichain_wallet_data');
sessionStorage.removeItem('multichain_wallet_session');
console.log('钱包数据已清除');
// 刷新页面
location.reload();
```

## ✅ 测试检查清单

- [ ] 钱包设置页面正常显示
- [ ] 可以生成12个单词的助记词
- [ ] 助记词验证功能正常
- [ ] 密码强度指示器工作正常
- [ ] 可以成功创建钱包
- [ ] 钱包数据正确存储到 localStorage
- [ ] 可以派生出4条链的地址
- [ ] 地址格式正确
- [ ] 助记词已加密存储
- [ ] 可以使用密码解锁钱包
- [ ] 解锁后可以访问钱包功能
- [ ] 刷新页面后需要重新解锁
- [ ] 错误提示正常显示
- [ ] UI 响应式设计正常
- [ ] 暗色主题显示正常

## 🐛 常见问题

### 问题1：页面空白

**解决方案：**
1. 检查浏览器控制台是否有错误
2. 确认开发服务器正在运行
3. 尝试刷新页面（Ctrl+F5）

### 问题2：无法生成助记词

**解决方案：**
1. 检查 bip39 包是否正确安装
2. 查看控制台错误信息
3. 确认 OKX SDK 包已安装

### 问题3：地址派生失败

**解决方案：**
1. 检查 OKX SDK 包是否正确安装
2. 查看控制台错误信息
3. 确认助记词格式正确

### 问题4：密码解密失败

**解决方案：**
1. 确认输入的密码正确
2. 检查 localStorage 中的数据是否完整
3. 尝试清除数据重新创建钱包

## 📊 性能指标

预期性能：
- 助记词生成：< 100ms
- 地址派生：< 2s（4条链）
- 加密存储：< 500ms
- 解密验证：< 500ms

## 🎯 测试目标

- ✅ 功能完整性：所有功能都能正常工作
- ✅ 用户体验：流程顺畅，提示清晰
- ✅ 安全性：密码加密，助记词保护
- ✅ 错误处理：各种错误情况都有提示
- ✅ 性能：响应速度快

## 📝 测试报告模板

```
测试日期：____________________
测试人员：____________________
浏览器：____________________

测试结果：
□ 通过  □ 失败

问题描述：
_________________________________
_________________________________

建议改进：
_________________________________
_________________________________
```

---

**祝测试顺利！** 🎉

如有问题，请查看：
- 开发者工具控制台
- `PHASE_5_STEP_8_WALLET_CREATION_VERIFICATION.md`
- `PHASE_5_STEP_8_COMPLETED.md`
