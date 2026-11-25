import { t } from '../data/i18n.js';
import { escapeHtml, formatRupiah, getTodayIsoDate, icons } from '../utils/format.js';

const PICKUP_LOCATIONS = [
  'Bandara Sultan Iskandar Muda (SIM)',
  'Pelabuhan Ulee Lheue Banda Aceh',
  'Hotel Area Kota Banda Aceh',
  'Pelabuhan Balohan Sabang',
  'Kota Takengon (Aceh Tengah)',
  'Kota Lhokseumawe'
];

/**
 * Renders the Rental Calculator & Booking History section.
 * Preserves form state across history updates and handles validation cleanly.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
export function renderBookingView(container, state) {
  const lang = state.lang;
  const todayIso = getTodayIsoDate();

  if (container.dataset.lang !== lang) {
    container.dataset.lang = lang;
    container.innerHTML = `
      <div class="section-header">
        <div>
          <h2 class="section-title">${escapeHtml(t(lang, 'booking.title'))}</h2>
          <p class="section-subtitle">${escapeHtml(t(lang, 'booking.subtitle'))}</p>
        </div>
      </div>

      <div class="two-col-layout">
        <div class="surface-panel">
          <h3 class="panel-heading">${escapeHtml(t(lang, 'booking.formTitle'))}</h3>
          <form id="booking-form" novalidate>
            <div class="form-group">
              <label for="book-car" class="field-label">${escapeHtml(t(lang, 'booking.unitLabel'))}</label>
              <select id="book-car"></select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="book-date" class="field-label">${escapeHtml(t(lang, 'booking.dateLabel'))}</label>
                <input type="date" id="book-date" value="${escapeHtml(todayIso)}" min="${escapeHtml(todayIso)}" />
                <div class="field-error" id="err-book-date">${escapeHtml(t(lang, 'booking.errDate'))}</div>
              </div>
              <div class="form-group">
                <label for="book-days" class="field-label">${escapeHtml(t(lang, 'booking.daysLabel'))}</label>
                <input type="number" id="book-days" min="1" max="14" value="3" />
                <div class="field-error" id="err-book-days">${escapeHtml(t(lang, 'booking.errDays'))}</div>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="book-service" class="field-label">${escapeHtml(t(lang, 'booking.serviceLabel'))}</label>
                <select id="book-service">
                  <option value="lepas">${escapeHtml(t(lang, 'booking.serviceSelf'))}</option>
                  <option value="sopir">${escapeHtml(t(lang, 'booking.serviceDriver'))}</option>
                </select>
                <div class="field-error" id="hint-driver-only" style="color:var(--warning);">
                  ${escapeHtml(t(lang, 'booking.driverRequiredHint'))}
                </div>
              </div>
              <div class="form-group">
                <label for="book-pickup" class="field-label">${escapeHtml(t(lang, 'booking.pickupLabel'))}</label>
                <select id="book-pickup">
                  ${PICKUP_LOCATIONS.map((loc) => `<option value="${escapeHtml(loc)}">${escapeHtml(loc)}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <span class="field-label">${escapeHtml(t(lang, 'booking.addonsLabel'))}</span>
              <label class="checkbox-item">
                <input type="checkbox" id="addon-gayo" />
                <span>${escapeHtml(t(lang, 'booking.addonGayo'))}</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" id="addon-babyseat" />
                <span>${escapeHtml(t(lang, 'booking.addonBaby'))}</span>
              </label>
            </div>

            <div class="form-group">
              <label for="book-customer" class="field-label">${escapeHtml(t(lang, 'booking.customerLabel'))}</label>
              <input
                type="text"
                id="book-customer"
                placeholder="${escapeHtml(t(lang, 'booking.customerPlaceholder'))}"
                value="Ahmad Fauzan"
                required
              />
              <div class="field-error" id="err-book-customer">${escapeHtml(t(lang, 'booking.errCustomer'))}</div>
            </div>

            <div class="summary-box">
              <div class="summary-label">${escapeHtml(t(lang, 'booking.totalLabel'))}</div>
              <div class="summary-total tabular-nums" id="rental-total-display">Rp 0</div>
              <div class="summary-breakdown tabular-nums" id="rental-breakdown"></div>
              <div class="summary-actions">
                <button type="submit" class="btn btn-primary">
                  ${escapeHtml(t(lang, 'booking.btnSaveHistory'))}
                </button>
                <a id="btn-wa-booking" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-wa">
                  ${escapeHtml(t(lang, 'booking.btnSendWa'))}
                  ${icons.externalLink()}
                </a>
              </div>
            </div>
          </form>
        </div>

        <div class="surface-panel">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px;">
            <h3 class="panel-heading" style="margin-bottom:0;">${escapeHtml(t(lang, 'booking.historyTitle'))}</h3>
            <button type="button" class="btn btn-sm btn-outline" data-action="clear-bookings">
              ${escapeHtml(t(lang, 'booking.btnClearHistory'))}
            </button>
          </div>
          <div id="booking-history-list"></div>
        </div>
      </div>
    `;
  }

  // Sync vehicle dropdown options while keeping current selection
  const select = /** @type {HTMLSelectElement | null} */ (container.querySelector('#book-car'));
  if (select) {
    const prevValue = state.selectedCarForBooking || select.value;
    select.innerHTML = state.armada
      .map((c) => {
        const rate = c.bisaLepasKunci ? c.hargaLepasKunci : c.hargaDenganSopir;
        return `<option value="${escapeHtml(c.id)}">${escapeHtml(c.nama)} (${escapeHtml(c.transmisi)} · ${escapeHtml(formatRupiah(rate))})</option>`;
      })
      .join('');

    if (prevValue && state.armada.some((c) => c.id === prevValue)) {
      select.value = prevValue;
    }
    state.selectedCarForBooking = null;
  }

  updateBookingSummary(container, state);
  renderBookingHistoryList(container, state);
}

