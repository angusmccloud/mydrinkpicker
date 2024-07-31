import React, { useState, useEffect, useContext } from 'react';
// import { DataStore } from 'aws-amplify';
import { PageContent } from '../../containers';
import { AuthContext } from '../../contexts';

const HomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <PageContent
      pageName=''
      pageKey='home'
    >
      Placeholder for now
    </PageContent>
  );
}

export default HomePage;
