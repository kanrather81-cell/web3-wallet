import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function SwapPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8 space-y-6">
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
              <ArrowLeftRight className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">Cross-Chain Swap</h1>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
          <p className="text-indigo-200 text-sm">
            💡 Swap tokens across multiple chains with the best rates.
          </p>
        </div>

        {/* Swap Interface Placeholder */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Token Swap</CardTitle>
            <CardDescription className="text-gray-400">
              Exchange tokens across different blockchains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* From Token */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">From</label>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <select className="bg-transparent text-white text-lg font-semibold outline-none">
                    <option>ETH</option>
                    <option>MATIC</option>
                    <option>USDC</option>
                    <option>USDT</option>
                  </select>
                  <span className="text-sm text-gray-400">Balance: 0.00</span>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full bg-transparent text-white text-2xl outline-none"
                />
              </div>
            </div>

            {/* Swap Icon */}
            <div className="flex justify-center">
              <button className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <label className="text-sm text-gray-400">To</label>
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <select className="bg-transparent text-white text-lg font-semibold outline-none">
                    <option>USDC</option>
                    <option>USDT</option>
                    <option>ETH</option>
                    <option>MATIC</option>
                  </select>
                  <span className="text-sm text-gray-400">Balance: 0.00</span>
                </div>
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full bg-transparent text-white text-2xl outline-none"
                  disabled
                />
              </div>
            </div>

            {/* Swap Button */}
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">
              Connect Wallet to Swap
            </button>

            {/* External Link to LI.FI */}
            <div className="pt-4 border-t border-gray-700">
              <a
                href="https://jumper.exchange/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Use LI.FI Jumper for full swap functionality</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-base">🔄 Cross-Chain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Swap tokens across Ethereum, Polygon, Optimism, Arbitrum, and Base
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-base">💰 Best Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Automatically finds the best exchange rates across multiple DEXs
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-base">⚡ Fast & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Quick transactions with secure smart contract execution
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Note */}
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4">
            <p className="text-yellow-200 text-sm">
              ℹ️ This is a placeholder interface. For full swap functionality, please visit{' '}
              <a
                href="https://jumper.exchange/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-100"
              >
                LI.FI Jumper
              </a>
              {' '}or integrate the LI.FI Widget SDK.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
