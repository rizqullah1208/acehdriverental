import { FALLBACK_CAR_SVG } from '../data/seed.js';
import { t } from '../data/i18n.js';
import { escapeHtml, formatRupiah, icons, sanitizeUrl } from '../utils/format.js';

/**
 * Renders the Aceh Point-to-Point & Airport Transfer Packages view.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
export function renderTransfersView(container, state) {
  const lang = state.lang;
  const list = state.antarjemput;

  const cardsHtml = list
    .map((pkg) => {
      const safeImg = sanitizeUrl(pkg.imageUrl, FALLBACK_CAR_SVG);
      const waMsg = encodeURIComponent(
        `Halo AcehDrive Rental (Demo), saya ingin menanyakan paket antar-jemput: ${pkg.nama}`
      );
      return `
        <article class="fleet-card">
          <div class="card-media">
            <img
              src="${escapeHtml(safeImg)}"
              alt="${escapeHtml(pkg.nama)}"
              loading="lazy"
              referrerpolicy="no-referrer"
              data-fallback-img="true"
            />
          </div>
          <div class="card-body">
            <div class="card-kicker">
              ${escapeHtml(pkg.durasi)} · ${escapeHtml(pkg.armada)}
            </div>
            <h3 class="card-title">${escapeHtml(pkg.nama)}</h3>
            <p style="font-size:0.87rem; color:var(--text-secondary); margin-bottom:10px;">
              <strong>${escapeHtml(t(lang, 'transfers.routePrefix'))}:</strong> ${escapeHtml(pkg.rute)}
            </p>
            <p style="font-size:0.82rem; color:var(--emerald-900); font-weight:600; margin-bottom:16px;">
              ${escapeHtml(pkg.inklusi)}
            </p>
            <div class="card-footer">
              <div class="price-block">
                <span class="price-amount tabular-nums">${escapeHtml(formatRupiah(pkg.harga))}</span>
              </div>
              <a
                href="https://wa.me/6281200001001?text=${waMsg}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-sm btn-wa"
              >
                ${escapeHtml(t(lang, 'transfers.btnBookTransfer'))}
                ${icons.externalLink()}
              </a>
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">${escapeHtml(t(lang, 'transfers.title'))}</h2>
        <p class="section-subtitle">${escapeHtml(t(lang, 'transfers.subtitle'))}</p>
      </div>
    </div>
    <div class="cards-grid">
      ${cardsHtml}
    </div>
  `;
}
