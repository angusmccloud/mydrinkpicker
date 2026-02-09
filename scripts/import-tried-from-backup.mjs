#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const getArg = (name) => {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
};

const hasFlag = (name) => process.argv.includes(`--${name}`);

const backupPath = getArg('backup') || path.resolve(process.cwd(), 'Dennis Backup.json');
const tableName = getArg('table');
const ownerArg = getArg('owner');
const userIdArg = getArg('user-id');
const region = getArg('region') || process.env.AWS_REGION || 'us-east-1';
const profile = getArg('profile') || process.env.AWS_PROFILE;
const dryRun = hasFlag('dry-run');

if (!tableName) {
  console.error('Usage: node scripts/import-tried-from-backup.mjs --table <TriedDrink table> [--owner <owner string>] [--user-id <user id prefix>] [--backup <path>] [--region us-east-1] [--profile <aws profile>] [--dry-run]');
  process.exit(1);
}

const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
const owner = ownerArg || backup.owner;
const userId = userIdArg || (owner ? owner.split('::')[0] : null);
const triedIds = Array.from(new Set((backup.triedDrinkIds || []).map((v) => String(v).trim()).filter(Boolean)));

if (!owner || !userId) {
  console.error('Could not resolve owner/user-id. Provide --owner/--user-id or ensure backup JSON includes owner.');
  process.exit(1);
}

if (triedIds.length === 0) {
  console.log('No triedDrinkIds found in backup. Nothing to import.');
  process.exit(0);
}

const now = new Date().toISOString();
const chunks = [];
for (let i = 0; i < triedIds.length; i += 25) {
  chunks.push(triedIds.slice(i, i + 25));
}

console.log(`Found ${triedIds.length} tried IDs. Writing ${chunks.length} batch(es) to ${tableName} in ${region}.`);
if (dryRun) {
  const sampleDrinkId = triedIds[0];
  const sampleItem = {
    id: `${userId}#tried#${sampleDrinkId}`,
    drinkId: parseInt(sampleDrinkId, 10),
    owner,
    createdAt: now,
    updatedAt: now,
    __typename: 'TriedDrink',
  };
  console.log('Dry-run sample item:', JSON.stringify(sampleItem, null, 2));
  console.log('Dry-run first 5 drinkIds:', JSON.stringify(triedIds.slice(0, 5)));
  console.log('Dry run enabled. No writes will be made.');
  process.exit(0);
}

let written = 0;
for (const chunk of chunks) {
  const requestItems = {
    [tableName]: chunk.map((drinkId) => ({
      PutRequest: {
        Item: {
          id: { S: `${userId}#tried#${drinkId}` },
          drinkId: { N: String(parseInt(drinkId, 10)) },
          owner: { S: owner },
          createdAt: { S: now },
          updatedAt: { S: now },
          __typename: { S: 'TriedDrink' },
        },
      },
    })),
  };

  const tempPath = path.resolve(process.cwd(), `.tmp-batch-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
  fs.writeFileSync(tempPath, JSON.stringify(requestItems));

  const args = ['dynamodb', 'batch-write-item', '--region', region, '--request-items', `file://${tempPath}`];
  if (profile) {
    args.unshift('--profile', profile);
  }

  const result = spawnSync('aws', args, { encoding: 'utf8' });
  fs.unlinkSync(tempPath);

  if (result.status !== 0) {
    console.error('Batch write failed:\n', result.stderr || result.stdout);
    process.exit(result.status || 1);
  }

  written += chunk.length;
}

console.log(`Done. Wrote ${written} TriedDrink records to ${tableName}.`);
