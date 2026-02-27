/**
 * 导入钱包页面 - 支持助记词和私钥导入
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiWalletManager } from '../lib/wallet/multiWalletManager';
import { validatePasswordStrength } from '../lib/wallet/encryption';
import { useWalletContext } from '../contexts/WalletContext';

type ImportMethod = 'mnemonic' | 'privateKey';
type ChainType = 'ethereum' | 'solana' | 'bitcoin' | 'tron';

export function ImportWalletPage() {
  const navigate = useNavigate();
  const { createWallet } = useWalletContext();

  const [importMethod, setImportMethod] = useState<ImportMethod>('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [selectedChain, setSelectedChain] = useState<ChainType>('ethereum');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletName, setWalletName] = useState('导入的钱包');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  // 验证私钥格式
  const validatePrivateKey = (key: string, chain: ChainType): boolean => {
    const trimmedKey = key.trim();
    
    switch (chain) {
      case 'ethereum':
        // Ethereum 私钥：64个十六进制字符，可选 0x 前缀
        return /^(0x)?[0-9a-fA-F]{64}$/.test(trimmedKey);
      case 'solana':
        // Solana 私钥：Base58 编码，约88个字符
        return trimmedKey.length >= 80 && trimmedKey.length <= 90;
      case 'bitcoin':
        // Bitcoin 私钥：WIF 格式，以 5/K/L 开头
        return /^[5KL][1-9A-HJ-NP-Za-km-z]{50,51}$/.test(trimmedKey);
      case 'tron':
        // Tron 私钥：64个十六进制字符
        return /^[0-9a-fA-F]{64}$/.test(trimmedKey);
      default:
        return false;
    }
  };

  // 从私钥派生地址（简化版，实际应使用 OKX SDK）
  const deriveAddressFromPrivateKey = async (key: string, chain: ChainType): Promise<string> => {
    try {
      const trimmedKey = key.trim();
      
      // 导入 OKX SDK
      switch (chain) {
        case 'ethereum': {
          const { EthWallet } = await import('@okxweb3/coin-ethereum');
          const wallet = new EthWallet();
          const address = await wallet.getNewAddress({
            privateKey: trimmedKey.startsWith('0x') ? trimmedKey : `0x${trimmedKey}`,
          });
          return address.address;
        }
        case 'solana': {
          const { SolWallet } = await import('@okxweb3/coin-solana');
          const wallet = new SolWallet();
          const address = await wallet.getNewAddress({
            privateKey: trimmedKey,
          });
          return address.address;
        }
        case 'bitcoin': {
          const { BtcWallet } = await import('@okxweb3/coin-bitcoin');
          const wallet = new BtcWallet();
          const address = await wallet.getNewAddress({
            privateKey: trimmedKey,
            addressType: 'legacy',
          });
          return address.address;
        }
        case 'tron': {
          const { TrxWallet } = await import('@okxweb3/coin-tron');
          const wallet = new TrxWallet();
          const address = await wallet.getNewAddress({
            privateKey: trimmedKey,
          });
          return address.address;
        }
        default:
          throw new Error('不支持的链');
      }
    } catch (error) {
      console.error('派生地址失败:', error);
      throw new Error('无法从私钥派生地址，请检查私钥格式');
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    const passwordCheck = validatePasswordStrength(password);
    if (passwordCheck.strength === 'weak') {
      setError(`密码强度不足: ${passwordCheck.message}`);
      return;
    }

    if (!agreedToTerms) {
      setError('请阅读并同意安全提示');
      return;
    }

    setIsImporting(true);

    try {
      if (importMethod === 'mnemonic') {
        // 助记词导入
        const trimmedMnemonic = mnemonic.trim();
        if (!MultiWalletManager.validateMnemonic(trimmedMnemonic)) {
          setError('无效的助记词，请检查输入');
          setIsImporting(false);
          return;
        }
        await createWallet(walletName, trimmedMnemonic, password);
      } else {
        // 私钥导入
        const trimmedKey = privateKey.trim();
        
        // 验证私钥格式
        if (!validatePrivateKey(trimmedKey, selectedChain)) {
          setError(`无效的 ${selectedChain} 私钥格式`);
          setIsImporting(false);
          return;
        }

        // 验证私钥是否可以派生地址
        try {
          const address = await deriveAddressFromPrivateKey(trimmedKey, selectedChain);
          console.log('派生的地址:', address);
          
          // 注意：私钥导入目前不支持完整的多链钱包
          // 这里仅作演示，实际应该创建一个只包含该链的钱包
          setError('私钥导入功能正在开发中。目前仅支持助记词导入以创建完整的多链钱包。');
          setIsImporting(false);
          return;
        } catch (err: any) {
          setError(err.message || '私钥验证失败');
          setIsImporting(false);
          return;
        }
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || '导入钱包失败');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900">导入钱包</h1>
          <div className="w-16" />
        </div>

        {/* 主要内容 */}
        <div className="bg-white rounded-2xl p-6 space-y-6 shadow-lg">
          <div className="text-center">
            <div className="text-6xl mb-4">📥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">导入现有钱包</h2>
            <p className="text-gray-600">使用助记词或私钥恢复您的钱包</p>
          </div>

          {/* 导入方式选择 */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setImportMethod('mnemonic')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                importMethod === 'mnemonic'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              助记词导入
            </button>
            <button
              type="button"
              onClick={() => setImportMethod('privateKey')}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                importMethod === 'privateKey'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              私钥导入
            </button>
          </div>

          <form onSubmit={handleImport} className="space-y-6">
            {/* 助记词导入 */}
            {importMethod === 'mnemonic' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    助记词（12 或 24 个单词，用空格分隔）
                  </label>
                  <textarea
                    value={mnemonic}
                    onChange={(e) => setMnemonic(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                    placeholder="word1 word2 word3 ..."
                    rows={4}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    请输入 12 或 24 个单词的助记词，单词之间用空格分隔
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="font-semibold text-blue-700 mb-2">💡 助记词导入</div>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>支持标准 BIP39 助记词</li>
                    <li>自动派生所有支持的链（ETH/SOL/BTC/TRX）</li>
                    <li>创建完整的多链钱包</li>
                  </ul>
                </div>
              </>
            )}

            {/* 私钥导入 */}
            {importMethod === 'privateKey' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">选择链</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'ethereum' as ChainType, name: 'Ethereum', icon: '⟠' },
                      { id: 'solana' as ChainType, name: 'Solana', icon: '◎' },
                      { id: 'bitcoin' as ChainType, name: 'Bitcoin', icon: '₿' },
                      { id: 'tron' as ChainType, name: 'Tron', icon: '⚡' },
                    ].map((chain) => (
                      <button
                        key={chain.id}
                        type="button"
                        onClick={() => setSelectedChain(chain.id)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedChain === chain.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{chain.icon}</span>
                          <span className="font-semibold text-gray-900">{chain.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    私钥（{selectedChain === 'ethereum' ? '64位十六进制' : 
                           selectedChain === 'solana' ? 'Base58编码' :
                           selectedChain === 'bitcoin' ? 'WIF格式' : '64位十六进制'}）
                  </label>
                  <textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors font-mono text-sm"
                    placeholder={
                      selectedChain === 'ethereum' ? '0x...' :
                      selectedChain === 'solana' ? 'Base58 私钥' :
                      selectedChain === 'bitcoin' ? '5/K/L 开头的 WIF 私钥' :
                      '64位十六进制私钥'
                    }
                    rows={3}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedChain === 'ethereum' && 'Ethereum 私钥：64个十六进制字符，可选 0x 前缀'}
                    {selectedChain === 'solana' && 'Solana 私钥：Base58 编码，约88个字符'}
                    {selectedChain === 'bitcoin' && 'Bitcoin 私钥：WIF 格式，以 5/K/L 开头'}
                    {selectedChain === 'tron' && 'Tron 私钥：64个十六进制字符'}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="font-semibold text-yellow-700 mb-2">⚠️ 私钥导入限制</div>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                    <li>私钥导入仅支持单链钱包</li>
                    <li>无法派生其他链的地址</li>
                    <li>建议使用助记词导入以获得完整功能</li>
                    <li>私钥导入功能目前处于测试阶段</li>
                  </ul>
                </div>
              </>
            )}

            {/* 钱包名称 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">钱包名称</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="导入的钱包"
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">设置密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="至少 8 个字符"
              />
              {password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          validatePasswordStrength(password).strength === 'weak'
                            ? 'bg-red-500 w-1/3'
                            : validatePasswordStrength(password).strength === 'medium'
                            ? 'bg-yellow-500 w-2/3'
                            : 'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {validatePasswordStrength(password).strength === 'weak'
                        ? '弱'
                        : validatePasswordStrength(password).strength === 'medium'
                        ? '中'
                        : '强'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {validatePasswordStrength(password).message}
                  </p>
                </div>
              )}
            </div>

            {/* 确认密码 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="再次输入密码"
              />
            </div>

            {/* 安全提示 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  我已理解此钱包使用浏览器 localStorage 存储加密数据，
                  仅适用于测试目的，不应存储大额资产。
                  我将仅在测试网络使用此钱包。
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isImporting || 
                (importMethod === 'mnemonic' ? !mnemonic : !privateKey) ||
                !password || 
                !confirmPassword || 
                !agreedToTerms
              }
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
            >
              {isImporting ? '导入中...' : '导入钱包'}
            </button>
          </form>

          {/* 安全警告 */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="font-semibold text-red-600 mb-2">⚠️ 安全警告</div>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>请确保您在安全的环境中输入助记词</li>
              <li>不要在公共电脑或不受信任的设备上导入钱包</li>
              <li>导入后请立即验证钱包地址是否正确</li>
              <li>此功能仅用于测试，不要导入包含真实资产的钱包</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportWalletPage;
