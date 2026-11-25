import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

import { I18N, t } from './data/i18n.js';
import { FALLBACK_CAR_SVG } from './data/seed.js';
import { createStore } from './state/store.js';
import { escapeHtml, getTodayIsoDate, sanitizeUrl } from './utils/format.js';
import { compressImageFile } from './utils/imageCompression.js';
import { renderAdminView } from './views/adminView.js';
import { renderBookingView, updateBookingSummary, validateBookingForm } from './views/bookingView.js';
import { renderFavoritesView } from './views/favoritesView.js';
import { renderFleetView } from './views/fleetView.js';
import { closeModal, openCarDetailModal, openResetConfirmModal } from './views/modalView.js';
import { renderRecommenderView } from './views/recommenderView.js';
import { renderTransfersView } from './views/transfersView.js';

// Tier 1 Google Maps Platform Quota Defense (module root before render)
/** @type {any} */ (window).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origConsoleError = console.error;
console.error = (...args) => {
  origConsoleError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

window.addEventListener('gmp-quota-exceeded', () => {
  document.getElementById('gmp-quota-banner')?.removeAttribute('hidden');
});

const store = createStore();

const modalBackdrop = /** @type {HTMLElement} */ (document.getElementById('app-modal'));
const modalContent = /** @type {HTMLElement} */ (document.getElementById('modal-content'));
const toastEl = /** @type {HTMLElement} */ (document.getElementById('toast-msg'));
const mobileDrawer = /** @type {HTMLElement} */ (document.getElementById('mobile-drawer'));
const mobileMenuBtn = /** @type {HTMLElement} */ (document.getElementById('mobile-menu-toggle'));

/** @type {number | undefined} */
let toastTimer;

/**
 * Displays a non-blocking status toast message.
 * @param {string} message
 */
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 2800);
}

/**
 * Updates static chrome (header nav, hero copy, proof strip, footer, language buttons).
 */
function renderChrome() {
  const { lang, activeTab, favorit } = store.state;
  const copy = I18N[lang];

  /**
   * @param {string} id
   * @param {string} text
   */
  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('skip-link', copy.skipToMain);
  setText('sim-notice', copy.simNotice);
  setText('nav-armada', copy.nav.armada);
  setText('nav-rekomendasi', copy.nav.rekomendasi);
  setText('nav-antarjemput', copy.nav.antarjemput);
  setText('nav-favorit', `${copy.nav.favorit} (${favorit.length})`);
  setText('nav-admin', copy.nav.admin);
  setText('nav-cta-booking', copy.nav.ctaBooking);

  document.querySelectorAll('[data-mobile-nav]').forEach((btn) => {
    const key = btn.getAttribute('data-mobile-nav');
    if (key === 'favorit') {
      btn.textContent = `${copy.nav.favorit} (${favorit.length})`;
    } else if (key === 'booking') {
      btn.textContent = copy.nav.ctaBooking;
    } else if (key && key in copy.nav) {
      btn.textContent = copy.nav[/** @type {keyof typeof copy.nav} */ (key)];
    }
  });

  setText('hero-kicker', copy.hero.kicker);
  setText('hero-title', copy.hero.title);
  setText('hero-desc', copy.hero.desc);
  setText('hero-cta-primary', copy.hero.ctaPrimary);
  setText('hero-cta-secondary', copy.hero.ctaSecondary);
  setText('hero-media-caption', copy.hero.mediaCaption);

  const proofStrip = document.getElementById('hero-proof-strip');
  if (proofStrip) {
    proofStrip.innerHTML = copy.hero.proof
      .map(
        (item) => `
        <div class="proof-cell">
          <strong class="tabular-nums">${escapeHtml(item.value)}</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `
      )
      .join('');
  }

  setText('footer-desc', copy.footer.desc);
  setText('footer-notice-title', copy.footer.noticeTitle);
  setText('footer-notice-1', copy.footer.notice1);
  setText('footer-notice-2', copy.footer.notice2);

  document.getElementById('lang-id')?.classList.toggle('active', lang === 'id');
  document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-action="go-tab"][data-tab]').forEach((el) => {
    if (el.classList.contains('nav-link')) {
      el.classList.toggle('active', el.getAttribute('data-tab') === activeTab);
    }
  });

  const tabs = ['armada', 'rekomendasi', 'booking', 'antarjemput', 'favorit', 'admin'];
  for (const tab of tabs) {
    const panel = document.getElementById(`tab-${tab}`);
    if (panel) {
      panel.classList.toggle('active', tab === activeTab);
    }
  }
}

