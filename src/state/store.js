import { DEFAULT_DATA } from '../data/seed.js';

const STORAGE_KEYS = {
  schema: 'acehdrive_schema_v2',
  armada: 'acehdrive_armada',
  antarjemput: 'acehdrive_antarjemput',
  favorit: 'acehdrive_favorit',
  bookings: 'acehdrive_bookings',
  lang: 'acehdrive_lang'
};

/**
 * @typedef {Object} BookingRecord
 * @property {string} id
 * @property {string} customer
 * @property {string} carName
 * @property {string} service
 * @property {string} date
 * @property {number} days
 * @property {string} pickup
 * @property {number} total
 */

/**
 * @typedef {Object} AppState
 * @property {import('../data/seed.js').FleetVehicle[]} armada
 * @property {import('../data/seed.js').TransferPackage[]} antarjemput
 * @property {string[]} favorit
 * @property {BookingRecord[]} bookings
 * @property {'id' | 'en'} lang
 * @property {'armada' | 'rekomendasi' | 'booking' | 'antarjemput' | 'favorit' | 'admin'} activeTab
 * @property {'armada' | 'antarjemput'} crudEntity
 * @property {string | null} crudEditId
 * @property {string | null} selectedCarForBooking
 * @property {{ search: string, wilayah: string, kategori: string, transmisi: string, sort: string }} filters
 * @property {{ pax: number, rute: string, budget: number }} recommender
 */

/**
 * Safely reads and parses JSON from localStorage.
 * @param {string} key
 * @param {any} fallback
 * @returns {any}
 */
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely writes JSON to localStorage.
 * @param {string} key
 * @param {unknown} value
 * @returns {boolean}
 */
