import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';

const emptyCellar = {
  drinks: [],
  cellarId: null,
  triedDrinkIds: [],
};

const LIST_PAGE_SIZE = 1000;
const MUTATION_BATCH_SIZE = 25;

const toNumberId = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const makeCurrentDrinkRecordId = (userId, drinkId) => `${userId}#drink#${drinkId}`;
const makeTriedDrinkRecordId = (userId, drinkId) => `${userId}#tried#${drinkId}`;

const assertScalableModels = (client) => {
  const hasCurrentDrink = Boolean(client?.models?.CurrentDrink);
  const hasTriedDrink = Boolean(client?.models?.TriedDrink);

  if (!hasCurrentDrink || !hasTriedDrink) {
    throw new Error('CurrentDrink/TriedDrink models are unavailable. Deploy backend and refresh amplify_outputs.json.');
  }
};

const listAllModelItems = async (model, authMode = 'userPool') => {
  const records = [];
  let nextToken;

  do {
    const response = await model.list({
      authMode,
      limit: LIST_PAGE_SIZE,
      nextToken,
    });

    if (response?.errors?.length > 0) {
      return { data: [], errors: response.errors };
    }

    records.push(...(response?.data || []));
    nextToken = response?.nextToken;
  } while (nextToken);

  return { data: records, errors: null };
};

const runInBatches = async (items, worker) => {
  const settled = [];

  for (let i = 0; i < items.length; i += MUTATION_BATCH_SIZE) {
    const batch = items.slice(i, i + MUTATION_BATCH_SIZE);
    const batchSettled = await Promise.allSettled(batch.map(worker));
    settled.push(...batchSettled);
  }

  return settled;
};

const coerceDrink = (rawDrink) => {
  if (!rawDrink) {
    return null;
  }

  if (typeof rawDrink === 'string') {
    return JSON.parse(rawDrink);
  }

  return rawDrink;
};

const normalizeIncomingDrinksList = (drinksPayload) => {
  const rawDrinks = Array.isArray(drinksPayload)
    ? drinksPayload
    : Array.isArray(drinksPayload?.drinks)
      ? drinksPayload.drinks
      : [];

  return rawDrinks
    .map((rawDrink) => coerceDrink(rawDrink))
    .filter(Boolean)
    .map((drink) => ({
      ...drink,
      drinkId: toNumberId(drink.drinkId),
      bottles: Array.isArray(drink.bottles) ? drink.bottles : [],
    }))
    .filter((drink) => drink.drinkId !== null);
};

const formatDrink = (drink, triedDrinkIdSet) => {
  const bottles = Array.isArray(drink.bottles) ? drink.bottles : [];
  const nonNullPrices = bottles
    .map((bottle) => bottle?.price)
    .filter((price) => price !== null && price !== undefined);
  const averagePrice = nonNullPrices.length > 0
    ? nonNullPrices.reduce((acc, price) => acc + price, 0) / nonNullPrices.length
    : null;

  const bottleStatuses = bottles.map((bottle) => (bottle?.status ? bottle.status.toLowerCase() : 'unknown'));
  let bottleStatus = 'Closed';

  if (bottleStatuses.length === 0 || bottleStatuses.every((status) => status === 'unknown')) {
    bottleStatus = 'Unknown';
  } else if (bottleStatuses.every((status) => status === 'empty')) {
    bottleStatus = 'Empty';
  } else if (bottleStatuses.every((status) => status === 'sample')) {
    bottleStatus = 'Sample';
  } else if (bottleStatuses.some((status) => status === 'open')) {
    bottleStatus = 'Open';
  }

  const drinkId = toNumberId(drink.drinkId);

  return {
    ...drink,
    drinkId,
    brand: drink.brand?.toString?.() || '',
    bottles,
    price: averagePrice,
    bottleStatus,
    hasTried: drinkId !== null && triedDrinkIdSet.has(drinkId),
  };
};

const formatFromCurrentDrinks = (currentDrinks, triedDrinkIds) => {
  const triedDrinkIdSet = new Set(triedDrinkIds);

  return {
    drinks: currentDrinks
      .map((currentDrink) => formatDrink(currentDrink, triedDrinkIdSet))
      .filter((drink) => drink.drinkId !== null),
    cellarId: null,
    triedDrinkIds,
  };
};

const getTriedDrinkIds = async (client) => {
  const { data: triedRecords, errors } = await listAllModelItems(client.models.TriedDrink);

  if (errors) {
    console.error('-- Error fetching tried drinks --', errors);
    return null;
  }

  const triedDrinkIds = triedRecords
    .map((record) => toNumberId(record.drinkId))
    .filter((id) => id !== null);

  return Array.from(new Set(triedDrinkIds));
};

const getCurrentDrinkRecords = async (client) => {
  const { data, errors } = await listAllModelItems(client.models.CurrentDrink);

  if (errors) {
    console.error('-- Error fetching current drinks --', errors);
    return null;
  }

  return data;
};