/**
 * Renders all feature view sections from current state.
 */
function renderViews() {
  const { state } = store;

  const armadaEl = document.getElementById('tab-armada');
  const recEl = document.getElementById('tab-rekomendasi');
  const bookEl = document.getElementById('tab-booking');
  const transferEl = document.getElementById('tab-antarjemput');
  const favEl = document.getElementById('tab-favorit');
  const adminEl = document.getElementById('tab-admin');

  if (armadaEl) {
    renderFleetView(armadaEl, state, (region) => {
      store.setRegionFilter(region);
      if (region) {
        showToast(t(store.state.lang, 'toast.mapFiltered', { region }));
      }
    });
  }
  if (recEl) renderRecommenderView(recEl, state);
  if (bookEl) renderBookingView(bookEl, state);
  if (transferEl) renderTransfersView(transferEl, state);
  if (favEl) renderFavoritesView(favEl, state);
  if (adminEl) renderAdminView(adminEl, state);
}

function renderAll() {
  renderChrome();
  renderViews();
}

/**
 * Switches active tab, updates URL hash, and scrolls smoothly to workspace when navigating from CTAs.
 * @param {string} tab
 * @param {boolean} [scrollToMain]
 */
function navigateToTab(tab, scrollToMain = false) {
  store.setActiveTab(tab);
  if (window.location.hash !== `#${tab}`) {
    history.replaceState(null, '', `#${tab}`);
  }
  mobileDrawer.classList.remove('open');
  mobileMenuBtn.setAttribute('aria-expanded', 'false');

  if (scrollToMain) {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ============================================================================
   EVENT DELEGATION & HANDLERS
   ============================================================================ */

// Fallback image protection without inline onerror attributes
document.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target.hasAttribute('data-fallback-img')) {
      if (target.src !== FALLBACK_CAR_SVG) {
        target.src = FALLBACK_CAR_SVG;
      }
    }
  },
  true
);

