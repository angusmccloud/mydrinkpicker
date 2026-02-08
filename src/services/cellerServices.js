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

const listAllModelItems = async (listFn, authMode = 'userPool') => {
  const records = [];
  let nextToken;

  do {
    const response = await listFn({
      authMode,
      limit: LIST_PAGE_SIZE,
      nextToken,
    });

    if (response?.errors) {
      return { data: [], errors: response.errors };
    }

    records.push(...(response?.data || []));
    nextToken = response?.nextToken;
  } while (nextToken);

  return { data: records, errors: null };
};

const runInBatches = async (items, batchSize, worker) => {
  const settled = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
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
  const nonNullPrices = bottles.map((bottle) => bottle?.price).filter((price) => price !== null && price !== undefined);
  const averagePrice = nonNullPrices.length > 0
    ? nonNullPrices.reduce((acc, price) => acc + price, 0) / nonNullPrices.length
    : null;

  const bottleStatuses = bottles.map((bottle) => bottle?.status ? bottle.status.toLowerCase() : 'unknown');
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

const formatLegacyCellar = (cellar, triedDrinkIdsOverride = null) => {
  try {
    const legacyTriedDrinkIds = (cellar?.triedDrinkIds || [])
      .map((id) => toNumberId(id))
      .filter((id) => id !== null);
    const triedDrinkIds = triedDrinkIdsOverride || legacyTriedDrinkIds;

    const triedDrinkIdSet = new Set(triedDrinkIds);

    const drinks = (cellar?.drinks || [])
      .map((rawDrink) => coerceDrink(rawDrink))
      .filter(Boolean)
      .map((drink) => formatDrink(drink, triedDrinkIdSet))
      .filter((drink) => drink.drinkId !== null);

    return {
      drinks,
      cellarId: cellar.id,
      triedDrinkIds,
    };
  } catch (error) {
    console.error('-- Error formatting legacy cellar --', error);
    return emptyCellar;
  }
};

const getTriedDrinkIds = async (client) => {
  const { data: triedRecords, errors } = await listAllModelItems(client.models.TriedDrink.list.bind(client.models.TriedDrink));

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
  const { data, errors } = await listAllModelItems(client.models.CurrentDrink.list.bind(client.models.CurrentDrink));

  if (errors) {
    console.error('-- Error fetching current drinks --', errors);
    return null;
  }

  return data;
};

const getLegacyCellar = async (client) => {
  const { errors, data } = await client.models.Cellar.list({ authMode: 'userPool', limit: 1 });

  if (errors) {
    console.error('-- Error fetching legacy Cellar --', errors);
    return null;
  }

  return data?.[0] || null;
};

const upsertTriedIds = async (client, userId, triedDrinkIds) => {
  const uniqueIds = Array.from(new Set(triedDrinkIds));

  const settled = await runInBatches(uniqueIds, MUTATION_BATCH_SIZE, (drinkId) =>
    client.models.TriedDrink.create(
      {
        id: makeTriedDrinkRecordId(userId, drinkId),
        drinkId,
      },
      { authMode: 'userPool' }
    )
  );
  const hardFailures = settled.filter((result) => {
    if (result.status === 'rejected') {
      return true;
    }

    const errors = result.value?.errors || [];
    if (errors.length === 0) {
      return false;
    }

    const onlyAlreadyExists = errors.every((error) => (error?.message || '').toLowerCase().includes('already exists'));
    return !onlyAlreadyExists;
  });

  if (hardFailures.length > 0) {
    console.error('-- Error upserting tried drink ids --', hardFailures);
  }
};

const replaceCurrentDrinks = async (client, userId, drinks) => {
  const existingCurrentDrinks = await getCurrentDrinkRecords(client);
  if (existingCurrentDrinks === null) {
    return false;
  }

  if (existingCurrentDrinks.length > 0) {
    const deleteResults = await runInBatches(
      existingCurrentDrinks,
      MUTATION_BATCH_SIZE,
      (drink) => client.models.CurrentDrink.delete({ id: drink.id }, { authMode: 'userPool' })
    );

    const failedDeletes = deleteResults.filter((result) => result.status === 'rejected' || result.value?.errors?.length > 0);
    if (failedDeletes.length > 0) {
      console.error('-- Error clearing existing current drinks --', failedDeletes);
      return false;
    }
  }

  const createResults = await runInBatches(
    drinks,
    MUTATION_BATCH_SIZE,
    (drink) =>
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

  const failedCreates = createResults.filter((result) => result.status === 'rejected' || result.value?.errors?.length > 0);
  if (failedCreates.length > 0) {
    console.error('-- Error creating current drinks --', failedCreates);
    return false;
  }

  return true;
};

const deleteLegacyCellarIfPresent = async (client) => {
  const legacyCellar = await getLegacyCellar(client);

  if (!legacyCellar) {
    return;
  }

  const { errors } = await client.models.Cellar.delete({ id: legacyCellar.id }, { authMode: 'userPool' });
  if (errors?.length > 0) {
    console.error('-- Error deleting legacy Cellar during migration --', errors);
  }
};

const syncLegacyTriedIds = async (client, action, normalizedDrinkId = null) => {
  const currentDrinkRecords = await getCurrentDrinkRecords(client);
  if (currentDrinkRecords === null || currentDrinkRecords.length > 0) {
    return true;
  }

  const legacyCellar = await getLegacyCellar(client);
  if (!legacyCellar) {
    return true;
  }

  const legacyTried = (legacyCellar.triedDrinkIds || []).map((id) => id.toString());
  let nextLegacyTried = legacyTried;

  if (action === 'clear') {
    nextLegacyTried = [];
  } else if (action === 'add' && normalizedDrinkId !== null) {
    const stringId = normalizedDrinkId.toString();
    nextLegacyTried = legacyTried.includes(stringId) ? legacyTried : [...legacyTried, stringId];
  } else if (action === 'remove' && normalizedDrinkId !== null) {
    nextLegacyTried = legacyTried.filter((id) => id !== normalizedDrinkId.toString());
  }

  const { errors } = await client.models.Cellar.update(
    {
      id: legacyCellar.id,
      drinks: legacyCellar.drinks,
      triedDrinkIds: nextLegacyTried,
    },
    { authMode: 'userPool' }
  );

  if (errors?.length > 0) {
    console.error('-- Error syncing legacy tried ids --', errors);
    return false;
  }

  return true;
};

const getCellar = async () => {
  const client = generateClient();

  const [currentDrinkRecords, triedDrinkIds] = await Promise.all([
    getCurrentDrinkRecords(client),
    getTriedDrinkIds(client),
  ]);

  if (currentDrinkRecords === null || triedDrinkIds === null) {
    return emptyCellar;
  }

  if (currentDrinkRecords.length > 0) {
    return formatFromCurrentDrinks(currentDrinkRecords, triedDrinkIds);
  }

  const legacyCellar = await getLegacyCellar(client);
  if (legacyCellar) {
    const effectiveTriedDrinkIds = triedDrinkIds.length > 0
      ? triedDrinkIds
      : (legacyCellar.triedDrinkIds || [])
        .map((id) => toNumberId(id))
        .filter((id) => id !== null);

    return formatLegacyCellar(legacyCellar, effectiveTriedDrinkIds);
  }

  if (triedDrinkIds.length > 0) {
    return formatFromCurrentDrinks([], triedDrinkIds);
  }

  return emptyCellar;
};

const createOrReplaceCellar = async (drinksList) => {
  try {
    const client = generateClient();
    const { userId } = await getCurrentUser();

    const parsedDrinks = normalizeIncomingDrinksList(drinksList);

    let triedDrinkIds = await getTriedDrinkIds(client);
    if (triedDrinkIds === null) {
      return emptyCellar;
    }

    const legacyCellar = await getLegacyCellar(client);
    if (legacyCellar?.triedDrinkIds?.length > 0) {
      const legacyTriedIds = legacyCellar.triedDrinkIds
        .map((id) => toNumberId(id))
        .filter((id) => id !== null);

      triedDrinkIds = Array.from(new Set([...triedDrinkIds, ...legacyTriedIds]));
      await upsertTriedIds(client, userId, legacyTriedIds);
    }

    const replaced = await replaceCurrentDrinks(client, userId, parsedDrinks);
    if (!replaced) {
      return emptyCellar;
    }

    await deleteLegacyCellarIfPresent(client);

    return formatFromCurrentDrinks(parsedDrinks, triedDrinkIds);
  } catch (error) {
    console.error('-- Error replacing current drink list --', error);
    return emptyCellar;
  }
};

const updateTriedIds = async (drinkId, action) => {
  try {
    const client = generateClient();
    const { userId } = await getCurrentUser();

    if (action === 'clear') {
      const { data: existingTried, errors } = await listAllModelItems(client.models.TriedDrink.list.bind(client.models.TriedDrink));
      if (errors) {
        console.error('-- Error fetching tried drinks for clear --', errors);
        return emptyCellar;
      }

      const deleteResults = await runInBatches(
        existingTried,
        MUTATION_BATCH_SIZE,
        (triedRecord) => client.models.TriedDrink.delete({ id: triedRecord.id }, { authMode: 'userPool' })
      );

      const failedDeletes = deleteResults.filter((result) => result.status === 'rejected' || result.value?.errors?.length > 0);
      if (failedDeletes.length > 0) {
        console.error('-- Error clearing tried drinks --', failedDeletes);
        return emptyCellar;
      }

      const syncedLegacy = await syncLegacyTriedIds(client, 'clear');
      if (!syncedLegacy) {
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
        const notFoundOnly = errors.every((error) => (error?.message || '').toLowerCase().includes('not found'));
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
        const alreadyExistsOnly = errors.every((error) => (error?.message || '').toLowerCase().includes('already exists'));
        if (!alreadyExistsOnly) {
          console.error('-- Error adding tried drink id --', errors);
          return emptyCellar;
        }
      }
    }

    const syncedLegacy = await syncLegacyTriedIds(client, action, normalizedDrinkId);
    if (!syncedLegacy) {
      return emptyCellar;
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
      operation.drinkIds.forEach((drinkId) => triedDrinkIdSet.add(drinkId));
    }
  });

  const currentDrinkSet = new Set(currentDrinkIds);
  const triedInCurrent = Array.from(triedDrinkIdSet).filter((drinkId) => currentDrinkSet.has(drinkId));

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
