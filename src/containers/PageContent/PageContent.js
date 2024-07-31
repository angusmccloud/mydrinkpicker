import React, { useContext } from 'react';
import { Container, CircularProgress } from '@mui/material';
import { AuthContext } from '../../contexts';
import Header from '../Header/Header';

const PageContent = (props) => {
  const { pageName, pageKey, children, fullScreen } = props;
  const { user } = useContext(AuthContext);

  return (
    <>
      <Header
        pageName={pageName}
        pageKey={pageKey}
      />
      <Container sx={{
        padding: fullScreen ? '0px !important' : '20px 50px',
        maxWidth: fullScreen ? '100% !important' : null,
      }}>
        {children}
      </Container>
    </>
  );
}

export default PageContent;
