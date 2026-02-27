/**
 * 钱包设置页面 - 首次使用引导
 */

import { useNavigate } from 'react-router-dom';

export function WalletSetupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">欢迎使用多链钱包</h1>
          <p className="text-gray-600 text-lg">
            开始之前，请创建或导入您的钱包
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 创建新钱包 */}
          <div className="bg-white rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary-500"
            onClick={() => navigate('/create-wallet')}
          >
            <div className="text-5xl mb-4">✨</div>
            <h2 className="text-2xl font-bold text-gray-900">创建新钱包</h2>
            <p className="text-gray-600">
              生成一个全新的多链钱包，支持 Ethereum、Solana、Bitcoin、Tron
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ 自动生成助记词</li>
              <li>✓ 支持多条区块链</li>
              <li>✓ 加密存储在本地</li>
            </ul>
            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all mt-4">
              创建钱包
            </button>
          </div>

          {/* 导入现有钱包 */}
          <div className="bg-white rounded-2xl p-8 space-y-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-500"
            onClick={() => navigate('/import-wallet')}
          >
            <div className="text-5xl mb-4">📥</div>
            <h2 className="text-2xl font-bold text-gray-900">导入现有钱包</h2>
            <p className="text-gray-600">
              使用助记词恢复您的钱包，访问您的资产
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ 使用 12 个单词恢复</li>
              <li>✓ 兼容标准 BIP39</li>
              <li>✓ 安全加密存储</li>
            </ul>
            <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-xl transition-all mt-4">
              导入钱包
            </button>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="font-semibold text-yellow-700 mb-2">重要安全提示</div>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 此钱包使用浏览器 localStorage 存储加密数据</li>
                <li>• 仅适用于测试目的，不应存储大额资产</li>
                <li>• 建议仅在测试网络（Testnet）使用</li>
                <li>• 请妥善保管您的助记词和密码</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用外部钱包 */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm mb-2">
            已有 MetaMask、Phantom 等钱包？
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 hover:text-primary-700 transition-colors text-sm"
          >
            直接使用外部钱包连接 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default WalletSetupPage;
