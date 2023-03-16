import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Box } from '@chakra-ui/react';
import Head from 'next/head';
import { DEFAULT_THEME, getThemeVariables } from '@magiclabs/ui';
type Props = {
  children?: ReactNode;
  title?: string;
};

const Layout = ({ children }: Props) => (
  <Box minH="100vh">
    <Head>
      <style
        type="text/css"
        dangerouslySetInnerHTML={{
          __html: getThemeVariables(DEFAULT_THEME).toCSS(),
        }}
      />
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta
        name="description"
        content="Learn about the latest consumer crypto projects with a <3 minute weekly newsletter."
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@seedclubhq" />
      <meta name="twitter:title" content="Consumer Crypto Club" />
      <meta
        name="twitter:description"
        content="Learn about the latest consumer crypto projects with a <3 minute weekly newsletter."
      />
      <meta
        name="twitter:image"
        content={`https://consumercrypto.club/future.png`}
      />
      <meta property="og:url" content={`https://consumercrypto.club`} />
      <meta property="og:title" content="Consumer Crpto Club Newsletter" />
      <meta
        property="og:description"
        content="Learn about the latest consumer crypto projects with a <3 minute weekly newsletter."
      />
      <meta
        property="og:image"
        content={`https://consumercrypto.club/future.png`}
      />
    </Head>

    <Box p={2} maxW="80em" w="full" mx="auto">
      <Navbar />
      <Box bg="orange.50">{children}</Box>
    </Box>
  </Box>
);

export default Layout;
