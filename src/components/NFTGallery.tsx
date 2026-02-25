import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { SimpleHashService, type NFT } from '../services/simplehash';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

export function NFTGallery() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (address) {
      loadNFTs();
    }
  }, [address]);

  const loadNFTs = async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      const nftData = await SimpleHashService.getNFTsByWallet(address);
      setNfts(nftData);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (nftId: string) => {
    setImageErrors((prev) => new Set(prev).add(nftId));
  };

  const getChainColor = (chain: string) => {
    const colors: Record<string, string> = {
      ethereum: 'bg-blue-500',
      polygon: 'bg-purple-500',
      optimism: 'bg-red-500',
      arbitrum: 'bg-cyan-500',
      base: 'bg-indigo-500',
    };
    return colors[chain.toLowerCase()] || 'bg-gray-500';
  };

  const getChainLabel = (chain: string) => {
    const labels: Record<string, string> = {
      ethereum: 'ETH',
      polygon: 'MATIC',
      optimism: 'OP',
      arbitrum: 'ARB',
      base: 'BASE',
    };
    return labels[chain.toLowerCase()] || chain.toUpperCase();
  };

  const getExplorerUrl = (nft: NFT) => {
    const explorers: Record<string, string> = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      optimism: 'https://optimistic.etherscan.io',
      arbitrum: 'https://arbiscan.io',
      base: 'https://basescan.org',
    };
    const baseUrl = explorers[nft.chain.toLowerCase()] || 'https://etherscan.io';
    return `${baseUrl}/token/${nft.contract_address}?a=${nft.token_id}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-0">
              <Skeleton className="w-full aspect-square rounded-t-lg" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">还没有 NFT</p>
          <p className="text-gray-500 text-sm">
            你的 NFT 收藏将显示在这里
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <Card
            key={nft.nft_id}
            className="bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800/70 transition-all cursor-pointer group overflow-hidden"
            onClick={() => setSelectedNFT(nft)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-900">
                {imageErrors.has(nft.nft_id) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  </div>
                ) : (
                  <img
                    src={nft.previews?.image_medium_url || nft.image_url}
                    alt={nft.name || 'NFT'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(nft.nft_id)}
                    loading="lazy"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${getChainColor(
                      nft.chain
                    )} text-white font-medium`}
                  >
                    {getChainLabel(nft.chain)}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-white font-medium text-sm truncate">
                  {nft.name || `#${nft.token_id}`}
                </h3>
                <p className="text-gray-400 text-xs truncate mt-1">
                  {nft.collection.name || 'Unknown Collection'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* NFT Detail Dialog */}
      <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedNFT && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNFT.name || `#${selectedNFT.token_id}`}</DialogTitle>
                <DialogDescription>
                  {selectedNFT.collection.name || 'Unknown Collection'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Image */}
                <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden">
                  {imageErrors.has(selectedNFT.nft_id) ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-24 h-24 text-gray-600" />
                    </div>
                  ) : (
                    <img
                      src={selectedNFT.previews?.image_large_url || selectedNFT.image_url}
                      alt={selectedNFT.name || 'NFT'}
                      className="w-full h-full object-contain"
                      onError={() => handleImageError(selectedNFT.nft_id)}
                    />
                  )}
                </div>

                {/* Description */}
                {selectedNFT.description && (
                  <div>
                    <h4 className="text-white font-medium mb-2">描述</h4>
                    <p className="text-gray-400 text-sm">{selectedNFT.description}</p>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-gray-400 text-xs mb-1">链</h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${getChainColor(
                          selectedNFT.chain
                        )} text-white font-medium`}
                      >
                        {getChainLabel(selectedNFT.chain)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-xs mb-1">Token ID</h4>
                    <p className="text-white text-sm font-mono">{selectedNFT.token_id}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-gray-400 text-xs mb-1">合约地址</h4>
                    <p className="text-white text-sm font-mono break-all">
                      {selectedNFT.contract_address}
                    </p>
                  </div>
                  {selectedNFT.contract.type && (
                    <div>
                      <h4 className="text-gray-400 text-xs mb-1">类型</h4>
                      <p className="text-white text-sm">{selectedNFT.contract.type}</p>
                    </div>
                  )}
                </div>

                {/* Attributes */}
                {selectedNFT.extra_metadata?.attributes &&
                  selectedNFT.extra_metadata.attributes.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-2">属性</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedNFT.extra_metadata.attributes.map((attr, index) => (
                          <div
                            key={index}
                            className="bg-gray-800 rounded p-2 border border-gray-700"
                          >
                            <p className="text-gray-400 text-xs">{attr.trait_type}</p>
                            <p className="text-white text-sm font-medium">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* View on Explorer */}
                <a
                  href={getExplorerUrl(selectedNFT)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  在区块链浏览器中查看
                </a>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
