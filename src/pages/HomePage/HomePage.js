import React, { useContext } from 'react';
import { PageContent } from '../../containers';
import { AuthContext } from '../../contexts';

const HomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <PageContent
      pageName=''
      pageKey='home'
    >
    </PageContent>
  );
}

export default HomePage;
