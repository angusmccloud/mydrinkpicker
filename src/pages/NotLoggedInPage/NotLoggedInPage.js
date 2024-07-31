import React from 'react';
// import { Auth } from 'aws-amplify';
import { Button } from '../../components';
import { PageContent } from '../../containers';

const NotLoggedInPage = () => {
  return (
    <PageContent
      pageName=''
      pageKey='notLoggedIn'
    >
      <Button
        onClick={() => {
          // Auth.federatedSignIn(); // Amplify OOTB method, but takes you to a Cognito hosted UI that only has one login option
          window.location.href=`https://${process.env.REACT_APP_USER_POOL_ID}.auth.${process.env.REACT_APP_AWS_REGION}.amazoncognito.com/oauth2/authorize?response_type=code&client_id=${process.env.REACT_APP_COGNITO_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_SIGNIN_URL}&identity_provider=${process.env.REACT_APP_IDENTITY_PROVIDER}`;
        }}
      >
        Login with Single Sign On
      </Button>
    </PageContent>
  );
}

export default NotLoggedInPage;
