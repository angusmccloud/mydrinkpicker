import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

const emptyCellar = {
  drinks: [],
  cellarId: null,
  triedDrinkIds: [],
};

const formatCellar = async (cellar) => {
  try {
    // Convert from Strings to Numbers
    const triedDrinkIds = cellar.triedDrinkIds.map(id => parseInt(id));
    // console.log('-- triedDrinkIds --', triedDrinkIds);
    const drinks = cellar.drinks.map(rawDrink => {
      const drink = JSON.parse(rawDrink);
      // console.log('-- drink --', drink);
      const nonNullPrices = drink.bottles.map(bottle => bottle.price).filter(price => price !== null);
      const averagePrice = nonNullPrices.length >= 1 ? nonNullPrices.reduce((acc, price) => acc + price, 0) / nonNullPrices.length : null;

      let bottleStatus = 'Closed';
      const bottleStatuses = drink.bottles.map(bottle => bottle.status ? bottle.status.toLowerCase() : 'unknown');
      if (bottleStatuses.every(status => status === 'empty')) {
        bottleStatus = 'Empty';
      } else if (bottleStatuses.every(status => status === 'sample')) {
        bottleStatus = 'Sample';
      } else if (bottleStatuses.some(status => status === 'open')) {
        bottleStatus = 'Open';
      } else if (bottleStatuses.every(status => status === 'unknown')) {
        bottleStatus = 'Unknown';
      }

      const hasTried = triedDrinkIds.includes(drink.drinkId);

      return {
        ...drink,
        price: averagePrice || null,
        bottleStatus: bottleStatus,
        hasTried: hasTried,
        brand: drink.brand.toString()
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
  // const { userId } = await getCurrentUser();
  // console.log('-- userId --', userId);

  const { errors, data } = await client.models.Cellar.list({
    authMode: 'userPool',
  });

  if (errors) {
    console.error('-- Error fetching Data --', errors);
    return emptyCellar;
  }

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
    // const { userId } = await getCurrentUser();
    const { errors, data: existingCellar } = await client.models.Cellar.list({
      authMode: 'userPool',
    });

    if (errors) {
      console.error('-- Error fetching Data --', errors);
      return emptyCellar;
    }

    if (existingCellar?.length > 0) {
      console.log('-- User has an existing cellar, we need to replace existing list --');
      const cellar = existingCellar[0];
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
      } else {
        console.log('-- Successfully updated Cellar --');
      }
  
      return formatCellar(updatedDrinksData);
    } else {
      console.log('-- No Existing Cellar, Create a New One --');
      const newCellar = {
        drinks: drinksList,
        triedDrinkIds: [],
      };

      // const { data: newDrinksData , errors } = await client.models.Cellar.create({
      //   query: queries.createCellar,
      //   variables: newCellar,
      //   authMode: 'userPool',
      // });

      // const { errors, data: newDrinksData } = await client.models.Cellar.create(
      //   newCellar,
      //   { authMode: 'userPool' }
      // );

      const { errors, data: newDrinksData } = await client.models.Cellar.create(
        newCellar,
        { authMode: 'userPool'},
      );

      // console.log('-- newDrinksData --', newDrinksData);

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

// Can be passed a single drinkId, and add or remove as action
const updateTriedIds = async (drinkId, action) => {
  // console.log('-- drinkId --', drinkId);
  const client = generateClient();
  // const { userId } = await getCurrentUser();

  const { errors, data: existingCellar } = await client.models.Cellar.list({
    authMode: 'userPool',
  });

  if (errors) {
    console.error('-- Error fetching Data --', errors);
    return emptyCellar;
  }

  if (existingCellar?.length > 0) {
    const cellar = existingCellar[0];
    let triedDrinkIds = [...cellar.triedDrinkIds] || [];
    if (action === 'add') {
      triedDrinkIds.push(drinkId);
    } else if (action === 'remove') {
      triedDrinkIds = triedDrinkIds.filter(id => id !== drinkId.toString());
    } else if (action === 'clear') {
      triedDrinkIds = [];
    }

    const updatedCellar = {
      id: cellar.id,
      drinks: cellar.drinks,
      triedDrinkIds: triedDrinkIds,
    };
    // console.log('-- updatedCellar --', updatedCellar);

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
    console.error('-- No Cellar found to update triedDrinkIds --');
    return emptyCellar;
  }

}

const clearTriedDrinkIds = async () => {
  return await updateTriedIds(null, 'clear');
}

export {
  getCellar,
  createOrReplaceCellar,
  updateTriedIds,
  clearTriedDrinkIds,
};