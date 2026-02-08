# Single-App Gen2 Cutover (Reuse Existing Cognito)

Goal: run frontend hosting + backend in one Amplify app (`d29pkywbp1ulxz`) and stop using the backend-only app.

## What changed in repo

- Auth backend now uses `referenceAuth(...)` and requires env vars for existing Cognito resources.
- Amplify scripts now target app id `d29pkywbp1ulxz`.

## One-time setup in Amplify Hosting app (d29pkywbp1ulxz)

Set these backend environment variables for branch `main` (or your deploy branch):

- `AMPLIFY_USERPOOL_ID`
- `AMPLIFY_USERPOOL_CLIENT_ID`
- `AMPLIFY_IDENTITYPOOL_ID`
- `AMPLIFY_AUTH_ROLE_ARN`
- `AMPLIFY_UNAUTH_ROLE_ARN`

Use values from the Cognito stack you are keeping.

## Cutover steps

1. Push this repo state to `main`.
2. Let Amplify Hosting build/deploy `main` for app `d29pkywbp1ulxz`.
3. After deploy, regenerate local outputs:
   - `npm run amplify:generate-outputs`
4. Verify outputs are new-model only:
   - `grep -n '"CurrentDrink"\|"TriedDrink"\|"Cellar"' src/amplify_outputs.json`
   - Expect `CurrentDrink` and `TriedDrink`, and no `Cellar`.
5. Build locally:
   - `npm run build`

## After cutover

- Stop using app `d1s042ouucc96o` for backend deploys.
- Remove any old CLI workflows that run `amplify pull/push`.
