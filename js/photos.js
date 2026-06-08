/* === KZN Hidden Gems — Community Photos & Review Enhancements === */

let pendingPhotos    = [];   // base64 strings for current review submission
let lightboxPhotos   = [];   // all photos for current lightbox session
let lightboxIndex    = 0;

// ── Image compression helper ──────────────────────────────────────────────────
function compressImage(file, maxW = 1000, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio  = Math.min(maxW / img.width, maxW / img.height, 1);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Handle files dropped or selected ─────────────────────────────────────────
async function handlePhotoFiles(files) {
  const remaining = 5 - pendingPhotos.length;
  if (remaining <= 0) { showNotification('📸 Maximum 5 photos per review.'); return; }

  const toProcess = Array.from(files).slice(0, remaining).filter(f => f.type.startsWith('image/'));

  for (const file of toProcess) {
    try {
      const b64 = await compressImage(file);
      pendingPhotos.push(b64);
    } catch { /* skip bad file */ }
  }
  renderPendingThumbs();
}

function renderPendingThumbs() {
  const wrap = document.getElementById('upload-thumbs');
  if (!wrap) return;
  wrap.innerHTML = pendingPhotos.map((b64, i) => `
    <div class="upload-thumb">
      <img src="${b64}" alt="Photo ${i+1}" />
      <button class="remove-thumb" onclick="removePhoto(${i})" title="Remove">✕</button>
    </div>
  `).join('');
  // Update count hint
  const hint = document.getElementById('upload-count-hint');
  if (hint) hint.textContent = pendingPhotos.length > 0
    ? `${pendingPhotos.length} photo${pendingPhotos.length > 1 ? 's' : ''} ready · ${5 - pendingPhotos.length} more allowed`
    : 'Up to 5 photos · JPEG/PNG/WEBP';
}

function removePhoto(i) {
  pendingPhotos.splice(i, 1);
  renderPendingThumbs();
}

// ── Drag & drop wiring ────────────────────────────────────────────────────────
function initUploadZone() {
  const zone = document.getElementById('photo-upload-zone');
  const inp  = document.getElementById('photo-file-input');
  if (!zone || !inp) return;

  inp.addEventListener('change', e => handlePhotoFiles(e.target.files));

  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
  zone.addEventListener('drop',      e  => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handlePhotoFiles(e.dataTransfer.files);
  });
}

// ── Star rating wiring ────────────────────────────────────────────────────────
function initStarRatings() {
  document.querySelectorAll('.star-rating-visual[data-score]').forEach(row => {
    const stars = row.querySelectorAll('.star-btn');
    stars.forEach((star, i) => {
      star.addEventListener('mouseover', () => stars.forEach((s, j) => s.classList.toggle('lit', j <= i)));
      star.addEventListener('mouseleave', () => {
        const val = parseInt(row.dataset.value || 0);
        stars.forEach((s, j) => s.classList.toggle('lit', j < val));
      });
      star.addEventListener('click', () => {
        const val = i + 1;
        row.dataset.value = val;
        stars.forEach((s, j) => s.classList.toggle('lit', j < val));
        const valEl = row.querySelector('.star-val');
        if (valEl) valEl.textContent = val + '/5';
      });
    });
  });
}

// ── Reset photo state when modal opens ───────────────────────────────────────
function resetPhotoUpload() {
  pendingPhotos = [];
  renderPendingThumbs();
  const inp = document.getElementById('photo-file-input');
  if (inp) inp.value = '';
}

