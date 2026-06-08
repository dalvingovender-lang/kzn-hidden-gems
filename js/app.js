/* === KZN Hidden Gems — Main Application Logic === */

let map = null;
let mapMarkers = [];
let currentFilter = 'all';
let currentLocation = null;

// Icon map for locations
const locationIcons = {
  'krantzkloof': '🦅',
  'giba-gorge': '🚵',
  'palmiet': '🌿',
  'paradise-valley': '💧',
  'kenneth-stainbank': '🦓',
  'burman-bush': '🐦',
  'giba-gorge-ggep': '🌲'
};

const parkingIcons = {
  'Fenced Guarded Interior': '🔒',
  'Guarded Public Lot': '🛡',
  'Open Public Lot': '🅿',
  'Unsecured Roadside': '⚠️'
};

const paymentColors = {
  'Free': 'fee-free',
  'Card Only': 'fee-paid',
  'Cash & Card': 'fee-paid',
  'Cash Only': 'fee-paid',
  'Ezemvelo Rhino Card': 'fee-paid'
};

// === NAVIGATION ===
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('explorer').classList.remove('active');
  document.getElementById('detail-view').classList.remove('active');
  document.getElementById('admin-page').classList.remove('active');
  document.querySelector('footer').style.display = '';

  if (pageId === 'explorer') {
    document.getElementById('explorer').classList.add('active');
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('about-page').style.display = 'none';
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
  } else if (pageId === 'detail') {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('about-page').style.display = 'none';
    document.getElementById('detail-view').classList.add('active');
  } else if (pageId === 'admin') {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('about-page').style.display = 'none';
    document.querySelector('footer').style.display = 'none';
    document.getElementById('admin-page').classList.add('active');
  } else {
    document.getElementById('home-page').style.display = pageId === 'home' ? 'block' : 'none';
    document.getElementById('about-page').style.display = pageId === 'about' ? 'block' : 'none';
  }

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  window.scrollTo(0, 0);
}

// === MAP INITIALIZATION ===
function initMap() {
  if (map) return;

  map = L.map('map').setView([-29.85, 30.92], 11);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  renderMapMarkers(KZN_DATA.locations);
}

function getMarkerColor(loc) {
  const d = loc.desirabilityIndex;
  if (loc.activeAlerts > 0) return '#c0392b';
  if (d >= 3.5) return '#2d7a4f';
  if (d >= 2.5) return '#e8a020';
  return '#c0392b';
}

