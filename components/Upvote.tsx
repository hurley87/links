import React, { useEffect, useState } from 'react';
import {
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  Stack,
} from '@chakra-ui/react';

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

const relay = new GelatoRelay();

const Upvote = ({ project }: { project: Project }) => {
  const [user, _]: any = useContext(UserContext);
  const votingContract = wagmi.useContract({
    address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
    abi: VotingContract.abi,
    signerOrProvider: user?.signer,
  });
  const clubContract = wagmi.useContract({
    address: '0xE9A46d9865C4dDD8b15be9D6b4eE7732E27A1878',
    abi: ClubContract.abi,
    signerOrProvider: user?.signer,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpvote = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true); // disable login button to prevent multiple emails from being triggered
      const { data: data2 } = await clubContract!.populateTransaction.approve(
        '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
        makeBig(1)
      );
      console.log('data2', data2);

      const request: any = {
        chainId: 84531,
        target: '0xE9A46d9865C4dDD8b15be9D6b4eE7732E27A1878',
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
              target: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
              data: data,
              user: await user.signer.getAddress(),
            };

            const response2 = await relay.sponsoredCallERC2771(
              request2,
              user.provider,
              apiKey
            );
            console.log('response', response2);
            const taskId2 = response2.taskId;
            setIsLoading(true);

            // create interval where we check the status of the task every second until it is completed
            const interval2 = setInterval(async () => {
              try {
                setIsLoading(true);
                const taskStatus = await relay.getTaskStatus(taskId2);
                console.log('taskStatus', taskStatus);
                if (taskStatus?.taskState === 'ExecSuccess') {
                  clearInterval(interval2);
                  setIsLoading(false);
                  toast.success('Link upvoted!');
                } else if (taskStatus?.taskState === 'CheckPending') {
                  if (
                    taskStatus?.lastCheckMessage?.includes(
                      'sponsoredCallERC2771:'
                    )
                  ) {
                    clearInterval(interval2);
                    throw new Error(
                      taskStatus?.lastCheckMessage?.split(
                        'sponsoredCallERC2771:'
                      )[1]
                    );
                  }
                } else if (taskStatus?.taskState === 'Cancelled') {
                  throw new Error('Error upvoting link');
                }
              } catch (error) {
                console.log(error);
                if (
                  !error?.toString().includes('GelatoRelaySDK/getTaskStatus')
                ) {
                  setIsLoading(false);
                  toast.error(`${error}`);
                }
              }
            }, 1000);
          }
        } catch (error) {
          console.log(error);
        }
      }, 1000);
    } catch (error) {
      // re-enable login button - user may have requested to edit their email
      console.log(error);
      setIsLoading(true);
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
        handleUpvote();
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Button
        onClick={toggleUpvote}
        isLoading={isLoading}
        size="sm"
        colorScheme="orange"
        variant="ghost"
        h="full"
        p="0"
      >
        <Stack gap="0" spacing="0">
          <FaCaretUp fontSize="23px" />
        </Stack>
      </Button>
    </>
  );
};

export default Upvote;
