import { BigNumber } from 'ethers';
import { useQuery } from 'react-query';
import useVotingContract from './useVotingContract';

interface UseUpvotesQuery {
  projectId: BigNumber;
}

const useUpvotes = ({ projectId }: UseUpvotesQuery) => {
  const contract = useVotingContract();

  return useQuery(['upvotes', projectId.toNumber()], async () => {
    return contract ? await contract.getUpvotes(projectId) : 0;
  });
};

export default useUpvotes;
