import React, { useState, useEffect, useContext } from 'react';
// import { DataStore } from 'aws-amplify';
import { PageContent } from '../../containers';
import { AuthContext } from '../../contexts';
import DrinkListContainer from '../../containers/DrinkListContainer/DrinkListContainer';

const HomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <PageContent
      pageName=''
      pageKey='home'
    >
      <DrinkListContainer />
    </PageContent>
  );
}

export default HomePage;
