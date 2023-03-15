import * as wagmi from 'wagmi';
import type { BigNumber } from 'ethers';
// Import our contract ABI (a json representation of our contract's public interface).
// The hardhat compiler writes this file to artifacts every time we run npx hardhat.
import VotingContract from './Voting.json';
import { magic } from '../lib/magic';
import { ethers } from 'ethers';
import { GelatoRelay } from '@gelatonetwork/relay-sdk';

const relay = new GelatoRelay();

export interface Project {
  projectId: BigNumber;
  //   name: string;
  description: string;
  //   tags: string;
  website: string;
  //   twitter: string;
  upvotes: BigNumber;
  creatorAddress: string;
}

export enum VotingEvent {
  ProjectUpvoted = 'ProjectUpvoted',
}

const useVotingContract = () => {
  // An ethers.Provider instance. This will help us read from the contract
  // even if we don't have a logged in wallet. We set this up in _app.tsx.
  if (magic.rpcProvider) {
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const signer = provider.getSigner();
    // This returns a new ethers.Contract ready to interact with our API.
    // We need to pass in the address of our deployed contract as well as its abi.
    const contract = wagmi.useContract({
      // Add the address that was output from your deploy script
      address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
      abi: VotingContract.abi,
      signerOrProvider: provider,
    });

    const signerContract = wagmi.useContract({
      address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
      abi: VotingContract.abi,
      signerOrProvider: signer,
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
      if (signerContract) {
        const { data } = await signerContract.populateTransaction.postProject(
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

        const response = await relay.sponsoredCallERC2771(
          request,
          provider,
          apiKey
        );
        console.log('response', response);
      }
    };

    const upvoteProject = async (projectId: BigNumber) => {
      if (signerContract) {
        const { data } = await signerContract.populateTransaction.upvoteProject(
          projectId
        );

        const request: any = {
          chainId: 84531,
          target: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
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
  }
};

export default useVotingContract;
