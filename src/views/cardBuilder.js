import { FALLBACK_CAR_SVG } from '../data/seed.js';
import { t } from '../data/i18n.js';
import { escapeHtml, formatRupiah, icons, sanitizeUrl } from '../utils/format.js';

/**
 * Builds an accessible, XSS-safe fleet vehicle card HTML string.
 * @param {import('../data/seed.js').FleetVehicle} car
 * @param {boolean} isFav
 * @param {'id' | 'en'} lang
 * @returns {string}
 */
export function buildFleetCardHtml(car, isFav, lang) {
  const basePrice = car.bisaLepasKunci ? car.hargaLepasKunci : car.hargaDenganSopir;
  const priceLabel = car.bisaLepasKunci ? t(lang, 'fleet.perDaySelf') : t(lang, 'fleet.perDayDriver');
  const safeImg = sanitizeUrl(car.imageUrl, FALLBACK_CAR_SVG);
  const safeName = escapeHtml(car.nama);
  const safeId = escapeHtml(car.id);

  return `
    <article class="fleet-card" data-car-id="${safeId}">
      <div class="card-media">
        <img
          src="${escapeHtml(safeImg)}"
          alt="${safeName}"
          loading="lazy"
          referrerpolicy="no-referrer"
          data-fallback-img="true"
        />
        <button
          type="button"
          class="card-fav-btn ${isFav ? 'is-fav' : ''}"
          data-action="toggle-fav"
          data-id="${safeId}"
          aria-pressed="${isFav ? 'true' : 'false'}"
          aria-label="${isFav ? escapeHtml(t(lang, 'toast.favRemoved')) : escapeHtml(t(lang, 'toast.favAdded'))} — ${safeName}"
        >
          ${icons.heart(isFav)}
        </button>
      </div>
      <div class="card-body">
        <div class="card-kicker">
          ${escapeHtml(car.kategori)} · ${escapeHtml(car.wilayah)} · ${escapeHtml(car.tahun)}
        </div>
        <h3 class="card-title">${safeName}</h3>

        <div class="spec-sheet">
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

        <div class="card-service-note ${car.bisaLepasKunci ? '' : 'driver-only'}">
          ${escapeHtml(car.bisaLepasKunci ? t(lang, 'fleet.selfDriveBadge') : t(lang, 'fleet.driverOnlyBadge'))}
        </div>

        <div class="card-footer">
          <div class="price-block">
            <span class="price-amount tabular-nums">${escapeHtml(formatRupiah(basePrice))}</span>
            <span class="price-unit">${escapeHtml(priceLabel)}</span>
          </div>
          <div class="card-actions">
            <button type="button" class="btn btn-sm btn-outline" data-action="open-detail" data-id="${safeId}">
              ${escapeHtml(t(lang, 'fleet.btnSpecs'))}
            </button>
            <button type="button" class="btn btn-sm btn-primary" data-action="book-car" data-id="${safeId}">
              ${escapeHtml(t(lang, 'fleet.btnRent'))}
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
