import React, { useState } from 'react';
import { Button } from '@chakra-ui/react';
import ClubContract from '../hooks/contracts/Club.json';
import * as wagmi from 'wagmi';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';
import { makeBig } from '@/lib/number-utils';

const relay = new GelatoRelay();

const Mint = ({
  signer,
  web3AuthProvider,
}: {
  signer: any;
  web3AuthProvider: any;
}) => {
  const signerContract = wagmi.useContract({
    address: '0xE9A46d9865C4dDD8b15be9D6b4eE7732E27A1878',
    abi: ClubContract.abi,
    signerOrProvider: signer,
  });
  const [isLoading, setIsLoading] = useState(false);

  async function mint() {
    try {
      setIsLoading(true); // disable login button to prevent multiple emails from being triggered

      const { data } = await signerContract!.populateTransaction.mint(
        makeBig(5)
      );
      console.log('data2', data);

      const request: any = {
        chainId: 84531,
        target: '0xE9A46d9865C4dDD8b15be9D6b4eE7732E27A1878',
        data: data,
        user: await signer.getAddress(),
      };

      console.log('request2', request);

      const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

      console.log(apiKey);

      console.log('web3AuthProvider', web3AuthProvider);

      const provider = new ethers.providers.Web3Provider(web3AuthProvider);

      const response = await relay.sponsoredCallERC2771(
        request,
        provider,
        apiKey
      );
      console.log('response', response);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false); // re-enable login button - user may have requested to edit their email
      console.log(error);
    }
  }
  return (
    <Button
      onClick={mint}
      colorScheme="green"
      borderWidth="3px"
      borderColor="green.500"
      isLoading={isLoading}
    >
      Mint
    </Button>
  );
};

export default Mint;
