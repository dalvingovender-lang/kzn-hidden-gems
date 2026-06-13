/* === KZN Hidden Gems — Site Content Editor ===
   Lets the admin edit any tagged text on the site ([data-edit="key"]).
   Overrides are stored in localStorage and applied on every page load. */

const CONTENT_KEY = 'kzn_site_content';

// Human-friendly grouping + labels for the editor UI
const CONTENT_FIELDS = [
  { group: '🧭 Navigation Bar', fields: [
    { key: 'nav.brand',        label: 'Brand Name' },
    { key: 'nav.tagline',      label: 'Brand Tagline' },
  ]},
  { group: '🦸 Hero Section', fields: [
    { key: 'hero.badge',       label: 'Badge Text' },
    { key: 'hero.title',       label: 'Main Headline', multiline: true },
    { key: 'hero.subtitle',    label: 'Sub-paragraph', multiline: true },
  ]},
  { group: '📊 Hero Statistics', fields: [
    { key: 'stat1.num',        label: 'Stat 1 — Number' },
    { key: 'stat1.label',      label: 'Stat 1 — Label' },
    { key: 'stat2.num',        label: 'Stat 2 — Number' },
    { key: 'stat2.label',      label: 'Stat 2 — Label' },
    { key: 'stat3.num',        label: 'Stat 3 — Number' },
    { key: 'stat3.label',      label: 'Stat 3 — Label' },
    { key: 'stat4.num',        label: 'Stat 4 — Number' },
    { key: 'stat4.label',      label: 'Stat 4 — Label' },
  ]},
  { group: '⭐ Featured Section', fields: [
    { key: 'featured.title',    label: 'Heading' },
    { key: 'featured.subtitle', label: 'Sub-heading' },
  ]},
  { group: '🛡️ Safety Section', fields: [
    { key: 'safety.title',     label: 'Heading' },
    { key: 'safety.subtitle',  label: 'Paragraph', multiline: true },
  ]},
  { group: '🗺️ All Destinations Section', fields: [
    { key: 'all.title',        label: 'Heading' },
    { key: 'all.subtitle',     label: 'Sub-heading' },
  ]},
  { group: '👣 Footer', fields: [
    { key: 'footer.brand',     label: 'Footer Brand Name' },
    { key: 'footer.about',     label: 'About Paragraph', multiline: true },
    { key: 'footer.copyright', label: 'Copyright Line' },
  ]},
];

// ── Storage ──────────────────────────────────────────────────────────────────
function loadSiteContent() {
  try { return JSON.parse(localStorage.getItem(CONTENT_KEY)) || {}; }
  catch { return {}; }
}

function saveSiteContent(obj) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(obj));
}

// Capture the original HTML defaults the first time, so "Reset" can restore them
const CONTENT_DEFAULTS = {};
function captureDefaults() {
  document.querySelectorAll('[data-edit]').forEach(el => {
    const key = el.getAttribute('data-edit');
    if (!(key in CONTENT_DEFAULTS)) CONTENT_DEFAULTS[key] = el.textContent.trim();
  });
}

// ── Apply overrides to the live page ─────────────────────────────────────────
function applySiteContent() {
  const overrides = loadSiteContent();
  document.querySelectorAll('[data-edit]').forEach(el => {
    const key = el.getAttribute('data-edit');
    if (overrides[key] != null && overrides[key] !== '') {
      el.textContent = overrides[key];
    }
  });
}

// ── Build the editor form inside the admin panel ─────────────────────────────
function buildContentEditor() {
  const wrap = document.getElementById('content-editor-fields');
  if (!wrap) return;

  const overrides = loadSiteContent();

  wrap.innerHTML = CONTENT_FIELDS.map(section => `
    <div class="admin-form-section">${section.group}</div>
    ${section.fields.map(f => {
      const current = overrides[f.key] ?? CONTENT_DEFAULTS[f.key] ?? '';
      const safe = current.replace(/"/g, '&quot;').replace(/</g, '&lt;');
      return `
        <div class="form-group">
          <label>${f.label}</label>
          ${f.multiline
            ? `<textarea data-content-key="${f.key}" rows="3">${safe}</textarea>`
            : `<input type="text" data-content-key="${f.key}" value="${safe}" />`}
        </div>`;
    }).join('')}
  `).join('');
}

// ── Save from the editor form ────────────────────────────────────────────────
function saveSiteContentFromEditor() {
  const overrides = {};
  document.querySelectorAll('[data-content-key]').forEach(input => {
    const key = input.getAttribute('data-content-key');
    const val = input.value.trim();
    // Only store if it differs from the original default
    if (val && val !== (CONTENT_DEFAULTS[key] ?? '')) {
      overrides[key] = val;
    }
  });
  saveSiteContent(overrides);
  applySiteContent();
  showContentStatus(`✅ Saved! ${Object.keys(overrides).length} custom field(s) applied. Changes are live.`, 'success');
}

// ── Reset everything back to defaults ────────────────────────────────────────
function resetSiteContent() {
  if (!confirm('Reset ALL site text back to the original defaults? Your custom wording will be lost.')) return;
  localStorage.removeItem(CONTENT_KEY);
  // Restore defaults on the live DOM
  document.querySelectorAll('[data-edit]').forEach(el => {
    const key = el.getAttribute('data-edit');
    if (CONTENT_DEFAULTS[key] != null) el.textContent = CONTENT_DEFAULTS[key];
  });
  buildContentEditor();
  showContentStatus('↩️ All text reset to original defaults.', 'info');
}

function showContentStatus(msg, type = 'info') {
  const el = document.getElementById('content-editor-status');
  if (!el) return;
  const bg = { success: '#e8f5ed', info: '#e8f4fd', warn: '#fff8e1' }[type] || '#f5f5f5';
  const fg = { success: '#1b5e20', info: '#1565c0', warn: '#856404' }[type] || '#444';
  el.style.background = bg;
  el.style.color = fg;
  el.style.display = 'block';
  el.textContent = msg;
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// ── Init: capture defaults, then apply overrides — as early as possible ──────
document.addEventListener('DOMContentLoaded', () => {
  captureDefaults();
  applySiteContent();
});

window.buildContentEditor       = buildContentEditor;
window.saveSiteContentFromEditor = saveSiteContentFromEditor;
window.resetSiteContent         = resetSiteContent;
