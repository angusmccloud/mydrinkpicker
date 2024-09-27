import { generateClient, queries } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

const emptyCellar = {
  drinks: [],
  cellarId: null,
  triedDrinkIds: [],
};

const formatCellar = async (cellar) => {
  try {
    const triedDrinkIds = cellar.triedDrinkIds;
    const drinks = cellar.drinks.map(rawDrink => {
      const drink = JSON.parse(rawDrink);
      // console.log('-- drink --', drink);
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

      const hasTried = triedDrinkIds.includes(drink.drinkId);

      return {
        ...drink,
        price: averagePrice || null,
        bottleStatus: bottleStatus,
        hasTried: hasTried
      };
    });

    return {
      drinks: drinks,
      cellarId: cellar.id,
      triedDrinkIds: triedDrinkIds
    };
  } catch (error) {
    console.error('-- Error formatting users cellar --', error);
    return emptyCellar;
  }
}

const getCellar = async () => {
  const client = generateClient();
  const { userId } = await getCurrentUser();
  // console.log('-- userId --', userId);

  // const { data , errors } = await client.models.Cellar.list({
  //   query: queries.listCellars,
  //   authMode: 'userPool',
  // });

  const { errors, data } = await client.models.Cellar.list({
      // filter: {
      //   owner: { eq: userId }
      // },
      authMode: 'userPool',
    });

  if (errors) {
    console.error('-- Error fetching Data --', errors);
    return emptyCellar;
  }

  if (data.length === 0) {
    return emptyCellar;
  }

  return formatCellar(data[0]);
}

const createOrReplaceCellar = async (drinksList) => {
  try{
    const client = generateClient();
    const { userId } = await getCurrentUser();
    const existingCellar = await client.models.Cellar.list({
      filter: {
        owner: {
          eq: userId
        }
      }
    });

    if (existingCellar?.data?.length > 0) {
      console.log('-- Existing Cellar, Update Time --');;
      const cellar = existingCellar.data[0];
      const updatedCellar = {
        id: cellar.id,
        drinks: drinksList,
        triedDrinkIds: cellar.triedDrinkIds,
      };
      // const { errors, data: updatedDrinksData } = await client.models.Cellar.update(updatedCellar);
      const { errors, data: updatedDrinksData } = await client.models.Cellar.update(
        updatedCellar,
        { authMode: 'userPool' }
      );
  
      if (errors) {
        console.error('-- Error updating Cellar --', errors);
        return emptyCellar;
      }
  
      return formatCellar(updatedDrinksData);
    } else {
      console.log('-- No Existing Cellar, Create Time --');
      const newCellar = {
        drinks: drinksList,
        triedDrinkIds: [],
      };

      const { errors, data: newDrinksData } = await client.models.Cellar.create(
        newCellar,
        { authMode: 'userPool' }
      );

      console.log('-- newDrinksData --', newDrinksData);

      // const { errors, data: newDrinksData } = await client.models.Cellar.create(newCellar);
  
      if (errors) {
        console.error('-- Error creating Cellar --', errors);
        return emptyCellar;
      }
  
      return formatCellar(newDrinksData);
    }
  } catch (error) {
    console.error('-- Error creating Cellar --', error);
    return emptyCellar;
  }
}


export {
  getCellar,
  createOrReplaceCellar,
};