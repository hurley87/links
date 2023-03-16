import React, { useContext, useState } from 'react';
import {
  Button,
  FormControl,
  Input,
  Box,
  HStack,
  Text,
  Stack,
} from '@chakra-ui/react';
import { UserContext } from '@/lib/UserContext';
import VotingContract from '../hooks/contracts/Voting.json';
import * as wagmi from 'wagmi';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const relay = new GelatoRelay();

const CreateProject = () => {
  const [user, _]: any = useContext(UserContext);
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const signerContract = wagmi.useContract({
    address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
    abi: VotingContract.abi,
    signerOrProvider: user?.signer,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      setIsLoading(true); // disable login button to prevent multiple emails from being triggered

      const { data } = await signerContract!.populateTransaction.postProject(
        website,
        description
      );
      console.log('data2', data);

      const request: any = {
        chainId: 84531,
        target: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
        data: data,
        user: await user?.signer.getAddress(),
      };

      const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

      const response = await relay.sponsoredCallERC2771(
        request,
        user?.provider,
        apiKey
      );

      const taskId = response.taskId;
      // create interval where we check the status of the task every second until it is completed
      const interval = setInterval(async () => {
        try {
          setIsLoading(true);
          const taskStatus = await relay.getTaskStatus(taskId);
          console.log('taskStatus', taskStatus);
          if (taskStatus?.taskState === 'ExecSuccess') {
            clearInterval(interval);
            setIsLoading(false);
            toast.success('Link submitted!');
            router.push('/');
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
            throw new Error('Error submitting link');
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
      setIsLoading(false); // re-enable login button - user may have requested to edit their email
      console.log(error);
    }
  };
  return (
    <Box maxW="lg" px="2" py="4">
      <form onSubmit={handleSubmit}>
        <Stack gap="1">
          <HStack id="role">
            <Text w="8">link</Text>
            <Input
              type="text"
              placeholder="https://www.seedclub.xyz/"
              value={website}
              size="sm"
              bg="white"
              onChange={(e) => setWebsite(e.target.value)}
            />
          </HStack>
          <HStack id="role">
            <Text w="8">title</Text>
            <Input
              type="text"
              value={description}
              placeholder="Make something people want to be a part of"
              bg="white"
              size="sm"
              onChange={(e) => setDescription(e.target.value)}
            />
          </HStack>
          <HStack pl="9">
            <Button
              isLoading={isLoading}
              colorScheme="orange"
              type="submit"
              size="sm"
            >
              Submit
            </Button>
          </HStack>
        </Stack>
      </form>
      <Text fontSize="sm" p="8">
        Submit a link you find valuable. Each time someone upvotes your link{' '}
        {" you'll "}
        get 1 CLUB token.{' '}
      </Text>
    </Box>
  );
};

export default CreateProject;
