/**
 * 解锁钱包页面（支持多钱包）
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWalletContext } from '../contexts/WalletContext';
import { MultiWalletManager } from '../lib/wallet/multiWalletManager';

export function UnlockWalletPage() {
  const navigate = useNavigate();
  const { unlockWallet } = useWalletContext();

  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState('');
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [activeWalletName, setActiveWalletName] = useState('');

  useEffect(() => {
    // 获取当前活动钱包
    const activeWallet = MultiWalletManager.getActiveWallet();
    if (activeWallet) {
      setActiveWalletId(activeWallet.id);
      setActiveWalletName(activeWallet.name);
    } else {
      // 如果没有活动钱包，跳转到钱包设置页面
      navigate('/wallet-setup');
    }
  }, [navigate]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('请输入密码');
      return;
    }

    if (!activeWalletId) {
      setError('未找到活动钱包');
      return;
    }

    setIsUnlocking(true);

    try {
      await unlockWallet(activeWalletId, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '密码错误');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-8 space-y-6 shadow-lg">
          {/* 图标 */}
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">解锁钱包</h1>
            {activeWalletName && (
              <p className="text-gray-600">解锁 "{activeWalletName}"</p>
            )}
          </div>

          {/* 表单 */}
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="输入密码"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isUnlocking || !password}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all"
            >
              {isUnlocking ? '解锁中...' : '解锁'}
            </button>
          </form>

          {/* 其他选项 */}
          <div className="text-center space-y-2">
            <button
              onClick={() => navigate('/wallets')}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors block w-full"
            >
              切换到其他钱包
            </button>
            <button
              onClick={() => navigate('/import-wallet')}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors block w-full"
            >
              导入其他钱包
            </button>
          </div>

          {/* 安全提示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-gray-700">
            <div className="font-semibold text-yellow-700 mb-1">⚠️ 安全提示</div>
            <p>请确保您在安全的环境中使用此钱包，不要在公共电脑上输入密码。</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnlockWalletPage;