// Delegated clicks
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target === modalBackdrop) {
    closeModal(modalBackdrop);
    return;
  }

  const actionEl = target.closest('[data-action]');
  if (!actionEl) return;

  const action = actionEl.getAttribute('data-action');
  const lang = store.state.lang;

  switch (action) {
    case 'set-lang': {
      const nextLang = actionEl.getAttribute('data-lang');
      if (nextLang === 'id' || nextLang === 'en') {
        store.setLang(nextLang);
      }
      break;
    }

    case 'toggle-mobile-menu': {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      break;
    }

    case 'go-tab': {
      if (actionEl.tagName === 'A') {
        event.preventDefault();
      }
      const tab = actionEl.getAttribute('data-tab') || 'armada';
      const fromHero = Boolean(actionEl.closest('.hero-section'));
      navigateToTab(tab, fromHero);
      break;
    }

    case 'map-region': {
      const region = actionEl.getAttribute('data-region') || '';
      store.setRegionFilter(region);
      if (region) {
        showToast(t(lang, 'toast.mapFiltered', { region }));
      }
      break;
    }

    case 'reset-fleet-filters': {
      store.state.filters = { search: '', wilayah: '', kategori: '', transmisi: '', sort: 'default' };
      renderViews();
      break;
    }

    case 'toggle-fav': {
      const carId = actionEl.getAttribute('data-id');
      if (!carId) return;
      const added = store.toggleFavorite(carId);
      showToast(t(lang, added ? 'toast.favAdded' : 'toast.favRemoved'));
      break;
    }

    case 'open-detail': {
      const carId = actionEl.getAttribute('data-id');
      const car = store.state.armada.find((/** @type {import('./data/seed.js').FleetVehicle} */ c) => c.id === carId);
      if (car) {
        openCarDetailModal(modalBackdrop, modalContent, car, lang);
      }
      break;
    }

    case 'book-car': {
      const carId = actionEl.getAttribute('data-id');
      if (carId) {
        store.state.selectedCarForBooking = carId;
      }
      closeModal(modalBackdrop);
      navigateToTab('booking', true);
      showToast(t(lang, 'toast.carSelected'));
      break;
    }

    case 'close-modal': {
      closeModal(modalBackdrop);
      break;
    }

    case 'delete-booking': {
      const bookingId = actionEl.getAttribute('data-id');
      if (bookingId) {
        store.deleteBooking(bookingId);
        showToast(t(lang, 'toast.bookingDeleted'));
      }
      break;
    }

    case 'clear-bookings': {
      store.clearBookings();
      showToast(t(lang, 'toast.historyCleared'));
      break;
    }

    case 'switch-crud': {
      const entity = actionEl.getAttribute('data-entity');
      if (entity) {
        store.setCrudEntity(entity);
      }
      break;
    }

    case 'edit-crud': {
      const id = actionEl.getAttribute('data-id');
      if (id) {
        store.setCrudEditId(id);
        document.getElementById('crud-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      break;
    }

    case 'delete-crud': {
      const id = actionEl.getAttribute('data-id');
      if (id) {
        store.deleteCrudItem(store.state.crudEntity, id);
        showToast(t(lang, 'toast.crudDeleted'));
      }
      break;
    }

    case 'cancel-crud': {
      store.setCrudEditId(null);
      break;
    }

    case 'open-reset-modal': {
      openResetConfirmModal(modalBackdrop, modalContent, lang);
      break;
    }

    case 'confirm-reset-demo': {
      store.resetDemoData();
      closeModal(modalBackdrop);
      showToast(t(lang, 'toast.dataReset'));
      break;
    }
  }
});

// Keyboard accessibility for modal Escape
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modalBackdrop.classList.contains('open')) {
    closeModal(modalBackdrop);
  }
});

// Delegated input & change listeners for filters, recommender, calculator, and CRUD image inputs
document.addEventListener('input', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.id === 'search-car' && target instanceof HTMLInputElement) {
    store.state.filters.search = target.value;
    const armadaEl = document.getElementById('tab-armada');
    if (armadaEl) {
      renderFleetView(armadaEl, store.state, (region) => {
        store.setRegionFilter(region);
      });
    }
    return;
  }

  if (
    target.id === 'book-days' ||
    target.id === 'book-customer' ||
    target.id === 'book-date'
  ) {
    const bookEl = document.getElementById('tab-booking');
    if (bookEl) updateBookingSummary(bookEl, store.state);
    return;
  }

  if (target.id === 'f-img-url' && target instanceof HTMLInputElement) {
    const clean = sanitizeUrl(target.value, FALLBACK_CAR_SVG);
    const dataInput = /** @type {HTMLInputElement | null} */ (document.getElementById('f-img-data'));
    const previewImg = /** @type {HTMLImageElement | null} */ (document.getElementById('f-img-preview'));
    if (dataInput) dataInput.value = clean;
    if (previewImg) previewImg.src = clean;
  }
});

