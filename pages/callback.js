import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { magic } from '../lib/magic';
import { UserContext } from '../lib/UserContext';
import { Box } from '@chakra-ui/react';
import CarLottie from '../components/BullLottie';

const Callback = () => {
  const router = useRouter();
  const [, setUser] = useContext(UserContext);

  useEffect(() => {
    // Send token to server to validate
    const authenticateWithServer = async (didToken) => {
      let res = await fetch('/api/login', {
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
        router.push('/');
      }
    };
    if (router.query.magic_credential)
      magic.auth
        .loginWithCredential()
        .then((didToken) => authenticateWithServer(didToken));
  }, [router, setUser]);

  return (
    <Box maxW="xs" mx="auto" mt="10">
      <CarLottie />
    </Box>
  );
};

export default Callback;
