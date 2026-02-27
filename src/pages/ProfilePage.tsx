import { useNavigate } from 'react-router-dom';
import { User, Wallet, Settings, History, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ProfilePage() {
  const navigate = useNavigate();
  
  // 暂时简化,避免使用 WalletContext
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    const address = localStorage.getItem('ethereum_address') || '';
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = () => {
    // 简化的退出逻辑
    localStorage.clear();
    navigate('/wallet-setup');
  };

  const menuItems = [
    {
      icon: Wallet,
      label: '钱包管理',
      description: '切换或导出钱包',
      onClick: () => navigate('/wallets'),
    },
    {
      icon: History,
      label: '交易历史',
      description: '查看所有交易记录',
      onClick: () => navigate('/history'),
    },
    {
      icon: Settings,
      label: '设置',
      description: '应用设置和偏好',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-2">我的</h1>
        
        {/* Wallet Address */}
        {localStorage.getItem('ethereum_address') && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
            <p className="text-white/70 text-sm mb-2">当前钱包地址 (Ethereum)</p>
            <div className="flex items-center justify-between">
              <p className="text-white font-mono text-sm">
                {localStorage.getItem('ethereum_address')?.slice(0, 6)}...{localStorage.getItem('ethereum_address')?.slice(-4)}
              </p>
              <button
                onClick={handleCopyAddress}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-4 hover:bg-gray-700/50 transition-all"
          >
            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <item.icon className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-white font-semibold">{item.label}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-red-600/30 transition-all"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-semibold">退出登录</span>
        </button>
      </div>

      {/* Version Info */}
      <div className="text-center text-gray-500 text-sm p-4">
        <p>Web3 Wallet v0.0.0</p>
      </div>
    </div>
  );
}

export default ProfilePage;