// ── Render community photo gallery on location detail page ───────────────────
function renderPhotoGallery(loc) {
  // Collect all photos: hero photo + review photos
  const allPhotos = [];

  // Built-in hero photo
  if (loc.photo) allPhotos.push({ src: loc.photo, credit: 'Official photo', reviewIdx: -1 });

  // Review photos
  (loc.reviews || []).forEach((rev, ri) => {
    (rev.photos || []).forEach(src => {
      allPhotos.push({ src, credit: rev.user, reviewIdx: ri });
    });
  });

  if (allPhotos.length <= 1) {   // only the hero photo — show empty state
    return `
      <div class="photo-gallery-empty">
        📷 No community photos yet — be the first to share yours!
        <br/><button class="btn btn-primary" style="margin-top:10px;display:inline-flex"
          onclick="openReviewModal('${loc.id}')">📸 Add Photos + Review</button>
      </div>`;
  }

  // Only show community-uploaded ones (skip the hero)
  const communityPhotos = allPhotos.filter(p => p.reviewIdx >= 0);

  return `
    <div class="photo-gallery-grid" id="gallery-${loc.id}">
      ${communityPhotos.map((p, i) => `
        <div class="photo-gallery-item" onclick="openLightbox('${loc.id}', ${i})">
          <img src="${p.src}" alt="Photo by ${p.credit}" loading="lazy" />
          <div class="photo-credit">📷 ${p.credit}</div>
        </div>
      `).join('')}
    </div>
    <button class="btn btn-primary" style="margin-top:12px;width:100%;justify-content:center"
      onclick="openReviewModal('${loc.id}')">
      📸 Add Your Photos + Review
    </button>`;
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function openLightbox(locId, startIdx) {
  const loc = KZN_DATA.locations.find(l => l.id === locId);
  if (!loc) return;

  lightboxPhotos = [];
  (loc.reviews || []).forEach(rev => {
    (rev.photos || []).forEach(src => {
      lightboxPhotos.push({ src, credit: rev.user });
    });
  });

  if (!lightboxPhotos.length) return;

  lightboxIndex = Math.min(startIdx, lightboxPhotos.length - 1);
  showLightboxSlide();
  document.getElementById('photo-lightbox').classList.add('active');
}

function showLightboxSlide() {
  const p = lightboxPhotos[lightboxIndex];
  if (!p) return;
  document.getElementById('lb-img').src = p.src;
  document.getElementById('lb-caption').textContent =
    `📷 ${p.credit} · ${lightboxIndex + 1} / ${lightboxPhotos.length}`;
  // Show/hide nav arrows
  document.getElementById('lb-prev').style.display = lightboxPhotos.length > 1 ? '' : 'none';
  document.getElementById('lb-next').style.display = lightboxPhotos.length > 1 ? '' : 'none';
}

function lightboxPrev() { lightboxIndex = (lightboxIndex - 1 + lightboxPhotos.length) % lightboxPhotos.length; showLightboxSlide(); }
function lightboxNext() { lightboxIndex = (lightboxIndex + 1) % lightboxPhotos.length; showLightboxSlide(); }
function closeLightbox() { document.getElementById('photo-lightbox').classList.remove('active'); }

// ── Open a single photo from a review card ───────────────────────────────────
function openSinglePhoto(src, credit) {
  lightboxPhotos  = [{ src, credit }];
  lightboxIndex   = 0;
  showLightboxSlide();
  document.getElementById('photo-lightbox').classList.add('active');
}

// ── init on DOMContentLoaded ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initUploadZone();
  initStarRatings();

  // Keyboard lightbox nav
  document.addEventListener('keydown', e => {
    if (!document.getElementById('photo-lightbox')?.classList.contains('active')) return;
    if (e.key === 'ArrowLeft')  lightboxPrev();
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'Escape')     closeLightbox();
  });
});

// Open photo from thumb element (reads src from the img tag, avoids long base64 in onclick attr)
function openSinglePhotoSrc(thumbEl) {
  const src    = thumbEl.querySelector('img')?.src;
  const credit = thumbEl.title?.replace('View photo by ', '') || 'Community';
  if (src) openSinglePhoto(src, credit);
}

// Expose
window.openSinglePhotoSrc = openSinglePhotoSrc;
window.removePhoto       = removePhoto;
window.openLightbox      = openLightbox;
window.lightboxPrev      = lightboxPrev;
window.lightboxNext      = lightboxNext;
window.closeLightbox     = closeLightbox;
window.openSinglePhoto   = openSinglePhoto;
window.renderPhotoGallery = renderPhotoGallery;
window.resetPhotoUpload  = resetPhotoUpload;
window.initStarRatings   = initStarRatings;
window.initUploadZone    = initUploadZone;
