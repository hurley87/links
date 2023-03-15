import React, { useContext, useState } from 'react';
import { Button, FormControl, Input, Box } from '@chakra-ui/react';
import { UserContext } from '@/lib/UserContext';
import VotingContract from '../hooks/Voting.json';
import * as wagmi from 'wagmi';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { ethers } from 'ethers';

const relay = new GelatoRelay();

const CreateProject = ({
  signer,
  web3AuthProvider,
}: {
  signer: any;
  web3AuthProvider: any;
}) => {
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const signerContract = wagmi.useContract({
    address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
    abi: VotingContract.abi,
    signerOrProvider: signer,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [_, setUser]: any = useContext(UserContext);

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
    } catch (error) {
      setIsLoading(false); // re-enable login button - user may have requested to edit their email
      console.log(error);
    }
  };
  return (
    <Box maxW="lg" mx="auto">
      <form onSubmit={handleSubmit}>
        <FormControl id="role">
          <Input
            type="text"
            placeholder="Website"
            value={website}
            border="1px solid #d9e1ec"
            size="lg"
            onChange={(e) => setWebsite(e.target.value)}
          />
        </FormControl>
        <FormControl id="role">
          <Input
            type="text"
            placeholder="Description"
            value={description}
            border="1px solid #d9e1ec"
            size="lg"
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormControl>

        <FormControl id="role">
          <Button
            isLoading={isLoading}
            mt={2}
            colorScheme="green"
            w="full"
            size="lg"
            type="submit"
          >
            Create
          </Button>
        </FormControl>
      </form>
    </Box>
  );
};

export default CreateProject;
