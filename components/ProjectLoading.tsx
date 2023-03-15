import React from 'react';
import { Flex, Skeleton, Stack } from '@chakra-ui/react';

const ProjectsLoading = () => {
  return (
    <Stack gap={6}>
      {[1, 2].map((i) => (
        <Stack key={i} backgroundColor="white" rounded="lg" gap="0">
          <Skeleton w="140px" h="24px" />
          <Skeleton w="100%" h="24px" />
          <Flex>
            <Skeleton w="100px" h="20px" pt="2" />
          </Flex>
        </Stack>
      ))}
    </Stack>
  );
};

export default ProjectsLoading;
