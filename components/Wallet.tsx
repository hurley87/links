import React from 'react';
import { Text } from '@chakra-ui/react';

// function to format user wallet address
const formatAddress = (address: string) => {
  return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
};

const Wallet = ({ address }: { address: string }) => {
  return <Text cursor="pointer">{formatAddress(address)}</Text>;
};

export default Wallet;
