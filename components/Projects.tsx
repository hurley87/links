import { Stack } from '@chakra-ui/react';
import useProjects from '@/hooks/useProjects';
import ProjectCard from './ProjectCard';
import ProjectsLoading from './ProjectLoading';
import { useContext } from 'react';
import { UserContext } from '@/lib/UserContext';

const Projects = ({
  signer,
  web3AuthProvider,
}: {
  signer: any;
  web3AuthProvider: any;
}) => {
  const { allProjectsQuery } = useProjects();
  const [user, _]: any = useContext(UserContext);

  console.log(allProjectsQuery.data);

  return (
    <>
      <Stack gap={6} maxW="2xl" mx="auto" pt="10">
        {allProjectsQuery.isLoading && <ProjectsLoading />}
        {allProjectsQuery.data
          ?.sort((a, b) => {
            return b.upvotes.toNumber() - a.upvotes.toNumber();
          })
          .map((project, i) => (
            <ProjectCard
              signer={signer}
              web3AuthProvider={web3AuthProvider}
              key={i}
              project={project}
            />
          ))}
      </Stack>
    </>
  );
};

export default Projects;
