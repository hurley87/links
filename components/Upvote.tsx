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
import useVotingContract, { Project } from '@/hooks/useVotingContract';
import useAddUpvote from '../hooks/useAddUpvote';
import { toast } from 'react-hot-toast';
import ClubContract from '../hooks/contracts/Club.json';
import useUpvotes from '../hooks/useUpvotes';
import VotingContract from '../hooks/Voting.json';
import * as wagmi from 'wagmi';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';
import { makeBig } from '@/lib/number-utils';

const relay = new GelatoRelay();

const Upvote = ({
  signer,
  web3AuthProvider,
  project,
}: {
  signer: any;
  web3AuthProvider: any;
  project: Project;
}) => {
  const [upvoteCount, setUpvoteCount] = useState(0);
  const upvotesQuery = useUpvotes({ projectId: project.projectId });
  const votingContract = wagmi.useContract({
    address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
    abi: VotingContract.abi,
    signerOrProvider: signer,
  });
  const clubContract = wagmi.useContract({
    address: '0xE9A46d9865C4dDD8b15be9D6b4eE7732E27A1878',
    abi: ClubContract.abi,
    signerOrProvider: signer,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUpvoteCount = async () => {
      if (upvotesQuery.isFetched && !!upvotesQuery.data) {
        setUpvoteCount(upvotesQuery.data?.toNumber());
      }
    };
    fetchUpvoteCount();
  }, [upvotesQuery.data, upvotesQuery.isFetched]);

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
        user: await signer.getAddress(),
      };

      console.log('request', request);

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
      const taskId = response.taskId;

      // create interval where we check the status of the task every second until it is completed
      const interval = setInterval(async () => {
        try {
          const taskStatus = await relay.getTaskStatus(taskId);
          console.log('taskStatus', taskStatus);
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
              user: await signer.getAddress(),
            };

            console.log('request2', request2);

            console.log(apiKey);

            console.log('web3AuthProvider', web3AuthProvider);

            const response2 = await relay.sponsoredCallERC2771(
              request2,
              provider,
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
                    taskStatus?.lastCheckMessage?.includes('Execution error')
                  ) {
                    clearInterval(interval2);
                    throw new Error(
                      taskStatus?.lastCheckMessage?.split(
                        'sponsoredCallERC2771:'
                      )[1]
                    );
                  }
                }
              } catch (error) {
                console.log(error);
                if (!error?.toString().includes('GelatoRelaySDK/getTaskStatus'))
                  toast.error(`${error}`);

                setIsLoading(false);
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
    }
  };

  return (
    <>
      <Button
        onClick={handleUpvote}
        isLoading={isLoading}
        size="sm"
        p="4"
        h="100%"
        bg="white"
        border="1px solid #d9e1ec"
        _hover={{
          border: '1px solid #48BB78',
          bgColor: '#F0FFF4',
          boxShadow: 'md',
        }}
      >
        <Stack gap="0" spacing="0">
          <FaCaretUp fontSize="30px" />
          <Text mt="0">{upvoteCount}</Text>
        </Stack>
      </Button>
    </>
  );
};

export default Upvote;
