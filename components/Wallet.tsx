import React, { useContext } from 'react';
import NextLink from 'next/link';
import { Flex, Text, HStack } from '@chakra-ui/react';
import { UserContext } from '@/lib/UserContext';

// function to format user wallet address
const formatAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const Wallet = ({ address }: { address: string }) => {
  return <Text cursor="pointer">{formatAddress(address)}</Text>;
};

export default Wallet;
