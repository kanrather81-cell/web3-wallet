/**
 * 发送页面 - 多链转账功能
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useSendTransaction } from '../lib/hooks/useSendTransaction';
import type { SendTransactionParams } from '../lib/hooks/useSendTransaction';
import type { ChainType } from '../lib/wallet/transaction';
import { MultiChainTransactionConfirm } from '../components/MultiChainTransactionConfirm';
import type { MultiChainTransactionDetails } from '../components/MultiChainTransactionConfirm';
import { TransactionHistoryManager } from '../lib/wallet/history';
import { GasSelector } from '../components/GasSelector';
import type { GasSpeed } from '../lib/wallet/gas';

// 支持的链列表
const SUPPORTED_CHAINS = [
  { id: 'ethereum' as ChainType, name: 'Ethereum', symbol: 'ETH', icon: '⟠' },
  { id: 'solana' as ChainType, name: 'Solana', symbol: 'SOL', icon: '◎' },
  { id: 'bitcoin' as ChainType, name: 'Bitcoin', symbol: 'BTC', icon: '₿' },
  { id: 'tron' as ChainType, name: 'Tron', symbol: 'TRX', icon: '⚡' },
];

export function SendPage() {
  const navigate = useNavigate();
  const { chainId: urlChainId, tokenAddress: urlTokenAddress } = useParams<{ chainId?: string; tokenAddress?: string }>();
  const { address: evmAddress } = useAccount();
  const { publicKey: solanaPublicKey } = useSolanaWallet();
  
  const [selectedChain, setSelectedChain] = useState<ChainType>(urlChainId as ChainType || 'ethereum');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState(urlTokenAddress || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<SendTransactionParams | null>(null);
  
  // Gas 相关状态
  const [, setGasSpeed] = useState<GasSpeed>('standard');
  const [gasPrice, setGasPrice] = useState<string>('');
  const [gasLimit, setGasLimit] = useState<string>('');

  const { send, loading, error, txHash, reset } = useSendTransaction();

  // 获取当前链的钱包地址
  const getWalletAddress = () => {
    try {
       
      const { getSafeWindowProp } = require('../lib/utils/safeWindow');
      switch (selectedChain) {
        case 'ethereum':
          return evmAddress;
        case 'solana':
          return solanaPublicKey?.toBase58();
        case 'bitcoin':
          return getSafeWindowProp('unisat')?.getAccounts?.()?.[0];
        case 'tron':
          return getSafeWindowProp('tronWeb')?.defaultAddress?.base58;
        default:
          return null;
      }
    } catch (e) {
       
      console.warn('getWalletAddress safe read failed', e);
      return null;
    }
  };

  const walletAddress = getWalletAddress();
  const isConnected = !!walletAddress;

  // 处理 Gas 变化
  const handleGasChange = (speed: GasSpeed, price: string, limit?: string) => {
    setGasSpeed(speed);
    setGasPrice(price);
    if (limit) {
      setGasLimit(limit);
    }
  };

  // 计算预估手续费
  const calculateEstimatedFee = (): string => {
    if (!gasPrice) return '~0.001';
    
    try {
      const price = parseFloat(gasPrice);
      const limit = parseFloat(gasLimit || '21000');
      
      // 根据链类型计算
      switch (selectedChain) {
        case 'ethereum':
          // gwei * gasLimit / 10^9 = ETH
          return (price * limit / 1e9).toFixed(6);
        case 'solana':
          // lamports / 10^9 = SOL
          return (price / 1e9).toFixed(6);
        case 'bitcoin':
          // sat/vB * 估算交易大小 / 10^8 = BTC
          return (price * 250 / 1e8).toFixed(6);
        case 'tron':
          // sun / 10^6 = TRX
          return (price / 1e6).toFixed(6);
        default:
          return '~0.001';
      }
    } catch {
      return '~0.001';
    }
  };

  // 准备交易确认详情
  const getTransactionDetails = (): MultiChainTransactionDetails | null => {
    if (!walletAddress || !recipient || !amount) return null;

    const selectedChainData = SUPPORTED_CHAINS.find(c => c.id === selectedChain);
    if (!selectedChainData) return null;

    return {
      chain: selectedChain,
      chainName: selectedChainData.name,
      chainIcon: selectedChainData.icon,
      from: walletAddress,
      to: recipient,
      amount,
      token: selectedChainData.symbol,
      tokenAddress: tokenAddress || undefined,
      estimatedFee: calculateEstimatedFee(),
      feeToken: selectedChainData.symbol,
      gasPrice,
      gasLimit,
    };
  };

  // 处理发送按钮点击 - 显示确认对话框
  const handleSendClick = () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    if (!recipient || !amount) {
      alert('请填写接收地址和金额');
      return;
    }

    // 准备交易参数
    const params: SendTransactionParams = {
      chain: selectedChain,
      to: recipient,
      amount,
      tokenAddress: tokenAddress || undefined,
    };

    setPendingTransaction(params);
    setShowConfirmDialog(true);
  };

  // 确认发送 - 执行实际交易
  const handleConfirmSend = async () => {
    if (!pendingTransaction || !walletAddress) return;

    try {
      const result = await send(pendingTransaction);
      const txHash = result.hash || result.signature;

      // 保存交易记录到本地
      if (txHash) {
        const selectedChainData = SUPPORTED_CHAINS.find(c => c.id === selectedChain);
        TransactionHistoryManager.addTransaction({
          hash: txHash,
          chain: selectedChain,
          chainName: selectedChainData?.name || selectedChain,
          from: walletAddress,
          to: pendingTransaction.to,
          amount: pendingTransaction.amount,
          token: selectedChainData?.symbol || 'Unknown',
          tokenAddress: pendingTransaction.tokenAddress,
          status: 'pending', // 初始状态为 pending
          gasFee: calculateEstimatedFee(),
          feeToken: selectedChainData?.symbol,
        });

        // 跳转到交易详情页面
        navigate(`/tx/${txHash}?chain=${selectedChain}`);
      }

      setShowConfirmDialog(false);
      setPendingTransaction(null);
      // 清空表单
      setRecipient('');
      setAmount('');
      setTokenAddress('');
    } catch (err: any) {
      console.error('发送失败:', err);
      // 错误会在 useSendTransaction 中处理
      throw err;
    }
  };

  // 取消确认
  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingTransaction(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">发送</h1>
      </div>

      {/* 主要内容 */}
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          {/* 选择链 */}
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-3">选择链</label>
            <div className="grid grid-cols-2 gap-3">
              {SUPPORTED_CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setSelectedChain(chain.id);
                    reset();
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedChain === chain.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{chain.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{chain.name}</div>
                      <div className="text-sm text-gray-500">{chain.symbol}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 钱包状态 */}
          {isConnected ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-sm text-gray-600 mb-1">当前钱包</div>
              <div className="font-mono text-sm break-all text-gray-900">{walletAddress}</div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <div className="text-yellow-700">⚠️ 请先连接 {SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.name} 钱包</div>
            </div>
          )}

          {/* 接收地址 */}
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-2">接收地址</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="输入接收地址"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-colors font-mono text-sm text-gray-900"
            />
          </div>

          {/* 金额 */}
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-2">金额</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.000001"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-20 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-colors text-lg text-gray-900"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                {SUPPORTED_CHAINS.find(c => c.id === selectedChain)?.symbol}
              </div>
            </div>
          </div>

          {/* Gas 费用选择器 */}
          <div className="border-t border-gray-100 pt-6">
            <GasSelector
              chain={selectedChain}
              onGasChange={handleGasChange}
              context={{
                provider: (window as any).ethereum,
                connection: (window as any).solana?.connection,
              }}
              defaultSpeed="standard"
            />
          </div>

          {/* 高级选项 */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary-600 hover:text-primary-700 transition-colors font-medium"
            >
              {showAdvanced ? '隐藏' : '显示'}高级选项 {showAdvanced ? '▲' : '▼'}
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 font-medium mb-2">
                    代币合约地址（可选）
                  </label>
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="留空表示发送原生币"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100 transition-colors font-mono text-sm text-gray-900"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    填写此项可发送 ERC20/SPL/TRC20 代币
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="text-red-600">❌ {error}</div>
            </div>
          )}

          {/* 成功信息 */}
          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="text-green-600 mb-2 font-medium">✅ 交易已发送</div>
              <div className="text-sm text-gray-600 break-all">
                交易哈希: {txHash}
              </div>
            </div>
          )}

          {/* 发送按钮 */}
          <button
            onClick={handleSendClick}
            disabled={loading || !isConnected || !recipient || !amount}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
          >
            {loading ? '发送中...' : '发送'}
          </button>

          {/* 提示信息 */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <div>⚠️ 请仔细核对接收地址，转账无法撤销</div>
            <div>💡 建议先发送小额测试</div>
          </div>
        </div>

        {/* 交易确认对话框 */}
        {pendingTransaction && getTransactionDetails() && (
          <MultiChainTransactionConfirm
            open={showConfirmDialog}
            onClose={handleCancelConfirm}
            onConfirm={handleConfirmSend}
            details={getTransactionDetails()!}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default SendPage;
