import React, { useContext } from 'react';
import { Container, CircularProgress } from '@mui/material';
import { AuthContext } from '../../contexts';
import Header from '../Header/Header';

const PageContent = (props) => {
  const { pageName, pageKey, children, fullScreen, fetchDrinks } = props;
  const { user } = useContext(AuthContext);

  return (
    <>
      <Header
        pageName={pageName}
        pageKey={pageKey}
        fetchDrinks={fetchDrinks}
      />
      <Container sx={{height: '100vh', marginTop: '0px'}} component={'div'}>
        {children}
      </Container>
    </>
  );
}

export default PageContent;