function renderMapMarkers(locations) {
  mapMarkers.forEach(m => map.removeLayer(m));
  mapMarkers = [];

  locations.forEach(loc => {
    const color = getMarkerColor(loc);

    const icon = L.divIcon({
      className: '',
      html: `<div style="
        background:${color};
        color:white;
        border:3px solid white;
        border-radius:50%;
        width:36px;
        height:36px;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:16px;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        cursor:pointer;
        transition:transform 0.2s;
      ">${locationIcons[loc.id] || '📍'}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });

    const marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon })
      .addTo(map);

    const alertHtml = loc.activeAlerts > 0
      ? `<div style="background:#fdecea;border-radius:4px;padding:4px 8px;font-size:11px;color:#c0392b;font-weight:600;margin-bottom:6px;">⚠️ ${loc.activeAlerts} Active Alert${loc.activeAlerts > 1 ? 's' : ''}</div>`
      : '';

    const feeHtml = loc.entry_fee_adult === 0
      ? '<span style="color:#2d7a4f;font-weight:700">Free Entry</span>'
      : `<span>R${loc.entry_fee_child}–R${loc.entry_fee_adult} per person</span>`;

    marker.bindPopup(`
      <div class="map-popup">
        <h4>${loc.name}</h4>
        <p>${loc.tagline}</p>
        ${alertHtml}
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#7a8f7e;margin-bottom:6px">
          <span>📍 ${loc.location}</span>
          <span>DI: <strong style="color:#2d7a4f">${loc.desirabilityIndex}</strong>/5</span>
        </div>
        <div style="font-size:12px;margin-bottom:8px">${feeHtml} · ${parkingIcons[loc.parking_type]} ${loc.parking_type}</div>
        <button class="popup-btn" onclick="openLocation('${loc.id}')">View Details →</button>
      </div>
    `);

    marker.on('click', () => {
      highlightSidebarCard(loc.id);
    });

    mapMarkers.push(marker);
  });
}

function highlightSidebarCard(locId) {
  document.querySelectorAll('.sidebar-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`[data-loc="${locId}"]`);
  if (card) {
    card.classList.add('selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// === EXPLORER VIEW ===
function renderExplorerSidebar(locations) {
  const container = document.getElementById('explorer-list');
  if (!container) return;

  container.innerHTML = '';

  if (locations.length === 0) {
    container.innerHTML = '<div style="padding:24px;text-align:center;color:#7a8f7e">No locations match your filter.</div>';
    return;
  }

  locations.forEach(loc => {
    const card = document.createElement('div');
    card.className = 'sidebar-card';
    card.dataset.loc = loc.id;

    const alertHtml = loc.activeAlerts > 0
      ? `<span style="color:#c0392b;font-size:11px;font-weight:600">⚠️ ${loc.activeAlerts} alert</span>`
      : '';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="sidebar-card-title">${locationIcons[loc.id] || '📍'} ${loc.name}</div>
        <span style="font-size:12px;font-weight:700;color:${loc.desirabilityIndex >= 3.5 ? '#2d7a4f' : loc.desirabilityIndex >= 2.5 ? '#e8a020' : '#c0392b'}">${loc.desirabilityIndex}/5</span>
      </div>
      <div class="sidebar-card-sub">${loc.location} · ${loc.entry_fee_adult === 0 ? '<span style="color:#2d7a4f;font-weight:600">Free</span>' : `R${loc.entry_fee_adult}`}</div>
      <div class="sidebar-card-scores">
        <span class="mini-score safety">🛡 Safety ${loc.avgSafety}</span>
        <span class="mini-score parking">🅿 Parking ${loc.avgParking}</span>
        ${alertHtml}
      </div>
    `;

    card.onclick = () => {
      // Pan map to location
      if (map) map.flyTo([loc.coordinates.lat, loc.coordinates.lng], 14);
      highlightSidebarCard(loc.id);
    };

    card.ondblclick = () => openLocation(loc.id);

    container.appendChild(card);
  });

  const hint = document.createElement('div');
  hint.style.cssText = 'padding:12px 16px;font-size:11px;color:#7a8f7e;text-align:center;border-top:1px solid #d4e6d8;';
  hint.textContent = 'Double-click a card or click a map pin to view details';
  container.appendChild(hint);
}

function applyFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === filter);
  });

  let filtered = KZN_DATA.locations;

  if (filter === 'free') filtered = filtered.filter(l => l.entry_fee_adult === 0);
  else if (filter === 'safe') filtered = filtered.filter(l => l.avgSafety >= 4);
  else if (filter === 'alerts') filtered = filtered.filter(l => l.activeAlerts > 0);
  else if (filter === 'hiking') filtered = filtered.filter(l => l.tags.some(t => t.toLowerCase().includes('hik')));
  else if (filter === 'family') filtered = filtered.filter(l => l.tags.some(t => t.toLowerCase().includes('famil')));
  else if (filter === 'wildlife') filtered = filtered.filter(l => l.tags.some(t => t.toLowerCase().includes('wildl') || t.toLowerCase().includes('bird')));

  renderExplorerSidebar(filtered);
  renderMapMarkers(filtered);
}

// === LOCATION DETAIL VIEW ===
function openLocation(locId) {
  const loc = KZN_DATA.locations.find(l => l.id === locId);
  if (!loc) return;
  currentLocation = loc;

  renderDetailView(loc);
  showPage('detail');
}

function getDIClass(d) {
  if (d >= 3.5) return 'high';
  if (d >= 2.5) return 'med';
  return 'low';
}

function getDILabel(d) {
  if (d >= 3.5) return '✅ Highly Recommended';
  if (d >= 2.5) return '⚡ Proceed with Awareness';
  return '⚠️ Exercise Caution';
}

