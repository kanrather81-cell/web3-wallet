/**
 * 钱包管理页面 - 多钱包列表和管理
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MultiWalletManager } from '../lib/wallet/multiWalletManager';
import type { WalletData } from '../lib/wallet/multiWalletManager';

export function WalletsPage() {
  const navigate = useNavigate();
  
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [activeWalletId, setActiveWalletId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [password, setPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [backupMnemonic, setBackupMnemonic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // 加载钱包列表
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = () => {
    const allWallets = MultiWalletManager.listWallets();
    const activeId = MultiWalletManager.getActiveWalletId();
    setWallets(allWallets);
    setActiveWalletId(activeId);
  };

  // 切换钱包
  const handleSwitchWallet = (walletId: string) => {
    if (walletId === activeWalletId) return;
    
    const success = MultiWalletManager.switchWallet(walletId);
    if (success) {
      setActiveWalletId(walletId);
      // 切换后需要重新解锁
      navigate('/unlock-wallet');
    }
  };

  // 打开删除对话框
  const handleDeleteClick = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setPassword('');
    setError('');
    setShowDeleteDialog(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!selectedWallet || !password) {
      setError('请输入密码');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      await MultiWalletManager.deleteWallet(selectedWallet.id, password);
      setShowDeleteDialog(false);
      setSelectedWallet(null);
      setPassword('');
      loadWallets();
      
      // 如果删除的是最后一个钱包，跳转到设置页面
      if (wallets.length === 1) {
        navigate('/wallet-setup');
      }
    } catch (err: any) {
      setError(err.message || '删除失败，请检查密码');
    } finally {
      setIsProcessing(false);
    }
  };

  // 打开备份对话框
  const handleBackupClick = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setPassword('');
    setBackupMnemonic('');
    setError('');
    setShowBackupDialog(true);
  };

  // 确认备份
  const handleConfirmBackup = async () => {
    if (!selectedWallet || !password) {
      setError('请输入密码');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { mnemonic } = await MultiWalletManager.backupWallet(selectedWallet.id, password);
      setBackupMnemonic(mnemonic);
    } catch (err: any) {
      setError(err.message || '备份失败，请检查密码');
    } finally {
      setIsProcessing(false);
    }
  };

  // 复制助记词
  const handleCopyMnemonic = () => {
    navigator.clipboard.writeText(backupMnemonic);
    alert('助记词已复制到剪贴板');
  };

  // 打开重命名对话框
  const handleRenameClick = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setNewName(wallet.name);
    setError('');
    setShowRenameDialog(true);
  };

  // 确认重命名
  const handleConfirmRename = () => {
    if (!selectedWallet || !newName.trim()) {
      setError('请输入钱包名称');
      return;
    }

    const success = MultiWalletManager.renameWallet(selectedWallet.id, newName.trim());
    if (success) {
      setShowRenameDialog(false);
      setSelectedWallet(null);
      setNewName('');
      loadWallets();
    } else {
      setError('重命名失败');
    }
  };

  // 格式化地址
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 计算链数量
  const getChainCount = (wallet: WalletData) => {
    return Object.values(wallet.addresses).filter(addr => addr).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">钱包管理</h1>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* 钱包列表 */}
        <div className="space-y-4 mb-6">
          {wallets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">👛</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">还没有钱包</h2>
              <p className="text-gray-600 mb-6">创建或导入一个钱包开始使用</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/create-wallet')}
                  className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  创建钱包
                </button>
                <button
                  onClick={() => navigate('/import-wallet')}
                  className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  导入钱包
                </button>
              </div>
            </div>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`bg-white rounded-2xl p-6 transition-all shadow-sm ${
                  wallet.id === activeWalletId
                    ? 'border-2 border-primary-500 shadow-md'
                    : 'border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  {/* 钱包信息 */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-3xl">
                        {wallet.id === activeWalletId ? '✅' : '👛'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{wallet.name}</h3>
                        {wallet.id === activeWalletId && (
                          <span className="text-xs text-primary-600">当前活动钱包</span>
                        )}
                      </div>
                    </div>

                    {/* 地址列表 */}
                    <div className="space-y-2 mb-4">
                      {wallet.addresses.ethereum && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">ETH:</span>
                          <span className="font-mono text-gray-900">{formatAddress(wallet.addresses.ethereum)}</span>
                        </div>
                      )}
                      {wallet.addresses.solana && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">SOL:</span>
                          <span className="font-mono text-gray-900">{formatAddress(wallet.addresses.solana)}</span>
                        </div>
                      )}
                      {wallet.addresses.bitcoin && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">BTC:</span>
                          <span className="font-mono text-gray-900">{formatAddress(wallet.addresses.bitcoin)}</span>
                        </div>
                      )}
                      {wallet.addresses.tron && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">TRX:</span>
                          <span className="font-mono text-gray-900">{formatAddress(wallet.addresses.tron)}</span>
                        </div>
                      )}
                    </div>

                    {/* 元数据 */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{getChainCount(wallet)} 条链</span>
                      <span>创建于 {new Date(wallet.createdAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex flex-col space-y-2 ml-4">
                    {wallet.id !== activeWalletId && (
                      <button
                        onClick={() => handleSwitchWallet(wallet.id)}
                        className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        切换
                      </button>
                    )}
                    <button
                      onClick={() => handleRenameClick(wallet)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      重命名
                    </button>
                    <button
                      onClick={() => handleBackupClick(wallet)}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      备份
                    </button>
                    <button
                      onClick={() => handleDeleteClick(wallet)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 添加钱包按钮 */}
        {wallets.length > 0 && (
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/create-wallet')}
              className="flex-1 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all"
            >
              + 创建新钱包
            </button>
            <button
              onClick={() => navigate('/import-wallet')}
              className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-semibold py-4 rounded-xl transition-all"
            >
              📥 导入钱包
            </button>
          </div>
        )}

        {/* 删除确认对话框 */}
        {showDeleteDialog && selectedWallet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">删除钱包</h2>
              <p className="text-gray-600 mb-4">
                确定要删除钱包 "{selectedWallet.name}" 吗？此操作无法撤销。
              </p>
              
              {!backupMnemonic && (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                    <p className="text-red-600 text-sm">
                      ⚠️ 删除前请确保已备份助记词，否则将永久失去访问权限
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">输入密码确认</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-gray-900"
                      placeholder="输入密码"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setSelectedWallet(null);
                        setPassword('');
                        setError('');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      disabled={isProcessing || !password}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-colors"
                    >
                      {isProcessing ? '删除中...' : '确认删除'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 备份对话框 */}
        {showBackupDialog && selectedWallet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">备份钱包</h2>
              
              {!backupMnemonic ? (
                <>
                  <p className="text-gray-600 mb-4">
                    输入密码以导出 "{selectedWallet.name}" 的助记词
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">密码</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-gray-900"
                      placeholder="输入密码"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setShowBackupDialog(false);
                        setSelectedWallet(null);
                        setPassword('');
                        setError('');
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleConfirmBackup}
                      disabled={isProcessing || !password}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-colors"
                    >
                      {isProcessing ? '导出中...' : '导出助记词'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                    <p className="text-yellow-700 text-sm">
                      ⚠️ 请妥善保管助记词，不要泄露给任何人
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="grid grid-cols-3 gap-3">
                      {backupMnemonic.split(' ').map((word, index) => (
                        <div key={index} className="bg-white rounded-lg p-2 text-center border border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">{index + 1}</div>
                          <div className="font-mono text-sm text-gray-900">{word}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleCopyMnemonic}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl transition-colors"
                    >
                      📋 复制
                    </button>
                    <button
                      onClick={() => {
                        setShowBackupDialog(false);
                        setSelectedWallet(null);
                        setPassword('');
                        setBackupMnemonic('');
                        setError('');
                      }}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl transition-colors"
                    >
                      完成
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 重命名对话框 */}
        {showRenameDialog && selectedWallet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">重命名钱包</h2>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">新名称</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 transition-colors text-gray-900"
                  placeholder="输入新名称"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowRenameDialog(false);
                    setSelectedWallet(null);
                    setNewName('');
                    setError('');
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmRename}
                  disabled={!newName.trim()}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletsPage;
