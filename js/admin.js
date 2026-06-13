/* === KZN Hidden Gems — Admin Panel Logic === */

// ── PLACE NAME GEOCODING (Nominatim / OpenStreetMap) ─────────────────────────
let placeSearchTimer = null;

function debouncePlaceSearch(query) {
  clearTimeout(placeSearchTimer);
  const q = query.trim();
  if (!q || q.length < 3) { clearPlaceResults(); return; }
  document.getElementById('place-search-spinner').classList.add('active');
  placeSearchTimer = setTimeout(() => runPlaceSearch(q), 500);
}

async function runPlaceSearch(query) {
  const spinner = document.getElementById('place-search-spinner');
  const list    = document.getElementById('place-results');

  try {
    // Bias results toward KZN / South Africa
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query + ', KwaZulu-Natal, South Africa')}` +
      `&format=json&limit=6&addressdetails=1&countrycodes=za` +
      `&accept-language=en`;

    const res  = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();

    spinner.classList.remove('active');
    renderPlaceResults(data, query);
  } catch (err) {
    spinner.classList.remove('active');
    // If biased search fails, try without bias
    try {
      const url2 = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1` +
        `&accept-language=en`;
      const res2  = await fetch(url2);
      const data2 = await res2.json();
      renderPlaceResults(data2, query);
    } catch {
      showPlaceError('Search unavailable — please enter coordinates manually.');
    }
  }
}

function renderPlaceResults(results, query) {
  const list = document.getElementById('place-results');
  list.innerHTML = '';

  if (!results || results.length === 0) {
    list.innerHTML = `<li class="no-results">😕 No results found for "<strong>${query}</strong>". Try adding "KZN" or "Durban".</li>`;
    list.classList.add('visible');
    return;
  }

  results.forEach(r => {
    const li    = document.createElement('li');
    const name  = r.display_name.split(',').slice(0, 3).join(', ');
    const type  = r.type ? r.type.replace(/_/g, ' ') : r.class || '';
    const lat   = parseFloat(r.lat).toFixed(5);
    const lng   = parseFloat(r.lon).toFixed(5);

    li.innerHTML = `
      <div class="result-name">📍 ${name}</div>
      <div class="result-type">${type} · ${lat}, ${lng}</div>
    `;

    li.addEventListener('click', () => selectPlace(r));
    list.appendChild(li);
  });

  list.classList.add('visible');
}

function selectPlace(result) {
  const lat  = parseFloat(result.lat).toFixed(5);
  const lng  = parseFloat(result.lon).toFixed(5);
  const name = result.display_name.split(',').slice(0, 3).join(', ');

  // Fill coordinate inputs
  document.getElementById('field-lat').value = lat;
  document.getElementById('field-lng').value = lng;

  // Auto-fill location field if empty
  const locField = document.getElementById('field-location');
  if (!locField.value.trim()) {
    const parts = result.display_name.split(',');
    locField.value = parts.slice(0, 2).join(', ').trim();
  }

  // Update map
  updateCoordPickerMap(parseFloat(lat), parseFloat(lng));

  // Show selected label
  const label = document.getElementById('place-selected-label');
  label.textContent = `✅ Selected: ${name} (${lat}, ${lng})`;
  label.classList.add('visible');

  // Clear the results list
  clearPlaceResults(false);

  // Keep the search input showing what was found
  document.getElementById('place-search-input').value = result.display_name.split(',').slice(0, 2).join(', ');

  updateDIPreview();
}

function clearPlaceResults(clearInput = true) {
  document.getElementById('place-results')?.classList.remove('visible');
  if (document.getElementById('place-results')) document.getElementById('place-results').innerHTML = '';
  document.getElementById('place-search-spinner')?.classList.remove('active');
  if (clearInput) {
    if (document.getElementById('place-search-input')) document.getElementById('place-search-input').value = '';
    document.getElementById('place-selected-label')?.classList.remove('visible');
  }
}

function showPlaceError(msg) {
  const list = document.getElementById('place-results');
  list.innerHTML = `<li class="no-results">⚠️ ${msg}</li>`;
  list.classList.add('visible');
}

