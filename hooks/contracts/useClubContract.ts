import * as wagmi from 'wagmi';
import type { BigNumber } from 'ethers';
import ClubContract from './Club.json';
import { makeNum } from '@/lib/number-utils';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { gelato } from '@/lib/gelato';
import { useContext } from 'react';
import { UserContext } from '@/lib/UserContext';

const relay = new GelatoRelay();

export type Amount = BigNumber;

export interface Transfer {
  from: string;
  to: string;
  amount: BigNumber;
}

const useClubContract = (signer: any, provider: any) => {
  const [user, _]: any = useContext(UserContext);
  if (gelato) {
    // This returns a new ethers.Contract ready to interact with our API.
    // We need to pass in the address of our deployed contract as well as its abi.
    const contract = wagmi.useContract({
      // Add the address that was output from your deploy script
      address: '0x814411684B5669D277093d48F2b2bb01bEA60255',
      abi: ClubContract.abi,
      signerOrProvider: signer || provider,
    });

    // Get a user's balance and convert to readable number
    const getBalance = async (address: string): Promise<string> => {
      if (contract) {
        const userBalanceBN = await contract.balanceOf(address);
        return makeNum(userBalanceBN);
      } else return '0';
    };

    // Get a user's number of mints
    const getMintCount = async (address: string): Promise<number> => {
      if (contract) {
        const userBalanceBN = await contract.getMintCount(address);
        return userBalanceBN.toNumber();
      } else return 0;
    };

    const approve = async (
      address: string,
      amount: BigNumber
    ): Promise<void> => {
      if (contract) {
        const { data } = await contract.populateTransaction.approve(
          address,
          amount
        );

        const request: any = {
          chainId: 84531,
          target: '0x814411684B5669D277093d48F2b2bb01bEA60255',
          data: data,
          user: await signer.getAddress(),
        };

        console.log('request', request);

        const apiKey = process.env.NEXT_PUBLIC_GELATO_API as string;

        console.log(apiKey);

        const response = await relay.sponsoredCallERC2771(
          request,
          provider,
          apiKey
        );
        console.log('response', response.taskId);
      }
    };

    const mint = async (amount: BigNumber): Promise<void> => {
      if (contract) {
        const { data } = await contract.populateTransaction.mint(amount);

        console.log('data', data);

        // Populate a relay request
        const request: any = {
          chainId: 84531,
          target: '0x814411684B5669D277093d48F2b2bb01bEA60255',
          data: data,
          user: await signer.getAddress(),
        };

        const apiKey = process.env.NEXT_PUBLIC_GELATO_API as string;

        const response = await relay.sponsoredCallERC2771(
          request,
          provider,
          apiKey
        );

        console.log('response', response);
      }
    };

    return {
      contract,
      chainId: 84531,
      mint,
      approve,
      getBalance,
      getMintCount,
    };
  }
};

export default useClubContract;
