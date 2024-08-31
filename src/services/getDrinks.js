import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import { Auth } from 'aws-amplify';

const getDrinks = async () => {
  const client = generateClient<Schema>();
  const user = await Auth.currentAuthenticatedUser();
  const userId = user.signInUserSession.idToken.payload.sub;

  const { data: cellars, errors } = await client.models.Cellar.list({
    filter: {
      userId: {
        eq: userId,
      },
    },
  });

  if (cellars.length === 0) {
    return [];
  }

  const cellar = cellars[0];
  const drinks = cellar.drinks.map(drink => {
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
      hasTried: hasTried,
    };
  });

  return drinks;
}

export default getDrinks;
