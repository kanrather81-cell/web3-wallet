import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAppStorage, type StoredDApp } from '../services/dappStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ArrowLeft, Heart, Clock, ExternalLink, Trash2 } from 'lucide-react';

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
    <Card
      key={dapp.id}
      className="bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70 transition-all cursor-pointer group"
      onClick={() => handleDAppClick(dapp)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
              {dapp.icon}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-white text-base truncate">
                {dapp.name}
              </CardTitle>
              <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded inline-block mt-1">
                {dapp.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showRemove && (
              <button
                onClick={(e) => handleRemoveFavorite(dapp.id, e)}
                className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                title="取消收藏"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            )}
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-gray-400 text-sm line-clamp-2 mb-2">
          {dapp.description}
        </CardDescription>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {dapp.chains.slice(0, 2).map((chain) => (
              <span
                key={chain}
                className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded"
              >
                {chain}
              </span>
            ))}
            {dapp.chains.length > 2 && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-400 rounded">
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
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto pt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-400" />
              <h1 className="text-3xl font-bold text-white">我的 DApps</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              收藏夹 ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              最近访问 ({recent.length})
            </TabsTrigger>
          </TabsList>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">还没有收藏的 DApp</p>
                  <p className="text-gray-500 text-sm">
                    在发现页面点击收藏按钮添加你喜欢的 DApp
                  </p>
                  <button
                    onClick={() => navigate('/discover')}
                    className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    去发现
                  </button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {favorites.map((dapp) => renderDAppCard(dapp, true))}
              </div>
            )}
          </TabsContent>

          {/* Recent Tab */}
          <TabsContent value="recent" className="space-y-4">
            {recent.length === 0 ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-2">还没有访问记录</p>
                  <p className="text-gray-500 text-sm">
                    访问 DApp 后会自动记录在这里
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleClearRecent}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    清除记录
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recent.map((dapp) => renderDAppCard(dapp, false))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Info */}
        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <p className="text-indigo-200 text-sm">
              💡 收藏的 DApp 会保存在本地浏览器中。清除浏览器数据会导致收藏记录丢失。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
