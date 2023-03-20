import React from 'react';
import { Skeleton, Stack } from '@chakra-ui/react';

const ProjectsLoading = () => {
  return (
    <Stack gap={4} pl="2">
      {Array.from(Array(10).keys()).map((i) => (
        <Stack key={i} gap="0">
          <Skeleton w="140px" h="24px" />
          <Skeleton w="90%" maxW="440px" h="20px" />
        </Stack>
      ))}
    </Stack>
  );
};

export default ProjectsLoading;
