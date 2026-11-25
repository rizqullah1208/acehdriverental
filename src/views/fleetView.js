import { t } from '../data/i18n.js';
import { escapeHtml } from '../utils/format.js';
import { mountPickupGoogleMap, syncPickupMapSelection } from '../utils/googleMaps.js';
import { buildFleetCardHtml } from './cardBuilder.js';

const REGIONS = ['Bandara SIM', 'Banda Aceh', 'Sabang', 'Aceh Besar', 'Takengon', 'Lhokseumawe'];
const CATEGORIES = [
  'City Car / Hatchback',
  'MPV Keluarga',
  'SUV / Medan Berat',
  'Minibus / Rombongan',
  'Luxury / VIP'
];

/**
 * Renders the Fleet Catalog section including the real interactive Google Map and filter toolbar.
 * Keeps the Google Map DOM container intact across filter and language updates.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 * @param {(region: string) => void} onMapRegionSelect
 */
export function renderFleetView(container, state, onMapRegionSelect) {
  const lang = state.lang;
  const f = state.filters;

  const q = f.search.trim().toLowerCase();
  const list = state.armada.filter((c) => {
    const matchQ =
      !q ||
      c.nama.toLowerCase().includes(q) ||
      c.kategori.toLowerCase().includes(q) ||
      c.wilayah.toLowerCase().includes(q);
    const matchW = !f.wilayah || c.wilayah === f.wilayah;
    const matchK = !f.kategori || c.kategori === f.kategori;
    const matchT = !f.transmisi || c.transmisi === f.transmisi;
    return matchQ && matchW && matchK && matchT;
  });

  if (f.sort === 'price-asc') {
    list.sort((a, b) => a.hargaLepasKunci - b.hargaLepasKunci);
  } else if (f.sort === 'price-desc') {
    list.sort((a, b) => b.hargaLepasKunci - a.hargaLepasKunci);
  } else if (f.sort === 'seat-desc') {
    list.sort((a, b) => b.kursi - a.kursi);
  }

  // Build static shell once so the Google Map instance stays mounted across updates
  if (!container.querySelector('#pickup-google-map')) {
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2 class="section-title" id="fleet-sec-title"></h2>
          <p class="section-subtitle" id="fleet-sec-subtitle"></p>
        </div>
      </div>

      <div class="pickup-map-panel">
        <div class="real-map-frame">
          <div id="pickup-google-map" class="google-map-canvas" role="region"></div>
          <div id="pickup-map-status" class="map-status-overlay" aria-live="polite"></div>
        </div>
        <div class="map-info">
          <h3 id="map-info-title"></h3>
          <p id="map-info-desc"></p>
          <div class="region-filter-group" id="region-chip-group">
            <button type="button" class="region-chip-btn" id="btn-all-regions" data-action="map-region" data-region=""></button>
            ${REGIONS.map(
              (region) => `
                <button type="button" class="region-chip-btn" data-action="map-region" data-region="${escapeHtml(region)}">
                  ${escapeHtml(region)}
                </button>
              `
            ).join('')}
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div>
          <label for="search-car" class="sr-only" id="lbl-search-car"></label>
          <input type="text" id="search-car" />
        </div>
        <div>
          <label for="filter-wilayah" class="sr-only" id="lbl-filter-wilayah"></label>
          <select id="filter-wilayah">
            <option value=""></option>
            ${REGIONS.map((r) => `<option value="${escapeHtml(r)}">${escapeHtml(r)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="filter-kategori" class="sr-only" id="lbl-filter-kategori"></label>
          <select id="filter-kategori">
            <option value=""></option>
            ${CATEGORIES.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label for="filter-transmisi" class="sr-only" id="lbl-filter-transmisi"></label>
          <select id="filter-transmisi">
            <option value=""></option>
            <option value="Matic">Matic (AT)</option>
            <option value="Manual">Manual (MT)</option>
          </select>
        </div>
        <div>
          <label for="sort-car" class="sr-only" id="lbl-sort-car"></label>
          <select id="sort-car">
            <option value="default"></option>
            <option value="price-asc"></option>
            <option value="price-desc"></option>
            <option value="seat-desc"></option>
          </select>
        </div>
      </div>

      <div class="results-meta">
        <span id="fleet-count-label" class="tabular-nums"></span>
      </div>

      <div class="cards-grid" id="armada-grid"></div>
    `;
  }

  // Update localized labels without recreating the map DOM node
  /**
   * @param {string} selector
   * @param {string} value
   */
  const setText = (selector, value) => {
    const el = container.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText('#fleet-sec-title', t(lang, 'fleet.title'));
  setText('#fleet-sec-subtitle', t(lang, 'fleet.subtitle'));
  setText('#map-info-title', t(lang, 'fleet.mapTitle'));
  setText('#map-info-desc', t(lang, 'fleet.mapDesc'));
  setText('#btn-all-regions', t(lang, 'fleet.allRegions'));
  setText('#lbl-search-car', t(lang, 'fleet.searchPlaceholder'));
  setText('#lbl-filter-wilayah', t(lang, 'fleet.allPickups'));
  setText('#lbl-filter-kategori', t(lang, 'fleet.allCategories'));
  setText('#lbl-filter-transmisi', t(lang, 'fleet.allTransmissions'));
  setText('#lbl-sort-car', t(lang, 'fleet.sortDefault'));

  const mapCanvas = /** @type {HTMLElement | null} */ (container.querySelector('#pickup-google-map'));
  const mapStatusEl = /** @type {HTMLElement | null} */ (container.querySelector('#pickup-map-status'));
  if (mapCanvas) {
    mapCanvas.setAttribute('aria-label', t(lang, 'fleet.mapTitle'));
  }

  const searchInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#search-car'));
  const selWilayah = /** @type {HTMLSelectElement | null} */ (container.querySelector('#filter-wilayah'));
  const selKategori = /** @type {HTMLSelectElement | null} */ (container.querySelector('#filter-kategori'));
  const selTrans = /** @type {HTMLSelectElement | null} */ (container.querySelector('#filter-transmisi'));
  const selSort = /** @type {HTMLSelectElement | null} */ (container.querySelector('#sort-car'));

  if (searchInput) {
    searchInput.placeholder = t(lang, 'fleet.searchPlaceholder');
    if (searchInput.value !== f.search) searchInput.value = f.search;
  }

  if (selWilayah) {
    const firstOpt = selWilayah.querySelector('option[value=""]');
    if (firstOpt) firstOpt.textContent = t(lang, 'fleet.allPickups');
    selWilayah.value = f.wilayah;
  }

  if (selKategori) {
    const firstOpt = selKategori.querySelector('option[value=""]');
    if (firstOpt) firstOpt.textContent = t(lang, 'fleet.allCategories');
    selKategori.value = f.kategori;
  }

  if (selTrans) {
    const firstOpt = selTrans.querySelector('option[value=""]');
    if (firstOpt) firstOpt.textContent = t(lang, 'fleet.allTransmissions');
    selTrans.value = f.transmisi;
  }

  if (selSort) {
    /**
     * @param {string} val
     * @param {string} text
     */
    const setOpt = (val, text) => {
      const opt = selSort.querySelector(`option[value="${val}"]`);
      if (opt) opt.textContent = text;
    };
    setOpt('default', t(lang, 'fleet.sortDefault'));
    setOpt('price-asc', t(lang, 'fleet.sortPriceAsc'));
    setOpt('price-desc', t(lang, 'fleet.sortPriceDesc'));
    setOpt('seat-desc', t(lang, 'fleet.sortSeatDesc'));
    selSort.value = f.sort;
  }

  container.querySelectorAll('.region-chip-btn').forEach((btn) => {
    const region = btn.getAttribute('data-region') || '';
    btn.classList.toggle('active', f.wilayah === region);
  });

  /** @param {string} region */
  const getVehicleCount = (region) => state.armada.filter((c) => c.wilayah === region).length;

  if (mapCanvas) {
    void mountPickupGoogleMap({
      mapContainer: mapCanvas,
      statusEl: mapStatusEl,
      lang,
      selectedRegion: f.wilayah,
      getVehicleCount,
      onSelectRegion: onMapRegionSelect
    });
    syncPickupMapSelection(f.wilayah, getVehicleCount, lang);
  }

  setText('#fleet-count-label', t(lang, 'fleet.showingCount', { count: list.length }));

  const grid = container.querySelector('#armada-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>${escapeHtml(t(lang, 'fleet.emptyTitle'))}</h3>
        <p style="margin-bottom:16px;">${escapeHtml(t(lang, 'fleet.emptyDesc'))}</p>
        <button type="button" class="btn btn-outline btn-sm" data-action="reset-fleet-filters">
          ${escapeHtml(t(lang, 'fleet.resetFilters'))}
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map((car) => buildFleetCardHtml(car, state.favorit.includes(car.id), lang)).join('');
}
