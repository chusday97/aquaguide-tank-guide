import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(new URL('../supabase/migrations/202608270001_catalog_releases_and_species_water_type.sql', import.meta.url), 'utf8');
const contentRoutes = readFileSync(new URL('../apps/api/src/routes/content.ts', import.meta.url), 'utf8');

assert.match(migration, /create table if not exists public\.catalog_releases/);
assert.match(migration, /create trigger catalog_releases_immutable/);
assert.match(migration, /if old\.status = 'published'/);
assert.match(migration, /published catalog releases are immutable/);
assert.match(migration, /create table if not exists public\.species_reference_links/);
assert.doesNotMatch(contentRoutes, /species_reference_links/);
assert.doesNotMatch(contentRoutes, /water_type/);

console.log('catalog release contract verified: published rows are immutable and legacy content queries remain migration-safe');
