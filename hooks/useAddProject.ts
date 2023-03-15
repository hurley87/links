import { useMutation } from 'react-query';
import useVotingContract from './useVotingContract';

interface UseAddProjectPayload {
  name: string;
  description: string;
  tags: string;
  website: string;
  twitter: string;
}

const useAddProject = () => {
  const contract = useVotingContract();
  return useMutation(async ({ website, description }: UseAddProjectPayload) => {
    if (contract) await contract.postProject(website, description);
  });
};

export default useAddProject;
