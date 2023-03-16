import React, { useState } from 'react';
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
import useClubContract from '@/hooks/contracts/useClubContract';
import Mint from './Mint';

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
    address: '0xd4435f714C5aC18d993F0aBBc9829ebE80E9e642',
    abi: VotingContract.abi,
    signerOrProvider: user?.signer,
  });
  const clubContract = wagmi.useContract({
    address: '0xE9A46d9865C4dDD8b15be9D6b4eE7732E27A1878',
    abi: ClubContract.abi,
    signerOrProvider: user?.signer,
  });
  const contract = useClubContract(user?.signer, user?.provider);
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleUpvote = async () => {
    setIsLoading(true);
    try {
      setIsLoading(true); // disable login button to prevent multiple emails from being triggered
      const { data: data2 } = await clubContract!.populateTransaction.approve(
        '0xd4435f714C5aC18d993F0aBBc9829ebE80E9e642',
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
              target: '0xd4435f714C5aC18d993F0aBBc9829ebE80E9e642',
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
                  setUpvotes(project.upvotes.toNumber() + 1);
                  setBalance(balance + 1);
                  return;
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
        const balance = await contract?.getBalance(user?.address);
        const mintCount = await contract?.getMintCount(user?.address);
        if (mintCount === 0) {
          onOpen();
          return;
        }
        if (balance && parseInt(balance) < 1) {
          toast.error('You need 1 CLUB to upvote a link');
          return;
        }
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
          <FaCaretUp fontSize="21px" />
        </Stack>
      </Button>
      <Modal size={'sm'} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Box p="4">
              <Text py="4" mt="0" textAlign="center" fontSize="md">
                Each time you upvote a link {"you'll"} send a token to whoever
                submitted the project.
              </Text>
              <Mint onClose={onClose} />
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Upvote;
