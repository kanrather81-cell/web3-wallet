/**
 * 多链交易确认组件
 * 支持 EVM、Solana、Bitcoin、Tron 链的交易确认
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import type { ChainType } from '../lib/wallet/transaction';

export interface MultiChainTransactionDetails {
  chain: ChainType;
  chainName: string;
  chainIcon: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  tokenAddress?: string;
  estimatedFee?: string;
  feeToken?: string;
  gasPrice?: string;
  gasLimit?: string;
}

interface MultiChainTransactionConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  details: MultiChainTransactionDetails;
  isLoading?: boolean;
}

export function MultiChainTransactionConfirm({
  open,
  onClose,
  onConfirm,
  details,
  isLoading = false,
}: MultiChainTransactionConfirmProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    setIsConfirming(true);

    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || '交易确认失败');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    if (isConfirming) return;
    setError('');
    onClose();
  };

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">确认交易</DialogTitle>
          <DialogDescription className="text-gray-400">
            请仔细核对交易信息，确认无误后点击确认按钮
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 链信息 */}
          <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            <span className="text-3xl">{details.chainIcon}</span>
            <div>
              <div className="text-sm text-gray-400">目标链</div>
              <div className="text-white font-semibold">{details.chainName}</div>
            </div>
          </div>

          {/* 交易详情 */}
          <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
            {/* 发送地址 */}
            <div>
              <div className="text-sm text-gray-400 mb-1">发送地址</div>
              <div className="text-white font-mono text-sm break-all bg-gray-900/50 p-2 rounded">
                {formatAddress(details.from)}
              </div>
            </div>

            {/* 箭头 */}
            <div className="flex justify-center">
              <div className="text-gray-500">↓</div>
            </div>

            {/* 接收地址 */}
            <div>
              <div className="text-sm text-gray-400 mb-1">接收地址</div>
              <div className="text-white font-mono text-sm break-all bg-gray-900/50 p-2 rounded">
                {formatAddress(details.to)}
              </div>
            </div>

            {/* 分隔线 */}
            <div className="border-t border-gray-700 my-3" />

            {/* 金额 */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">转账金额</div>
              <div className="text-white font-semibold text-lg">
                {details.amount} {details.token}
              </div>
            </div>

            {/* 代币合约地址（如果有） */}
            {details.tokenAddress && (
              <div>
                <div className="text-sm text-gray-400 mb-1">代币合约</div>
                <div className="text-gray-300 font-mono text-xs break-all bg-gray-900/50 p-2 rounded">
                  {formatAddress(details.tokenAddress)}
                </div>
              </div>
            )}

            {/* Gas 费用 */}
            {details.estimatedFee && (
              <div className="pt-2 border-t border-gray-700 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">预估手续费</div>
                  <div className="text-gray-300 font-mono text-sm">
                    {details.estimatedFee} {details.feeToken || details.token}
                  </div>
                </div>
                
                {/* Gas 详情 */}
                {details.gasPrice && (
                  <div className="text-xs text-gray-500 space-y-1">
                    {details.chain === 'ethereum' && (
                      <>
                        <div className="flex justify-between">
                          <span>Gas Price:</span>
                          <span className="font-mono">{details.gasPrice} Gwei</span>
                        </div>
                        {details.gasLimit && (
                          <div className="flex justify-between">
                            <span>Gas Limit:</span>
                            <span className="font-mono">{details.gasLimit}</span>
                          </div>
                        )}
                      </>
                    )}
                    {details.chain === 'solana' && (
                      <div className="flex justify-between">
                        <span>Fee:</span>
                        <span className="font-mono">{details.gasPrice} Lamports</span>
                      </div>
                    )}
                    {details.chain === 'bitcoin' && (
                      <div className="flex justify-between">
                        <span>Fee Rate:</span>
                        <span className="font-mono">{details.gasPrice} sat/vB</span>
                      </div>
                    )}
                    {details.chain === 'tron' && (
                      <div className="flex justify-between">
                        <span>Energy/Bandwidth:</span>
                        <span className="font-mono">{details.gasPrice} Sun</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 警告提示 */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 text-lg">⚠️</span>
              <div className="text-sm text-yellow-400 space-y-1">
                <div>• 请仔细核对接收地址，转账无法撤销</div>
                <div>• 确保接收地址支持该链和代币</div>
                <div>• 交易需要支付网络手续费</div>
              </div>
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="text-red-400 text-sm">❌ {error}</div>
            </div>
          )}

          {/* 签名状态 */}
          {isConfirming && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <div className="text-blue-400 text-sm">
                  正在签名交易，请在钱包中确认...
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isConfirming}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={isConfirming || isLoading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-all font-medium flex items-center justify-center gap-2"
            >
              {isConfirming ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  签名中...
                </>
              ) : (
                <>
                  <span>✓</span>
                  确认发送
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MultiChainTransactionConfirm;
