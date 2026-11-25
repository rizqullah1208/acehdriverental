import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { t } from '../data/i18n.js';

const PICKUP_HUB_QUERIES = [
  { region: 'Bandara SIM', query: 'Sultan Iskandar Muda International Airport, Aceh, Indonesia' },
  { region: 'Banda Aceh', query: 'Pelabuhan Ulee Lheue, Banda Aceh, Indonesia' },
  { region: 'Sabang', query: 'Pelabuhan Balohan, Sabang, Aceh, Indonesia' },
  { region: 'Aceh Besar', query: 'Lhoknga, Aceh Besar, Indonesia' },
  { region: 'Takengon', query: 'Takengon, Aceh Tengah, Indonesia' },
  { region: 'Lhokseumawe', query: 'Lhokseumawe, Aceh, Indonesia' }
];

const SESSION_CACHE_KEY = 'acehdrive_gmp_pickup_hubs_v1';

/**
 * @typedef {Object} ResolvedPickupHub
 * @property {string} region
 * @property {string} displayName
 * @property {string} formattedAddress
 * @property {{ lat: number, lng: number }} location
 */

let loaderConfigured = false;
/** @type {google.maps.Map | null} */
let mapInstance = null;
/** @type {google.maps.InfoWindow | null} */
let infoWindow = null;
/** @type {google.maps.LatLngBounds | null} */
let allBounds = null;
/** @type {Map<string, { marker: google.maps.marker.AdvancedMarkerElement, pin: google.maps.marker.PinElement, hub: ResolvedPickupHub }>} */
const hubMarkers = new Map();
/** @type {Promise<void> | null} */
let initPromise = null;

/**
 * Checks if an error indicates Google Maps Platform quota exhaustion.
 * @param {unknown} err
 * @returns {boolean}
 */
function isQuotaError(err) {
  const msg = String(err instanceof Error ? err.message : err || '');
  return (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('429')
  );
}

/**
 * @returns {ResolvedPickupHub[] | null}
 */
function readSessionHubs() {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore storage read failure
  }
  return null;
}

/**
 * @param {ResolvedPickupHub[]} hubs
 */
function writeSessionHubs(hubs) {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(hubs));
  } catch {
    // Ignore storage write failure
  }
}

/**
 * Resolves the 6 Aceh pickup regions using Places API (New) Text Search.
 * @param {typeof google.maps.places.Place} PlaceClass
 * @param {'id' | 'en'} lang
 * @returns {Promise<ResolvedPickupHub[]>}
 */
async function resolvePickupHubs(PlaceClass, lang) {
  const cached = readSessionHubs();
  if (cached) return cached;

  const results = await Promise.all(
    PICKUP_HUB_QUERIES.map(async (item) => {
      const { places } = await PlaceClass.searchByText({
        textQuery: item.query,
        fields: ['displayName', 'location', 'formattedAddress'],
        language: lang === 'en' ? 'en' : 'id',
        region: 'id',
        maxResultCount: 1,
        internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio']
      });
      const first = places?.[0];
      if (!first?.location) return null;
      return {
        region: item.region,
        displayName: first.displayName || item.region,
        formattedAddress: first.formattedAddress || item.region,
        location: {
          lat: first.location.lat(),
          lng: first.location.lng()
        }
      };
    })
  );

  const valid = results.filter(/** @returns {r is ResolvedPickupHub} */ (r) => r !== null);
  if (valid.length > 0) {
    writeSessionHubs(valid);
  }
  return valid;
}

/**
 * Builds accessible DOM content for a pickup hub InfoWindow.
 * @param {ResolvedPickupHub} hub
 * @param {number} vehicleCount
 * @param {'id' | 'en'} lang
 * @returns {HTMLElement}
 */
function buildInfoWindowContent(hub, vehicleCount, lang) {
  const wrapper = document.createElement('div');
  wrapper.style.maxWidth = '240px';
  wrapper.style.fontFamily = 'var(--font-sans, sans-serif)';
  wrapper.style.color = '#0f172a';
  wrapper.style.lineHeight = '1.45';

  const title = document.createElement('strong');
  title.style.display = 'block';
  title.style.fontSize = '0.94rem';
  title.style.color = '#06283d';
  title.style.marginBottom = '4px';
  title.textContent = `${hub.region} — ${hub.displayName}`;

  const address = document.createElement('p');
  address.style.fontSize = '0.8rem';
  address.style.color = '#475569';
  address.style.margin = '0 0 8px 0';
  address.textContent = hub.formattedAddress;

  const count = document.createElement('div');
  count.style.fontSize = '0.8rem';
  count.style.fontWeight = '700';
  count.style.color = '#0f766e';
  count.textContent = t(lang, 'fleet.mapInfoCount', { count: vehicleCount });

  wrapper.append(title, address, count);
  return wrapper;
}

