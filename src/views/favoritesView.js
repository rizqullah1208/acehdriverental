import { t } from '../data/i18n.js';
import { escapeHtml } from '../utils/format.js';
import { buildFleetCardHtml } from './cardBuilder.js';

/**
 * Renders the Saved Favorite Vehicles view.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
export function renderFavoritesView(container, state) {
  const lang = state.lang;
  const favCars = state.armada.filter((c) => state.favorit.includes(c.id));

  const contentHtml =
    favCars.length === 0
      ? `
      <div class="empty-state">
        <h3>${escapeHtml(t(lang, 'fav.emptyTitle'))}</h3>
        <p style="margin-bottom:16px;">${escapeHtml(t(lang, 'fav.emptyDesc'))}</p>
        <button type="button" class="btn btn-primary btn-sm" data-action="go-tab" data-tab="armada">
          ${escapeHtml(t(lang, 'hero.ctaPrimary'))}
        </button>
      </div>
    `
      : favCars.map((car) => buildFleetCardHtml(car, true, lang)).join('');

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">${escapeHtml(t(lang, 'fav.title'))}</h2>
        <p class="section-subtitle">${escapeHtml(t(lang, 'fav.subtitle'))}</p>
      </div>
    </div>
    <div class="cards-grid">
      ${contentHtml}
    </div>
  `;
}
