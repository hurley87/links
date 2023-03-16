import { Stack } from '@chakra-ui/react';
import ProjectCard from './ProjectCard';
import ProjectsLoading from './ProjectLoading';
import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '@/lib/UserContext';
import VotingContract from '../hooks/contracts/Voting.json';
import * as wagmi from 'wagmi';
import { Project } from '@/hooks/contracts/useVotingContract';

const NewProjects = () => {
  const [user, _]: any = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const contract = wagmi.useContract({
    // Add the address that was output from your deploy script
    address: '0xF8ac8A09d6Ce1f2b68e9EBC0d5d42f91E8a758bC',
    abi: VotingContract.abi,
    signerOrProvider: user?.provider,
  });

  // use callback to fetch projects
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    if (contract) {
      const qArray = await contract.getProjects();
      setProjects(qArray.map((q: Project) => ({ ...q })));
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.loading) fetchData().catch((err) => console.error(err));
  }, [fetchData]);

  // console.log(user);
  return (
    <>
      <Stack gap={2} py="4">
        {isLoading && <ProjectsLoading />}
        {projects
          ?.sort(
            (
              a: { timestamp: { toNumber: () => number } },
              b: { timestamp: { toNumber: () => number } }
            ) => {
              return b.timestamp.toNumber() - a.timestamp.toNumber();
            }
          )
          .map((project: any, i: number) => (
            <ProjectCard key={i} project={project} />
          ))}
      </Stack>
    </>
  );
};

export default NewProjects;
