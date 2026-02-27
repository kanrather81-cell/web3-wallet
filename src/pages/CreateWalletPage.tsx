/**
 * 创建钱包页面 - 多步骤流程
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiWalletManager } from '../lib/wallet/multiWalletManager';
import { validatePasswordStrength } from '../lib/wallet/encryption';
import { useWalletContext } from '../contexts/WalletContext';

type Step = 'generate' | 'verify' | 'password' | 'complete';

export function CreateWalletPage() {
  const navigate = useNavigate();
  const { createWallet } = useWalletContext();

  const [step, setStep] = useState<Step>('generate');
  const [mnemonic, setMnemonic] = useState('');
  const [mnemonicWords, setMnemonicWords] = useState<string[]>([]);
  const [verifyIndexes, setVerifyIndexes] = useState<number[]>([]);
  const [verifyInputs, setVerifyInputs] = useState<string[]>(['', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [walletName, setWalletName] = useState('我的钱包');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // 步骤 1: 生成助记词
  const handleGenerate = () => {
    const newMnemonic = MultiWalletManager.generateMnemonic();
    setMnemonic(newMnemonic);
    const words = newMnemonic.split(' ');
    setMnemonicWords(words);

    // 随机选择 3 个单词用于验证
    const indexes: number[] = [];
    while (indexes.length < 3) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (!indexes.includes(randomIndex)) {
        indexes.push(randomIndex);
      }
    }
    setVerifyIndexes(indexes.sort((a, b) => a - b));

    setStep('verify');
  };

  // 步骤 2: 验证助记词
  const handleVerify = () => {
    setError('');

    // 检查验证输入
    for (let i = 0; i < verifyIndexes.length; i++) {
      const expectedWord = mnemonicWords[verifyIndexes[i]];
      const inputWord = verifyInputs[i].trim().toLowerCase();

      if (inputWord !== expectedWord) {
        setError(`第 ${verifyIndexes[i] + 1} 个单词不正确`);
        return;
      }
    }

    setStep('password');
  };

  // 步骤 3: 设置密码并创建钱包
  const handleCreateWallet = async () => {
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

    setIsCreating(true);

    try {
      await createWallet(walletName, mnemonic, password);
      setStep('complete');
    } catch (err: any) {
      setError(err.message || '创建钱包失败');
    } finally {
      setIsCreating(false);
    }
  };

  // 复制助记词
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(mnemonic);
    alert('助记词已复制到剪贴板');
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
          <h1 className="text-2xl font-bold text-gray-900">创建钱包</h1>
          <div className="w-16" />
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center mb-8 space-x-4">
          <div className={`flex items-center ${step === 'generate' || step === 'verify' || step === 'password' || step === 'complete' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">1</div>
            <span className="ml-2 text-sm">生成</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className={`flex items-center ${step === 'verify' || step === 'password' || step === 'complete' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">2</div>
            <span className="ml-2 text-sm">验证</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-300" />
          <div className={`flex items-center ${step === 'password' || step === 'complete' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center">3</div>
            <span className="ml-2 text-sm">密码</span>
          </div>
        </div>

        {/* 步骤 1: 生成助记词 */}
        {step === 'generate' && (
          <div className="bg-white rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-6xl">🔐</div>
              <h2 className="text-2xl font-bold text-gray-900">创建新钱包</h2>
              <p className="text-gray-600">
                我们将为您生成一个 12 个单词的助记词
              </p>
            </div>

            {/* 安全警告 */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
              <div className="font-semibold text-red-600">⚠️ 重要安全提示</div>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>助记词是恢复钱包的唯一方式，请妥善保管</li>
                <li>不要将助记词告诉任何人</li>
                <li>不要在网络上传输或存储助记词</li>
                <li>建议手写备份并保存在安全的地方</li>
                <li>此钱包仅用于测试，不要存储大额资产</li>
              </ul>
            </div>

            <button
              onClick={handleGenerate}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl transition-all"
            >
              生成助记词
            </button>
          </div>
        )}

        {/* 步骤 2: 显示并验证助记词 */}
        {step === 'verify' && (
          <div className="bg-white rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">备份助记词</h2>
              <p className="text-gray-600">请按顺序抄写下面的 12 个单词</p>
            </div>

            {/* 助记词显示 */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-3 gap-4">
                {mnemonicWords.map((word, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-3 text-center border border-gray-200"
                  >
                    <div className="text-xs text-gray-500 mb-1">{index + 1}</div>
                    <div className="font-mono font-semibold text-gray-900">{word}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopyMnemonic}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 py-3 rounded-xl transition-colors"
            >
              📋 复制助记词
            </button>

            {/* 验证输入 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">验证助记词</h3>
              <p className="text-sm text-gray-600 mb-4">
                请输入以下位置的单词以验证您已正确备份
              </p>

              <div className="space-y-4">
                {verifyIndexes.map((wordIndex, i) => (
                  <div key={i}>
                    <label className="block text-sm text-gray-600 mb-2">
                      第 {wordIndex + 1} 个单词
                    </label>
                    <input
                      type="text"
                      value={verifyInputs[i]}
                      onChange={(e) => {
                        const newInputs = [...verifyInputs];
                        newInputs[i] = e.target.value;
                        setVerifyInputs(newInputs);
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors"
                      placeholder="输入单词"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep('generate')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-xl transition-colors"
              >
                重新生成
              </button>
              <button
                onClick={handleVerify}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl transition-all"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* 步骤 3: 设置密码 */}
        {step === 'password' && (
          <div className="bg-white rounded-2xl p-6 space-y-6 shadow-lg">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">设置密码</h2>
              <p className="text-gray-600">密码用于加密保护您的钱包</p>
            </div>

            {/* 钱包名称 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">钱包名称</label>
              <input
                type="text"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="我的钱包"
              />
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">密码</label>
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

            <div className="flex space-x-4">
              <button
                onClick={() => setStep('verify')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-4 rounded-xl transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleCreateWallet}
                disabled={isCreating || !password || !confirmPassword || !agreedToTerms}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
              >
                {isCreating ? '创建中...' : '创建钱包'}
              </button>
            </div>
          </div>
        )}

        {/* 步骤 4: 完成 */}
        {step === 'complete' && (
          <div className="bg-white rounded-2xl p-6 space-y-6 text-center shadow-lg">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-gray-900">钱包创建成功！</h2>
            <p className="text-gray-600">
              您的多链钱包已创建完成，现在可以开始使用了
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
              <div className="font-semibold text-gray-900 mb-2">💡 下一步</div>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>前往资产页面查看您的钱包地址</li>
                <li>从水龙头获取测试币</li>
                <li>开始体验多链转账功能</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl transition-all"
            >
              开始使用
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateWalletPage;
