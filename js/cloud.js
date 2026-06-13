/* === KZN Hidden Gems — Cloud Sync (Supabase) ===
   Shares custom locations, reviews, and site-content edits across ALL visitors.

   ┌─────────────────────────────────────────────────────────────────────┐
   │  TO ACTIVATE: paste your Supabase Project URL + anon key below.       │
   │  Until then, the site runs exactly as before (browser-only storage).  │
   └─────────────────────────────────────────────────────────────────────┘ */

const SUPABASE_URL      = '';   // e.g. 'https://abcdxyz.supabase.co'
const SUPABASE_ANON_KEY = '';   // e.g. 'eyJhbGciOi...'  (the long public anon key)

// ──────────────────────────────────────────────────────────────────────────────
const CLOUD_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const TABLE = 'app_state';      // single key/value table: { key text, value jsonb }

function cloudHeaders() {
  return {
    'apikey':        SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type':  'application/json',
  };
}

// ── Read a single key's value (returns parsed JSON or null) ──────────────────
async function cloudGet(key) {
  if (!CLOUD_ENABLED) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?key=eq.${encodeURIComponent(key)}&select=value`,
      { headers: cloudHeaders() }
    );
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const rows = await res.json();
    return rows?.[0]?.value ?? null;
  } catch (e) {
    console.warn('[cloud] get failed:', e.message);
    return null;
  }
}

// ── Upsert a key's value ─────────────────────────────────────────────────────
async function cloudSet(key, value) {
  if (!CLOUD_ENABLED) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: { ...cloudHeaders(), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return true;
  } catch (e) {
    console.warn('[cloud] set failed:', e.message);
    return false;
  }
}

// ── High-level: custom locations (+ their reviews/alerts) ────────────────────
async function cloudPushLocations() {
  const list = (window.Storage?.loadCustomLocations?.() || []);
  return cloudSet('custom_locations', list);
}

async function cloudPullLocations() {
  const list = await cloudGet('custom_locations');
  if (!Array.isArray(list)) return false;
  // Persist locally and merge into the live dataset
  window.Storage?.saveCustomLocations?.(list);
  window.Storage?.mergeCustomLocations?.();
  return true;
}

// ── High-level: site content edits ───────────────────────────────────────────
async function cloudPushSiteContent(obj) {
  return cloudSet('site_content', obj);
}

async function cloudPullSiteContent() {
  const obj = await cloudGet('site_content');
  if (obj && typeof obj === 'object') {
    localStorage.setItem('kzn_site_content', JSON.stringify(obj));
    return true;
  }
  return false;
}

// ── Startup sync: pull shared data, then refresh the UI ──────────────────────
async function initCloudSync() {
  if (!CLOUD_ENABLED) return;
  const [gotLocations, gotContent] = await Promise.all([
    cloudPullLocations(),
    cloudPullSiteContent(),
  ]);
  if (gotContent && window.applySiteContent)  applySiteContent();
  if (gotLocations) {
    // Re-render whatever home views exist
    if (window.renderHomeCards)  renderHomeCards();
    if (window.renderCardGrid)   { /* handled inside renderHomeCards */ }
    if (window.refreshAdminTable && window.Storage?.isAdminAuthed?.()) refreshAdminTable();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Defer slightly so the initial synchronous render completes first
  setTimeout(initCloudSync, 50);
});

window.Cloud = {
  enabled: CLOUD_ENABLED,
  pushLocations:   cloudPushLocations,
  pullLocations:   cloudPullLocations,
  pushSiteContent: cloudPushSiteContent,
  pullSiteContent: cloudPullSiteContent,
  get: cloudGet,
  set: cloudSet,
};
