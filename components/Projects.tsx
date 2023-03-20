import { Stack } from '@chakra-ui/react';
import ProjectCard from './ProjectCard';
import ProjectsLoading from './ProjectLoading';
import { useCallback, useContext, useEffect, useState } from 'react';
import { UserContext } from '@/lib/UserContext';
import VotingContract from '../hooks/contracts/Voting.json';
import * as wagmi from 'wagmi';
import { Project } from '@/hooks/contracts/useVotingContract';

const Projects = () => {
  const [user, _]: any = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any>([]);
  const contract = wagmi.useContract({
    // Add the address that was output from your deploy script
    address: '0x93697e88337ee711C137752579A64C7d2D6dD122',
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

  return (
    <>
      <Stack gap={3} py="4">
        {isLoading && <ProjectsLoading />}
        {projects
          ?.sort(
            (
              a: { upvotes: { toNumber: () => number } },
              b: { upvotes: { toNumber: () => number } }
            ) => {
              return b.upvotes.toNumber() - a.upvotes.toNumber();
            }
          )
          .map((project: any, i: number) => (
            <ProjectCard key={i} project={project} />
          ))}
      </Stack>
    </>
  );
};

export default Projects;
