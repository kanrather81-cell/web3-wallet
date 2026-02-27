/**
 * 交易构建工具 - 基于 OKX SDK
 * 支持 EVM、Solana、Bitcoin、Tron 链的交易构建
 */

export type ChainType = 'ethereum' | 'solana' | 'bitcoin' | 'tron';

export interface TransactionParams {
  from: string;
  to: string;
  amount: string;
  tokenAddress?: string; // 代币合约地址（原生币时为空）
  decimals?: number; // 代币精度
}

export interface BuildTransactionResult {
  transaction: any;
  estimatedFee?: string;
}

/**
 * 构建 EVM 链交易（Ethereum、BSC、Polygon 等）
 */
export async function buildEvmTransaction(
  params: TransactionParams,
  chainId: number = 1
): Promise<BuildTransactionResult> {
  try {
    // 如果是代币转账
    if (params.tokenAddress) {
      // ERC20 代币转账 - 手动构建 transfer 函数调用数据
      // transfer(address,uint256)
      const decimals = params.decimals || 18;
      const amount = BigInt(parseFloat(params.amount) * Math.pow(10, decimals));
      
      // 构建 ERC20 transfer 函数调用数据
      // 函数选择器: transfer(address,uint256) = 0xa9059cbb
      const functionSelector = '0xa9059cbb';
      // 参数1: 接收地址（去掉0x，左填充到32字节）
      const toAddress = params.to.replace('0x', '').padStart(64, '0');
      // 参数2: 金额（转为16进制，左填充到32字节）
      const amountHex = amount.toString(16).padStart(64, '0');
      
      const data = functionSelector + toAddress + amountHex;
      
      return {
        transaction: {
          from: params.from,
          to: params.tokenAddress,
          data,
          value: '0',
          chainId,
        },
      };
    }
    
    // 原生币转账
    const decimals = 18; // ETH 默认 18 位精度
    const amount = BigInt(parseFloat(params.amount) * Math.pow(10, decimals));
    
    return {
      transaction: {
        from: params.from,
        to: params.to,
        value: '0x' + amount.toString(16),
        chainId,
      },
    };
  } catch (error) {
    console.error('构建 EVM 交易失败:', error);
    throw error;
  }
}

/**
 * 构建 Solana 交易
 */
export async function buildSolanaTransaction(
  params: TransactionParams,
  connection: any // Solana Connection 对象
): Promise<BuildTransactionResult> {
  try {
    // 获取最新的 blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    
    // 如果是代币转账
    if (params.tokenAddress) {
      // SPL Token 转账
      const transaction = {
        type: 'spl-transfer',
        from: params.from,
        to: params.to,
        mint: params.tokenAddress,
        amount: params.amount,
        decimals: params.decimals || 9,
        recentBlockhash: blockhash,
      };
      
      return { transaction };
    }
    
    // SOL 原生币转账
    const transaction = {
      type: 'sol-transfer',
      from: params.from,
      to: params.to,
      amount: params.amount,
      recentBlockhash: blockhash,
    };
    
    return { transaction };
  } catch (error) {
    console.error('构建 Solana 交易失败:', error);
    throw error;
  }
}

/**
 * 构建 Bitcoin 交易
 */
export async function buildBitcoinTransaction(
  params: TransactionParams,
  utxos: any[] // UTXO 列表
): Promise<BuildTransactionResult> {
  try {
    // Bitcoin 只支持原生币转账
    if (params.tokenAddress) {
      throw new Error('Bitcoin 不支持代币转账');
    }
    
    // 构建交易输入输出
    const transaction = {
      inputs: utxos.map((utxo: any) => ({
        txId: utxo.txid,
        vout: utxo.vout,
        amount: utxo.value,
        address: params.from,
      })),
      outputs: [
        {
          address: params.to,
          amount: params.amount,
        },
      ],
    };
    
    return { transaction };
  } catch (error) {
    console.error('构建 Bitcoin 交易失败:', error);
    throw error;
  }
}

/**
 * 构建 Tron 交易
 */
export async function buildTronTransaction(
  params: TransactionParams,
  tronWeb: any // TronWeb 实例
): Promise<BuildTransactionResult> {
  try {
    // 如果是代币转账
    if (params.tokenAddress) {
      // TRC20 代币转账
      const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
        params.tokenAddress,
        'transfer(address,uint256)',
        {},
        [
          { type: 'address', value: params.to },
          { type: 'uint256', value: params.amount },
        ],
        params.from
      );
      
      return { transaction: transaction.transaction };
    }
    
    // TRX 原生币转账
    const transaction = await tronWeb.transactionBuilder.sendTrx(
      params.to,
      params.amount,
      params.from
    );
    
    return { transaction };
  } catch (error) {
    console.error('构建 Tron 交易失败:', error);
    throw error;
  }
}

/**
 * 统一的交易构建接口
 */
export async function buildTransaction(
  chain: ChainType,
  params: TransactionParams,
  context?: any // 链特定的上下文（connection、utxos、tronWeb 等）
): Promise<BuildTransactionResult> {
  switch (chain) {
    case 'ethereum':
      return buildEvmTransaction(params, context?.chainId);
    
    case 'solana':
      if (!context?.connection) {
        throw new Error('Solana 需要 connection 对象');
      }
      return buildSolanaTransaction(params, context.connection);
    
    case 'bitcoin':
      if (!context?.utxos) {
        throw new Error('Bitcoin 需要 UTXO 列表');
      }
      return buildBitcoinTransaction(params, context.utxos);
    
    case 'tron':
      if (!context?.tronWeb) {
        throw new Error('Tron 需要 TronWeb 实例');
      }
      return buildTronTransaction(params, context.tronWeb);
    
    default:
      throw new Error(`不支持的链类型: ${chain}`);
  }
}
