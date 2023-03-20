import useClubContract from '@/hooks/contracts/useClubContract';
import { Project } from '@/hooks/contracts/useVotingContract';
import { UserContext } from '@/lib/UserContext';
import { Badge, Box, Flex, HStack, Link, Stack, Text } from '@chakra-ui/react';
import moment from 'moment';
import { useContext, useEffect, useState } from 'react';
import Upvote from './Upvote';

// function to format user wallet address
const formatAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const ProjectCard = ({ project }: { project: Project }) => {
  const [upvotes, setUpvotes] = useState(project?.upvotes?.toNumber() || 0);
  const [user, setUser]: any = useContext(UserContext);
  const contract = useClubContract(user?.signer, user?.provider);
  const [isFetched, setIsFetched] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (contract && project?.creatorAddress) {
        const balanceReturned = await contract.getBalance(
          project?.creatorAddress
        );
        const balance = parseInt(balanceReturned);
        setBalance(balance);
        setIsFetched(true);
      }
    };
    if (!isFetched) fetchBalance();
  }, [contract, isFetched, project]);

  return (
    <>
      <Stack>
        <Flex gap="0">
          <Upvote
            balance={balance}
            setBalance={setBalance}
            setUpvotes={setUpvotes}
            project={project}
          />
          <Stack spacing="0.5">
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
              <Link
                href={`https://base-goerli.blockscout.com/address/${project?.creatorAddress}?tab=token_transfers`}
                target="_blank"
                fontSize={['xs', 'xs', 'xs']}
              >
                <Badge colorScheme="orange">
                  {formatAddress(project?.creatorAddress)} | {balance}
                </Badge>
              </Link>
            </HStack>
            <HStack gap="0" spacing="1">
              <Text fontSize={['xs', 'xs', 'xs']} pb="0" mt="0">
                {upvotes} {upvotes === 1 ? 'upvote' : 'upvotes'}
              </Text>
              <Text fontSize="xs">|</Text>
              <HStack fontSize="xs" pb="0" mt="0" spacing="1">
                <Text>
                  {moment(project?.timestamp.toNumber() * 1000).fromNow()}
                </Text>
              </HStack>
            </HStack>
          </Stack>
        </Flex>
      </Stack>
    </>
  );
};

export default ProjectCard;