let adminEditingId  = null;   // id of location currently being edited (null = new)
let deleteTargetId  = null;
let coordPickerMap  = null;
let coordMarker     = null;

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function openAdminLogin() {
  document.getElementById('admin-login-overlay').classList.add('active');
  setTimeout(() => document.getElementById('admin-pass-input').focus(), 100);
}

function closeAdminLogin() {
  document.getElementById('admin-login-overlay').classList.remove('active');
  document.getElementById('admin-login-error').classList.remove('active');
  document.getElementById('admin-pass-input').value = '';
}

function attemptAdminLogin() {
  const pass = document.getElementById('admin-pass-input').value;
  if (Storage.adminLogin(pass)) {
    closeAdminLogin();
    openAdminPanel();
  } else {
    document.getElementById('admin-login-error').classList.add('active');
    document.getElementById('admin-pass-input').value = '';
    document.getElementById('admin-pass-input').focus();
  }
}

// ── OPEN / CLOSE PANEL ────────────────────────────────────────────────────────
function openAdminPanel() {
  if (!Storage.isAdminAuthed()) { openAdminLogin(); return; }
  showPage('admin');
  renderAdminStats();
  renderAdminTable();
  resetAdminForm();
}

function closeAdminPanel() {
  Storage.adminLogout();
  showPage('home');
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function renderAdminStats() {
  const locs    = KZN_DATA.locations;
  const custom  = locs.filter(l => l._custom);
  const alerts  = locs.reduce((s, l) => s + l.activeAlerts, 0);
  const reviews = locs.reduce((s, l) => s + l.reviewCount, 0);

  document.getElementById('stat-total').textContent    = locs.length;
  document.getElementById('stat-custom').textContent   = custom.length;
  document.getElementById('stat-alerts').textContent   = alerts;
  document.getElementById('stat-reviews').textContent  = reviews;
}

// ── TABLE ─────────────────────────────────────────────────────────────────────
function renderAdminTable(filter = '') {
  const tbody = document.getElementById('admin-table-body');
  const locs  = KZN_DATA.locations.filter(l =>
    !filter || l.name.toLowerCase().includes(filter.toLowerCase()) ||
    l.location.toLowerCase().includes(filter.toLowerCase())
  );

  if (!locs.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-light)">No locations found</td></tr>`;
    return;
  }

  tbody.innerHTML = locs.map(loc => {
    const diClass = loc.desirabilityIndex >= 3.5 ? 'high' : loc.desirabilityIndex >= 2.5 ? 'med' : 'low';
    const customBadge = loc._custom ? '<span class="custom-badge">Custom</span>' : '';
    const alertBadge  = loc.activeAlerts > 0
      ? `<span style="color:var(--red-alert);font-size:0.75rem;font-weight:600">⚠️ ${loc.activeAlerts}</span>` : '–';
    const canDelete = loc._custom;

    return `
      <tr>
        <td>
          <div class="loc-name">${locationIcons[loc.id] || '📍'} ${loc.name} ${customBadge}</div>
          <div class="loc-sub">${loc.location}</div>
        </td>
        <td><span class="di-pill ${diClass}">${loc.desirabilityIndex}</span></td>
        <td>${loc.entry_fee_adult === 0 ? '<span style="color:var(--green-mid);font-weight:600">Free</span>' : `R${loc.entry_fee_adult}`}</td>
        <td>${alertBadge}</td>
        <td>${loc.reviewCount}</td>
        <td style="white-space:nowrap">
          <button class="btn-icon" title="Edit" onclick="editLocation('${loc.id}')">✏️</button>
          ${canDelete ? `<button class="btn-icon danger" title="Delete" onclick="confirmDelete('${loc.id}')">🗑️</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// ── FORM ──────────────────────────────────────────────────────────────────────
function resetAdminForm() {
  adminEditingId = null;
  document.getElementById('admin-form-title').textContent = '➕ Add New Location';
  document.getElementById('admin-form-submit-btn').textContent = '✅ Save Location';
  document.getElementById('admin-form-cancel-edit').style.display = 'none';

  const f = document.getElementById('admin-location-form');
  f.reset();
  // Reset fields not covered by reset()
  document.getElementById('field-id').value = '';
  document.getElementById('preview-photo').classList.remove('visible');
  document.getElementById('preview-photo').src = '';
  clearPlaceResults(true);
  document.getElementById('place-selected-label')?.classList.remove('visible');
  updateDIPreview();
  initCoordPicker();
}

function editLocation(locId) {
  const loc = KZN_DATA.locations.find(l => l.id === locId);
  if (!loc) return;

  adminEditingId = locId;
  document.getElementById('admin-form-title').textContent = `✏️ Editing: ${loc.name}`;
  document.getElementById('admin-form-submit-btn').textContent = '💾 Update Location';
  document.getElementById('admin-form-cancel-edit').style.display = 'inline-flex';

  // Populate form fields
  document.getElementById('field-id').value          = loc.id;
  document.getElementById('field-name').value        = loc.name;
  document.getElementById('field-tagline').value     = loc.tagline || '';
  document.getElementById('field-description').value = loc.description || '';
  document.getElementById('field-location').value    = loc.location || '';
  document.getElementById('field-management').value  = loc.management || '';
  document.getElementById('field-hectares').value    = loc.hectares || '';
  document.getElementById('field-lat').value         = loc.coordinates?.lat || '';
  document.getElementById('field-lng').value         = loc.coordinates?.lng || '';
  document.getElementById('field-payment').value     = loc.payment_method || 'Free';
  document.getElementById('field-fee-adult').value   = loc.entry_fee_adult || 0;
  document.getElementById('field-fee-child').value   = loc.entry_fee_child || 0;
  document.getElementById('field-parking').value     = loc.parking_type || 'Guarded Public Lot';
  document.getElementById('field-parking-notes').value = loc.parking_notes || '';
  document.getElementById('field-hours').value       = loc.hours || '';
  document.getElementById('field-phone').value       = loc.phone || '';
  document.getElementById('field-tags').value        = (loc.tags || []).join(', ');
  document.getElementById('field-hazards').value     = (loc.hazards || []).join('\n');
  document.getElementById('field-regulations').value = (loc.regulations || []).join('\n');
  document.getElementById('field-attractions').value = (loc.attractions || []).join('\n');
  document.getElementById('field-photo').value       = loc.photo || '';
  document.getElementById('field-featured').checked  = !!loc.featured;

  // Show photo preview
  previewPhoto(loc.photo);

  // Update coord picker map
  if (loc.coordinates?.lat && loc.coordinates?.lng) {
    updateCoordPickerMap(loc.coordinates.lat, loc.coordinates.lng);
  }

  updateDIPreview();

  // Scroll form into view
  document.getElementById('admin-form-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function submitAdminForm() {
  const name = document.getElementById('field-name').value.trim();
  if (!name) { showAdminNotif('❌ Location name is required.', true); return; }

  const lat = parseFloat(document.getElementById('field-lat').value);
  const lng = parseFloat(document.getElementById('field-lng').value);
  if (!lat || !lng) { showAdminNotif('❌ Coordinates (lat/lng) are required.', true); return; }

  const locData = {
    id:            document.getElementById('field-id').value.trim() || null,
    name,
    tagline:       document.getElementById('field-tagline').value.trim(),
    description:   document.getElementById('field-description').value.trim(),
    location:      document.getElementById('field-location').value.trim(),
    management:    document.getElementById('field-management').value.trim(),
    hectares:      parseFloat(document.getElementById('field-hectares').value) || null,
    coordinates:   { lat, lng },
    payment_method: document.getElementById('field-payment').value,
    entry_fee_adult: parseFloat(document.getElementById('field-fee-adult').value) || 0,
    entry_fee_child: parseFloat(document.getElementById('field-fee-child').value) || 0,
    parking_type:  document.getElementById('field-parking').value,
    parking_notes: document.getElementById('field-parking-notes').value.trim(),
    hours:         document.getElementById('field-hours').value.trim(),
    phone:         document.getElementById('field-phone').value.trim() || null,
    tags:          document.getElementById('field-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    hazards:       document.getElementById('field-hazards').value.split('\n').map(t => t.trim()).filter(Boolean),
    regulations:   document.getElementById('field-regulations').value.split('\n').map(t => t.trim()).filter(Boolean),
    attractions:   document.getElementById('field-attractions').value.split('\n').map(t => t.trim()).filter(Boolean),
    photo:         document.getElementById('field-photo').value.trim() || null,
    featured:      document.getElementById('field-featured').checked,
    reviews:       [],
    alerts:        [],
    website:       null,
  };

  // If editing, preserve existing reviews and alerts
  if (adminEditingId) {
    const existing = KZN_DATA.locations.find(l => l.id === adminEditingId);
    if (existing) {
      locData.reviews = existing.reviews || [];
      locData.alerts  = existing.alerts  || [];
      locData.id      = adminEditingId;
    }
  }

  const saved = Storage.saveLocation(locData);
  renderAdminStats();
  renderAdminTable();
  renderHomeCards();
  resetAdminForm();
  showAdminNotif(`✅ "${saved.name}" saved successfully!`);
}

// ── DI PREVIEW (live, as you type) ───────────────────────────────────────────
function updateDIPreview() {
  // Just show a formula-based estimate with default scores of 3.5
  // (real DI will be computed from reviews once people submit them)
  const fee = parseFloat(document.getElementById('field-fee-adult')?.value) || 0;
  const costScore = fee === 0 ? 5 : fee <= 20 ? 4 : fee <= 50 ? 3 : fee <= 80 ? 2 : 1;
  // Default assumptions: new site with no reviews → neutral scores
  const di = Math.round(((0.35*3.5) + (0.25*3.5) + (0.15*3.5) + (0.15*3.5) - (0.10*costScore)) * 100) / 100;
  const el = document.getElementById('di-preview-num');
  if (el) el.textContent = di.toFixed(2);
}

// ── PHOTO PREVIEW ─────────────────────────────────────────────────────────────
function previewPhoto(url) {
  const img = document.getElementById('preview-photo');
  if (!url) { img.classList.remove('visible'); return; }
  img.src = url;
  img.onload  = () => img.classList.add('visible');
  img.onerror = () => img.classList.remove('visible');
}

// ── COORD PICKER MAP ──────────────────────────────────────────────────────────
function initCoordPicker() {
  if (coordPickerMap) {
    coordPickerMap.remove();
    coordPickerMap = null;
    coordMarker    = null;
  }

  const el = document.getElementById('coord-map-picker');
  if (!el || el.style.display === 'none') return;

  coordPickerMap = L.map('coord-map-picker', {
    keyboard:        false,
    scrollWheelZoom: false,
    tap:             false,
    zoomControl:     true
  }).setView([-29.85, 30.92], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
    .addTo(coordPickerMap);

  // ── CRITICAL: strip ALL tabindex from every Leaflet element ──────────────
  setTimeout(() => {
    el.querySelectorAll('[tabindex]').forEach(e => e.setAttribute('tabindex', '-1'));
    el.setAttribute('tabindex', '-1');
    // Prevent map container from stealing focus on mousedown
    el.addEventListener('mousedown', ev => {
      // Let map clicks through for pin-dropping, but keep focus on inputs
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        // don't let the map steal focus from form fields
        const activeEl = document.activeElement;
        setTimeout(() => activeEl.focus(), 0);
      }
    });
  }, 300);

  coordPickerMap.on('click', (e) => {
    const { lat, lng } = e.latlng;
    document.getElementById('field-lat').value = lat.toFixed(5);
    document.getElementById('field-lng').value = lng.toFixed(5);
    if (coordMarker) coordMarker.setLatLng(e.latlng);
    else coordMarker = L.marker(e.latlng).addTo(coordPickerMap);
  });
}

// Toggle map visibility (collapsed by default keeps it from interfering)
function toggleCoordMap() {
  const el  = document.getElementById('coord-map-picker');
  const btn = document.getElementById('toggle-map-btn');
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = 'block';
    if (btn) btn.textContent = '🗺️ Hide Map';
    initCoordPicker();
    setTimeout(() => coordPickerMap?.invalidateSize(), 150);
  } else {
    el.style.display = 'none';
    if (btn) btn.textContent = '🗺️ Show Map to Pin Location';
  }
}
window.toggleCoordMap = toggleCoordMap;

function updateCoordPickerMap(lat, lng) {
  if (!coordPickerMap) return;
  coordPickerMap.setView([lat, lng], 14);
  if (coordMarker) coordMarker.setLatLng([lat, lng]);
  else coordMarker = L.marker([lat, lng]).addTo(coordPickerMap);
}

// ── DELETE ────────────────────────────────────────────────────────────────────
function confirmDelete(locId) {
  const loc = KZN_DATA.locations.find(l => l.id === locId);
  if (!loc) return;
  deleteTargetId = locId;
  document.getElementById('delete-loc-name').textContent = loc.name;
  document.getElementById('delete-confirm-overlay').classList.add('active');
}

function cancelDelete() {
  deleteTargetId = null;
  document.getElementById('delete-confirm-overlay').classList.remove('active');
}

function executeDelete() {
  if (!deleteTargetId) return;
  const loc = KZN_DATA.locations.find(l => l.id === deleteTargetId);
  Storage.deleteLocation(deleteTargetId);
  cancelDelete();
  renderAdminStats();
  renderAdminTable();
  renderHomeCards();
  if (adminEditingId === deleteTargetId) resetAdminForm();
  showAdminNotif(`🗑️ "${loc?.name}" deleted.`);
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
function showAdminNotif(msg, isError = false) {
  const n = document.createElement('div');
  n.style.cssText = `
    position:fixed;top:80px;right:24px;
    background:${isError ? 'var(--red-alert)' : 'var(--green-deep)'};color:white;
    padding:12px 20px;border-radius:var(--radius);font-size:0.875rem;font-weight:600;
    box-shadow:var(--shadow-lg);z-index:6000;animation:slideIn 0.3s ease;max-width:340px;
  `;
  n.textContent = msg;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 4000);
}

// ── INIT ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Login form
  document.getElementById('admin-pass-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') attemptAdminLogin();
  });

  // ── Place name search (input + button + Enter key) ──────────────────────
  const placeInput = document.getElementById('place-search-input');
  const placeBtn   = document.getElementById('place-search-btn');

  if (placeInput) {
    placeInput.addEventListener('input', e => {
      debouncePlaceSearch(e.target.value);
    });
    placeInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = placeInput.value.trim();
        if (q) runPlaceSearch(q);
      }
      if (e.key === 'Escape') clearPlaceResults();
    });
    // Ensure map doesn't steal focus when input is clicked
    placeInput.addEventListener('click', e => e.stopPropagation());
    placeInput.addEventListener('focus', e => e.stopPropagation());
  }

  if (placeBtn) {
    placeBtn.addEventListener('click', () => {
      const q = document.getElementById('place-search-input')?.value.trim();
      if (q) runPlaceSearch(q);
    });
  }

  // Live DI preview on fee change
  document.getElementById('field-fee-adult')?.addEventListener('input', updateDIPreview);

  // Photo preview on URL change
  document.getElementById('field-photo')?.addEventListener('input', e => previewPhoto(e.target.value));

  // Coord map syncs when lat/lng typed manually
  ['field-lat','field-lng'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const lat = parseFloat(document.getElementById('field-lat').value);
      const lng = parseFloat(document.getElementById('field-lng').value);
      if (lat && lng) updateCoordPickerMap(lat, lng);
    });
  });

  // Admin table search
  document.getElementById('admin-table-search')?.addEventListener('input', e => {
    renderAdminTable(e.target.value);
  });
});

