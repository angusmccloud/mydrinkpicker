import * as React from "react";

export const UnauthedUser = {
  isAuthed: false,
  authCheckPending: true,
  roleCheckPending: true,
  userId: undefined,
  congnitoId: undefined,
  name: undefined,
  email: undefined,
  enabled: false,
  roles: [],
  practices: [],
};

export const AuthContext = React.createContext(
  UnauthedUser // Default auth status
);