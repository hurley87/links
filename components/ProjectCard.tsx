import { Project } from '@/hooks/useVotingContract';
import {
  Box,
  Button,
  Flex,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spacer,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import Upvote from './Upvote';

const ProjectCard = ({
  signer,
  web3AuthProvider,
  project,
}: {
  signer: any;
  web3AuthProvider: any;
  project: Project;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Stack
        backgroundColor="white"
        rounded="lg"
        gap="0"
        transition="all 2s linear"
        cursor="pointer"
        _hover={{
          bgGradient: 'linear(to-r, white, green.50)',
        }}
      >
        <Flex gap="4">
          <Stack gap="0" spacing="1">
            <Box w="full" onClick={onOpen}>
              <HStack>
                <Link
                  href={'https://' + project.website}
                  target="_blank"
                  fontSize="xs"
                >
                  <Text fontSize={['sm', 'md', 'lg']} fontWeight="bold" pb="1">
                    {project.website}
                  </Text>
                </Link>
              </HStack>
              <Text fontSize={['xs', 'sm', 'md']} pb="0" mt="0">
                {project?.description}
              </Text>
            </Box>
          </Stack>
          <Spacer />
          <Upvote
            signer={signer}
            web3AuthProvider={web3AuthProvider}
            project={project}
          />
        </Flex>
      </Stack>
    </>
  );
};

export default ProjectCard;