/**
 * Initializes the interactive Google Map in the Fleet Catalog pickup panel.
 * @param {{
 *   mapContainer: HTMLElement,
 *   statusEl: HTMLElement | null,
 *   lang: 'id' | 'en',
 *   selectedRegion: string,
 *   getVehicleCount: (region: string) => number,
 *   onSelectRegion: (region: string) => void
 * }} opts
 */
export async function mountPickupGoogleMap(opts) {
  const { mapContainer, statusEl, lang, selectedRegion, getVehicleCount, onSelectRegion } = opts;

  if (mapInstance && mapContainer.contains(mapInstance.getDiv())) {
    syncPickupMapSelection(selectedRegion, getVehicleCount, lang);
    return;
  }

  if (initPromise) {
    await initPromise;
    return;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    if (statusEl) {
      statusEl.textContent = t(lang, 'fleet.mapUnavailable');
      statusEl.classList.add('is-visible', 'is-error');
    }
    return;
  }

  initPromise = (async () => {
    if (statusEl) {
      statusEl.textContent = t(lang, 'fleet.mapLoading');
      statusEl.classList.add('is-visible');
      statusEl.classList.remove('is-error');
    }

    try {
      if (!loaderConfigured) {
        setOptions({
          key: apiKey,
          v: 'weekly',
          language: lang === 'en' ? 'en' : 'id',
          region: 'ID'
        });
        loaderConfigured = true;
      }

      const [{ Map: GoogleMap, InfoWindow }, { AdvancedMarkerElement, PinElement }, { Place }, { LatLngBounds }] =
        await Promise.all([
          importLibrary('maps'),
          importLibrary('marker'),
          importLibrary('places'),
          importLibrary('core')
        ]);

      const hubs = await resolvePickupHubs(Place, lang);
      if (hubs.length === 0) {
        if (statusEl) {
          statusEl.textContent = t(lang, 'fleet.mapUnavailable');
          statusEl.classList.add('is-visible', 'is-error');
        }
        return;
      }

      const bounds = new LatLngBounds();
      for (const hub of hubs) {
        bounds.extend(hub.location);
      }
      allBounds = bounds;

      mapInstance = new GoogleMap(mapContainer, {
        center: hubs[0].location,
        zoom: 8,
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        gestureHandling: 'cooperative',
        internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio']
      });

      mapInstance.fitBounds(bounds, { top: 28, right: 28, bottom: 28, left: 28 });
      infoWindow = new InfoWindow({ maxWidth: 280 });
      hubMarkers.clear();

      for (const hub of hubs) {
        const isSelected = selectedRegion === hub.region;
        const pin = new PinElement({
          background: isSelected ? '#d97706' : '#06283d',
          borderColor: '#ffffff',
          glyphColor: '#ffffff',
          scale: isSelected ? 1.2 : 1.0
        });

        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: hub.location,
          title: `${hub.region} — ${hub.displayName}`,
          gmpClickable: true
        });
        marker.append(pin);

        marker.addListener('click', () => {
          onSelectRegion(hub.region);
        });

        hubMarkers.set(hub.region, { marker, pin, hub });
      }

      if (statusEl) {
        statusEl.classList.remove('is-visible', 'is-error');
      }

      if (selectedRegion) {
        syncPickupMapSelection(selectedRegion, getVehicleCount, lang);
      }
    } catch (err) {
      if (isQuotaError(err)) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      if (statusEl) {
        statusEl.textContent = t(lang, 'fleet.mapUnavailable');
        statusEl.classList.add('is-visible', 'is-error');
      }
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
}

/**
 * Updates Google Map camera, pin styling, and InfoWindow when selected pickup region changes.
 * @param {string} selectedRegion
 * @param {(region: string) => number} getVehicleCount
 * @param {'id' | 'en'} lang
 */
export function syncPickupMapSelection(selectedRegion, getVehicleCount, lang) {
  if (!mapInstance || !infoWindow) return;

  for (const [region, entry] of hubMarkers.entries()) {
    const active = selectedRegion === region;
    entry.pin.background = active ? '#d97706' : '#06283d';
    entry.pin.scale = active ? 1.2 : 1.0;
  }

  if (!selectedRegion) {
    infoWindow.close();
    if (allBounds) {
      mapInstance.fitBounds(allBounds, { top: 28, right: 28, bottom: 28, left: 28 });
    }
    return;
  }

  const target = hubMarkers.get(selectedRegion);
  if (!target) return;

  mapInstance.panTo(target.hub.location);
  const currentZoom = mapInstance.getZoom() ?? 8;
  if (currentZoom < 11) {
    mapInstance.setZoom(11);
  }

  infoWindow.setContent(buildInfoWindowContent(target.hub, getVehicleCount(selectedRegion), lang));
  infoWindow.open({
    map: mapInstance,
    anchor: target.marker,
    shouldFocus: false
  });
}
