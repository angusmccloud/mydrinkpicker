import React, { useEffect, useState } from 'react';
// import { Amplify, Auth, Hub, DataStore } from 'aws-amplify';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Snackbar, Alert } from '@mui/material';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import {
  ErrorPage,
  HomePage,
  NotLoggedInPage,
  ManageDrinksPage
} from 'pages';
import { SnackbarContext, DefaultSnackbar, AuthContext, UnauthedUser } from 'contexts';
import { lightTheme } from 'theme/theme';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(outputs);

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/manage-drinks',
    element: <ManageDrinksPage />,
    errorElement: <ErrorPage />,
  },
]);

const notLoggedInRouter = createBrowserRouter([
  {
    path: '/*',
    element: <NotLoggedInPage />,
    errorElement: <ErrorPage />,
  },
]);

function App() {
  const [user, setUser] = useState(UnauthedUser);
  // const [user, setUser] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarDetails, setSnackbarDetails] = useState(DefaultSnackbar);
  const [awsUser, setAwsUser] = useState(undefined);

  // Pieces for the Snackbar Context
  const setSnackbar = (props) => {
    const { message, action, severity = 'success', duration = 7000 } = props;
    setSnackbarDetails({
      message: message,
      duration: duration,
      action: action,
      severity: severity,
    });
    setShowSnackbar(true);
  };

  const onDismissSnackBar = () => {
    setShowSnackbar(false);
    setSnackbarDetails(DefaultSnackbar);
  };

  // useEffect(() => {
  //   if(user.isAuthed && user.email) {
  //     const usersSubscription = DataStore.observeQuery(Users, (u) => u.and(u => [u.email.eq(user.email), u.enabled.eq(true)])).subscribe(({items}) => {
  //       if(items.length > 0) {
  //         const u = items[0];

  //         // Used for testing that role permissions are applied appropriately
  //         // const mockRoles = [
  //         //   // 'user',
  //         //   // 'dsr',
  //         //   // 'userAdmin',
  //         //   // 'admin',
  //         //   // 'projectOwner',
  //         //   // 'dsrAdmin',
  //         //   // 'architectureAdmin',
  //         //   // 'admin',
  //         // ]
  //         const newUser = {
  //           isAuthed: true, // Came from Cognito
  //           authCheckPending: false, // They're logged in
  //           roleCheckPending: false, // We're loading the roles now
  //           email: user.email, // Came from Cognito
  //           userId: u.id,
  //           congnitoId: user.congnitoId, // Came from Cognito
  //           name: u.name,
  //           enabled: u.roles.length > 0 ? u.enabled : false, // If the user has no roles (they only exist to be referenced on items), treat them as a non-enabled user in terms of what they can do
  //           roles: u.roles,
  //           // roles: mockRoles, // Used when testing user roles throughout app
  //           practices: u.practices,
  //         };
  //         if(JSON.stringify(user) !== JSON.stringify(newUser)) {
  //           setUser(newUser);
  //         }
  //       } else {
  //         // User isn't in our DB, so they'll have limited access
  //         const newUser = {
  //           isAuthed: true, // Came from Cognito
  //           authCheckPending: false, // They're logged in
  //           roleCheckPending: false, // We're loading the roles now
  //           email: user.email, // Came from Cognito
  //           userId: undefined,
  //           congnitoId: user.congnitoId, // Came from Cognito
  //           name: user.email,
  //           enabled: false, // Will come from DB
  //           roles: [],
  //           practices: [],
  //         };
  //         if(JSON.stringify(user) !== JSON.stringify(newUser)) {
  //           setUser(newUser);
  //         }
  //       }
  //     });

  //     return () => {
  //       usersSubscription.unsubscribe();
  //     }
  //   }
  // }, [user]);

  // useEffect(() => {
  //   const unsubscribe = Hub.listen('auth', ({ payload: { event, data } }) => {
  //     switch (event) {
  //       case 'signIn':
  //         const email = data.signInUserSession.idToken.payload.email;
  //         setUser({
  //           isAuthed: true,
  //           authCheckPending: false, // They're logged in
  //           roleCheckPending: true, // Will come from DB
  //           email: email,
  //           userId: undefined, // Will come from DB
  //           congnitoId: data.signInUserSession.idToken.payload.sub,
  //           name: undefined, // Will come from DB
  //           enabled: false, // Will come from DB
  //           roles: [], // Will come from DB
  //           practices: [], // Will come from DB
  //         })
  //         break;
  //       case 'signOut':
  //         console.log('-- Sign Out --');
  //         // setUser(null);
  //         setUser(UnauthedUser);
  //         break;
  //       default:
  //         // console.log('-- Some Other State --', event, data);
  //         break;
  //     }
  //   });

  //   Auth.currentAuthenticatedUser()
  //     .then((currentUser) => {
  //       const email = currentUser.signInUserSession.idToken.payload.email;
  //       setAwsUser(currentUser);
  //       setUser({
  //         isAuthed: true,
  //         authCheckPending: false, // They're logged in
  //         roleCheckPending: true, // Will come from DB
  //         email: email,
  //         userId: undefined, // Will come from DB
  //         congnitoId: currentUser.signInUserSession.idToken.payload.sub,
  //         name: undefined, // Will come from DB
  //         enabled: false, // Will come from DB
  //         roles: [], // Will come from DB
  //         practices: [], // Will come from DB
  //       })
  //     })
  //     .catch(() => {
  //       // console.log('Not signed in')
  //       setUser({
  //         isAuthed: false,
  //         authCheckPending: false, // They're not logged in
  //         roleCheckPending: false, // They're not logged in
  //         email: undefined,
  //         userId: undefined,
  //         congnitoId: undefined,
  //         name: undefined,
  //         enabled: false,
  //         roles: [],
  //         practices: [],
  //       })
  //     });

  //   return unsubscribe;
  // }, []);

  // This fetches the latest data from S3 and loads into our app, if the user is logged in (can't access S3 without Cognito token)
  // useEffect(() => {
  //   if(awsUser) {
  //     const token = awsUser.signInUserSession.idToken.jwtToken;
  //     loadData(token);
  //   }
  // }, [awsUser])

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <ThemeProvider theme={lightTheme}>
          <SnackbarContext.Provider
            value={{ snackbar: snackbarDetails, setSnackbar }}
          >
            <AuthContext.Provider value={{ user: user, setUser: setUser }}>
              <div>
                {/* {user.isAuthed || user.authCheckPending ? (
              <RouterProvider router={router} />
            ) : (
              <RouterProvider router={notLoggedInRouter} />
            )} */}
                <RouterProvider router={router} />
                <Snackbar
                  open={showSnackbar}
                  onClose={onDismissSnackBar}
                  message={snackbarDetails.message}
                  action={snackbarDetails.action}
                  autoHideDuration={snackbarDetails.duration}
                >
                  <Alert onClose={onDismissSnackBar} severity={snackbarDetails.severity} sx={{ width: '100%' }}>
                    {snackbarDetails.message}
                  </Alert>
                </Snackbar>
              </div>
            </AuthContext.Provider>
          </SnackbarContext.Provider>
        </ThemeProvider>
      )}
    </Authenticator>
  );
}

export default App;
