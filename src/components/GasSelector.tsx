/**
 * Gas 选择器组件
 * 支持三种档位选择和自定义输入
 */

import { useState, useEffect } from 'react';
import { getGasPrice, formatGasPrice, validateGasPrice } from '../lib/wallet/gas';
import type { ChainType } from '../lib/wallet/transaction';
import type { GasSpeed, GasEstimate } from '../lib/wallet/gas';

interface GasSelectorProps {
  chain: ChainType;
  onGasChange: (speed: GasSpeed, gasPrice: string, gasLimit?: string) => void;
  context?: any; // provider, connection, tronWeb 等
  defaultSpeed?: GasSpeed;
}

export function GasSelector({
  chain,
  onGasChange,
  context,
  defaultSpeed = 'standard',
}: GasSelectorProps) {
  const [estimate, setEstimate] = useState<GasEstimate | null>(null);
  const [selectedSpeed, setSelectedSpeed] = useState<GasSpeed>(defaultSpeed);
  const [isCustom, setIsCustom] = useState(false);
  const [customGasPrice, setCustomGasPrice] = useState('');
  const [customGasLimit, setCustomGasLimit] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 加载 Gas 估算
  useEffect(() => {
    loadGasEstimate();
  }, [chain]);

  const loadGasEstimate = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const gasEstimate = await getGasPrice(chain, context);
      setEstimate(gasEstimate);
      
      // 设置默认值
      if (gasEstimate.gasLimit) {
        setCustomGasLimit(gasEstimate.gasLimit);
      }
      
      // 通知父组件
      onGasChange(
        selectedSpeed,
        gasEstimate.gasPrice[selectedSpeed],
        gasEstimate.gasLimit
      );
    } catch (err: any) {
      console.error('加载 Gas 估算失败:', err);
      setError('加载 Gas 估算失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理档位选择
  const handleSpeedChange = (speed: GasSpeed) => {
    if (!estimate) return;
    
    setSelectedSpeed(speed);
    setIsCustom(false);
    setError('');
    
    onGasChange(speed, estimate.gasPrice[speed], estimate.gasLimit);
  };

  // 处理自定义输入
  const handleCustomChange = () => {
    if (!estimate) return;
    
    const validation = validateGasPrice(customGasPrice, estimate);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }
    
    setError('');
    onGasChange('standard', customGasPrice, customGasLimit || estimate.gasLimit);
  };

  // 切换到自定义模式
  const enableCustomMode = () => {
    if (!estimate) return;
    
    setIsCustom(true);
    setCustomGasPrice(estimate.gasPrice[selectedSpeed]);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-gray-400">加载 Gas 估算中...</div>
        <div className="h-24 bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
        <div className="text-red-400 text-sm">无法加载 Gas 估算</div>
        <button
          onClick={loadGasEstimate}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Gas 费用</div>
        <button
          onClick={loadGasEstimate}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          🔄 刷新
        </button>
      </div>

      {/* 档位选择 */}
      {!isCustom ? (
        <div className="grid grid-cols-3 gap-3">
          {(['slow', 'standard', 'fast'] as GasSpeed[]).map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`p-3 rounded-xl border-2 transition-all ${
                selectedSpeed === speed
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="space-y-1">
                {/* 图标 */}
                <div className="text-2xl">
                  {speed === 'slow' && '🐢'}
                  {speed === 'standard' && '⚡'}
                  {speed === 'fast' && '🚀'}
                </div>
                
                {/* 名称 */}
                <div
                  className={`text-xs font-medium ${
                    selectedSpeed === speed ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  {speed === 'slow' && '经济'}
                  {speed === 'standard' && '标准'}
                  {speed === 'fast' && '快速'}
                </div>
                
                {/* 价格 */}
                <div className="text-xs text-gray-400 font-mono">
                  {formatGasPrice(estimate.gasPrice[speed], estimate.unit)}
                </div>
                
                {/* 时间 */}
                <div className="text-xs text-gray-500">
                  {estimate.estimatedTime[speed]}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* 自定义输入 */
        <div className="space-y-3 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              Gas 价格 ({estimate.unit})
            </label>
            <input
              type="number"
              value={customGasPrice}
              onChange={(e) => setCustomGasPrice(e.target.value)}
              onBlur={handleCustomChange}
              placeholder="输入自定义价格"
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          {estimate.gasLimit && (
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Gas Limit
              </label>
              <input
                type="number"
                value={customGasLimit}
                onChange={(e) => setCustomGasLimit(e.target.value)}
                onBlur={handleCustomChange}
                placeholder="输入 Gas Limit"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}
        </div>
      )}

      {/* 自定义按钮 */}
      <div className="flex justify-center">
        <button
          onClick={() => (isCustom ? setIsCustom(false) : enableCustomMode())}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {isCustom ? '← 返回预设档位' : '自定义 Gas →'}
        </button>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <div className="text-yellow-400 text-xs">⚠️ {error}</div>
        </div>
      )}

      {/* 总费用预估 */}
      {estimate.gasLimit && (
        <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">预估总费用</span>
            <span className="text-white font-mono">
              {isCustom && customGasPrice
                ? formatGasPrice(
                    (parseFloat(customGasPrice) * parseFloat(customGasLimit || estimate.gasLimit) / 10 ** 9).toFixed(6),
                    'ETH'
                  )
                : formatGasPrice(
                    (parseFloat(estimate.gasPrice[selectedSpeed]) * parseFloat(estimate.gasLimit) / 10 ** 9).toFixed(6),
                    'ETH'
                  )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default GasSelector;
