import type { BigNumber } from 'ethers';
import { useMutation } from 'react-query';
import useVotingContract from './useVotingContract';

interface UseAddUpvotePayload {
  projectId: BigNumber;
}

const useAddUpvote = () => {
  const contract = useVotingContract();
  return useMutation(async ({ projectId }: UseAddUpvotePayload) => {
    if (contract) await contract.upvoteProject(projectId);
  });
};

export default useAddUpvote;
