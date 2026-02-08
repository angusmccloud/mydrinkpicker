# Cellar Refactor Plan

## New model

The app stores user state in scalable records:

- `CurrentDrink`: one record per current drink, including drink fields and that drink's `bottles`.
- `TriedDrink`: one record per tried drink ID (`drinkId`) that persists over time.

No legacy `Cellar` model is used in the future-state backend.

This removes unbounded growth from single DynamoDB items. No single item contains an ever-growing `drinks[]` or `triedDrinkIds[]` list.

## Upload replace behavior

`createOrReplaceCellar` performs replacement as one user action:

1. Parse upload payload into drink objects.
2. Load persistent tried history from `TriedDrink`.
3. Replace all `CurrentDrink` records with the uploaded list.

The current list is always exactly the latest upload, and tried history remains intact.

## Persistent tried history across uploads

`updateTriedIds` and `clearTriedDrinkIds` operate on `TriedDrink` records:

- Mark tried: create/update a `TriedDrink` record.
- Remove tried: delete that `TriedDrink` record.
- Clear journey: delete all `TriedDrink` records.

Read paths (`getCellar`) load current drinks from `CurrentDrink` and derive `hasTried` by joining against `TriedDrink`. If a previously tried drink disappears and later reappears in a new upload, it is automatically marked as tried again.