function renderStars(score) {
  const full = Math.round(score);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function renderDetailView(loc) {
  const container = document.getElementById('detail-view');
  const diClass = getDIClass(loc.desirabilityIndex);

  const alertsHtml = loc.alerts.filter(a => a.active).map(alert => `
    <div class="alert-card ${alert.severity}">
      <div class="alert-card-icon">${alert.severity === 'High' || alert.severity === 'Critical' ? '🚨' : alert.category === 'Flash Flood' ? '🌊' : alert.category === 'Water Pollution' ? '☣️' : '⚠️'}</div>
      <div class="alert-card-body">
        <div class="alert-title">${alert.category} <span class="severity-badge ${alert.severity}">${alert.severity}</span></div>
        <div class="alert-text">${alert.details}</div>
      </div>
    </div>
  `).join('') || '<p style="color:#7a8f7e;font-size:0.875rem">No active alerts for this location. ✅</p>';

  // Count all community photos across all reviews
  const photoCount = loc.reviews.reduce((n, r) => n + (r.photos?.length || 0), 0);

  const reviewsHtml = loc.reviews.map(r => {
    const photosHtml = r.photos?.length ? `
      <div class="review-photos">
        ${r.photos.map((src, i) => `
          <div class="review-photo-thumb" onclick="openSinglePhotoSrc(this)" data-src="${src.length > 100 ? src.substring(0,8) + '…' : src}" data-full="${i}" title="View photo by ${r.user}">
            <img src="${src}" alt="Photo by ${r.user}" loading="lazy" />
          </div>`).join('')}
      </div>` : '';
    return `
    <div class="review-item">
      <div class="review-header">
        <span class="review-user">👤 ${r.user}</span>
        <span class="review-date">${r.date}${r.photos?.length ? ` · 📷 ${r.photos.length} photo${r.photos.length > 1 ? 's' : ''}` : ''}</span>
      </div>
      <div class="review-mini-scores">
        <span class="mini-score safety">🛡 Safety ${r.safety}/5</span>
        <span class="mini-score parking">🅿 Parking ${r.parking}/5</span>
        <span class="mini-score cleanliness">🧹 Clean ${r.cleanliness}/5</span>
        <span class="mini-score environmental">🌿 Enviro ${r.environmental}/5</span>
        <span class="mini-score cost">💳 Cost ${r.cost}/5</span>
      </div>
      ${photosHtml}
      <p class="review-comment">"${r.comment}"</p>
    </div>`;
  }).join('');

  const hazardsHtml = loc.hazards.map(h => `
    <div class="hazard-item">⚠️ ${h}</div>
  `).join('');

  const regsHtml = loc.regulations.map(r => `<li>${r}</li>`).join('');

  const attractionsHtml = loc.attractions.map(a => `
    <span style="background:var(--green-pale);color:var(--green-deep);padding:4px 10px;border-radius:999px;font-size:0.78rem;font-weight:600;white-space:nowrap">✦ ${a}</span>
  `).join('');

  const tagsHtml = loc.tags.map(t => `
    <span class="tag" style="background:rgba(45,122,79,0.12);color:var(--green-deep);font-size:0.78rem">${t}</span>
  `).join('');

  const heroBg = loc.photo
    ? `background: linear-gradient(to bottom, rgba(10,35,18,0.55) 0%, rgba(10,35,18,0.75) 100%), url('${loc.photo}') center/cover no-repeat; background-attachment: fixed;`
    : '';

  container.innerHTML = `
    <div class="detail-hero" style="${heroBg}">
      <div class="detail-hero-content">
        <div class="detail-breadcrumb" onclick="showPage('home')">← Back to KZN Hidden Gems</div>
        <h1>${locationIcons[loc.id] || '📍'} ${loc.name}</h1>
        <p class="tagline">${loc.tagline}</p>
        <div class="detail-hero-meta">
          <span>📍 ${loc.location}</span>
          <span>🏛 ${loc.management}</span>
          ${loc.hectares ? `<span>📐 ${loc.hectares} hectares</span>` : ''}
          <span>⏰ ${loc.hours}</span>
          ${loc.entry_fee_adult === 0 ? '<span style="background:rgba(74,171,112,0.25)">🆓 Free Entry</span>' : `<span>💳 R${loc.entry_fee_child}–R${loc.entry_fee_adult}</span>`}
        </div>
        <div class="di-badge ${diClass}" style="display:inline-flex;margin-top:14px">
          Desirability Index: ${loc.desirabilityIndex}/5 · ${getDILabel(loc.desirabilityIndex)}
        </div>
      </div>
    </div>

    <div class="detail-body">
      ${loc.activeAlerts > 0 ? `
        <div style="background:var(--red-light);border:1.5px solid var(--red-alert);border-radius:var(--radius);padding:14px 18px;margin-bottom:24px;display:flex;align-items:center;gap:10px">
          <span style="font-size:1.4rem">🚨</span>
          <div>
            <div style="font-weight:700;color:var(--red-alert)">${loc.activeAlerts} Active Safety Alert${loc.activeAlerts > 1 ? 's' : ''}</div>
            <div style="font-size:0.82rem;color:#922b21">Review alerts before visiting this location</div>
          </div>
        </div>
      ` : ''}

      <div class="detail-grid">
        <div class="detail-main">

          <!-- Description -->
          <div class="card-box">
            <h3>📖 About</h3>
            <p style="font-size:0.9rem;color:var(--text-mid);line-height:1.7">${loc.description}</p>
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px">${tagsHtml}</div>
          </div>

          <!-- Weighted Score Breakdown -->
          <div class="card-box">
            <h3>📊 Safety & Desirability Scores</h3>
            <div class="di-display">
              <div class="di-num">${loc.desirabilityIndex}</div>
              <div class="di-sub">Weighted Desirability Index (out of 5)</div>
              <div style="font-size:0.72rem;color:var(--text-light);margin-top:4px">Based on ${loc.reviewCount} community review${loc.reviewCount !== 1 ? 's' : ''}</div>
            </div>
            <div class="rating-bar-group">
              <div class="rating-bar-item">
                <span class="rating-bar-label">🛡 Safety <strong>(35%)</strong></span>
                <div class="rating-bar-track"><div class="rating-bar-fill safety" style="width:${loc.avgSafety * 20}%"></div></div>
                <span class="rating-bar-val">${loc.avgSafety}</span>
              </div>
              <div class="rating-bar-item">
                <span class="rating-bar-label">🅿 Parking <strong>(25%)</strong></span>
                <div class="rating-bar-track"><div class="rating-bar-fill parking" style="width:${loc.avgParking * 20}%"></div></div>
                <span class="rating-bar-val">${loc.avgParking}</span>
              </div>
              <div class="rating-bar-item">
                <span class="rating-bar-label">🌿 Environment <strong>(15%)</strong></span>
                <div class="rating-bar-track"><div class="rating-bar-fill environmental" style="width:${loc.avgEnvironmental * 20}%"></div></div>
                <span class="rating-bar-val">${loc.avgEnvironmental}</span>
              </div>
              <div class="rating-bar-item">
                <span class="rating-bar-label">🧹 Cleanliness <strong>(15%)</strong></span>
                <div class="rating-bar-track"><div class="rating-bar-fill" style="width:${loc.avgCleanliness * 20}%"></div></div>
                <span class="rating-bar-val">${loc.avgCleanliness}</span>
              </div>
              <div class="rating-bar-item">
                <span class="rating-bar-label">💳 Cost <strong>(10%)</strong></span>
                <div class="rating-bar-track"><div class="rating-bar-fill cost" style="width:${loc.avgCost * 20}%"></div></div>
                <span class="rating-bar-val">${loc.avgCost}</span>
              </div>
            </div>
            <div style="font-size:0.73rem;color:var(--text-light);background:var(--bg);padding:8px 10px;border-radius:6px">
              Formula: D = (0.35 × Safety) + (0.25 × Parking) + (0.15 × Environment) + (0.15 × Cleanliness) − (0.10 × Cost)
            </div>
          </div>

          <!-- Attractions -->
          <div class="card-box">
            <h3>✨ Key Attractions</h3>
            <div style="display:flex;flex-wrap:wrap;gap:8px">${attractionsHtml}</div>
          </div>

          <!-- Hazards -->
          ${loc.hazards.length > 0 ? `
          <div class="card-box">
            <h3>⚠️ Trail Hazards & Warnings</h3>
            ${hazardsHtml}
          </div>
          ` : ''}

          <!-- Active Alerts -->
          <div class="card-box">
            <h3>🚨 Active Safety Alerts</h3>
            ${alertsHtml}
            <button class="btn btn-ghost" style="margin-top:12px;width:100%;justify-content:center" onclick="openReportModal('${loc.id}')">
              + Report a New Alert
            </button>
          </div>

          <!-- Reviews -->
          <div class="card-box">
            <h3>💬 Community Reviews (${loc.reviewCount})</h3>
            ${reviewsHtml}
            <button class="btn btn-primary" style="margin-top:16px;width:100%;justify-content:center" onclick="openReviewModal('${loc.id}')">
              📸 Add Photos + Write a Review
            </button>
          </div>

        </div>

        <!-- SIDEBAR -->
        <div class="detail-sidebar">

          <!-- Quick Info -->
          <div class="card-box" style="margin-bottom:16px">
            <h3>ℹ️ Quick Info</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Entry Fee</span>
                <span class="info-value ${loc.entry_fee_adult === 0 ? 'fee-free' : ''}">${loc.entry_fee_adult === 0 ? 'FREE' : `R${loc.entry_fee_adult} adult`}</span>
              </div>
              ${loc.entry_fee_child > 0 ? `
              <div class="info-item">
                <span class="info-label">Child Fee</span>
                <span class="info-value">R${loc.entry_fee_child}</span>
              </div>
              ` : ''}
              <div class="info-item">
                <span class="info-label">Payment</span>
                <span class="info-value">${loc.payment_method}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Parking</span>
                <span class="info-value">${parkingIcons[loc.parking_type]} ${loc.parking_type}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Hours</span>
                <span class="info-value">${loc.hours}</span>
              </div>
              ${loc.hectares ? `
              <div class="info-item">
                <span class="info-label">Size</span>
                <span class="info-value">${loc.hectares} ha</span>
              </div>
              ` : ''}
            </div>
            ${loc.phone ? `
            <div style="margin-top:12px;padding:10px;background:var(--bg);border-radius:var(--radius-sm)">
              <div style="font-size:0.75rem;color:var(--text-light);margin-bottom:2px">PHONE</div>
              <a href="tel:${loc.phone}" style="font-weight:600;color:var(--green-mid);text-decoration:none">📞 ${loc.phone}</a>
            </div>
            ` : ''}
          </div>

          <!-- Map Mini -->
          <div class="card-box" style="margin-bottom:16px">
            <h3>🗺️ Location</h3>
            <div id="detail-map" style="height:200px;border-radius:8px;overflow:hidden;background:#e8f5ed;display:flex;align-items:center;justify-content:center">
              <span style="color:var(--text-light);font-size:0.8rem">Map loading...</span>
            </div>
            <div style="margin-top:10px;font-size:0.78rem;color:var(--text-light)">
              📐 Coordinates: ${loc.coordinates.lat.toFixed(4)}, ${loc.coordinates.lng.toFixed(4)}
            </div>
            <button class="btn btn-primary" style="margin-top:10px;width:100%;justify-content:center" onclick="openInMaps(${loc.coordinates.lat},${loc.coordinates.lng},'${loc.name}')">
              🧭 Open in Google Maps
            </button>
          </div>

          <!-- Regulations -->
          <div class="card-box" style="margin-bottom:16px">
            <h3>📋 Rules & Regulations</h3>
            <ul class="reg-list">${regsHtml}</ul>
          </div>

          <!-- Green Flag -->
          <div class="card-box" style="background:var(--green-pale);border-color:var(--green-light)">
            <div style="text-align:center">
              <div style="font-size:2rem;margin-bottom:8px">🏳️</div>
              <div style="font-weight:700;color:var(--green-deep);margin-bottom:6px">Green Flag Trails</div>
              <div style="font-size:0.78rem;color:var(--text-mid);line-height:1.5">This reserve may qualify for Green Flag accreditation under HOSA standards for safety, environmental responsibility, and trail quality.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `;

  // Initialize mini map
  setTimeout(() => {
    const miniMap = L.map('detail-map', { zoomControl: false, dragging: false, scrollWheelZoom: false })
      .setView([loc.coordinates.lat, loc.coordinates.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(miniMap);
    L.marker([loc.coordinates.lat, loc.coordinates.lng]).addTo(miniMap);
  }, 100);
}

function openInMaps(lat, lng, name) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}+${encodeURIComponent(name)}`, '_blank');
}

// === HOME PAGE CARDS ===
function renderHomeCards() {
  const featured = KZN_DATA.locations.filter(l => l.featured);
  const all = KZN_DATA.locations;

  renderCardGrid('featured-cards', featured);
  renderCardGrid('all-cards', all);
}

function renderCardGrid(containerId, locations) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = locations.map(loc => {
    const diClass = getDIClass(loc.desirabilityIndex);
    const isFree = loc.entry_fee_adult === 0;

    const bgStyle = loc.photo
      ? `background: linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%), url('${loc.photo}') center/cover no-repeat`
      : `background: linear-gradient(135deg, ${getCardGradient(loc.id)})`;

    return `
    <div class="card" onclick="openLocation('${loc.id}')">
      <div class="card-image" style="${bgStyle}">
        <div class="card-image-icon" style="${loc.photo ? 'display:none' : ''}">${locationIcons[loc.id] || '🌿'}</div>
        <div class="card-image-overlay" style="${loc.photo ? 'display:none' : ''}"></div>
        <div class="card-tags">
          ${isFree ? '<span class="tag free">FREE</span>' : ''}
          ${loc.featured ? '<span class="tag featured">⭐ Featured</span>' : ''}
          ${loc.activeAlerts > 0 ? `<span class="tag alert">⚠️ Alert</span>` : ''}
        </div>
        <div class="card-di ${diClass}">DI: ${loc.desirabilityIndex}/5</div>
      </div>
      <div class="card-body">
        <div class="card-title">${loc.name}</div>
        <div class="card-tagline">${loc.tagline}</div>
        <div class="card-meta">
          <span>📍 ${loc.location}</span>
          <span>${parkingIcons[loc.parking_type]} ${loc.parking_type.replace('Fenced Guarded Interior', 'Secure').replace('Guarded Public Lot', 'Guarded')}</span>
        </div>
        <div class="card-scores">
          <div class="score-item safety">
            <span class="score-label">🛡 Safety</span>
            <span class="score-val">${loc.avgSafety}/5</span>
          </div>
          <div class="score-item parking">
            <span class="score-label">🅿 Parking</span>
            <span class="score-val">${loc.avgParking}/5</span>
          </div>
          <div class="score-item">
            <span class="score-label">🌿 Enviro</span>
            <span class="score-val">${loc.avgEnvironmental}/5</span>
          </div>
          <div class="score-item">
            <span class="score-label">🧹 Clean</span>
            <span class="score-val">${loc.avgCleanliness}/5</span>
          </div>
        </div>
        ${loc.activeAlerts > 0 ? `
          <div class="alert-indicator">
            <span>⚠️</span>
            <span>${loc.activeAlerts} active safety alert${loc.activeAlerts > 1 ? 's' : ''}</span>
          </div>
        ` : ''}
      </div>
      <div class="card-footer">
        <div class="card-fee">
          💳
          <span class="${isFree ? 'fee-free' : 'fee-paid'}">
            ${isFree ? 'Free Entry' : `R${loc.entry_fee_adult} adult`}
          </span>
          · ${loc.payment_method}
        </div>
        <span style="color:var(--green-mid);font-weight:600;font-size:0.85rem">View →</span>
      </div>
    </div>
    `;
  }).join('');
}

function getCardGradient(id) {
  const gradients = {
    'krantzkloof': '#1a4a2e, #2d7a4f',
    'giba-gorge': '#1a3a5c, #2471a3',
    'palmiet': '#2a5a1a, #4aab70',
    'paradise-valley': '#1a4a5e, #2da0b0',
    'kenneth-stainbank': '#5a3a1a, #a05a2a',
    'burman-bush': '#1a4a3a, #2d7a5f',
    'giba-gorge-ggep': '#2a5a2a, #4a9a4a'
  };
  return gradients[id] || '#1a4a2e, #2d7a4f';
}

// === MODALS ===
function openReviewModal(locId) {
  const loc = KZN_DATA.locations.find(l => l.id === locId);
  const modal = document.getElementById('review-modal');

  modal.querySelector('.modal-title').textContent = `⭐ Rate & Review: ${loc.name}`;
  modal.querySelector('#review-location-id').value = locId;

  // Reset new visual star ratings
  modal.querySelectorAll('.star-rating-visual').forEach(row => {
    row.dataset.value = '0';
    row.querySelectorAll('.star-btn').forEach(s => s.classList.remove('lit'));
    const valEl = row.querySelector('.star-val');
    if (valEl) valEl.textContent = '—';
  });

  modal.querySelector('#review-comment').value = '';
  modal.querySelector('#review-user').value = '';

  // Reset photo upload
  if (window.resetPhotoUpload) resetPhotoUpload();
  if (window.initUploadZone)   initUploadZone();
  if (window.initStarRatings)  initStarRatings();

  document.getElementById('modal-overlay').classList.add('active');
}

function openReportModal(locId) {
  const modal = document.getElementById('report-modal');
  modal.querySelector('#report-location-id').value = locId;
  document.getElementById('alert-overlay').classList.add('active');
}

function closeModals() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.getElementById('alert-overlay').classList.remove('active');
}

function setScore(category, score) {
  // Legacy support — kept for any old inline calls
  const row = document.querySelector(`[data-score="${category}"]`);
  if (!row) return;
  row.dataset.value = score;
  row.querySelectorAll('.star-btn').forEach((s, i) => s.classList.toggle('lit', i < score));
  const valEl = row.querySelector('.star-val');
  if (valEl) valEl.textContent = score + '/5';
}

function submitReview() {
  const locId   = document.getElementById('review-location-id').value;
  const user    = document.getElementById('review-user').value.trim() || 'Anonymous';
  const comment = document.getElementById('review-comment').value.trim();

  const scores = {};
  let allScored = true;
  ['safety', 'parking', 'cleanliness', 'cost', 'environmental'].forEach(key => {
    const val = parseInt(document.querySelector(`.star-rating-visual[data-score="${key}"]`)?.dataset.value || 0);
    if (!val) allScored = false;
    scores[key] = val;
  });

  if (!allScored || !comment) {
    showNotification('⚠️ Please give all 5 star ratings and write a comment.', true);
    return;
  }

  const loc = KZN_DATA.locations.find(l => l.id === locId);
  if (!loc) return;

  // Collect uploaded photos
  const photos = window.pendingPhotos ? [...window.pendingPhotos] : [];

  loc.reviews.unshift({
    user,
    date: new Date().toISOString().split('T')[0],
    ...scores,
    comment,
    photos   // array of base64 strings
  });

  // Recompute scores
  loc.desirabilityIndex = calculateDesirabilityIndex(loc);
  ['safety', 'parking', 'cleanliness', 'cost', 'environmental'].forEach(key => {
    loc[`avg${key.charAt(0).toUpperCase() + key.slice(1)}`] = getAverageScore(loc, key);
  });
  loc.reviewCount = loc.reviews.length;

  closeModals();

  if (currentLocation && currentLocation.id === locId) {
    renderDetailView(loc);
  }

  renderHomeCards();
  showNotification('✅ Review submitted! Thank you for keeping the community informed.');
}

function submitAlert() {
  const locId = document.getElementById('report-location-id').value;
  const category = document.getElementById('alert-category').value;
  const severity = document.getElementById('alert-severity').value;
  const details = document.getElementById('alert-details').value.trim();

  if (!details) { alert('Please describe the alert.'); return; }

  const loc = KZN_DATA.locations.find(l => l.id === locId);
  if (!loc) return;

  loc.alerts.unshift({ category, severity, details, active: true });
  loc.activeAlerts = loc.alerts.filter(a => a.active).length;

  closeModals();

  if (currentLocation && currentLocation.id === locId) {
    renderDetailView(loc);
  }

  renderHomeCards();
  showNotification('🚨 Alert reported! Thank you for keeping others safe.');
}

// === NOTIFICATIONS ===
function showNotification(message) {
  const n = document.createElement('div');
  n.style.cssText = `
    position:fixed;bottom:80px;right:24px;
    background:var(--green-deep);color:white;
    padding:12px 20px;border-radius:var(--radius);
    font-size:0.875rem;font-weight:600;
    box-shadow:var(--shadow-lg);
    z-index:3000;animation:slideIn 0.3s ease;
    max-width:320px;
  `;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 4000);
}

// === SEARCH ===
let searchDebounceTimer = null;

function localSearch(q) {
  return KZN_DATA.locations.filter(l =>
    l.name.toLowerCase().includes(q) ||
    l.location.toLowerCase().includes(q) ||
    l.description.toLowerCase().includes(q) ||
    l.tags.some(t => t.toLowerCase().includes(q)) ||
    l.attractions.some(a => a.toLowerCase().includes(q))
  );
}

// Position the floating dropdown under the search input
function positionDropdown() {
  const input = document.getElementById('hero-search-input');
  const dd    = document.getElementById('hero-search-dropdown');
  if (!input || !dd) return;
  const rect = input.getBoundingClientRect();
  dd.style.top    = (rect.bottom + 6) + 'px';
  dd.style.left   = rect.left + 'px';
  dd.style.width  = rect.width + 'px';
}

// Live suggestions as user types
function handleSearchInput(query) {
  clearTimeout(searchDebounceTimer);
  const dropdown = document.getElementById('hero-search-dropdown');
  if (!dropdown) return;

  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) { dropdown.style.display = 'none'; return; }

  positionDropdown();

  const local = localSearch(q);

  // Build suggestion list from local matches
  let html = '';
  if (local.length > 0) {
    html += `<div class="search-dropdown-group">📍 KZN Locations</div>`;
    html += local.map(l => `
      <div class="search-dropdown-item" onclick="closeSuggestions();openLocation('${l.id}')">
        <span class="sdi-icon">${locationIcons[l.id] || '🌿'}</span>
        <span class="sdi-text">
          <strong>${l.name}</strong>
          <span>${l.location} · DI ${l.desirabilityIndex}/5</span>
        </span>
      </div>`).join('');
  }

  dropdown.innerHTML = html || `<div class="search-dropdown-empty">🔍 Searching KZN for "<strong>${query.trim()}</strong>"…</div>`;
  dropdown.style.display = 'block';

  // After 400ms also query Nominatim for any KZN place
  if (q.length >= 3) {
    searchDebounceTimer = setTimeout(() => fetchNominatimSuggestions(query.trim(), local, dropdown), 400);
  }
}

async function fetchNominatimSuggestions(query, localResults, dropdown) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', KwaZulu-Natal')}&format=json&limit=5&countrycodes=za&accept-language=en`;
    const res  = await fetch(url);
    const data = await res.json();

    // Filter to exclude results already shown as local locations
    const osmResults = data.filter(r => {
      const rName = r.display_name.toLowerCase();
      return !localResults.some(l => rName.includes(l.name.toLowerCase().substring(0, 8)));
    });

    if (osmResults.length === 0 && localResults.length === 0) {
      dropdown.innerHTML = `<div class="search-dropdown-empty">😕 No results found for "<strong>${query}</strong>" in KZN</div>`;
      return;
    }

    let html = '';
    if (localResults.length > 0) {
      html += `<div class="search-dropdown-group">📍 KZN Locations</div>`;
      html += localResults.map(l => `
        <div class="search-dropdown-item" onclick="closeSuggestions();openLocation('${l.id}')">
          <span class="sdi-icon">${locationIcons[l.id] || '🌿'}</span>
          <span class="sdi-text">
            <strong>${l.name}</strong>
            <span>${l.location} · DI ${l.desirabilityIndex}/5</span>
          </span>
        </div>`).join('');
    }

    if (osmResults.length > 0) {
      html += `<div class="search-dropdown-group">🗺️ Places in KZN</div>`;
      html += osmResults.map(r => {
        const name  = r.display_name.split(',').slice(0, 2).join(',').trim();
        const sub   = r.display_name.split(',').slice(2, 4).join(',').trim();
        const lat   = parseFloat(r.lat).toFixed(5);
        const lng   = parseFloat(r.lon).toFixed(5);
        return `
          <div class="search-dropdown-item" onclick="closeSuggestions();flyToOsmResult(${r.lat},${r.lon},'${name.replace(/'/g,"\\'")}')">
            <span class="sdi-icon">🗺️</span>
            <span class="sdi-text">
              <strong>${name}</strong>
              <span>${sub}</span>
            </span>
          </div>`;
      }).join('');
    }

    if (dropdown.style.display !== 'none') dropdown.innerHTML = html;
  } catch (e) {
    // Nominatim unavailable — local results already shown, silently fail
  }
}

