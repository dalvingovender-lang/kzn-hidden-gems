/* === KZN Hidden Gems — Wikipedia Smart Fill === */

// ── Wikipedia search: find the best article for a query ──────────────────────
async function wikiSearch(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search` +
    `&srsearch=${encodeURIComponent(query + ' South Africa')}&srlimit=5&format=json&origin=*`;
  const res  = await fetch(url);
  const data = await res.json();
  return data?.query?.search || [];
}

// ── Wikipedia REST summary for a page title ───────────────────────────────────
async function wikiSummary(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res  = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

// ── Nominatim geocode fallback ────────────────────────────────────────────────
async function nominatimGeocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query + ', KwaZulu-Natal, South Africa')}&format=json&limit=1&addressdetails=1&countrycodes=za`;
    const res  = await fetch(url);
    const data = await res.json();
    return data?.[0] || null;
  } catch { return null; }
}

// ── Extract structured data from Wikipedia extract text ───────────────────────
function parseWikiExtract(extract) {
  if (!extract) return {};
  const result = {};

  // Hectares — patterns: "668 ha", "668 hectares", "668-hectare", "668 ha (1,650 acres)"
  const haMatch = extract.match(/(\d[\d,]*(?:\.\d+)?)\s*(?:ha\b|hectares?)/i);
  if (haMatch) result.hectares = parseFloat(haMatch[1].replace(/,/g, ''));

  // Management — "managed by X", "administered by X", "owned by X"
  const mgmtMatch = extract.match(/(?:managed|administered|operated|run)\s+by\s+([^,.]+)/i);
  if (mgmtMatch) result.management = mgmtMatch[1].trim();

  // Ezemvelo specific
  if (/ezemvelo/i.test(extract)) result.management = result.management || 'Ezemvelo KZN Wildlife';
  if (/ethekwini/i.test(extract)) result.management = result.management || 'eThekwini Municipality';
  if (/sanparks/i.test(extract)) result.management = result.management || 'SANParks';
  if (/private/i.test(extract) && /reserve|park/i.test(extract)) result.management = result.management || 'Private';

  // Tags — infer from keywords
  const tags = [];
  if (/hiking|trail|walk/i.test(extract))           tags.push('Hiking');
  if (/bird|avian|species/i.test(extract))          tags.push('Birdwatching');
  if (/mountain\s*bik|mtb|cycling/i.test(extract))  tags.push('Mountain Biking');
  if (/waterfall/i.test(extract))                   tags.push('Waterfall');
  if (/wildlife|game|mammal/i.test(extract))        tags.push('Wildlife');
  if (/family|picnic/i.test(extract))               tags.push('Family');
  if (/free|no.*charge|no.*fee/i.test(extract))     tags.push('Free');
  if (/photography/i.test(extract))                 tags.push('Photography');
  if (/gorge|canyon/i.test(extract))                tags.push('Gorge');
  if (/forest/i.test(extract))                      tags.push('Forest');
  if (/dam|lake|river/i.test(extract))              tags.push('Water');
  if (tags.length) result.tags = tags;

  // Attractions — pull first meaningful sentences as attraction hints
  const sentences = extract.split(/[.!?]/).map(s => s.trim()).filter(s => s.length > 20 && s.length < 120);
  if (sentences.length > 1) result.attractions = sentences.slice(1, 5);

  return result;
}

