import { FALLBACK_CAR_SVG } from '../data/seed.js';
import { t } from '../data/i18n.js';
import { escapeHtml, formatRupiah, icons, sanitizeUrl } from '../utils/format.js';

/**
 * Opens the Vehicle Specification Modal.
 * @param {HTMLElement} modalBackdrop
 * @param {HTMLElement} modalContent
 * @param {import('../data/seed.js').FleetVehicle} car
 * @param {'id' | 'en'} lang
 */
export function openCarDetailModal(modalBackdrop, modalContent, car, lang) {
  const safeImg = sanitizeUrl(car.imageUrl, FALLBACK_CAR_SVG);
  const safeMaps = sanitizeUrl(car.mapsUrl, 'https://www.google.com/maps/search/?api=1&query=Banda+Aceh');
  const safeName = escapeHtml(car.nama);

  modalContent.innerHTML = `
    <img
      src="${escapeHtml(safeImg)}"
      alt="${safeName}"
      class="modal-hero-img"
      referrerpolicy="no-referrer"
      data-fallback-img="true"
    />
    <div class="card-kicker" style="margin-bottom:6px;">
      ${escapeHtml(car.kategori)} · ${escapeHtml(car.wilayah)} · ${escapeHtml(t(lang, 'fleet.yearLabel'))} ${escapeHtml(car.tahun)}
    </div>
    <h2 id="modal-title" style="color:var(--navy-900); font-size:1.55rem; margin-bottom:14px;">${safeName}</h2>

    <div class="spec-sheet" style="grid-template-columns: repeat(4, 1fr); margin-bottom:16px;">
      <div class="spec-item">
        <span class="spec-label">${escapeHtml(t(lang, 'fleet.transmissionLabel'))}</span>
        <span class="spec-value">${escapeHtml(car.transmisi)}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">${escapeHtml(t(lang, 'fleet.capacityLabel'))}</span>
        <span class="spec-value tabular-nums">${escapeHtml(car.kursi)} ${escapeHtml(t(lang, 'fleet.seatsUnit'))}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">${escapeHtml(t(lang, 'fleet.fuelLabel'))}</span>
        <span class="spec-value">${escapeHtml(car.bbm)}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">${escapeHtml(t(lang, 'fleet.luggageLabel'))}</span>
        <span class="spec-value">${escapeHtml(car.bagasi)}</span>
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <strong style="display:block; font-size:0.88rem; color:var(--navy-900); margin-bottom:6px;">
        ${escapeHtml(t(lang, 'modal.facilitiesTitle'))}
      </strong>
      <p style="font-size:0.88rem; color:var(--text-secondary);">
        ${(car.fasilitas || []).map((f) => escapeHtml(f)).join(' · ')}
      </p>
    </div>

    <div class="modal-rates-grid">
      <div class="rate-card">
        <small>${escapeHtml(t(lang, 'modal.selfDriveRate'))}</small>
        <strong class="tabular-nums">
          ${car.bisaLepasKunci ? escapeHtml(formatRupiah(car.hargaLepasKunci)) : escapeHtml(t(lang, 'modal.unavailable'))}
        </strong>
      </div>
      <div class="rate-card">
        <small>${escapeHtml(t(lang, 'modal.driverRate'))}</small>
        <strong class="tabular-nums">${escapeHtml(formatRupiah(car.hargaDenganSopir))}</strong>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-top:1px solid var(--border-hairline); padding-top:16px;">
      <a href="${escapeHtml(safeMaps)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">
        ${escapeHtml(t(lang, 'modal.openMaps'))}
        ${icons.externalLink()}
      </a>
      <button type="button" class="btn btn-primary" data-action="book-car" data-id="${escapeHtml(car.id)}">
        ${escapeHtml(t(lang, 'modal.proceedCalc'))}
      </button>
    </div>
  `;

  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
}

/**
 * Opens the Reset Confirmation Modal.
 * @param {HTMLElement} modalBackdrop
 * @param {HTMLElement} modalContent
 * @param {'id' | 'en'} lang
 */
export function openResetConfirmModal(modalBackdrop, modalContent, lang) {
  modalContent.innerHTML = `
    <h2 id="modal-title" style="color:var(--navy-900); font-size:1.35rem; margin-bottom:10px;">
      ${escapeHtml(t(lang, 'modal.resetTitle'))}
    </h2>
    <p style="font-size:0.94rem; color:var(--text-muted); margin-bottom:20px;">
      ${escapeHtml(t(lang, 'modal.resetDesc'))}
    </p>
    <div style="display:flex; gap:10px; justify-content:flex-end;">
      <button type="button" class="btn btn-outline" data-action="close-modal">
        ${escapeHtml(t(lang, 'modal.cancel'))}
      </button>
      <button type="button" class="btn btn-danger" data-action="confirm-reset-demo">
        ${escapeHtml(t(lang, 'modal.resetConfirm'))}
      </button>
    </div>
  `;

  modalBackdrop.classList.add('open');
  modalBackdrop.setAttribute('aria-hidden', 'false');
}

/**
 * Closes the modal dialog cleanly.
 * @param {HTMLElement} modalBackdrop
 */
export function closeModal(modalBackdrop) {
  modalBackdrop.classList.remove('open');
  modalBackdrop.setAttribute('aria-hidden', 'true');
}