function flyToOsmResult(lat, lng, name) {
  showPage('explorer');
  initMap();
  renderExplorerSidebar(KZN_DATA.locations);
  renderMapMarkers(KZN_DATA.locations);
  setTimeout(() => {
    map.flyTo([lat, lng], 15);
    L.popup()
      .setLatLng([lat, lng])
      .setContent(`<div class="map-popup"><h4>🗺️ ${name}</h4><p style="color:#7a8f7e;font-size:12px">OpenStreetMap result · No KZN Hidden Gems listing yet</p><button class="popup-btn" onclick="document.querySelector('.modal-overlay').classList.add('active')">+ Add This Location</button></div>`)
      .openOn(map);
  }, 300);
}

function closeSuggestions() {
  const d = document.getElementById('hero-search-dropdown');
  if (d) d.style.display = 'none';
}

function handleSearch(query) {
  closeSuggestions();
  if (!query.trim()) return;

  const q     = query.trim().toLowerCase();
  const local = localSearch(q);

  if (local.length === 1) {
    openLocation(local[0].id);
    return;
  }

  showPage('explorer');
  initMap();
  renderExplorerSidebar(local.length > 0 ? local : KZN_DATA.locations);
  renderMapMarkers(local.length > 0 ? local : KZN_DATA.locations);

  if (local.length > 0) {
    setTimeout(() => {
      const bounds = local.map(r => [r.coordinates.lat, r.coordinates.lng]);
      map.fitBounds(bounds, { padding: [40, 40] });
    }, 200);
  } else {
    // No local match — try Nominatim and fly there
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', KwaZulu-Natal')}&format=json&limit=1&countrycodes=za`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          const place = data[0];
          const name  = place.display_name.split(',').slice(0,2).join(',').trim();
          setTimeout(() => flyToOsmResult(place.lat, place.lng, name), 300);
        } else {
          showNotification(`😕 No results found for "${query.trim()}" in KZN`);
        }
      })
      .catch(() => showNotification('🔍 Search unavailable — check your connection'));
  }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  // Load any custom locations saved by admin
  if (window.Storage) Storage.mergeCustomLocations();
  renderHomeCards();

  // Nav clicks
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const page = a.dataset.page;
      if (page === 'explorer') {
        showPage('explorer');
        initMap();
        renderExplorerSidebar(KZN_DATA.locations);
        renderMapMarkers(KZN_DATA.locations);
      } else {
        showPage(page);
      }
    });
  });

  // Hero search
  const heroSearchBtn = document.getElementById('hero-search-btn');
  const heroSearchInput = document.getElementById('hero-search-input');

  heroSearchBtn.addEventListener('click', () => handleSearch(heroSearchInput.value));
  heroSearchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') handleSearch(heroSearchInput.value);
    if (e.key === 'Escape') closeSuggestions();
  });
  heroSearchInput.addEventListener('input', e => handleSearchInput(e.target.value));

  // Close dropdown when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.hero-search')) closeSuggestions();
  });

  // Explorer button
  document.getElementById('open-explorer-btn').addEventListener('click', () => {
    showPage('explorer');
    initMap();
    renderExplorerSidebar(KZN_DATA.locations);
    renderMapMarkers(KZN_DATA.locations);
  });

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
  });

  // Scroll to top
  const scrollBtn = document.querySelector('.scroll-top');
  window.addEventListener('scroll', () => {
    scrollBtn.classList.toggle('visible', window.scrollY > 400);
  });
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Modal close
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModals(); });
});

// Expose for inline handlers
window.openLocation = openLocation;
window.closeSuggestions = closeSuggestions;
window.flyToOsmResult = flyToOsmResult;
window.handleSearchInput = handleSearchInput;
window.showPage = showPage;
window.openReviewModal = openReviewModal;
window.openReportModal = openReportModal;
window.closeModals = closeModals;
window.setScore = setScore;
window.submitReview = submitReview;
window.submitAlert = submitAlert;
window.openInMaps = openInMaps;
window.applyFilter = applyFilter;

// Reuse the calculation functions from data.js
function calculateDesirabilityIndex(location) {
  if (!location.reviews || location.reviews.length === 0) return 3.0;
  const n = location.reviews.length;
  const avg = (key) => location.reviews.reduce((s, r) => s + r[key], 0) / n;
  const S = avg('safety'), P = avg('parking'), C = avg('cleanliness'), F = avg('cost'), E = avg('environmental');
  return Math.round(((0.35 * S) + (0.25 * P) + (0.15 * E) + (0.15 * C) - (0.10 * F)) * 100) / 100;
}

function getAverageScore(location, key) {
  if (!location.reviews || location.reviews.length === 0) return 0;
  return Math.round(location.reviews.reduce((s, r) => s + r[key], 0) / location.reviews.length * 10) / 10;
}
