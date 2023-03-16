import React, { useContext, useEffect, useState } from 'react';
import NextLink from 'next/link';
import { Flex, Text, HStack, Link } from '@chakra-ui/react';
import { UserContext } from '@/lib/UserContext';
import useClubContract from '@/hooks/contracts/useClubContract';
import { gelato } from '@/lib/gelato';

// function to format user wallet address
const formatAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const Navbar = () => {
  const [user, setUser]: any = useContext(UserContext);
  const contract = useClubContract(user?.signer, user?.provider);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (contract && user?.address) {
        const balance = await contract.getBalance(user?.address);
        setBalance(parseInt(balance));
      }
    };
    fetchBalance();
  }, [contract]);

  async function connect() {
    try {
      if (!gelato) {
        return;
      }
      await gelato.login();
    } catch (error) {
      console.log(error);
    }
  }

  const logout = async () => {
    if (!gelato) {
      return;
    }
    await gelato.logout();
    setUser(null);
  };

  return (
    <Flex
      justifyContent="space-between"
      w="full"
      p={1}
      bg="orange.800"
      color="orange.200"
    >
      <HStack gap={1}>
        <NextLink href="/" passHref>
          <Text
            transition="all 200ms linear"
            _active={{
              transform: 'scale(0.95)',
            }}
            fontWeight="black"
          >
            Club Links
          </Text>
        </NextLink>
        <HStack spacing={1}>
          <NextLink href="/new" passHref>
            <Text fontSize="sm">new</Text>
          </NextLink>
          <Text>|</Text>
          <NextLink href="/submit" passHref>
            <Text fontSize="sm">submit</Text>
          </NextLink>
        </HStack>
      </HStack>
      {user?.signer ? (
        <Flex
          justifyContent="center"
          alignItems="center"
          textDecoration="none"
          gap={2}
        >
          <Link
            href={`https://base-goerli.blockscout.com/address/${user.address}`}
            target="_blank"
            fontSize="sm"
            cursor="pointer"
          >
            {formatAddress(user.address)} ({balance} CLUB)
          </Link>
          <Text>|</Text>
          <Text fontSize="sm" cursor="pointer" onClick={logout}>
            logout
          </Text>
        </Flex>
      ) : (
        <Flex
          justifyContent="center"
          alignItems="center"
          textDecoration="none"
          gap={6}
        >
          <Text cursor="pointer" onClick={connect}>
            login
          </Text>
        </Flex>
      )}
    </Flex>
  );
};

export default Navbar;