function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * @template T
 * @param {T} obj
 * @returns {T}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function createStore() {
  // Ensure old prototype Unsplash URLs are upgraded once to verified local assets
  const hasMigrated = localStorage.getItem(STORAGE_KEYS.schema) === '2';
  if (!hasMigrated) {
    writeJson(STORAGE_KEYS.armada, deepClone(DEFAULT_DATA.armada));
    writeJson(STORAGE_KEYS.antarjemput, deepClone(DEFAULT_DATA.antarjemput));
    localStorage.setItem(STORAGE_KEYS.schema, '2');
  }

  /** @type {import('../data/seed.js').FleetVehicle[] | null} */
  const savedArmada = readJson(STORAGE_KEYS.armada, null);
  /** @type {import('../data/seed.js').TransferPackage[] | null} */
  const savedTransfers = readJson(STORAGE_KEYS.antarjemput, null);
  /** @type {string[]} */
  const savedFav = readJson(STORAGE_KEYS.favorit, []);
  /** @type {BookingRecord[]} */
  const savedBookings = readJson(STORAGE_KEYS.bookings, []);
  const savedLang = localStorage.getItem(STORAGE_KEYS.lang) === 'en' ? 'en' : 'id';

  /** @type {AppState} */
  const state = {
    armada:
      Array.isArray(savedArmada) && savedArmada.length > 0
        ? savedArmada
        : deepClone(DEFAULT_DATA.armada),
    antarjemput:
      Array.isArray(savedTransfers) && savedTransfers.length > 0
        ? savedTransfers
        : deepClone(DEFAULT_DATA.antarjemput),
    favorit: Array.isArray(savedFav) ? savedFav : [],
    bookings: Array.isArray(savedBookings) ? savedBookings : [],
    lang: savedLang,
    activeTab: 'armada',
    crudEntity: 'armada',
    crudEditId: null,
    selectedCarForBooking: null,
    filters: {
      search: '',
      wilayah: '',
      kategori: '',
      transmisi: '',
      sort: 'default'
    },
    recommender: {
      pax: 5,
      rute: '',
      budget: 99999999
    }
  };

  /** @type {Set<() => void>} */
  const listeners = new Set();

  function notify() {
    for (const fn of listeners) {
      fn();
    }
  }

  return {
    state,
    /** @param {() => void} fn */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    /** @param {'id' | 'en'} lang */
    setLang(lang) {
      state.lang = lang === 'en' ? 'en' : 'id';
      localStorage.setItem(STORAGE_KEYS.lang, state.lang);
      document.documentElement.lang = state.lang;
      notify();
    },
    /** @param {string} tab */
    setActiveTab(tab) {
      const valid = ['armada', 'rekomendasi', 'booking', 'antarjemput', 'favorit', 'admin'];
      state.activeTab = valid.includes(tab) ? /** @type {AppState['activeTab']} */ (tab) : 'armada';
      notify();
    },
    /** @param {string} wilayah */
    setRegionFilter(wilayah) {
      state.filters.wilayah = wilayah;
      notify();
    },
    /** @param {string} carId */
    toggleFavorite(carId) {
      const idx = state.favorit.indexOf(carId);
      let added = false;
      if (idx > -1) {
        state.favorit.splice(idx, 1);
      } else {
        state.favorit.push(carId);
        added = true;
      }
      writeJson(STORAGE_KEYS.favorit, state.favorit);
      notify();
      return added;
    },
    /** @param {BookingRecord} record */
    addBooking(record) {
      state.bookings.unshift(record);
      const ok = writeJson(STORAGE_KEYS.bookings, state.bookings);
      notify();
      return ok;
    },
    /** @param {string} bookingId */
    deleteBooking(bookingId) {
      state.bookings = state.bookings.filter((b) => b.id !== bookingId);
      writeJson(STORAGE_KEYS.bookings, state.bookings);
      notify();
    },
    clearBookings() {
      state.bookings = [];
      writeJson(STORAGE_KEYS.bookings, state.bookings);
      notify();
    },
    /** @param {string} entity */
    setCrudEntity(entity) {
      state.crudEntity = entity === 'antarjemput' ? 'antarjemput' : 'armada';
      state.crudEditId = null;
      notify();
    },
    /** @param {string | null} id */
    setCrudEditId(id) {
      state.crudEditId = id;
      notify();
    },
    /**
     * @param {'armada' | 'antarjemput'} entity
     * @param {any} payload
     * @param {string | null} editId
     */
    upsertCrudItem(entity, payload, editId) {
      if (entity === 'armada') {
        if (editId) {
          const idx = state.armada.findIndex((item) => item.id === editId);
          if (idx > -1) state.armada[idx] = payload;
        } else {
          state.armada.unshift(payload);
        }
        state.crudEditId = null;
        const ok = writeJson(STORAGE_KEYS.armada, state.armada);
        notify();
        return ok;
      }

      if (editId) {
        const idx = state.antarjemput.findIndex((item) => item.id === editId);
        if (idx > -1) state.antarjemput[idx] = payload;
      } else {
        state.antarjemput.unshift(payload);
      }
      state.crudEditId = null;
      const ok = writeJson(STORAGE_KEYS.antarjemput, state.antarjemput);
      notify();
      return ok;
    },
    /**
     * @param {'armada' | 'antarjemput'} entity
     * @param {string} id
     */
    deleteCrudItem(entity, id) {
      if (entity === 'armada') {
        state.armada = state.armada.filter((item) => item.id !== id);
        writeJson(STORAGE_KEYS.armada, state.armada);
      } else {
        state.antarjemput = state.antarjemput.filter((item) => item.id !== id);
        writeJson(STORAGE_KEYS.antarjemput, state.antarjemput);
      }
      if (state.crudEditId === id) {
        state.crudEditId = null;
      }
      notify();
    },
    resetDemoData() {
      state.armada = deepClone(DEFAULT_DATA.armada);
      state.antarjemput = deepClone(DEFAULT_DATA.antarjemput);
      state.crudEditId = null;
      writeJson(STORAGE_KEYS.armada, state.armada);
      writeJson(STORAGE_KEYS.antarjemput, state.antarjemput);
      notify();
    }
  };
}
