import { TronConnectButton } from './TronConnectButton';
import { useTron } from '../../lib/hooks/useTron';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function TronTest() {
  const { address, connected, balance, isLoading, error } = useTron();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tron 钱包连接</CardTitle>
        </CardHeader>
        <CardContent>
          <TronConnectButton />
        </CardContent>
      </Card>

      {connected && address && (
        <Card>
          <CardHeader>
            <CardTitle>钱包信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">地址</p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">余额</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <p className="text-2xl font-mono">{balance.toFixed(2)} TRX</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>需要安装 TronLink 浏览器插件</li>
            <li>点击"连接 Tron 钱包"按钮授权连接</li>
            <li>连接后自动显示地址和TRX余额</li>
            <li>余额每30秒自动刷新</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