// ── MAIN: Smart Fill ──────────────────────────────────────────────────────────
async function runSmartFill() {
  const query = document.getElementById('sf-input')?.value?.trim();
  if (!query || query.length < 3) {
    setSmartFillStatus('⚠️ Please enter a place name first.', 'warn');
    return;
  }

  setSmartFillStatus('🔍 Searching Wikipedia & OpenStreetMap…', 'loading');

  let wiki     = null;
  let osmPlace = null;
  let filled   = [];

  try {
    // ── 1. Try direct Wikipedia title lookup first ───────────────────────────
    // Try the query as-is (e.g. "Krantzkloof Nature Reserve")
    const directSlug = query.replace(/\s+/g, '_');
    const directAttempt = await wikiSummary(directSlug);
    if (directAttempt && directAttempt.type !== 'disambiguation' && !/^list of/i.test(directAttempt.title)) {
      wiki = directAttempt;
    }

    // ── 2. Fall back to search if direct lookup missed ───────────────────────
    if (!wiki) {
      const searchResults = await wikiSearch(query);
      // Skip "List of…" and disambiguation pages, prefer nature-related articles
      const good = searchResults.filter(r =>
        !/^list of/i.test(r.title) &&
        !/disambiguation/i.test(r.snippet)
      );
      const best = good[0] || searchResults[0];
      if (best) {
        wiki = await wikiSummary(best.title);
        // If still a "list" article, try the second result
        if (wiki && /^list of/i.test(wiki.title) && good[1]) {
          wiki = await wikiSummary(good[1].title);
        }
      }
    }

    // ── 2. Geocode with Nominatim ────────────────────────────────────────────
    osmPlace = await nominatimGeocode(query);

    // ── 3. Parse extract ─────────────────────────────────────────────────────
    const parsed = parseWikiExtract(wiki?.extract);

    // ── 4. Fill fields (only if currently empty) ─────────────────────────────
    function fillField(id, value) {
      const el = document.getElementById(id);
      if (!el || !value) return;
      if (el.type === 'checkbox') { el.checked = !!value; filled.push(id); return; }
      if (!el.value || el.value === el.defaultValue) {
        el.value = value;
        filled.push(id);
      }
    }

    // Name
    if (wiki?.title) fillField('field-name', wiki.title);

    // Tagline — Wikipedia short description
    if (wiki?.description) fillField('field-tagline', wiki.description);

    // Description — first paragraph of extract (clean up wiki markup)
    if (wiki?.extract) {
      const clean = wiki.extract
        .replace(/\([^)]*\)/g, '')      // remove parenthetical asides
        .replace(/\s{2,}/g, ' ')
        .trim()
        .substring(0, 600);
      fillField('field-description', clean);
    }

    // Hectares
    if (parsed.hectares) fillField('field-hectares', parsed.hectares);

    // Management
    if (parsed.management) fillField('field-management', parsed.management);

    // Coordinates — prefer Wikipedia's, fall back to Nominatim
    const lat = wiki?.coordinates?.lat || (osmPlace ? parseFloat(osmPlace.lat) : null);
    const lng = wiki?.coordinates?.lon || (osmPlace ? parseFloat(osmPlace.lon) : null);
    if (lat && lng) {
      fillField('field-lat', lat.toFixed(5));
      fillField('field-lng', lng.toFixed(5));
    }

    // Area / suburb — from Nominatim address
    if (osmPlace?.address) {
      const suburb = osmPlace.address.suburb || osmPlace.address.town ||
                     osmPlace.address.city_district || osmPlace.address.municipality;
      const province = osmPlace.address.state || '';
      if (suburb) fillField('field-location', suburb + (province ? ', ' + province : ''));
    }

    // Tags
    if (parsed.tags?.length) {
      const tagField = document.getElementById('field-tags');
      if (tagField && !tagField.value) {
        tagField.value = parsed.tags.join(', ');
        filled.push('field-tags');
      }
    }

    // Attractions
    if (parsed.attractions?.length) {
      const attrField = document.getElementById('field-attractions');
      if (attrField && !attrField.value) {
        attrField.value = parsed.attractions.join('\n');
        filled.push('field-attractions');
      }
    }

    // Photo — Wikipedia thumbnail (high-res version)
    if (wiki?.thumbnail?.source) {
      // Upscale the thumbnail to 800px wide
      const highRes = wiki.thumbnail.source.replace(/\/\d+px-/, '/800px-');
      fillField('field-photo', highRes);
      // Trigger preview
      const img = document.getElementById('preview-photo');
      if (img) { img.src = highRes; img.classList.add('visible'); }
    }

    // ── 5. Report what was filled ─────────────────────────────────────────────
    if (filled.length === 0) {
      setSmartFillStatus('⚠️ Nothing new to fill — fields already have values, or no data found.', 'warn');
    } else {
      const labels = {
        'field-name': 'Name', 'field-tagline': 'Tagline', 'field-description': 'Description',
        'field-hectares': 'Hectares', 'field-management': 'Management',
        'field-lat': 'Latitude', 'field-lng': 'Longitude',
        'field-location': 'Area', 'field-tags': 'Tags',
        'field-attractions': 'Attractions', 'field-photo': 'Photo'
      };
      const names = filled.map(f => labels[f] || f).join(', ');
      setSmartFillStatus(`✅ Filled ${filled.length} field${filled.length > 1 ? 's' : ''}: ${names}`, 'success');
    }

  } catch (err) {
    setSmartFillStatus('❌ Error: ' + err.message + ' — enter fields manually.', 'error');
  }
}

// ── Status display ────────────────────────────────────────────────────────────
function setSmartFillStatus(msg, type = 'info') {
  const el = document.getElementById('sf-status');
  if (!el) return;
  const colors = {
    loading: '#e8f4fd',  success: '#e8f5ed',
    warn:    '#fff8e1',  error:   '#fdecea',
    info:    '#f5f5f5'
  };
  const textColors = {
    loading: '#1565c0', success: '#1b5e20',
    warn:    '#856404', error:   '#c0392b',
    info:    '#444'
  };
  el.style.background = colors[type];
  el.style.color = textColors[type];
  el.style.display = 'block';
  el.textContent = msg;
}

function clearSmartFill() {
  document.getElementById('sf-input').value = '';
  const el = document.getElementById('sf-status');
  if (el) el.style.display = 'none';
}

window.runSmartFill  = runSmartFill;
window.clearSmartFill = clearSmartFill;
