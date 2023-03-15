import { useForm } from 'react-hook-form';
import {
  Button,
  FormControl,
  FormErrorMessage,
  Input,
  Spacer,
  Stack,
  Textarea,
  FormLabel,
} from '@chakra-ui/react';
import toast from 'react-hot-toast';
import useAddProject from '../hooks/useAddProject';
import { useRouter } from 'next/router';
import { useState } from 'react';

type CreateThreadInputs = {
  name: string;
  website: string;
  description: string;
  unassociated: null;
  email: string;
  tags: string;
  twitter: string;
  hostname: string;
  investment: string;
};

export default function New() {
  const { register, handleSubmit, formState, reset, setError, clearErrors } =
    useForm<CreateThreadInputs>();

  const { errors } = formState;
  const addProject = useAddProject();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: CreateThreadInputs) => {
    setIsLoading(true);
    try {
      await addProject.mutateAsync({ ...data });
      router.push('/');
      toast.success('Thank you!');
      reset();
      setIsLoading(false);
    } catch (error) {
      console.error('Something went wrong while posting a project...', error);
      toast.success('Error posting project.');
      setError('unassociated', {
        type: 'custom',
        message: 'You cannot post the same project twice! Try another.',
      });
      setIsLoading(false);
    }
  };

  const handleClearErrors = () => {
    if (errors.unassociated) {
      clearErrors();
    }
  };

  return (
    <Stack
      maxW="2xl"
      mx="auto"
      as="form"
      spacing={3}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Stack>
        <FormControl isInvalid={Boolean(errors.website)}>
          <FormLabel>Website</FormLabel>
          <Input
            placeholder="https://www.seedclub.xyz"
            variant="filled"
            w="100%"
            {...register('website', {
              required: {
                value: true,
                message: 'Please add a website.',
              },
              minLength: {
                value: 3,
                message: 'Title must contain at least 3 characters.',
              },
              maxLength: {
                value: 255,
                message: 'Title must contain less than 256 characters.',
              },
              onChange: handleClearErrors,
            })}
          />
          <FormErrorMessage>{errors.website?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={Boolean(errors.description)}>
          <FormLabel>Description</FormLabel>
          <Textarea
            placeholder="The leading accelerator for consumer crypto projects."
            variant="filled"
            {...register('description', {
              required: {
                value: true,
                message: 'Please add some content.',
              },
              minLength: {
                value: 8,
                message: 'Thread must contain at least 8 characters.',
              },
              maxLength: {
                value: 32767,
                message: 'Thread must contain less than 32,768 characters.',
              },
              onChange: handleClearErrors,
            })}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <Spacer />

        <Button
          isLoading={isLoading}
          type="submit"
          colorScheme="green"
          alignSelf="flex-end"
          fontWeight="extrabold"
          textTransform="uppercase"
          borderRadius="4px"
          py="8px"
          px="16px"
          fontSize="14px"
          lineHeight="24px"
        >
          Post
        </Button>
      </Stack>
    </Stack>
  );
}
