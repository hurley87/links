import * as wagmi from 'wagmi';
import type { BigNumber } from 'ethers';
import VotingContract from './Voting.json';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { gelato } from '@/lib/gelato';

const relay = new GelatoRelay();

export interface Project {
  timestamp: any;
  projectId: BigNumber;
  description: string;
  website: string;
  upvotes: BigNumber;
  creatorAddress: string;
}

export enum VotingEvent {
  ProjectUpvoted = 'ProjectUpvoted',
}

const useVotingContract = (signer: any, provider: any) => {
  // An ethers.Provider instance. This will help us read from the contract
  // even if we don't have a logged in wallet. We set this up in _app.tsx.
  // This returns a new ethers.Contract ready to interact with our API.
  // We need to pass in the address of our deployed contract as well as its abi.
  const contract = wagmi.useContract({
    // Add the address that was output from your deploy script
    address: '0xd4435f714C5aC18d993F0aBBc9829ebE80E9e642',
    abi: VotingContract.abi,
    signerOrProvider: provider,
  });

  const getAllProjects = async (): Promise<Project[]> => {
    if (contract) {
      const qArray = await contract.getProjects();
      return qArray.map((q: Project) => ({ ...q }));
    } else return [];
  };

  const postProject = async (
    website: string,

    description: string
  ): Promise<void> => {
    if (contract) {
      const { data } = await contract.populateTransaction.postProject(
        website,
        description
      );
      console.log('data2', data);

      const request: any = {
        chainId: 84531,
        target: '0xd4435f714C5aC18d993F0aBBc9829ebE80E9e642',
        data: data,
        user: await signer.getAddress(),
      };

      console.log('request2', request);

      const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

      console.log(apiKey);

      const response = await relay.sponsoredCallERC2771(
        request,
        provider,
        apiKey
      );
      console.log('response', response);
    }
  };

  const upvoteProject = async (projectId: BigNumber) => {
    if (contract) {
      const { data } = await contract.populateTransaction.upvoteProject(
        projectId
      );

      const request: any = {
        chainId: 84531,
        target: '0xd4435f714C5aC18d993F0aBBc9829ebE80E9e642',
        data: data,
        user: await signer.getAddress(),
      };

      console.log('request', request);

      const apiKey = process.env.NEXT_PUBLIC_GELATO_API_KEY as string;

      console.log(apiKey);

      const response = await relay.sponsoredCallERC2771(
        request,
        provider,
        apiKey
      );
      console.log('response', response);
      return response.taskId;
    }
  };

  const getUpvotes = async (projectId: BigNumber): Promise<BigNumber> => {
    return contract ? await contract.getUpvotes(projectId) : 0;
  };

  return {
    contract,
    chainId: 84531,
    getAllProjects,
    postProject,
    upvoteProject,
    getUpvotes,
  };
};

export default useVotingContract;
