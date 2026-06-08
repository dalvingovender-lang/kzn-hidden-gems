/* === KZN Hidden Gems — Storage & Persistence Layer === */

const STORAGE_KEY = 'kzn_custom_locations';
const ADMIN_KEY   = 'kzn_admin_auth';
const ADMIN_PASS  = 'KZN@dmin2026';   // change to suit

// ── helpers ──────────────────────────────────────────────────────────────────
function loadCustomLocations() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveCustomLocations(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function isAdminAuthed() {
  return sessionStorage.getItem(ADMIN_KEY) === 'true';
}

function adminLogin(password) {
  if (password === ADMIN_PASS) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
    return true;
  }
  return false;
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY);
}

// ── merge custom locations into KZN_DATA at startup ──────────────────────────
function mergeCustomLocations() {
  const custom = loadCustomLocations();
  custom.forEach(loc => {
    loc.desirabilityIndex = calculateDesirabilityIndex(loc);
    loc.avgSafety         = getAverageScore(loc, 'safety');
    loc.avgParking        = getAverageScore(loc, 'parking');
    loc.avgCleanliness    = getAverageScore(loc, 'cleanliness');
    loc.avgCost           = getAverageScore(loc, 'cost');
    loc.avgEnvironmental  = getAverageScore(loc, 'environmental');
    loc.activeAlerts      = (loc.alerts || []).filter(a => a.active).length;
    loc.reviewCount       = (loc.reviews || []).length;
    loc._custom           = true;

    const existing = KZN_DATA.locations.findIndex(l => l.id === loc.id);
    if (existing >= 0) KZN_DATA.locations[existing] = loc;
    else               KZN_DATA.locations.push(loc);
  });
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
function saveLocation(locData) {
  // Generate an id from the name if not present
  if (!locData.id) {
    locData.id = locData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const custom = loadCustomLocations();
  const idx    = custom.findIndex(l => l.id === locData.id);
  if (idx >= 0) custom[idx] = locData;
  else          custom.push(locData);
  saveCustomLocations(custom);

  // Also update live KZN_DATA so the UI reflects immediately
  locData.desirabilityIndex = calculateDesirabilityIndex(locData);
  locData.avgSafety         = getAverageScore(locData, 'safety');
  locData.avgParking        = getAverageScore(locData, 'parking');
  locData.avgCleanliness    = getAverageScore(locData, 'cleanliness');
  locData.avgCost           = getAverageScore(locData, 'cost');
  locData.avgEnvironmental  = getAverageScore(locData, 'environmental');
  locData.activeAlerts      = (locData.alerts || []).filter(a => a.active).length;
  locData.reviewCount       = (locData.reviews || []).length;
  locData._custom           = true;

  const liveIdx = KZN_DATA.locations.findIndex(l => l.id === locData.id);
  if (liveIdx >= 0) KZN_DATA.locations[liveIdx] = locData;
  else              KZN_DATA.locations.push(locData);

  return locData;
}

function deleteLocation(locId) {
  // Only allow deleting custom locations
  const custom = loadCustomLocations().filter(l => l.id !== locId);
  saveCustomLocations(custom);
  const idx = KZN_DATA.locations.findIndex(l => l.id === locId);
  if (idx >= 0) KZN_DATA.locations.splice(idx, 1);
}

// expose
window.Storage = { loadCustomLocations, saveCustomLocations, isAdminAuthed, adminLogin, adminLogout, mergeCustomLocations, saveLocation, deleteLocation };
