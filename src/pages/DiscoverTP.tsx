import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Gamepad2, Gift, Coins } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';

const categories = [
  { id: 'defi', name: 'DeFi', icon: TrendingUp, color: 'bg-blue-500' },
  { id: 'nft', name: 'NFT', icon: Coins, color: 'bg-purple-500' },
  { id: 'game', name: 'Game', icon: Gamepad2, color: 'bg-green-500' },
  { id: 'airdrop', name: '空投', icon: Gift, color: 'bg-orange-500' },
];

const dapps = [
  {
    id: 1,
    name: 'Uniswap',
    category: 'defi',
    description: '去中心化交易所',
    icon: '🦄',
    users: '1.2M',
  },
  {
    id: 2,
    name: 'OpenSea',
    category: 'nft',
    description: 'NFT 市场',
    icon: '🌊',
    users: '800K',
  },
  {
    id: 3,
    name: 'Axie Infinity',
    category: 'game',
    description: '区块链游戏',
    icon: '🎮',
    users: '500K',
  },
  {
    id: 4,
    name: 'Aave',
    category: 'defi',
    description: '借贷协议',
    icon: '👻',
    users: '600K',
  },
  {
    id: 5,
    name: 'Blur',
    category: 'nft',
    description: 'NFT 交易平台',
    icon: '💨',
    users: '300K',
  },
  {
    id: 6,
    name: 'PancakeSwap',
    category: 'defi',
    description: 'BSC DEX',
    icon: '🥞',
    users: '900K',
  },
];

export function DiscoverTP() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDapps = dapps.filter((dapp) => {
    const matchesCategory = selectedCategory === 'all' || dapp.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* 顶部搜索栏 */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="搜索 DApp"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border-gray-200 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* DApp 网格 */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredDapps.map((dapp) => (
            <Card
              key={dapp.id}
              className="cursor-pointer hover:shadow-lg transition-all border-0 bg-white"
              onClick={() => navigate(`/browser?url=${dapp.name.toLowerCase()}`)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-3xl shadow-lg">
                    {dapp.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">{dapp.name}</h3>
                    <p className="text-xs text-gray-500">{dapp.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span>{dapp.users}</span>
                    <span>用户</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDapps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">未找到相关 DApp</p>
          </div>
        )}
      </div>

      {/* 热门推荐 */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">热门推荐</h2>
        <div className="space-y-3">
          {dapps.slice(0, 3).map((dapp) => (
            <Card
              key={dapp.id}
              className="cursor-pointer hover:shadow-md transition-all border-0 bg-white"
              onClick={() => navigate(`/browser?url=${dapp.name.toLowerCase()}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                    {dapp.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{dapp.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{dapp.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{dapp.users} 用户</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
