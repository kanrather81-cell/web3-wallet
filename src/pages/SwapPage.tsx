import { ArrowLeftRight, ExternalLink, ArrowDownUp } from 'lucide-react';

export function SwapPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header - TP Style */}
      <div className="bg-gradient-tp text-white px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <ArrowLeftRight className="w-7 h-7" />
          <h1 className="text-2xl font-bold">兑换</h1>
        </div>
        <p className="text-sm opacity-90">跨链代币兑换，获取最优汇率</p>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Swap Interface - TP Style */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* From Token */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">支付</label>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <select className="bg-transparent text-gray-900 text-lg font-semibold outline-none">
                  <option>ETH</option>
                  <option>MATIC</option>
                  <option>USDC</option>
                  <option>USDT</option>
                </select>
                <span className="text-sm text-gray-500">余额: 0.00</span>
              </div>
              <input
                type="number"
                placeholder="0.0"
                className="w-full bg-transparent text-gray-900 text-2xl font-semibold outline-none placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center -my-2 relative z-10">
            <button className="p-3 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors shadow-md">
              <ArrowDownUp className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">接收</label>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <select className="bg-transparent text-gray-900 text-lg font-semibold outline-none">
                  <option>USDC</option>
                  <option>USDT</option>
                  <option>ETH</option>
                  <option>MATIC</option>
                </select>
                <span className="text-sm text-gray-500">余额: 0.00</span>
              </div>
              <input
                type="number"
                placeholder="0.0"
                className="w-full bg-transparent text-gray-900 text-2xl font-semibold outline-none placeholder:text-gray-300"
                disabled
              />
            </div>
          </div>

          {/* Swap Button */}
          <button className="w-full mt-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-md">
            连接钱包进行兑换
          </button>
        </div>

        {/* External Link to LI.FI */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <a
            href="https://jumper.exchange/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between group"
          >
            <div>
              <p className="text-blue-900 font-medium">使用 LI.FI Jumper</p>
              <p className="text-blue-600 text-sm">完整的跨链兑换功能</p>
            </div>
            <ExternalLink className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
          </a>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 px-1">功能特点</h2>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🔄</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">跨链兑换</h3>
                <p className="text-gray-600 text-sm">
                  支持 Ethereum、Polygon、Optimism、Arbitrum 和 Base
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">最优汇率</h3>
                <p className="text-gray-600 text-sm">
                  自动从多个 DEX 中找到最佳兑换汇率
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">快速安全</h3>
                <p className="text-gray-600 text-sm">
                  快速交易，智能合约安全执行
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
          <p className="text-yellow-800 text-sm">
            ℹ️ 这是一个占位界面。完整的兑换功能请访问{' '}
            <a
              href="https://jumper.exchange/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900 font-medium"
            >
              LI.FI Jumper
            </a>
            {' '}或集成 LI.FI Widget SDK。
          </p>
        </div>
      </div>
    </div>
  );
}
