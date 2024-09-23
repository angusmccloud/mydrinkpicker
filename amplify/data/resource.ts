import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Cellar: a
    .model({
      userId: a.string(),
      drinks: a.json().array(),
      triedDrinkIds: a.string().array(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 30 }
  }
});