/**
 * Recalculates rental estimate and updates summary panel + WhatsApp link.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
export function updateBookingSummary(container, state) {
  const lang = state.lang;
  const carSelect = /** @type {HTMLSelectElement | null} */ (container.querySelector('#book-car'));
  const daysInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#book-days'));
  const serviceSelect = /** @type {HTMLSelectElement | null} */ (container.querySelector('#book-service'));
  const dateInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#book-date'));
  const pickupSelect = /** @type {HTMLSelectElement | null} */ (container.querySelector('#book-pickup'));
  const customerInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#book-customer'));
  const addonGayo = /** @type {HTMLInputElement | null} */ (container.querySelector('#addon-gayo'));
  const addonBaby = /** @type {HTMLInputElement | null} */ (container.querySelector('#addon-babyseat'));
  const driverHint = container.querySelector('#hint-driver-only');

  if (!carSelect || !daysInput || !serviceSelect || !dateInput || !pickupSelect || !customerInput) return null;

  const car = state.armada.find((c) => c.id === carSelect.value) || state.armada[0];
  if (!car) return null;

  const selfOpt = serviceSelect.querySelector('option[value="lepas"]');
  if (!car.bisaLepasKunci) {
    serviceSelect.value = 'sopir';
    if (selfOpt) selfOpt.setAttribute('disabled', 'disabled');
    if (driverHint) driverHint.classList.add('visible');
  } else {
    if (selfOpt) selfOpt.removeAttribute('disabled');
    if (driverHint) driverHint.classList.remove('visible');
  }

  const rawDays = Number(daysInput.value);
  const days = Number.isFinite(rawDays) ? Math.min(14, Math.max(1, Math.round(rawDays))) : 1;
  const serviceType = serviceSelect.value === 'lepas' ? 'lepas' : 'sopir';
  const dailyCarRate = serviceType === 'lepas' ? car.hargaLepasKunci : car.hargaDenganSopir;

  const addGayoFee = addonGayo?.checked ? 100000 : 0;
  const addBabyFee = addonBaby?.checked ? 50000 : 0;
  const addonPerDay = addGayoFee + addBabyFee;

  const grandTotal = (dailyCarRate + addonPerDay) * days;

  const totalEl = container.querySelector('#rental-total-display');
  const breakdownEl = container.querySelector('#rental-breakdown');
  const waBtn = /** @type {HTMLAnchorElement | null} */ (container.querySelector('#btn-wa-booking'));

  if (totalEl) totalEl.textContent = formatRupiah(grandTotal);
  if (breakdownEl) {
    breakdownEl.textContent = t(lang, 'booking.breakdownTemplate', {
      days,
      unitRate: formatRupiah(dailyCarRate),
      addonRate: formatRupiah(addonPerDay)
    });
  }

  const customerVal = customerInput.value.trim() || 'Guest';
  const serviceText =
    serviceType === 'lepas' ? t(lang, 'booking.serviceSelf') : t(lang, 'booking.serviceDriver');

  if (waBtn) {
    const waText = encodeURIComponent(
      `Halo AcehDrive Rental (Demo),\n` +
        `• Nama: ${customerVal}\n` +
        `• Armada: ${car.nama} (${car.transmisi})\n` +
        `• Paket: ${serviceText}\n` +
        `• Tanggal Mulai: ${dateInput.value} (${days} hari)\n` +
        `• Lokasi Jemput: ${pickupSelect.value}\n` +
        `• Estimasi Total: ${formatRupiah(grandTotal)}`
    );
    waBtn.href = `https://wa.me/${car.kontak}?text=${waText}`;
  }

  return {
    car,
    days,
    rawDays,
    serviceType,
    serviceLabel: serviceText,
    dateVal: dateInput.value,
    pickupVal: pickupSelect.value,
    customerVal: customerInput.value.trim(),
    grandTotal
  };
}

