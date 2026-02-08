import { referenceAuth } from '@aws-amplify/backend';

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Reuse an existing Cognito setup instead of creating a new pool in this backend.
export const auth = referenceAuth({
  userPoolId: requireEnv('AMPLIFY_USERPOOL_ID'),
  userPoolClientId: requireEnv('AMPLIFY_USERPOOL_CLIENT_ID'),
  identityPoolId: requireEnv('AMPLIFY_IDENTITYPOOL_ID'),
  authRoleArn: requireEnv('AMPLIFY_AUTH_ROLE_ARN'),
  unauthRoleArn: requireEnv('AMPLIFY_UNAUTH_ROLE_ARN'),
});
