import React from 'react';
import { PageContent } from '..';
import { Typography } from '../../components';

const CantAccessContent = () => {
  return (
    <>
      <Typography variant={'h4'}>
        You don't have permission to access this page.
      </Typography>
      <Typography variant={'h6'}>
        Please talk to one of the application Admins if you feel you've reached this page in error.
      </Typography>
    </>
  );
}

export default CantAccessContent;
