import { useQuery } from 'react-query';
import useVotingContract from './useVotingContract';

const useProjects = () => {
  const contract = useVotingContract();

  const allProjectsQuery = useQuery(['projects'], async () => {
    if (contract) return await contract.getAllProjects();
  });

  return { allProjectsQuery };
};

export default useProjects;
