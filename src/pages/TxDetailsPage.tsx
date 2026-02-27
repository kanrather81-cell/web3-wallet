/**
 * 交易详情页面
 * 显示完整的交易信息和实时状态
 */

import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { TransactionStatus } from '../components/TransactionStatus';
import type { ChainType } from '../lib/wallet/transaction';
import { TransactionHistoryManager } from '../lib/wallet/history';
import { useEffect, useState } from 'react';
import type { TransactionRecord } from '../lib/wallet/history';

// 支持的链列表
const CHAIN_INFO: Record<ChainType, { name: string; icon: string; symbol: string }> = {
  ethereum: { name: 'Ethereum', icon: '⟠', symbol: 'ETH' },
  solana: { name: 'Solana', icon: '◎', symbol: 'SOL' },
  bitcoin: { name: 'Bitcoin', icon: '₿', symbol: 'BTC' },
  tron: { name: 'Tron', icon: '⚡', symbol: 'TRX' },
};

export function TxDetailsPage() {
  const navigate = useNavigate();
  const { txHash } = useParams<{ txHash: string }>();
  const [searchParams] = useSearchParams();
  const chain = (searchParams.get('chain') || 'ethereum') as ChainType;

  const [transaction, setTransaction] = useState<TransactionRecord | null>(null);

  // 从本地存储加载交易记录
  useEffect(() => {
    if (txHash) {
      const tx = TransactionHistoryManager.getTransactionByHash(txHash);
      setTransaction(tx);
    }
  }, [txHash]);

  if (!txHash) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl text-gray-900">交易哈希无效</div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const chainInfo = CHAIN_INFO[chain];

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">交易详情</h1>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* 链信息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{chainInfo.icon}</span>
            <div>
              <div className="text-sm text-gray-600">区块链</div>
              <div className="text-2xl font-bold text-gray-900">{chainInfo.name}</div>
            </div>
          </div>
        </div>

        {/* 交易状态 */}
        <div>
          <div className="text-sm text-gray-600 font-medium mb-3">交易状态</div>
          <TransactionStatus
            txHash={txHash}
            chain={chain}
            autoRefresh={true}
            showConfirmations={true}
            showExplorerLink={true}
          />
        </div>

        {/* 交易哈希 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-sm text-gray-600 font-medium mb-2">交易哈希</div>
          <div className="font-mono text-sm break-all bg-gray-50 p-3 rounded-lg text-gray-900">
            {txHash}
          </div>
        </div>

        {/* 交易详情 */}
        {transaction && (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="text-lg font-semibold text-gray-900 mb-4">交易信息</div>

            {/* 发送地址 */}
            <div>
              <div className="text-sm text-gray-600 font-medium mb-2">发送地址</div>
              <div className="font-mono text-sm bg-gray-50 p-3 rounded-lg break-all text-gray-900">
                {transaction.from}
              </div>
            </div>

            {/* 箭头 */}
            <div className="flex justify-center">
              <div className="text-2xl text-gray-400">↓</div>
            </div>

            {/* 接收地址 */}
            <div>
              <div className="text-sm text-gray-600 font-medium mb-2">接收地址</div>
              <div className="font-mono text-sm bg-gray-50 p-3 rounded-lg break-all text-gray-900">
                {transaction.to}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-100 my-4" />

            {/* 金额 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">转账金额</div>
              <div className="text-xl font-semibold text-gray-900">
                {transaction.amount} {transaction.token}
              </div>
            </div>

            {/* 代币合约地址 */}
            {transaction.tokenAddress && (
              <div>
                <div className="text-sm text-gray-600 font-medium mb-2">代币合约</div>
                <div className="font-mono text-xs text-gray-700 bg-gray-50 p-3 rounded-lg break-all">
                  {transaction.tokenAddress}
                </div>
              </div>
            )}

            {/* Gas 费用 */}
            {transaction.gasFee && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-600">手续费</div>
                <div className="font-mono text-sm text-gray-700">
                  {transaction.gasFee} {transaction.feeToken || transaction.token}
                </div>
              </div>
            )}

            {/* 时间戳 */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="text-sm text-gray-600">交易时间</div>
              <div className="text-sm text-gray-700">
                {formatTime(transaction.timestamp)}
              </div>
            </div>
          </div>
        )}

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• 交易状态会自动刷新，直到交易完成</div>
              <div>• 点击"查看详情"可在区块浏览器中查看完整信息</div>
              <div>• 不同链的确认时间和确认数要求不同</div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/history')}
            className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 rounded-xl transition-colors font-medium shadow-sm"
          >
            查看历史记录
          </button>
          <button
            onClick={() => navigate('/send')}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-md"
          >
            发送新交易
          </button>
        </div>
      </div>
    </div>
  );
}

export default TxDetailsPage;
