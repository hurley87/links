import type { NextPage } from 'next';
import Layout from '@/components/Layout';
import NewProjects from '@/components/NewProjects';

const New: NextPage = () => {
  return (
    <Layout>
      <NewProjects />
    </Layout>
  );
};

export default New;