/**
 * Validates booking inputs and shows inline errors when invalid.
 * @param {HTMLElement} container
 * @returns {boolean}
 */
export function validateBookingForm(container) {
  const customerInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#book-customer'));
  const dateInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#book-date'));
  const daysInput = /** @type {HTMLInputElement | null} */ (container.querySelector('#book-days'));

  const errCustomer = container.querySelector('#err-book-customer');
  const errDate = container.querySelector('#err-book-date');
  const errDays = container.querySelector('#err-book-days');

  let valid = true;

  if (customerInput) {
    const ok = customerInput.value.trim().length >= 2;
    customerInput.setAttribute('aria-invalid', ok ? 'false' : 'true');
    errCustomer?.classList.toggle('visible', !ok);
    if (!ok) valid = false;
  }

  if (dateInput) {
    const today = getTodayIsoDate();
    const ok = Boolean(dateInput.value) && dateInput.value >= today;
    dateInput.setAttribute('aria-invalid', ok ? 'false' : 'true');
    errDate?.classList.toggle('visible', !ok);
    if (!ok) valid = false;
  }

  if (daysInput) {
    const num = Number(daysInput.value);
    const ok = Number.isFinite(num) && num >= 1 && num <= 14;
    daysInput.setAttribute('aria-invalid', ok ? 'false' : 'true');
    errDays?.classList.toggle('visible', !ok);
    if (!ok) valid = false;
  }

  return valid;
}

/**
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
function renderBookingHistoryList(container, state) {
  const lang = state.lang;
  const listEl = container.querySelector('#booking-history-list');
  if (!listEl) return;

  if (state.bookings.length === 0) {
    listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem;">${escapeHtml(t(lang, 'booking.historyEmpty'))}</p>`;
    return;
  }

  listEl.innerHTML = state.bookings
    .map(
      (b) => `
      <div class="history-card">
        <div class="history-card-top">
          <strong style="color:var(--navy-900);">${escapeHtml(b.carName)}</strong>
          <span class="tabular-nums" style="font-size:0.8rem; font-weight:700; color:var(--warning);">
            ${escapeHtml(b.days)} ${escapeHtml(t(lang, 'booking.daysUnit'))} · ${escapeHtml(b.service)}
          </span>
        </div>
        <div class="history-meta tabular-nums">
          ${escapeHtml(t(lang, 'booking.customerShort'))}: <strong>${escapeHtml(b.customer)}</strong> ·
          ${escapeHtml(t(lang, 'booking.dateShort'))}: ${escapeHtml(b.date)} ·
          ${escapeHtml(t(lang, 'booking.pickupShort'))}: ${escapeHtml(b.pickup)}
        </div>
        <div class="history-footer">
          <strong class="tabular-nums" style="color:var(--turquoise-700);">
            ${escapeHtml(formatRupiah(b.total))}
          </strong>
          <button type="button" class="btn btn-sm btn-outline" data-action="delete-booking" data-id="${escapeHtml(b.id)}">
            ${escapeHtml(t(lang, 'booking.deleteItem'))}
          </button>
        </div>
      </div>
    `
    )
    .join('');
}