document.addEventListener('change', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  // Fleet filters
  const rerenderFleet = () => {
    const armadaEl = document.getElementById('tab-armada');
    if (armadaEl) {
      renderFleetView(armadaEl, store.state, (region) => {
        store.setRegionFilter(region);
      });
    }
  };

  if (target.id === 'filter-wilayah' && target instanceof HTMLSelectElement) {
    store.state.filters.wilayah = target.value;
    rerenderFleet();
    return;
  }
  if (target.id === 'filter-kategori' && target instanceof HTMLSelectElement) {
    store.state.filters.kategori = target.value;
    rerenderFleet();
    return;
  }
  if (target.id === 'filter-transmisi' && target instanceof HTMLSelectElement) {
    store.state.filters.transmisi = target.value;
    rerenderFleet();
    return;
  }
  if (target.id === 'sort-car' && target instanceof HTMLSelectElement) {
    store.state.filters.sort = target.value;
    rerenderFleet();
    return;
  }

  // Recommender filters
  if (target.id === 'rec-pax' && target instanceof HTMLSelectElement) {
    store.state.recommender.pax = Number(target.value);
    const recEl = document.getElementById('tab-rekomendasi');
    if (recEl) renderRecommenderView(recEl, store.state);
    return;
  }
  if (target.id === 'rec-rute' && target instanceof HTMLSelectElement) {
    store.state.recommender.rute = target.value;
    const recEl = document.getElementById('tab-rekomendasi');
    if (recEl) renderRecommenderView(recEl, store.state);
    return;
  }
  if (target.id === 'rec-budget' && target instanceof HTMLSelectElement) {
    store.state.recommender.budget = Number(target.value);
    const recEl = document.getElementById('tab-rekomendasi');
    if (recEl) renderRecommenderView(recEl, store.state);
    return;
  }

  // Calculator selects & checkboxes
  if (
    target.id === 'book-car' ||
    target.id === 'book-service' ||
    target.id === 'book-pickup' ||
    target.id === 'book-date' ||
    target.id === 'addon-gayo' ||
    target.id === 'addon-babyseat'
  ) {
    const bookEl = document.getElementById('tab-booking');
    if (bookEl) updateBookingSummary(bookEl, store.state);
    return;
  }

  // CRUD local image upload + Canvas compression
  if (target.id === 'f-img-file' && target instanceof HTMLInputElement) {
    const file = target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      const dataInput = /** @type {HTMLInputElement | null} */ (document.getElementById('f-img-data'));
      const urlInput = /** @type {HTMLInputElement | null} */ (document.getElementById('f-img-url'));
      const previewImg = /** @type {HTMLImageElement | null} */ (document.getElementById('f-img-preview'));
      if (dataInput) dataInput.value = compressed;
      if (urlInput) urlInput.value = '';
      if (previewImg) previewImg.src = compressed;
      showToast(t(store.state.lang, 'toast.imgCompressed'));
    } catch {
      showToast(t(store.state.lang, 'toast.imgError'));
    }
  }
});

