import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import { Loader2, AlertCircle } from 'lucide-react';

interface AddTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTokenAdded?: () => void;
}

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainType: string;
}

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

const CHAIN_OPTIONS = [
  { value: 'ethereum', label: 'Ethereum', rpc: 'https://eth.llamarpc.com' },
  { value: 'polygon', label: 'Polygon', rpc: 'https://polygon-rpc.com' },
  { value: 'optimism', label: 'Optimism', rpc: 'https://mainnet.optimism.io' },
  { value: 'arbitrum', label: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc' },
  { value: 'base', label: 'Base', rpc: 'https://mainnet.base.org' },
  { value: 'solana', label: 'Solana', rpc: 'https://api.mainnet-beta.solana.com' },
];

export function AddTokenDialog({ open, onOpenChange, onTokenAdded }: AddTokenDialogProps) {
  const [chainType, setChainType] = useState<string>('ethereum');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTokenAddress('');
    setTokenInfo(null);
    setError(null);
  };

  const validateAndFetchTokenInfo = async () => {
    if (!tokenAddress.trim()) {
      setError('请输入代币合约地址');
      return;
    }

    setIsValidating(true);
    setError(null);
    setTokenInfo(null);

    try {
      const selectedChain = CHAIN_OPTIONS.find(c => c.value === chainType);
      if (!selectedChain) {
        throw new Error('不支持的链');
      }

      if (chainType === 'solana') {
        // Validate Solana SPL Token
        await validateSolanaToken(tokenAddress, selectedChain.rpc);
      } else {
        // Validate EVM ERC-20 Token
        await validateERC20Token(tokenAddress, selectedChain.rpc, chainType);
      }
    } catch (err: any) {
      console.error('Token validation error:', err);
      setError(err.message || '无法验证代币合约地址');
      setTokenInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const validateERC20Token = async (address: string, rpcUrl: string, chain: string) => {
    // Validate address format
    if (!ethers.isAddress(address)) {
      throw new Error('无效的以太坊地址格式');
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(address, ERC20_ABI, provider);

    try {
      const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
      ]);

      setTokenInfo({
        address,
        name,
        symbol,
        decimals: Number(decimals),
        chainType: chain,
      });

      toast.success(`找到代币: ${name} (${symbol})`);
    } catch (err) {
      throw new Error('无法读取代币信息，请确认合约地址是否正确');
    }
  };

  const validateSolanaToken = async (address: string, rpcUrl: string) => {
    try {
      const publicKey = new PublicKey(address);
      const connection = new Connection(rpcUrl);

      // Check if account exists
      const accountInfo = await connection.getAccountInfo(publicKey);
      if (!accountInfo) {
        throw new Error('代币账户不存在');
      }

      // For SPL tokens, we would need to fetch metadata from the token program
      // For now, we'll just validate the address format
      setTokenInfo({
        address,
        name: 'SPL Token',
        symbol: 'SPL',
        decimals: 9, // Default for Solana
        chainType: 'solana',
      });

      toast.success('找到 Solana SPL 代币');
    } catch (err) {
      throw new Error('无效的 Solana 地址或代币不存在');
    }
  };

  const handleAddToken = () => {
    if (!tokenInfo) {
      toast.error('请先验证代币地址');
      return;
    }

    // Save token to localStorage
    const storageKey = `custom_tokens_${chainType}`;
    const existingTokens = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Check if token already exists
    const tokenExists = existingTokens.some(
      (t: TokenInfo) => t.address.toLowerCase() === tokenInfo.address.toLowerCase()
    );

    if (tokenExists) {
      toast.error('该代币已添加');
      return;
    }

    existingTokens.push(tokenInfo);
    localStorage.setItem(storageKey, JSON.stringify(existingTokens));

    toast.success(`成功添加代币: ${tokenInfo.name} (${tokenInfo.symbol})`);
    
    resetForm();
    onOpenChange(false);
    onTokenAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">添加自定义代币</DialogTitle>
          <DialogDescription className="text-gray-400">
            输入代币合约地址以添加到您的钱包
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Chain Selection */}
          <div className="space-y-2">
            <Label htmlFor="chain" className="text-white">
              选择链
            </Label>
            <Select value={chainType} onValueChange={setChainType}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {CHAIN_OPTIONS.map((chain) => (
                  <SelectItem
                    key={chain.value}
                    value={chain.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {chain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Token Address Input */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">
              代币合约地址
            </Label>
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder={
                  chainType === 'solana'
                    ? 'Solana 代币地址'
                    : '0x...'
                }
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={validateAndFetchTokenInfo}
                disabled={isValidating || !tokenAddress.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '验证'
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Token Info Display */}
          {tokenInfo && (
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
              <h4 className="text-sm font-semibold text-white">代币信息</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">名称:</span>
                  <span className="text-white font-medium">{tokenInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">符号:</span>
                  <span className="text-white font-medium">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">精度:</span>
                  <span className="text-white font-medium">{tokenInfo.decimals}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">链:</span>
                  <span className="text-white font-medium capitalize">{tokenInfo.chainType}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            取消
          </Button>
          <Button
            onClick={handleAddToken}
            disabled={!tokenInfo}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            添加代币
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
