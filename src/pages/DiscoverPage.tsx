import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dapps, categories, type DAppCategory } from '../data/dapps';
import { DAppStorage } from '../services/dappStorage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { ArrowLeft, Compass, ExternalLink, Search, Star, Heart } from 'lucide-react';

export function DiscoverPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<DAppCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const favorites = DAppStorage.getFavorites();
    setFavoritedIds(new Set(favorites.map((fav) => fav.id)));
  };

  const handleToggleFavorite = (dapp: typeof dapps[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (favoritedIds.has(dapp.id)) {
      DAppStorage.removeFavorite(dapp.id);
    } else {
      DAppStorage.addFavorite(dapp);
    }
    
    loadFavorites();
  };

  const handleDAppClick = (dapp: typeof dapps[0]) => {
    DAppStorage.addRecent(dapp);
    // Open in browser page instead of new tab
    navigate(`/browser?url=${encodeURIComponent(dapp.url)}`);
  };

  const filteredDapps = dapps.filter((dapp) => {
    const matchesCategory = selectedCategory === 'All' || dapp.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      dapp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dapp.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredDapps = dapps.filter((dapp) => dapp.featured);

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
              <Compass className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">Discover DApps</h1>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search DApps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'All'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === category.name
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Featured DApps */}
        {selectedCategory === 'All' && searchQuery === '' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Featured DApps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredDapps.map((dapp) => (
                <Card
                  key={dapp.id}
                  className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30 hover:border-indigo-500/50 transition-all cursor-pointer group"
                  onClick={() => handleDAppClick(dapp)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-2xl">
                          {dapp.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{dapp.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">
                              {dapp.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleFavorite(dapp, e)}
                          className="p-1.5 hover:bg-pink-500/20 rounded transition-colors"
                          title={favoritedIds.has(dapp.id) ? '取消收藏' : '收藏'}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              favoritedIds.has(dapp.id)
                                ? 'fill-pink-400 text-pink-400'
                                : 'text-gray-400 hover:text-pink-400'
                            }`}
                          />
                        </button>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 mb-3">
                      {dapp.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1">
                      {dapp.chains.slice(0, 3).map((chain) => (
                        <span
                          key={chain}
                          className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded"
                        >
                          {chain}
                        </span>
                      ))}
                      {dapp.chains.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded">
                          +{dapp.chains.length - 3}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All DApps */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {selectedCategory === 'All' ? 'All DApps' : `${selectedCategory} DApps`}
              <span className="text-gray-400 text-base ml-2">({filteredDapps.length})</span>
            </h2>
          </div>

          {filteredDapps.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-12 text-center">
                <p className="text-gray-400">No DApps found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDapps.map((dapp) => (
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
                          onClick={(e) => handleToggleFavorite(dapp, e)}
                          className="p-1.5 hover:bg-pink-500/20 rounded transition-colors"
                          title={favoritedIds.has(dapp.id) ? '取消收藏' : '收藏'}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              favoritedIds.has(dapp.id)
                                ? 'fill-pink-400 text-pink-400'
                                : 'text-gray-400 hover:text-pink-400'
                            }`}
                          />
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
          )}
        </div>

        {/* Info */}
        <Card className="bg-indigo-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <p className="text-indigo-200 text-sm">
              💡 Click on any DApp to open it in a new tab. Make sure your wallet is connected to interact with these applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
