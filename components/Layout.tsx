import React, { ReactNode, useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  Stack,
} from '@chakra-ui/react';
import Head from 'next/head';
import useClubContract from '@/hooks/contracts/useClubContract';
import { UserContext } from '@/lib/UserContext';
import Mint from './Mint';
type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children }: Props) => {
  const [user, setUser]: any = useContext(UserContext);
  const contract = useClubContract(user?.signer, user?.provider);
  const [isFetched, setIsFetched] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [mintCount, setMintCount] = useState(1);

  useEffect(() => {
    const fetchBalance = async () => {
      if (contract && user?.address) {
        const balanceReturned = await contract.getBalance(user?.address);
        const mintCount = await contract?.getMintCount(user?.address);
        if (mintCount === 0) onOpen();
        setMintCount(mintCount);
        const balance = parseInt(balanceReturned);
        setUser({ ...user, balance });
        setIsFetched(true);
      }
    };
    if (!isFetched) fetchBalance();
  }, [contract, setUser, user, isFetched]);

  return (
    <Box minH="100vh">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Ideas worth paying for" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@seedclubhq" />
        <meta name="twitter:title" content="Consumer Crypto Club" />
        <meta name="twitter:description" content="Ideas worth paying for" />
        <meta
          name="twitter:image"
          content={`https://consumercrypto.club/future.png`}
        />
        <meta property="og:url" content={`https://consumercrypto.club`} />
        <meta property="og:title" content="ClubLink" />
        <meta property="og:description" content="Ideas worth paying for" />
        <meta
          property="og:image"
          content={`https://consumercrypto.club/future.png`}
        />
      </Head>

      <Box p={2} maxW="74em" w="full" mx="auto">
        <Navbar />
        <Box bg="orange.50">{children}</Box>
      </Box>
      <Modal size={'sm'} isOpen={mintCount === 0 && isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Stack p="4" gap="2">
              <Text fontSize="lg" fontWeight="bold">
                Welcome!
              </Text>
              <Text mt="0">
                {"You'll"} need tokens to upvote links. You can claim 5 CLUB
                tokens below.
              </Text>
              <Text mt="0">
                Each time you upvote a link {"you'll"} send a token to whoever
                submitted the link.
              </Text>
              <Text mt="0" pb="2">
                Earn CLUB tokens by submitting links that people are willing to
                upvote.
              </Text>
              <Mint onClose={onClose} />
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Layout;
