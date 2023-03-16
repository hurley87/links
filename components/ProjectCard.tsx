import { Project } from '@/hooks/contracts/useVotingContract';
import { Box, Flex, HStack, Link, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useState } from 'react';
import Upvote from './Upvote';

// function to format user wallet address
const formatAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const ProjectCard = ({ project }: { project: Project }) => {
  const [upvotes, setUpvotes] = useState(project?.upvotes?.toNumber() || 0);
  return (
    <>
      <Stack>
        <Flex gap="0">
          <Upvote setUpvotes={setUpvotes} project={project} />
          <Stack gap="0" spacing="0">
            <Box w="full">
              <HStack>
                <Link href={project.website} target="_blank" fontSize="xs">
                  <Text
                    fontSize={['sm', 'sm', 'md']}
                    fontWeight="semibold"
                    lineHeight="130%"
                    pb="0"
                  >
                    {project?.description}
                  </Text>
                </Link>
              </HStack>
              <HStack gap="0" spacing="1">
                <Text fontSize={['xs', 'xs', 'xs']} pb="0" mt="0">
                  {upvotes} {upvotes === 1 ? 'upvote' : 'upvotes'}
                </Text>
                <Text fontSize="xs">|</Text>
                <Text fontSize="xs" pb="0" mt="0">
                  submitted{' '}
                  {moment(project?.timestamp.toNumber() * 1000).fromNow()} by{' '}
                  <Link
                    href={`https://base-goerli.blockscout.com/address/${project?.creatorAddress}`}
                    target="_blank"
                    fontSize={['xs', 'xs', 'xs']}
                  >
                    {formatAddress(project?.creatorAddress)}
                  </Link>
                </Text>
              </HStack>
            </Box>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
};

export default ProjectCard;
