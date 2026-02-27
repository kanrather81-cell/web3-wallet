import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAppStorage, type StoredDApp } from '../services/dappStorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Heart, Clock, ExternalLink, Trash2 } from 'lucide-react';

export function MyDAppsPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<StoredDApp[]>([]);
  const [recent, setRecent] = useState<StoredDApp[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setFavorites(DAppStorage.getFavorites());
    setRecent(DAppStorage.getRecent());
  };

  const handleRemoveFavorite = (dappId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    DAppStorage.removeFavorite(dappId);
    loadData();
  };

  const handleClearRecent = () => {
    if (window.confirm('确定要清除所有最近访问记录吗？')) {
      DAppStorage.clearRecent();
      loadData();
    }
  };

  const handleDAppClick = (dapp: StoredDApp) => {
    DAppStorage.addRecent(dapp);
    // Open in browser page instead of new tab
    navigate(`/browser?url=${encodeURIComponent(dapp.url)}`);
    loadData();
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  const renderDAppCard = (dapp: StoredDApp, showRemove: boolean = false) => (
    <div
      key={dapp.id}
      className="bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => handleDAppClick(dapp)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            {dapp.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 font-semibold truncate mb-1">
              {dapp.name}
            </h3>
            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full inline-block">
              {dapp.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showRemove && (
            <button
              onClick={(e) => handleRemoveFavorite(dapp.id, e)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              title="取消收藏"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          )}
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
        </div>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
        {dapp.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {dapp.chains.slice(0, 2).map((chain) => (
            <span
              key={chain}
              className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full"
            >
              {chain}
            </span>
          ))}
          {dapp.chains.length > 2 && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              +{dapp.chains.length - 2}
            </span>
          )}
        </div>
        {dapp.timestamp && (
          <span className="text-xs text-gray-500">
            {formatTimestamp(dapp.timestamp)}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header - TP Style */}
      <div className="bg-gradient-tp text-white px-6 pt-12 pb-6 rounded-b-[32px] shadow-lg">
        <div className="flex items-center gap-3">
          <Heart className="w-7 h-7" />
          <h1 className="text-2xl font-bold">我的 DApps</h1>
        </div>
      </div>

      <div className="px-4 mt-6">
        {/* Tabs */}
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="w-full bg-white rounded-xl p-1 shadow-sm">
            <TabsTrigger 
              value="favorites" 
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg"
            >
              <Heart className="w-4 h-4" />
              收藏 ({favorites.length})
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="flex-1 flex items-center justify-center gap-2 data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-lg"
            >
              <Clock className="w-4 h-4" />
              最近 ({recent.length})
            </TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4 mt-4">
            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">还没有收藏的 DApp</p>
                <p className="text-gray-500 text-sm mb-4">
                  在发现页面点击收藏按钮添加你喜欢的 DApp
                </p>
                <button
                  onClick={() => navigate('/discover')}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium shadow-md"
                >
                  去发现
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((dapp) => renderDAppCard(dapp, true))}
              </div>
            )}
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="space-y-4 mt-4">
            {recent.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">还没有访问记录</p>
                <p className="text-gray-500 text-sm">
                  访问 DApp 后会自动记录在这里
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleClearRecent}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-gray-50 text-gray-700 rounded-xl transition-colors border border-gray-200 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    清除记录
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recent.map((dapp) => renderDAppCard(dapp, false))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Info */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 mt-6">
          <p className="text-blue-800 text-sm">
            💡 收藏的 DApp 会保存在本地浏览器中。清除浏览器数据会导致收藏记录丢失。
          </p>
        </div>
      </div>
    </div>
  );
}
