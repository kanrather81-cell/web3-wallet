import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Trash2, Eye, EyeOff, Coins } from 'lucide-react';
import { AddTokenDialog } from './AddTokenDialog';
import { toast } from 'sonner';

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainType: string;
  hidden?: boolean;
}

interface CustomTokenListProps {
  chainType?: string;
}

export function CustomTokenList({ chainType = 'ethereum' }: CustomTokenListProps) {
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const loadTokens = () => {
    const storageKey = `custom_tokens_${chainType}`;
    const savedTokens = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setTokens(savedTokens);
  };

  useEffect(() => {
    loadTokens();
  }, [chainType]);

  const handleRemoveToken = (address: string) => {
    const storageKey = `custom_tokens_${chainType}`;
    const updatedTokens = tokens.filter(
      (t) => t.address.toLowerCase() !== address.toLowerCase()
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedTokens));
    setTokens(updatedTokens);
    toast.success('代币已移除');
  };

  const handleToggleVisibility = (address: string) => {
    const storageKey = `custom_tokens_${chainType}`;
    const updatedTokens = tokens.map((t) =>
      t.address.toLowerCase() === address.toLowerCase()
        ? { ...t, hidden: !t.hidden }
        : t
    );
    localStorage.setItem(storageKey, JSON.stringify(updatedTokens));
    setTokens(updatedTokens);
    toast.success('代币可见性已更新');
  };

  const visibleTokens = tokens.filter((t) => !t.hidden);
  const hiddenTokens = tokens.filter((t) => t.hidden);

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-400" />
              自定义代币
            </CardTitle>
            <Button
              onClick={() => setShowAddDialog(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加代币
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">还没有添加自定义代币</p>
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加第一个代币
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Visible Tokens */}
              {visibleTokens.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    显示的代币 ({visibleTokens.length})
                  </h4>
                  {visibleTokens.map((token) => (
                    <TokenItem
                      key={token.address}
                      token={token}
                      onRemove={handleRemoveToken}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                </div>
              )}

              {/* Hidden Tokens */}
              {hiddenTokens.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    隐藏的代币 ({hiddenTokens.length})
                  </h4>
                  {hiddenTokens.map((token) => (
                    <TokenItem
                      key={token.address}
                      token={token}
                      onRemove={handleRemoveToken}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTokenDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onTokenAdded={loadTokens}
      />
    </div>
  );
}

interface TokenItemProps {
  token: TokenInfo;
  onRemove: (address: string) => void;
  onToggleVisibility: (address: string) => void;
}

function TokenItem({ token, onRemove, onToggleVisibility }: TokenItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
        token.hidden
          ? 'bg-gray-800/30 border-gray-700/50 opacity-60'
          : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h5 className="text-white font-semibold">{token.symbol}</h5>
          <span className="text-xs text-gray-500 capitalize">
            {token.chainType}
          </span>
        </div>
        <p className="text-sm text-gray-400">{token.name}</p>
        <p className="text-xs text-gray-500 font-mono mt-1">
          {token.address.slice(0, 6)}...{token.address.slice(-4)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleVisibility(token.address)}
          className="text-gray-400 hover:text-white hover:bg-gray-700"
        >
          {token.hidden ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(token.address)}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
