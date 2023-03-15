import { GaslessOnboarding } from '@gelatonetwork/gasless-onboarding';

const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

const createGelato = () => {
  return (
    typeof window != 'undefined' &&
    new GaslessOnboarding(
      {
        domains: [window.location.origin],
        chain: {
          id: 84531,
          rpcUrl:
            'https://fabled-proportionate-grass.base-goerli.quiknode.pro/43a2893a730d0ac6376b0fbd184c18c94d408504/',
        },
        ui: {
          theme: 'dark',
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