// Delegated form submissions (Booking Calculator & Admin CRUD)
document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  if (form.id === 'booking-form') {
    event.preventDefault();
    const bookEl = document.getElementById('tab-booking');
    if (!bookEl) return;

    if (!validateBookingForm(bookEl)) {
      showToast(t(store.state.lang, 'toast.validationError'));
      return;
    }

    const calc = updateBookingSummary(bookEl, store.state);
    if (!calc) return;

    const record = {
      id: `bk-${Date.now()}`,
      customer: calc.customerVal,
      carName: calc.car.nama,
      service: calc.serviceLabel,
      date: calc.dateVal || getTodayIsoDate(),
      days: calc.days,
      pickup: calc.pickupVal,
      total: calc.grandTotal
    };

    const ok = store.addBooking(record);
    showToast(t(store.state.lang, ok ? 'toast.bookingSaved' : 'toast.quotaExceeded'));
    return;
  }

  if (form.id === 'crud-form') {
    event.preventDefault();
    const lang = store.state.lang;
    const entity = store.state.crudEntity;
    const editId = /** @type {HTMLInputElement | null} */ (document.getElementById('crud-id'))?.value || '';
    const imgDataVal = /** @type {HTMLInputElement | null} */ (document.getElementById('f-img-data'))?.value;
    const chosenImg = sanitizeUrl(imgDataVal, FALLBACK_CAR_SVG);

    /** @type {any} */
    let payload;

    if (entity === 'armada') {
      const nama = (/** @type {HTMLInputElement | null} */ (document.getElementById('f-nama'))?.value || '').trim();
      const kategori = /** @type {HTMLSelectElement | null} */ (document.getElementById('f-kategori'))?.value || 'MPV Keluarga';
      const wilayah = /** @type {HTMLSelectElement | null} */ (document.getElementById('f-wilayah'))?.value || 'Banda Aceh';
      const transmisi = /** @type {HTMLSelectElement | null} */ (document.getElementById('f-transmisi'))?.value === 'Manual' ? 'Manual' : 'Matic';
      const kursi = Math.min(30, Math.max(2, Number(/** @type {HTMLInputElement | null} */ (document.getElementById('f-kursi'))?.value) || 7));
      const hargaLepasKunci = Math.max(50000, Number(/** @type {HTMLInputElement | null} */ (document.getElementById('f-lepas'))?.value) || 450000);
      const hargaDenganSopir = Math.max(50000, Number(/** @type {HTMLInputElement | null} */ (document.getElementById('f-sopir'))?.value) || 650000);
      const bbm = (/** @type {HTMLInputElement | null} */ (document.getElementById('f-bbm'))?.value || 'Bensin').trim();

      if (!nama) {
        showToast(t(lang, 'toast.validationError'));
        return;
      }

      const existing = editId
        ? store.state.armada.find((/** @type {import('./data/seed.js').FleetVehicle} */ x) => x.id === editId)
        : null;
      payload = {
        id: editId || `car-${Date.now()}`,
        nama,
        kategori,
        wilayah,
        transmisi,
        kursi,
        bagasi: kursi > 8 ? '6 Koper Besar' : '2 Koper Besar',
        bbm,
        tahun: existing?.tahun || new Date().getFullYear(),
        hargaLepasKunci,
        hargaDenganSopir,
        bisaLepasKunci: kursi <= 8,
        fasilitas: existing?.fasilitas || ['AC Dingin', 'Car Charger', 'Kotak P3K'],
        ruteCocok: kursi > 8 ? ['kota', 'gunung', 'rombongan'] : ['kota', 'gunung'],
        imageUrl: chosenImg,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${wilayah} Aceh`)}`,
        kontak: existing?.kontak || '6281200001099'
      };
    } else {
      const nama = (/** @type {HTMLInputElement | null} */ (document.getElementById('f-nama'))?.value || '').trim();
      const rute = (/** @type {HTMLInputElement | null} */ (document.getElementById('f-rute'))?.value || '').trim();
      const durasi = (/** @type {HTMLInputElement | null} */ (document.getElementById('f-durasi'))?.value || '± 1 Jam').trim();
      const armada = (/** @type {HTMLInputElement | null} */ (document.getElementById('f-armada'))?.value || 'Innova Reborn').trim();
      const harga = Math.max(50000, Number(/** @type {HTMLInputElement | null} */ (document.getElementById('f-harga'))?.value) || 200000);

      if (!nama || !rute) {
        showToast(t(lang, 'toast.validationError'));
        return;
      }

      payload = {
        id: editId || `trf-${Date.now()}`,
        nama,
        rute,
        durasi,
        armada,
        harga,
        imageUrl: chosenImg,
        inklusi: 'Mobil + Sopir + BBM (Data Admin)'
      };
    }

    const ok = store.upsertCrudItem(entity, payload, editId || null);
    if (!ok) {
      showToast(t(lang, 'toast.quotaExceeded'));
      return;
    }
    showToast(t(lang, editId ? 'toast.crudUpdated' : 'toast.crudCreated'));
  }
});

// Subscribe store updates to re-render
store.subscribe(renderAll);

// Sync initial route from URL hash
const initialHash = window.location.hash.replace('#', '');
if (initialHash) {
  store.setActiveTab(initialHash);
} else {
  renderAll();
}
