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
            'https://bitter-dawn-resonance.base-goerli.quiknode.pro/69f5a5c20a5360a50f9cad4657f82db552c0a41d',
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
