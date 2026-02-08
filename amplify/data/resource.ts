import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  CurrentDrink: a
    .model({
      drinkId: a.integer().required(),
      brand: a.string().required(),
      name: a.string().required(),
      bottlingSerie: a.string(),
      statedAge: a.float(),
      strength: a.float(),
      type: a.string(),
      imageUrl: a.string(),
      bottles: a.json().array().required(),
    })
    .authorization((allow) => [allow.owner()]),

  TriedDrink: a
    .model({
      drinkId: a.integer().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  }
});
