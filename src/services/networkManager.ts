// Network Manager Service for managing custom RPC endpoints
export interface NetworkConfig {
  id: string;
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  isCustom: boolean;
  isDefault: boolean;
  icon?: string;
}

const STORAGE_KEY = 'custom_networks';
const DEFAULT_NETWORK_KEY = 'default_network';

// Built-in networks
const BUILT_IN_NETWORKS: NetworkConfig[] = [
  {
    id: 'ethereum',
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    isCustom: false,
    isDefault: true,
    icon: '⟠',
  },
  {
    id: 'polygon',
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    isCustom: false,
    isDefault: false,
    icon: '⬡',
  },
  {
    id: 'optimism',
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    isCustom: false,
    isDefault: false,
    icon: '🔴',
  },
  {
    id: 'arbitrum',
    chainId: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    isCustom: false,
    isDefault: false,
    icon: '🔵',
  },
  {
    id: 'base',
    chainId: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    isCustom: false,
    isDefault: false,
    icon: '🔷',
  },
];

export class NetworkManager {
  /**
   * Get all networks (built-in + custom)
   */
  static getAllNetworks(): NetworkConfig[] {
    const customNetworks = this.getCustomNetworks();
    const defaultNetworkId = this.getDefaultNetworkId();

    // Merge built-in and custom networks
    const allNetworks = [...BUILT_IN_NETWORKS, ...customNetworks];

    // Update default flag
    return allNetworks.map((network) => ({
      ...network,
      isDefault: network.id === defaultNetworkId,
    }));
  }

  /**
   * Get custom networks from localStorage
   */
  static getCustomNetworks(): NetworkConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading custom networks:', error);
      return [];
    }
  }

  /**
   * Add a custom network
   */
  static addCustomNetwork(network: Omit<NetworkConfig, 'id' | 'isCustom' | 'isDefault'>): void {
    try {
      const customNetworks = this.getCustomNetworks();

      // Check if chain ID already exists
      const allNetworks = this.getAllNetworks();
      const exists = allNetworks.some((n) => n.chainId === network.chainId);

      if (exists) {
        throw new Error(`Network with chain ID ${network.chainId} already exists`);
      }

      // Generate ID
      const id = `custom-${Date.now()}`;

      const newNetwork: NetworkConfig = {
        ...network,
        id,
        isCustom: true,
        isDefault: false,
      };

      customNetworks.push(newNetwork);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customNetworks));
    } catch (error) {
      console.error('Error adding custom network:', error);
      throw error;
    }
  }

  /**
   * Update a custom network
   */
  static updateCustomNetwork(
    id: string,
    updates: Partial<Omit<NetworkConfig, 'id' | 'isCustom' | 'isDefault'>>
  ): void {
    try {
      const customNetworks = this.getCustomNetworks();
      const index = customNetworks.findIndex((n) => n.id === id);

      if (index === -1) {
        throw new Error('Network not found');
      }

      customNetworks[index] = {
        ...customNetworks[index],
        ...updates,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(customNetworks));
    } catch (error) {
      console.error('Error updating custom network:', error);
      throw error;
    }
  }

  /**
   * Delete a custom network
   */
  static deleteCustomNetwork(id: string): void {
    try {
      const customNetworks = this.getCustomNetworks();
      const filtered = customNetworks.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      // If deleted network was default, reset to Ethereum
      const defaultNetworkId = this.getDefaultNetworkId();
      if (defaultNetworkId === id) {
        this.setDefaultNetwork('ethereum');
      }
    } catch (error) {
      console.error('Error deleting custom network:', error);
      throw error;
    }
  }

  /**
   * Get default network ID
   */
  static getDefaultNetworkId(): string {
    try {
      return localStorage.getItem(DEFAULT_NETWORK_KEY) || 'ethereum';
    } catch (error) {
      return 'ethereum';
    }
  }

  /**
   * Set default network
   */
  static setDefaultNetwork(networkId: string): void {
    try {
      const allNetworks = this.getAllNetworks();
      const network = allNetworks.find((n) => n.id === networkId);

      if (!network) {
        throw new Error('Network not found');
      }

      localStorage.setItem(DEFAULT_NETWORK_KEY, networkId);
    } catch (error) {
      console.error('Error setting default network:', error);
      throw error;
    }
  }

  /**
   * Get default network
   */
  static getDefaultNetwork(): NetworkConfig {
    const defaultId = this.getDefaultNetworkId();
    const allNetworks = this.getAllNetworks();
    return allNetworks.find((n) => n.id === defaultId) || BUILT_IN_NETWORKS[0];
  }

  /**
   * Get network by chain ID
   */
  static getNetworkByChainId(chainId: number): NetworkConfig | undefined {
    const allNetworks = this.getAllNetworks();
    return allNetworks.find((n) => n.chainId === chainId);
  }

  /**
   * Validate RPC URL
   */
  static async validateRpcUrl(rpcUrl: string, chainId: number): Promise<boolean> {
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1,
        }),
      });

      const data = await response.json();
      const returnedChainId = parseInt(data.result, 16);

      return returnedChainId === chainId;
    } catch (error) {
      console.error('Error validating RPC URL:', error);
      return false;
    }
  }
}
