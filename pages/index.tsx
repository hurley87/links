import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import Projects from '@/components/Projects';

const Home: NextPage = () => {
  return (
    <Layout>
      <Projects />
    </Layout>
  );
};

export default Home;
