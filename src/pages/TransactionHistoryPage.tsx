/**
 * 交易历史页面 - TP 钱包风格
 */

import { MultiChainTransactionHistory } from '../components/MultiChainTransactionHistory';

export function TransactionHistoryPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">交易历史</h1>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-6">
        <MultiChainTransactionHistory />
      </div>
    </div>
  );
}

export default TransactionHistoryPage;
