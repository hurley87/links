import React, { useContext, useState } from 'react';
import { Button, FormControl, Input, Box } from '@chakra-ui/react';
import { magic } from '../lib/magic';
import { UserContext } from '@/lib/UserContext';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [_, setUser]: any = useContext(UserContext);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      setIsLoading(true); // disable login button to prevent multiple emails from being triggered

      // Trigger Magic link to be sent to user
      let didToken = await magic.auth.loginWithMagicLink({
        email,
        redirectURI: new URL('/callback', window.location.origin).href, // optional redirect back to your app after magic link is clicked
      });

      // Validate didToken with server
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + didToken,
        },
      });

      if (res.status === 200) {
        // Set the UserContext to the now logged in user
        let userMetadata = await magic.user.getMetadata();
        await setUser(userMetadata);

        setEmail('');
      }
    } catch (error) {
      setIsLoading(false); // re-enable login button - user may have requested to edit their email
      console.log(error);
    }
  };
  return (
    <Box maxW="lg" mx="auto">
      <form onSubmit={handleSubmit}>
        <FormControl id="role">
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            border="1px solid #d9e1ec"
            size="lg"
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormControl>

        <FormControl id="role">
          <Button
            isDisabled={email.length === 0}
            isLoading={isLoading}
            mt={2}
            colorScheme="green"
            w="full"
            size="lg"
            type="submit"
          >
            Continue
          </Button>
        </FormControl>
      </form>
    </Box>
  );
};

export default CreateAccount;