const replaceCurrentDrinks = async (client, userId, drinks) => {
  const existingCurrentDrinks = await getCurrentDrinkRecords(client);
  if (existingCurrentDrinks === null) {
    return false;
  }

  if (existingCurrentDrinks.length > 0) {
    const deleteResults = await runInBatches(existingCurrentDrinks, (drink) =>
      client.models.CurrentDrink.delete({ id: drink.id }, { authMode: 'userPool' })
    );

    const failedDeletes = deleteResults.filter(
      (result) => result.status === 'rejected' || result.value?.errors?.length > 0
    );
    if (failedDeletes.length > 0) {
      console.error('-- Error clearing existing current drinks --', failedDeletes);
      return false;
    }
  }

  const createResults = await runInBatches(drinks, (drink) =>
    client.models.CurrentDrink.create(
      {
        id: makeCurrentDrinkRecordId(userId, drink.drinkId),
        drinkId: drink.drinkId,
        brand: drink.brand,
        name: drink.name,
        bottlingSerie: drink.bottlingSerie || null,
        statedAge: drink.statedAge ?? null,
        strength: drink.strength ?? null,
        type: drink.type || null,
        imageUrl: drink.imageUrl || '',
        bottles: Array.isArray(drink.bottles) ? drink.bottles : [],
      },
      { authMode: 'userPool' }
    )
  );

  const failedCreates = createResults.filter(
    (result) => result.status === 'rejected' || result.value?.errors?.length > 0
  );
  if (failedCreates.length > 0) {
    console.error('-- Error creating current drinks --', failedCreates);
    return false;
  }

  return true;
};

const getCellar = async () => {
  try {
    const client = generateClient();
    assertScalableModels(client);

    const [currentDrinkRecords, triedDrinkIds] = await Promise.all([
      getCurrentDrinkRecords(client),
      getTriedDrinkIds(client),
    ]);

    if (currentDrinkRecords === null || triedDrinkIds === null) {
      return emptyCellar;
    }

    return formatFromCurrentDrinks(currentDrinkRecords, triedDrinkIds);
  } catch (error) {
    console.error('-- Error fetching cellar --', error);
    return emptyCellar;
  }
};

const createOrReplaceCellar = async (drinksList) => {
  try {
    const client = generateClient();
    assertScalableModels(client);

    const { userId } = await getCurrentUser();
    const parsedDrinks = normalizeIncomingDrinksList(drinksList);

    const triedDrinkIds = await getTriedDrinkIds(client);
    if (triedDrinkIds === null) {
      return emptyCellar;
    }

    const replaced = await replaceCurrentDrinks(client, userId, parsedDrinks);
    if (!replaced) {
      return emptyCellar;
    }

    return formatFromCurrentDrinks(parsedDrinks, triedDrinkIds);
  } catch (error) {
    console.error('-- Error replacing current drink list --', error);
    return emptyCellar;
  }
};

const updateTriedIds = async (drinkId, action) => {
  try {
    const client = generateClient();
    assertScalableModels(client);

    const { userId } = await getCurrentUser();

    if (action === 'clear') {
      const { data: existingTried, errors } = await listAllModelItems(client.models.TriedDrink);
      if (errors) {
        console.error('-- Error fetching tried drinks for clear --', errors);
        return emptyCellar;
      }

      const deleteResults = await runInBatches(existingTried, (triedRecord) =>
        client.models.TriedDrink.delete({ id: triedRecord.id }, { authMode: 'userPool' })
      );

      const failedDeletes = deleteResults.filter(
        (result) => result.status === 'rejected' || result.value?.errors?.length > 0
      );
      if (failedDeletes.length > 0) {
        console.error('-- Error clearing tried drinks --', failedDeletes);
        return emptyCellar;
      }

      return getCellar();
    }

    const normalizedDrinkId = toNumberId(drinkId);
    if (normalizedDrinkId === null) {
      return getCellar();
    }

    const id = makeTriedDrinkRecordId(userId, normalizedDrinkId);

    if (action === 'remove') {
      const { errors } = await client.models.TriedDrink.delete({ id }, { authMode: 'userPool' });
      if (errors?.length > 0) {
        const notFoundOnly = errors.every((error) =>
          (error?.message || '').toLowerCase().includes('not found')
        );
        if (!notFoundOnly) {
          console.error('-- Error removing tried drink id --', errors);
          return emptyCellar;
        }
      }
    } else if (action === 'add') {
      const { errors } = await client.models.TriedDrink.create(
        {
          id,
          drinkId: normalizedDrinkId,
        },
        { authMode: 'userPool' }
      );

      if (errors?.length > 0) {
        const alreadyExistsOnly = errors.every((error) =>
          (error?.message || '').toLowerCase().includes('already exists')
        );
        if (!alreadyExistsOnly) {
          console.error('-- Error adding tried drink id --', errors);
          return emptyCellar;
        }
      }
    }

    return getCellar();
  } catch (error) {
    console.error('-- Error updating tried drink ids --', error);
    return emptyCellar;
  }
};

const clearTriedDrinkIds = async () => updateTriedIds(null, 'clear');

const applyUploadAndTriedOperations = (operations) => {
  let currentDrinkIds = [];
  const triedDrinkIdSet = new Set();

  operations.forEach((operation) => {
    if (operation.type === 'upload') {
      currentDrinkIds = [...operation.drinkIds];
      return;
    }

    if (operation.type === 'markTried') {
      operation.drinkIds.forEach((id) => triedDrinkIdSet.add(id));
    }
  });

  const currentDrinkSet = new Set(currentDrinkIds);
  const triedInCurrent = Array.from(triedDrinkIdSet).filter((id) => currentDrinkSet.has(id));

  return {
    currentDrinkIds,
    triedInCurrent,
    persistentTriedDrinkIds: Array.from(triedDrinkIdSet),
  };
};

export {
  getCellar,
  createOrReplaceCellar,
  updateTriedIds,
  clearTriedDrinkIds,
  applyUploadAndTriedOperations,
};
