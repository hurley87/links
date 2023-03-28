import { GaslessOnboarding } from '@gelatonetwork/gasless-onboarding';

const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

const createGelato = () => {
  return (
    typeof window != 'undefined' &&
    new GaslessOnboarding(
      {
        domains: [window.location.origin],
        chain: {
          id: 1442,
          rpcUrl: 'https://rpc.public.zkevm-test.net',
        },
        ui: {
          theme: 'light',
        },
        openLogin: {
          redirectUrl: `${window.location.origin}`,
        },
      },
      { apiKey }
    )
  );
};

export const gelato = createGelato();
