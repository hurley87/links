import { ChakraProvider } from '@chakra-ui/react';
import { providers } from 'ethers';
import { createClient, WagmiConfig } from 'wagmi';
import { useEffect, useState } from 'react';
import '@magiclabs/ui/dist/cjs/index.css';
import { UserContext } from '../lib/UserContext';
import { magic } from '../lib/magic';
import { QueryClient, QueryClientProvider, QueryCache } from 'react-query';
import { Toaster, toast } from 'react-hot-toast';

const provider = new providers.JsonRpcProvider(
  'https://delicate-evocative-forest.base-goerli.quiknode.pro/5ea844af25c75df309eaa0b76010b72febe250e9/',
  { name: 'base-goerli', chainId: 84531, ensAddress: undefined }
);

// Give wagmi our provider config and allow it to autoconnect wallet
const client = createClient({
  autoConnect: true,
  provider,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: () => {
      toast.error('Network Error!');
    },
  }),
});

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState();

  useEffect(() => {
    setUser({ loading: true });
    magic.user.isLoggedIn().then((isLoggedIn) => {
      if (isLoggedIn) {
        magic.user.getMetadata().then((userData) => setUser(userData));
      } else {
        setUser({ loading: false });
      }
    });
  }, [setUser]);

  return (
    <WagmiConfig client={client}>
      <UserContext.Provider value={[user, setUser]}>
        <ChakraProvider>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
            <Toaster position="top-center" />
          </QueryClientProvider>
        </ChakraProvider>
      </UserContext.Provider>
    </WagmiConfig>
  );
}

export default MyApp;