// expose
window.debouncePlaceSearch = debouncePlaceSearch;
window.clearPlaceResults   = clearPlaceResults;
window.switchAdminTab = function(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach((b,i) =>
    b.classList.toggle('active', (i===0&&tab==='add')||(i===1&&tab==='list')||(i===2&&tab==='content')));
  document.getElementById('admin-tab-add').classList.toggle('active', tab==='add');
  document.getElementById('admin-tab-list').classList.toggle('active', tab==='list');
  document.getElementById('admin-tab-content')?.classList.toggle('active', tab==='content');
  if (tab==='add') { document.getElementById('place-search-input')?.focus(); }
  if (tab==='content' && window.buildContentEditor) { buildContentEditor(); }
};
window.openAdminLogin    = openAdminLogin;
window.closeAdminLogin   = closeAdminLogin;
window.attemptAdminLogin = attemptAdminLogin;
window.openAdminPanel    = openAdminPanel;
window.closeAdminPanel   = closeAdminPanel;
window.editLocation      = editLocation;
window.submitAdminForm   = submitAdminForm;
window.resetAdminForm    = resetAdminForm;
window.confirmDelete     = confirmDelete;
window.cancelDelete      = cancelDelete;
window.executeDelete     = executeDelete;
window.updateDIPreview   = updateDIPreview;
