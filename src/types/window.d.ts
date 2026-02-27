/**
 * 全局 Window 对象类型扩展
 * 支持各种钱包扩展的类型定义
 */

interface UnisatWallet {
  getAccounts(): Promise<string[]>;
  requestAccounts(): Promise<string[]>;
  sendBitcoin(address: string, amount: number): Promise<string>;
  signMessage(message: string): Promise<string>;
  getBalance(): Promise<{ confirmed: number; unconfirmed: number; total: number }>;
  getNetwork(): Promise<string>;
}

interface TronWeb {
  defaultAddress: {
    base58: string;
    hex: string;
  };
  ready: boolean;
  transactionBuilder: {
    sendTrx(to: string, amount: number, from: string): Promise<any>;
    triggerSmartContract(
      contractAddress: string,
      functionSelector: string,
      options: any,
      parameters: any[],
      from: string
    ): Promise<any>;
  };
  trx: {
    sign(transaction: any): Promise<any>;
    sendRawTransaction(signedTransaction: any): Promise<any>;
    getBalance(address: string): Promise<number>;
  };
}

interface Window {
  unisat?: UnisatWallet;
  tronWeb?: TronWeb;
  tronLink?: {
    ready: boolean;
    request(args: { method: string }): Promise<any>;
    on?(event: string, callback: (...args: any[]) => void): void;
    removeListener?(event: string, callback: (...args: any[]) => void): void;
  };
}
