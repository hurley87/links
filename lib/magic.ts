import { Magic } from 'magic-sdk';

const network = {
  rpcUrl:
    'https://delicate-evocative-forest.base-goerli.quiknode.pro/5ea844af25c75df309eaa0b76010b72febe250e9/', // Polygon RPC URL
  chainId: 84531,
};

// Create client-side Magic instance
const createMagic = (key: string) => {
  return (
    typeof window != 'undefined' &&
    new Magic(key, {
      network,
    })
  );
};

const key: string = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY || '';

export const magic: any = createMagic(key);
