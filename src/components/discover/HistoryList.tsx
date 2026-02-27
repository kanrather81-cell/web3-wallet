import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAppStorage, type StoredDApp } from '../../services/dappStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Clock, ExternalLink, Trash2 } from 'lucide-react';

export function HistoryList() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState<StoredDApp[]>([]);

  function loadRecent() {
    setRecent(DAppStorage.getRecent());
  }

  useEffect(() => {
    loadRecent();
  }, []);

  const handleClearRecent = () => {
    if (window.confirm('确定要清除所有最近访问记录吗？')) {
      DAppStorage.clearRecent();
      loadRecent();
    }
  };

  const handleDAppClick = (dapp: StoredDApp) => {
    DAppStorage.addRecent(dapp);
    navigate(`/browser?url=${encodeURIComponent(dapp.url)}`);
    loadRecent();
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

  if (recent.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-12 text-center">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">还没有访问记录</p>
          <p className="text-gray-500 text-sm">
            访问 DApp 后会自动记录在这里
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleClearRecent}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          清除记录
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {recent.map((dapp) => (
          <Card
            key={`${dapp.id}-${dapp.timestamp}`}
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
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
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
        ))}
      </div>
    </>
  );
}
