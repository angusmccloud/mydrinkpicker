# Cellar Refactor Plan

## New model

The app now stores user cellar state in scalable records instead of one giant `Cellar` item:

- `CurrentDrink`: one record per current drink, including drink fields and that drink's `bottles`.
- `TriedDrink`: one record per tried drink ID (`drinkId`) that persists over time.
- `Cellar` is retained only as a temporary legacy fallback for migrate-on-next-upload behavior.

This removes unbounded growth from single DynamoDB items. No single item contains an ever-growing `drinks[]` or `triedDrinkIds[]` list.

## Upload replace behavior

`createOrReplaceCellar` now performs replacement as one user action:

1. Parse upload file into drink objects.
2. Load persistent tried history from `TriedDrink`.
3. If needed, migrate legacy `Cellar.triedDrinkIds` into `TriedDrink`.
4. Replace all `CurrentDrink` records with the uploaded list.
5. Delete legacy `Cellar` record after successful migration.

The current list is always exactly the latest upload, and tried history remains intact.

## Persistent tried history across uploads

`updateTriedIds` and `clearTriedDrinkIds` now operate on `TriedDrink` records:

- Mark tried: add/update `TriedDrink` record.
- Remove tried: delete that `TriedDrink` record.
- Clear journey: delete all `TriedDrink` records.

Read paths (`getCellar`) load current drinks from `CurrentDrink` and derive `hasTried` by joining against `TriedDrink`. If a previously tried drink disappears and later reappears in a new upload, it is automatically marked as tried again.

## Legacy backup compatibility

The service normalizes both modern upload arrays and legacy `Cellar`-shaped payloads (`{ drinks: [...] }`), including legacy stringified drink entries, so historical exports can be migrated cleanly into `CurrentDrink` records.
