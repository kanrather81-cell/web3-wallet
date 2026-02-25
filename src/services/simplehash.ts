// SimpleHash API Service for NFT data
import axios from 'axios';

// SimpleHash API endpoint
const SIMPLEHASH_API_URL = 'https://api.simplehash.com/api/v0';

// Note: In production, store API key in environment variables
// For demo purposes, we'll use a placeholder or free tier
const API_KEY = import.meta.env.VITE_SIMPLEHASH_API_KEY || '';

export interface NFT {
  nft_id: string;
  chain: string;
  contract_address: string;
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  previews?: {
    image_small_url?: string;
    image_medium_url?: string;
    image_large_url?: string;
  };
  collection: {
    name: string;
    description?: string;
    image_url?: string;
  };
  contract: {
    type: string;
    name?: string;
    symbol?: string;
  };
  owners?: Array<{
    owner_address: string;
    quantity: number;
  }>;
  extra_metadata?: {
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
}

export interface NFTsResponse {
  nfts: NFT[];
  next_cursor?: string;
}

// Supported chains mapping
const CHAIN_MAPPING: Record<number, string> = {
  1: 'ethereum',
  137: 'polygon',
  10: 'optimism',
  42161: 'arbitrum',
  8453: 'base',
};

export class SimpleHashService {
  private static getHeaders() {
    return {
      'X-API-KEY': API_KEY,
      'accept': 'application/json',
    };
  }

  /**
   * Get NFTs owned by a wallet address across multiple chains
   */
  static async getNFTsByWallet(
    walletAddress: string,
    chains: string[] = ['ethereum', 'polygon', 'optimism', 'arbitrum', 'base']
  ): Promise<NFT[]> {
    try {
      // If no API key, return mock data for demo
      if (!API_KEY) {
        console.warn('SimpleHash API key not configured, using mock data');
        return this.getMockNFTs(walletAddress);
      }

      const chainParam = chains.join(',');
      const response = await axios.get<NFTsResponse>(
        `${SIMPLEHASH_API_URL}/nfts/owners`,
        {
          params: {
            chains: chainParam,
            wallet_addresses: walletAddress,
            limit: 50,
          },
          headers: this.getHeaders(),
        }
      );

      return response.data.nfts || [];
    } catch (error) {
      console.error('Error fetching NFTs from SimpleHash:', error);
      // Return mock data on error for demo purposes
      return this.getMockNFTs(walletAddress);
    }
  }

  /**
   * Get NFT details by contract and token ID
   */
  static async getNFTDetails(
    chain: string,
    contractAddress: string,
    tokenId: string
  ): Promise<NFT | null> {
    try {
      if (!API_KEY) {
        return null;
      }

      const response = await axios.get<NFT>(
        `${SIMPLEHASH_API_URL}/nfts/${chain}/${contractAddress}/${tokenId}`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching NFT details:', error);
      return null;
    }
  }

  /**
   * Get chain name from chain ID
   */
  static getChainName(chainId: number): string {
    return CHAIN_MAPPING[chainId] || 'ethereum';
  }

  /**
   * Mock NFT data for demo purposes
   */
  private static getMockNFTs(_walletAddress: string): NFT[] {
    return [
      {
        nft_id: 'ethereum.0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d.1',
        chain: 'ethereum',
        contract_address: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
        token_id: '1',
        name: 'Bored Ape #1',
        description: 'A unique Bored Ape NFT from the BAYC collection',
        image_url: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=500',
        previews: {
          image_small_url: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=200',
          image_medium_url: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=500',
        },
        collection: {
          name: 'Bored Ape Yacht Club',
          description: 'The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs',
          image_url: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?w=500',
        },
        contract: {
          type: 'ERC721',
          name: 'BoredApeYachtClub',
          symbol: 'BAYC',
        },
        extra_metadata: {
          attributes: [
            { trait_type: 'Background', value: 'Blue' },
            { trait_type: 'Fur', value: 'Brown' },
            { trait_type: 'Eyes', value: 'Bored' },
          ],
        },
      },
      {
        nft_id: 'polygon.0x2953399124f0cbb46d2cbacd8a89cf0599974963.1',
        chain: 'polygon',
        contract_address: '0x2953399124f0cbb46d2cbacd8a89cf0599974963',
        token_id: '1',
        name: 'Polygon NFT #1',
        description: 'A sample NFT on Polygon network',
        image_url: 'https://i.seadn.io/gcs/files/default-image.png?w=500',
        collection: {
          name: 'Polygon Collection',
        },
        contract: {
          type: 'ERC721',
        },
      },
      {
        nft_id: 'ethereum.0x60e4d786628fea6478f785a6d7e704777c86a7c6.1',
        chain: 'ethereum',
        contract_address: '0x60e4d786628fea6478f785a6d7e704777c86a7c6',
        token_id: '1',
        name: 'Mutant Ape #1',
        description: 'A Mutant Ape from the MAYC collection',
        image_url: 'https://i.seadn.io/gae/lHexKRMpw-aoSyB1WdFBff5yfANLReFxHzt1DOj_sg7mS14yARpuvYcUtsyyx-Nkpk6WTcUPFoG53VnLJezYi8hAs0OxNZwlw6Y-dmI?w=500',
        collection: {
          name: 'Mutant Ape Yacht Club',
        },
        contract: {
          type: 'ERC721',
          name: 'MutantApeYachtClub',
          symbol: 'MAYC',
        },
      },
    ];
  }
}
