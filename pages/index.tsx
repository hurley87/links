import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import Projects from '@/components/Projects';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '@/lib/UserContext';
import useClubContract from '@/hooks/contracts/useClubContract';

const Home: NextPage = () => {
  const [user, setUser]: any = useContext(UserContext);
  const contract = useClubContract(user?.signer, user?.provider);
  const [isFetched, setIsFetched] = useState(false);

  console.log(user?.balance);

  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     if (contract && user?.address) {
  //       const balanceReturned = await contract.getBalance(user?.address);
  //       const balance = parseInt(balanceReturned);
  //       setIsFetched(true);
  //     }
  //   };
  //   if (!isFetched) fetchBalance();
  // }, [contract, setUser, user, isFetched]);

  return (
    <Layout>
      <Projects />
    </Layout>
  );
};

export default Home;
