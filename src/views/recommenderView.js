import { t } from '../data/i18n.js';
import { escapeHtml } from '../utils/format.js';
import { buildFleetCardHtml } from './cardBuilder.js';

/**
 * Renders the Rule-Based Smart Recommender section.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
export function renderRecommenderView(container, state) {
  const lang = state.lang;
  const rec = state.recommender;

  if (container.dataset.lang !== lang) {
    container.dataset.lang = lang;
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2 class="section-title">${escapeHtml(t(lang, 'rec.title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t(lang, 'rec.subtitle'))}</p>
        </div>
      </div>

      <div class="filter-bar filter-bar-3">
        <div>
          <label for="rec-pax" class="field-label">${escapeHtml(t(lang, 'rec.paxLabel'))}</label>
          <select id="rec-pax">
            <option value="1">${escapeHtml(t(lang, 'rec.pax1'))}</option>
            <option value="5">${escapeHtml(t(lang, 'rec.pax5'))}</option>
            <option value="8">${escapeHtml(t(lang, 'rec.pax8'))}</option>
          </select>
        </div>
        <div>
          <label for="rec-rute" class="field-label">${escapeHtml(t(lang, 'rec.routeLabel'))}</label>
          <select id="rec-rute">
            <option value="">${escapeHtml(t(lang, 'rec.routeAll'))}</option>
            <option value="kota">${escapeHtml(t(lang, 'rec.routeCity'))}</option>
            <option value="gunung">${escapeHtml(t(lang, 'rec.routeMountain'))}</option>
            <option value="rombongan">${escapeHtml(t(lang, 'rec.routeGroup'))}</option>
          </select>
        </div>
        <div>
          <label for="rec-budget" class="field-label">${escapeHtml(t(lang, 'rec.budgetLabel'))}</label>
          <select id="rec-budget">
            <option value="99999999">${escapeHtml(t(lang, 'rec.budgetAll'))}</option>
            <option value="450000">${escapeHtml(t(lang, 'rec.budget450'))}</option>
            <option value="750000">${escapeHtml(t(lang, 'rec.budget750'))}</option>
            <option value="1500000">${escapeHtml(t(lang, 'rec.budget1500'))}</option>
          </select>
        </div>
      </div>

      <div class="cards-grid" id="rekomendasi-grid"></div>
    `;
  }

  const paxEl = /** @type {HTMLSelectElement | null} */ (container.querySelector('#rec-pax'));
  const ruteEl = /** @type {HTMLSelectElement | null} */ (container.querySelector('#rec-rute'));
  const budgetEl = /** @type {HTMLSelectElement | null} */ (container.querySelector('#rec-budget'));

  if (paxEl) paxEl.value = String(rec.pax);
  if (ruteEl) ruteEl.value = rec.rute;
  if (budgetEl) budgetEl.value = String(rec.budget);

  const minSeats = rec.pax === 1 ? 4 : rec.pax === 5 ? 6 : 10;
  const filtered = state.armada.filter((c) => {
    const ruleSeat = c.kursi >= minSeats;
    const ruleRute = !rec.rute || (Array.isArray(c.ruteCocok) && c.ruteCocok.includes(rec.rute));
    const dailyRate = c.bisaLepasKunci ? c.hargaLepasKunci : c.hargaDenganSopir;
    const ruleBudget = dailyRate <= rec.budget;
    return ruleSeat && ruleRute && ruleBudget;
  });

  const grid = container.querySelector('#rekomendasi-grid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>${escapeHtml(t(lang, 'rec.emptyTitle'))}</h3>
        <p>${escapeHtml(t(lang, 'rec.emptyDesc'))}</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map((car) => buildFleetCardHtml(car, state.favorit.includes(car.id), lang)).join('');
}
