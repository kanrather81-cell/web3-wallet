import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyImage } from './LazyImage';
import type { NFT } from '../services/simplehash';

interface VirtualNFTGridProps {
  nfts: NFT[];
  onNFTClick?: (nft: NFT) => void;
  columns?: number;
}

export function VirtualNFTGrid({
  nfts,
  onNFTClick,
  columns = 3,
}: VirtualNFTGridProps) {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows based on columns
  const rows = Math.ceil(nfts.length / columns);

  const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280, // Estimated height of each row
    overscan: 2,
  });

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        {t('assets.noNFTs')}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowNFTs = nfts.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className="grid gap-4 px-2 py-2"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {rowNFTs.map((nft) => (
                  <div
                    key={nft.nft_id}
                    className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => onNFTClick?.(nft)}
                  >
                    {/* NFT Image */}
                    <div className="aspect-square bg-gray-900 relative overflow-hidden">
                      <LazyImage
                        src={nft.image_url || nft.previews?.image_medium_url || ''}
                        alt={nft.name || 'NFT'}
                        className="w-full h-full object-cover"
                        placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23374151' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-size='14'%3ENFT%3C/text%3E%3C/svg%3E"
                      />
                      {/* Chain Badge */}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
                        {nft.chain}
                      </div>
                    </div>

                    {/* NFT Info */}
                    <div className="p-3">
                      <h3 className="text-white font-medium truncate mb-1">
                        {nft.name || 'Unnamed NFT'}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {nft.collection?.name || 'Unknown Collection'}
                      </p>
                      {nft.token_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          #{nft.token_id}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
