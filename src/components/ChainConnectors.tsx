import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TronConnectButton } from './tron/TronConnectButton';
import { BitcoinConnector } from './bitcoin/BitcoinConnector';
import { SimpleSolanaConnect } from './solana/SimpleSolanaConnect';

export function ChainConnectors() {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💼</span>
          <CardTitle className="text-white">多链钱包连接</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="solana" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solana">Solana</TabsTrigger>
            <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
            <TabsTrigger value="tron">Tron</TabsTrigger>
          </TabsList>

          <TabsContent value="solana" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                连接 Phantom 钱包以查看 SOL 余额
              </p>
              <SimpleSolanaConnect />
            </div>
          </TabsContent>

          <TabsContent value="bitcoin" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                连接 Unisat、Xverse 或 Leather 钱包以查看 BTC 余额
              </p>
              <BitcoinConnector />
            </div>
          </TabsContent>

          <TabsContent value="tron" className="mt-4">
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                连接 TronLink 钱包以查看 TRX 和 TRC20 代币余额
              </p>
              <TronConnectButton />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
