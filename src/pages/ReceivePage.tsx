import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Check, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useMultiChainBalance } from '../lib/hooks/useMultiChainBalance';

export function ReceivePage() {
  const { chainId, tokenAddress } = useParams<{ chainId: string; tokenAddress?: string }>();
  const { balances } = useMultiChainBalance();
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState('');
  const [chainName, setChainName] = useState('');

  useEffect(() => {
    // 获取对应链的地址和名称
    const chain = balances.find((b) => b.chainId.toString() === chainId);
    
    if (chain) {
      setChainName(chain.chainName);
    }

    // 从 localStorage 获取地址
    let addr = '';
    if (chainId === 'solana') {
      addr = localStorage.getItem('solana_address') || '';
    } else if (chainId === 'bitcoin') {
      addr = localStorage.getItem('bitcoin_address') || '';
    } else if (chainId === 'tron') {
      addr = localStorage.getItem('tron_address') || '';
    } else {
      // EVM chains
      addr = localStorage.getItem('ethereum_address') || '';
    }
    
    setAddress(addr);
  }, [chainId, balances]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${chainName}-address-qr.png`;
      link.href = url;
      link.click();
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <p className="text-gray-600">加载地址中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 顶部渐变区域 */}
      <div className="bg-gradient-tp pt-12 pb-8 px-6 rounded-b-[32px] mb-6">
        <h1 className="text-2xl font-bold text-white text-center">
          接收 {chainName} {tokenAddress && tokenAddress !== 'native' ? '代币' : ''}
        </h1>
        <p className="text-white/80 text-center mt-2 text-sm">扫描二维码或复制地址</p>
      </div>

      {/* QR Code Section */}
      <div className="max-w-md mx-auto px-6">
        <div className="flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
            <QRCodeCanvas
              value={address}
              size={240}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Address Display */}
          <div className="w-full bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-gray-600 text-sm mb-2 text-center font-medium">钱包地址</p>
            <div className="bg-gray-50 rounded-xl p-3 break-all">
              <p className="text-gray-900 font-mono text-sm text-center">
                {address}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full space-y-3">
            <button
              onClick={handleCopy}
              className="w-full bg-primary-600 hover:bg-primary-700 rounded-xl p-4 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">已复制!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold">复制地址</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadQR}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Download className="w-5 h-5 text-gray-700" />
              <span className="text-gray-700 font-semibold">下载二维码</span>
            </button>
          </div>

          {/* Warning */}
          <div className="w-full mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-700 text-sm text-center font-medium">
              ⚠️ 仅支持在 {chainName} 网络上发送资产到此地址
            </p>
            <p className="text-yellow-600 text-xs text-center mt-2">
              发送其他网络的资产可能导致永久丢失
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceivePage;
