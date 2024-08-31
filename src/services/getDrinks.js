import { API, Auth } from 'aws-amplify';

const getDrinks = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const userId = user.attributes.sub;

    const result = await API.graphql({
      query: `query GetCellar($userId: String!) {
        getCellar(userId: $userId) {
          Drinks {
            drinkId
            brand
            name
            bottlingSerie
            statedAge
            strength
            type
            bottles {
              id
              status
              size
              price
              dateAdded
            }
          }
          triedDrinkIds
        }
      }`,
      variables: { userId: userId },
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    });

    const cellar = result.data.getCellar;

    if (!cellar) {
      return [];
    }

    const drinks = cellar.Drinks.map(drink => {
      const nonNullPrices = drink.bottles.map(bottle => bottle.price).filter(price => price !== null);
      const averagePrice = nonNullPrices.reduce((acc, price) => acc + price, 0) / nonNullPrices.length;

      let bottleStatus = 'Closed';
      const bottleStatuses = drink.bottles.map(bottle => bottle.status.toLowerCase());
      if (bottleStatuses.every(status => status === 'empty')) {
        bottleStatus = 'Empty';
      } else if (bottleStatuses.every(status => status === 'sample')) {
        bottleStatus = 'Sample';
      } else if (bottleStatuses.some(status => status === 'open')) {
        bottleStatus = 'Open';
      }

      const hasTried = cellar.triedDrinkIds.includes(drink.drinkId);

      return {
        ...drink,
        price: averagePrice,
        bottleStatus: bottleStatus,
        hasTried: hasTried
      };
    });

    return drinks;
  } catch (error) {
    console.error('Error fetching drinks:', error);
    return [];
  }
};

export default getDrinks;
