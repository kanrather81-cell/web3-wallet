declare module 'bitcoin-wallet-connector/adapters' {
  import type { WalletAdapter, WalletAdapterFactory } from 'bitcoin-wallet-connector';
  
  export function BitgetWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
  export function LeatherWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
  export function MagicEdenWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
  export function MockAddressWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
  export function OkxWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
  export function UnisatWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
  export function XverseWalletAdapterFactory(): WalletAdapterFactory<WalletAdapter>;
}
