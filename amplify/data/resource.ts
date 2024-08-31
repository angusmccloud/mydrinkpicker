import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Cellar: a
    .model({
      userId: a.string(),
      Drinks: a.array(a.model({
        drinkId: a.string(),
        brand: a.string(),
        name: a.string(),
        bottlingSerie: a.string().optional(),
        statedAge: a.int().optional(),
        strength: a.float().optional(),
        type: a.string(),
        bottles: a.array(a.model({
          id: a.string(),
          status: a.string(),
          size: a.float().optional(),
          price: a.float().optional(),
          dateAdded: a.date(),
        })),
      })),
      triedDrinkIds: a.array(a.string()),
    })
    .authorization((allow) => [allow.guest()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'iam',
  },
});
