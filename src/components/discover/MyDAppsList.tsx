import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAppStorage, type StoredDApp } from '../../services/dappStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Heart, ExternalLink, Trash2 } from 'lucide-react';

export function MyDAppsList() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<StoredDApp[]>([]);

  function loadFavorites() {
    setFavorites(DAppStorage.getFavorites());
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = (dappId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    DAppStorage.removeFavorite(dappId);
    loadFavorites();
  };

  const handleDAppClick = (dapp: StoredDApp) => {
    DAppStorage.addRecent(dapp);
    navigate(`/browser?url=${encodeURIComponent(dapp.url)}`);
  };

  if (favorites.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-12 text-center">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">还没有收藏的 DApp</p>
          <p className="text-gray-500 text-sm">
            在发现页面点击收藏按钮添加你喜欢的 DApp
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {favorites.map((dapp) => (
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
                <button
                  onClick={(e) => handleRemoveFavorite(dapp.id, e)}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="取消收藏"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-gray-400 text-sm line-clamp-2 mb-2">
              {dapp.description}
            </CardDescription>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
