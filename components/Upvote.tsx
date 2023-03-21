import React, { useEffect, useState } from 'react';
import { Button, Stack } from '@chakra-ui/react';

import { useContext } from 'react';
import { UserContext } from '../lib/UserContext';
import { FaCaretUp } from 'react-icons/fa';
import { Project } from '@/hooks/contracts/useVotingContract';
import { toast } from 'react-hot-toast';
import ClubContract from '../hooks/contracts/Club.json';
import VotingContract from '../hooks/contracts/Voting.json';
import * as wagmi from 'wagmi';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { makeBig } from '@/lib/number-utils';
import { gelato } from '@/lib/gelato';
import useClubContract from '@/hooks/contracts/useClubContract';

const relay = new GelatoRelay();

type UpvoteProps = {
  project: Project;
  setUpvotes: (upvotes: number) => void;
  setBalance: (balance: number) => void;
  balance: number;
};

const Upvote = ({ project, setUpvotes, setBalance, balance }: UpvoteProps) => {
  const [user, _]: any = useContext(UserContext);
  const votingContract = wagmi.useContract({
    address: '0x93697e88337ee711C137752579A64C7d2D6dD122',
    abi: VotingContract.abi,
    signerOrProvider: user?.signer,
  });
  const clubContract = wagmi.useContract({
    address: '0xA5909B30b1267B36a93d2d3f6eB1809Db36e9a7E',
    abi: ClubContract.abi,
    signerOrProvider: user?.signer,
  });
  const contract = useClubContract(user?.signer, user?.provider);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    const checkUpvote = async () => {
      if (user?.signer) {
        const hasUpvoted = await votingContract?.hasUpvoted(project?.projectId);
        setHasUpvoted(hasUpvoted);
      }
    };
    checkUpvote();
  }, [user?.signer, project, votingContract]);

  const handleUpvote = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true); // disable login button to prevent multiple emails from being triggered
      const { data: data2 } = await clubContract!.populateTransaction.approve(
        '0x93697e88337ee711C137752579A64C7d2D6dD122',
        makeBig(1)
      );
      console.log('data2', data2);

      const request: any = {
        chainId: 84531,
        target: '0xA5909B30b1267B36a93d2d3f6eB1809Db36e9a7E',
        data: data2,
        user: await user.signer.getAddress(),
      };

      console.log('request', request);

      const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

      const response = await relay.sponsoredCallERC2771(
        request,
        user.provider,
        apiKey
      );
      console.log('response', response);
      const taskId = response.taskId;

      // create interval where we check the status of the task every second until it is completed
      const interval = setInterval(async () => {
        try {
          const taskStatus = await relay.getTaskStatus(taskId);
          console.log('taskStatus', taskStatus);
          setIsLoading(true);
          if (taskStatus?.taskState === 'ExecSuccess') {
            clearInterval(interval);
            const { data } =
              await votingContract!.populateTransaction.upvoteProject(
                project.projectId
              );
            console.log('data2', data);

            const request2: any = {
              chainId: 84531,
              target: '0x93697e88337ee711C137752579A64C7d2D6dD122',
              data: data,
              user: await user.signer.getAddress(),
            };

            const response2 = await relay.sponsoredCallERC2771(
              request2,
              user.provider,
              apiKey
            );
            console.log('response', response2);
            setIsLoading(false);
            toast.success('Link upvoted!');
            setUpvotes(project.upvotes.toNumber() + 1);
            setBalance(balance + 1);
            setHasUpvoted(true);

            // create interval where we check the status of the task every second until it is completed
            // const interval2 = setInterval(async () => {
            //   try {
            //     setIsLoading(true);
            //     const taskStatus = await relay.getTaskStatus(taskId2);
            //     console.log('taskStatus', taskStatus);
            //     if (taskStatus?.taskState === 'ExecSuccess') {
            //       // clearInterval(interval2);
            //       // setIsLoading(false);
            //       // toast.success('Link upvoted!');
            //       setUpvotes(project.upvotes.toNumber() + 1);
            //       setBalance(balance + 1);
            //       return;
            //     } else if (taskStatus?.taskState === 'CheckPending') {
            //       if (
            //         taskStatus?.lastCheckMessage?.includes(
            //           'sponsoredCallERC2771:'
            //         )
            //       ) {
            //         clearInterval(interval2);
            //         throw new Error(
            //           taskStatus?.lastCheckMessage?.split(
            //             'sponsoredCallERC2771:'
            //           )[1]
            //         );
            //       }
            //     } else if (taskStatus?.taskState === 'Cancelled') {
            //       throw new Error('Error upvoting link');
            //     }
            //   } catch (error) {
            //     console.log(error);
            //     if (
            //       !error?.toString().includes('GelatoRelaySDK/getTaskStatus')
            //     ) {
            //       setIsLoading(false);
            //       toast.error(`${error}`);
            //     }
            //   }
            // }, 1000);
          }
        } catch (error) {
          console.log(error);
        }
      }, 1000);
    } catch (error) {
      // re-enable login button - user may have requested to edit their email
      console.log(error);
      setIsLoading(false);
    }
  };

  const toggleUpvote = async () => {
    try {
      if (!gelato) {
        return;
      }
      if (!user?.signer) {
        await gelato.login();
      } else {
        const balance = await contract?.getBalance(user?.address);

        if (balance && parseInt(balance) < 1) {
          toast.error('You need 1 CLUB to upvote a link');
          return;
        }

        if (user?.address === project?.creatorAddress) {
          toast.error('You cannot upvote your own link');
          return;
        }
        handleUpvote();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      onClick={toggleUpvote}
      isLoading={isLoading}
      isDisabled={hasUpvoted || user?.address === project?.creatorAddress}
      size="sm"
      colorScheme="orange"
      variant="ghost"
      h="full"
      p="0"
    >
      <Stack gap="0" spacing="0">
        <FaCaretUp fontSize="21px" />
      </Stack>
    </Button>
  );
};

export default Upvote;
