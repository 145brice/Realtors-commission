#!/usr/bin/env node
/**
 * Manage the Appwrite `agents` collection from the command line.
 *
 * Usage (run from the project root):
 *   node scripts/manage-agents.mjs list                 # show every agent currently stored
 *   node scripts/manage-agents.mjs clear-demo           # delete the seeded demo agents
 *   node scripts/manage-agents.mjs clear-all            # delete EVERY agent (asks for --yes)
 *   node scripts/manage-agents.mjs import <file.json>   # upsert real agents from a JSON file
 *
 * It reads the same env vars the app uses, from your shell or .env.local.
 * Requires: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID,
 *           NEXT_PUBLIC_APPWRITE_DATABASE_ID, APPWRITE_API_KEY
 *           (NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID optional, defaults to "agents")
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// --- Load .env.local manually so you don't need any extra dependency ---
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // no .env.local — rely on real env vars
  }
}
loadEnvLocal();

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const apiKey = process.env.APPWRITE_API_KEY || '';
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AGENTS_COLLECTION_ID || 'agents';

if (!endpoint || !projectId || !databaseId || !apiKey) {
  console.error('Missing Appwrite env vars. Need ENDPOINT, PROJECT_ID, DATABASE_ID and APPWRITE_API_KEY.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
};

const base = `${endpoint}/databases/${databaseId}/collections/${collectionId}/documents`;

async function api(method, path = '', body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`${method} ${path || '/'} -> ${res.status} ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

async function listAll() {
  const all = [];
  let cursor = null;
  // page through everything (Appwrite returns max 100 per call)
  for (;;) {
    const queries = [JSON.stringify({ method: 'limit', values: [100] })];
    if (cursor) queries.push(JSON.stringify({ method: 'cursorAfter', values: [cursor] }));
    const qs = queries.map((q) => `queries[]=${encodeURIComponent(q)}`).join('&');
    const page = await api('GET', `?${qs}`);
    all.push(...page.documents);
    if (page.documents.length < 100) break;
    cursor = page.documents[page.documents.length - 1].$id;
  }
  return all;
}

// Heuristic for the seeded demo records: @realty.com emails or DRE-0123/0124 numbers.
function isDemo(doc) {
  const email = String(doc.email || '').toLowerCase();
  const license = String(doc.license_number || '').toUpperCase();
  return email.endsWith('@realty.com') || /0123456[0-9]|0124|0125/.test(license);
}

function toAgentData(a) {
  return {
    name: a.name || '',
    email: a.email || '',
    phone: a.phone || '',
    photo_url: a.photo_url || '',
    brokerage: a.brokerage || '',
    commission_rate: Number(a.commission_rate || 0),
    years_experience: Number(a.years_experience || 0),
    total_sales: Number(a.total_sales || 0),
    avg_days_on_market: Number(a.avg_days_on_market || 0),
    rating: Number(a.rating || 0),
    review_count: Number(a.review_count || 0),
    bio: a.bio || '',
    specialties: a.specialties || [],
    languages: a.languages || ['English'],
    license_number: a.license_number || '',
    office_address: a.office_address || '',
    latitude: Number(a.latitude || 34.0522),
    longitude: Number(a.longitude || -118.2437),
    area_served: a.area_served || '',
    city: a.city || '',
    state: a.state || '',
    zip_codes: a.zip_codes || [],
    neighborhoods: a.neighborhoods || [],
    verified: a.verified !== false,
    accepts_referrals: a.accepts_referrals !== false,
  };
}

function docId(a) {
  return (a.id || a.license_number || a.email || '')
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .slice(0, 36) || undefined;
}

async function deleteDocs(docs, label) {
  for (const d of docs) {
    await api('DELETE', `/${d.$id}`);
    console.log(`  deleted ${d.name || d.$id}`);
  }
  console.log(`Deleted ${docs.length} ${label} agent(s).`);
}

async function upsert(a) {
  const id = docId(a);
  const data = toAgentData(a);
  try {
    await api('POST', '', { documentId: id || 'unique()', data, permissions: ['read("any")'] });
    console.log(`  created ${a.name}`);
  } catch (err) {
    if (String(err.message).includes('409') && id) {
      await api('PATCH', `/${id}`, { data });
      console.log(`  updated ${a.name}`);
    } else {
      throw err;
    }
  }
}

async function main() {
  const [cmd, arg] = process.argv.slice(2);

  switch (cmd) {
    case 'list': {
      const docs = await listAll();
      console.log(`${docs.length} agent(s):`);
      for (const d of docs) {
        console.log(`  ${isDemo(d) ? '[DEMO] ' : ''}${d.name} <${d.email}> ${d.license_number}`);
      }
      break;
    }
    case 'clear-demo': {
      const demo = (await listAll()).filter(isDemo);
      if (!demo.length) {
        console.log('No demo agents found.');
        break;
      }
      await deleteDocs(demo, 'demo');
      break;
    }
    case 'clear-all': {
      if (arg !== '--yes') {
        console.log('Refusing to delete ALL agents. Re-run: clear-all --yes');
        break;
      }
      await deleteDocs(await listAll(), 'total');
      break;
    }
    case 'import': {
      if (!arg) {
        console.log('Usage: import <file.json>');
        break;
      }
      const list = JSON.parse(readFileSync(resolve(process.cwd(), arg), 'utf8'));
      if (!Array.isArray(list)) throw new Error('JSON file must be an array of agents.');
      console.log(`Importing ${list.length} agent(s)...`);
      for (const a of list) await upsert(a);
      console.log('Import complete.');
      break;
    }
    default:
      console.log('Commands: list | clear-demo | clear-all --yes | import <file.json>');
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
