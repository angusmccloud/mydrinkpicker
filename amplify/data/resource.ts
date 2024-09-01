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
        statedAge: a.string().optional(),
        strength: a.string(),
        type: a.string(),
        imageUrl: a.string().optional(),
        bottles: a.array(a.model({
          id: a.string(),
          status: a.string(),
          size: a.string(),
          price: a.string(),
          dateAdded: a.string(),
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
