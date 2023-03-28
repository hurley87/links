import React, { useContext, useState } from 'react';
import { Button } from '@chakra-ui/react';
import ClubContract from '../hooks/contracts/Club.json';
import * as wagmi from 'wagmi';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { makeBig } from '@/lib/number-utils';
import { UserContext } from '@/lib/UserContext';
import toast from 'react-hot-toast';

const relay = new GelatoRelay();

type MintProps = {
  onClose: () => void;
};

const Mint = ({ onClose }: MintProps) => {
  const [user, setUser]: any = useContext(UserContext);
  const signerContract = wagmi.useContract({
    address: '0x814411684B5669D277093d48F2b2bb01bEA60255',
    abi: ClubContract.abi,
    signerOrProvider: user?.signer,
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
        target: '0x814411684B5669D277093d48F2b2bb01bEA60255',
        data: data,
        user: await user.signer.getAddress(),
      };

      console.log('request2', request);

      const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

      const response = await relay.sponsoredCallERC2771(
        request,
        user.provider,
        apiKey
      );
      console.log('response', response);
      const taskId = response.taskId;

      const interval = setInterval(async () => {
        try {
          setIsLoading(true);
          const taskStatus = await relay.getTaskStatus(taskId);
          console.log('taskStatus', taskStatus);
          if (taskStatus?.taskState === 'ExecSuccess') {
            clearInterval(interval);
            setIsLoading(false);
            toast.success('Tokens claimed!');
            setUser({ ...user, balance: user.balance + 5 });
            onClose();
          } else if (taskStatus?.taskState === 'CheckPending') {
            if (
              taskStatus?.lastCheckMessage?.includes('sponsoredCallERC2771:')
            ) {
              clearInterval(interval);
              throw new Error(
                taskStatus?.lastCheckMessage?.split('sponsoredCallERC2771:')[1]
              );
            }
          } else if (taskStatus?.taskState === 'Cancelled') {
            throw new Error('Error minting tokens');
          }
        } catch (error) {
          console.log(error);
          if (!error?.toString().includes('GelatoRelaySDK/getTaskStatus')) {
            setIsLoading(false);
            toast.error(`${error}`);
          }
        }
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Button
      onClick={mint}
      colorScheme="orange"
      w="full"
      mx="auto"
      isLoading={isLoading}
    >
      Claim 5 CLUB Tokens
    </Button>
  );
};

export default Mint;
