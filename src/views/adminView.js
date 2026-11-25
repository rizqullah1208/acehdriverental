import { FALLBACK_CAR_SVG } from '../data/seed.js';
import { t } from '../data/i18n.js';
import { escapeHtml, formatRupiah, sanitizeUrl } from '../utils/format.js';

const REGIONS = ['Bandara SIM', 'Banda Aceh', 'Sabang', 'Aceh Besar', 'Takengon', 'Lhokseumawe'];
const CATEGORIES = [
  'City Car / Hatchback',
  'MPV Keluarga',
  'SUV / Medan Berat',
  'Minibus / Rombongan',
  'Luxury / VIP'
];

/**
 * Renders the Fleet & Transfer CRUD Admin Dashboard.
 * @param {HTMLElement} container
 * @param {import('../state/store.js').AppState} state
 */
export function renderAdminView(container, state) {
  const lang = state.lang;
  const entity = state.crudEntity;
  const list = entity === 'armada' ? state.armada : state.antarjemput;
  const editItem = state.crudEditId
    ? list.find((x) => x.id === state.crudEditId) || null
    : null;

  const formTitle =
    entity === 'armada'
      ? editItem
        ? t(lang, 'admin.formEditFleet', { name: editItem.nama })
        : t(lang, 'admin.formAddFleet')
      : editItem
      ? t(lang, 'admin.formEditTransfer', { name: editItem.nama })
      : t(lang, 'admin.formAddTransfer');

  container.innerHTML = `
    <div class="section-header">
      <div>
        <h2 class="section-title">${escapeHtml(t(lang, 'admin.title'))}</h2>
        <p class="section-subtitle">${escapeHtml(t(lang, 'admin.subtitle'))}</p>
      </div>
      <button type="button" class="btn btn-danger btn-sm" data-action="open-reset-modal">
        ${escapeHtml(t(lang, 'admin.btnResetDemo'))}
      </button>
    </div>

    <div class="segmented-bar" role="tablist" aria-label="CRUD Entity Switch">
      <button
        type="button"
        role="tab"
        aria-selected="${entity === 'armada' ? 'true' : 'false'}"
        class="segmented-btn ${entity === 'armada' ? 'active' : ''}"
        data-action="switch-crud"
        data-entity="armada"
      >
        ${escapeHtml(t(lang, 'admin.tabFleet'))}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected="${entity === 'antarjemput' ? 'true' : 'false'}"
        class="segmented-btn ${entity === 'antarjemput' ? 'active' : ''}"
        data-action="switch-crud"
        data-entity="antarjemput"
      >
        ${escapeHtml(t(lang, 'admin.tabTransfers'))}
      </button>
    </div>

    <div class="two-col-layout admin-layout">
      <div class="surface-panel">
        <h3 class="panel-heading" id="crud-form-title">${escapeHtml(formTitle)}</h3>
        <form id="crud-form">
          <input type="hidden" id="crud-id" value="${escapeHtml(editItem?.id || '')}" />
          ${renderCrudFieldsHtml(entity, editItem, lang)}
          <div style="display:flex; gap:10px; margin-top:16px;">
            <button type="submit" class="btn btn-primary" style="flex:1;">
              ${escapeHtml(t(lang, 'admin.btnSave'))}
            </button>
            <button type="button" class="btn btn-outline" data-action="cancel-crud">
              ${escapeHtml(t(lang, 'admin.btnCancel'))}
            </button>
          </div>
        </form>
      </div>

      <div class="table-card">
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                ${
                  entity === 'armada'
                    ? `
                      <th>${escapeHtml(t(lang, 'admin.thPhoto'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thUnit'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thRegionCat'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thRate'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thAction'))}</th>
                    `
                    : `
                      <th>${escapeHtml(t(lang, 'admin.thPhoto'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thPkg'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thFleetDur'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thPrice'))}</th>
                      <th>${escapeHtml(t(lang, 'admin.thAction'))}</th>
                    `
                }
              </tr>
            </thead>
            <tbody>
              ${renderCrudRowsHtml(entity, list, lang)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * @param {'armada' | 'antarjemput'} entity
 * @param {any} editItem
 * @param {'id' | 'en'} lang
 */
function renderCrudFieldsHtml(entity, editItem, lang) {
  const existingImg = sanitizeUrl(editItem?.imageUrl, FALLBACK_CAR_SVG);
  const urlFieldValue =
    editItem?.imageUrl && !String(editItem.imageUrl).startsWith('data:') ? editItem.imageUrl : '';

  if (entity === 'armada') {
    return `
      <div class="form-group">
        <label for="f-nama" class="field-label">${escapeHtml(t(lang, 'admin.lblCarName'))}</label>
        <input type="text" id="f-nama" required value="${escapeHtml(editItem?.nama || '')}" />
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label for="f-kategori" class="field-label">${escapeHtml(t(lang, 'admin.lblCategory'))}</label>
          <select id="f-kategori">
            ${CATEGORIES.map(
              (k) => `<option value="${escapeHtml(k)}" ${editItem?.kategori === k ? 'selected' : ''}>${escapeHtml(k)}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="f-wilayah" class="field-label">${escapeHtml(t(lang, 'admin.lblRegion'))}</label>
          <select id="f-wilayah">
            ${REGIONS.map(
              (w) => `<option value="${escapeHtml(w)}" ${editItem?.wilayah === w ? 'selected' : ''}>${escapeHtml(w)}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label for="f-transmisi" class="field-label">${escapeHtml(t(lang, 'admin.lblTrans'))}</label>
          <select id="f-transmisi">
            <option value="Matic" ${editItem?.transmisi === 'Matic' ? 'selected' : ''}>Matic</option>
            <option value="Manual" ${editItem?.transmisi === 'Manual' ? 'selected' : ''}>Manual</option>
          </select>
        </div>
        <div class="form-group">
          <label for="f-kursi" class="field-label">${escapeHtml(t(lang, 'admin.lblSeats'))}</label>
          <input type="number" id="f-kursi" min="2" max="30" required value="${escapeHtml(editItem?.kursi ?? 7)}" />
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label for="f-lepas" class="field-label">${escapeHtml(t(lang, 'admin.lblRateSelf'))}</label>
          <input type="number" id="f-lepas" min="50000" step="5000" required value="${escapeHtml(editItem?.hargaLepasKunci ?? 450000)}" />
        </div>
        <div class="form-group">
          <label for="f-sopir" class="field-label">${escapeHtml(t(lang, 'admin.lblRateDriver'))}</label>
          <input type="number" id="f-sopir" min="50000" step="5000" required value="${escapeHtml(editItem?.hargaDenganSopir ?? 650000)}" />
        </div>
      </div>
      <div class="form-group">
        <label for="f-bbm" class="field-label">${escapeHtml(t(lang, 'admin.lblFuel'))}</label>
        <input type="text" id="f-bbm" required value="${escapeHtml(editItem?.bbm || 'Bensin')}" />
      </div>
      <div class="form-group">
        <label for="f-img-file" class="field-label">${escapeHtml(t(lang, 'admin.lblPhoto'))}</label>
        <div class="img-upload-box">
          <input type="file" id="f-img-file" accept="image/*" style="font-size:0.82rem; width:100%;" />
          <div style="font-size:0.75rem; color:var(--text-muted); margin:8px 0;">
            ${escapeHtml(t(lang, 'admin.lblPhotoOr'))}
          </div>
          <input type="url" id="f-img-url" placeholder="https://..." value="${escapeHtml(urlFieldValue)}" />
          <input type="hidden" id="f-img-data" value="${escapeHtml(existingImg)}" />
          <img id="f-img-preview" class="img-preview-thumb" src="${escapeHtml(existingImg)}" data-fallback-img="true" alt="Preview" />
        </div>
      </div>
    `;
  }

  return `
    <div class="form-group">
      <label for="f-nama" class="field-label">${escapeHtml(t(lang, 'admin.lblPkgName'))}</label>
      <input type="text" id="f-nama" required value="${escapeHtml(editItem?.nama || '')}" />
    </div>
    <div class="form-group">
      <label for="f-rute" class="field-label">${escapeHtml(t(lang, 'admin.lblRoute'))}</label>
      <input type="text" id="f-rute" required value="${escapeHtml(editItem?.rute || '')}" />
    </div>
    <div class="form-row-2">
      <div class="form-group">
        <label for="f-durasi" class="field-label">${escapeHtml(t(lang, 'admin.lblDuration'))}</label>
        <input type="text" id="f-durasi" required value="${escapeHtml(editItem?.durasi || '± 1 Jam')}" />
      </div>
      <div class="form-group">
        <label for="f-harga" class="field-label">${escapeHtml(t(lang, 'admin.lblPkgPrice'))}</label>
        <input type="number" id="f-harga" min="50000" step="5000" required value="${escapeHtml(editItem?.harga ?? 200000)}" />
      </div>
    </div>
    <div class="form-group">
      <label for="f-armada" class="field-label">${escapeHtml(t(lang, 'admin.lblPkgFleet'))}</label>
      <input type="text" id="f-armada" required value="${escapeHtml(editItem?.armada || 'Innova Reborn / Avanza')}" />
    </div>
    <div class="form-group">
      <label for="f-img-file" class="field-label">${escapeHtml(t(lang, 'admin.lblPkgPhoto'))}</label>
      <div class="img-upload-box">
        <input type="file" id="f-img-file" accept="image/*" style="font-size:0.82rem; width:100%;" />
        <input type="url" id="f-img-url" placeholder="https://..." style="margin-top:8px;" value="${escapeHtml(urlFieldValue)}" />
        <input type="hidden" id="f-img-data" value="${escapeHtml(existingImg)}" />
        <img id="f-img-preview" class="img-preview-thumb" src="${escapeHtml(existingImg)}" data-fallback-img="true" alt="Preview" />
      </div>
    </div>
  `;
}

/**
 * @param {'armada' | 'antarjemput'} entity
 * @param {any[]} list
 * @param {'id' | 'en'} lang
 */
function renderCrudRowsHtml(entity, list, lang) {
  if (entity === 'armada') {
    return /** @type {import('../data/seed.js').FleetVehicle[]} */ (list)
      .map((c) => {
        const img = sanitizeUrl(c.imageUrl, FALLBACK_CAR_SVG);
        const safeId = escapeHtml(c.id);
        return `
          <tr>
            <td><img src="${escapeHtml(img)}" class="table-thumb" data-fallback-img="true" alt="${escapeHtml(c.nama)}" /></td>
            <td>
              <strong>${escapeHtml(c.nama)}</strong><br />
              <small class="tabular-nums" style="color:var(--text-muted);">
                ${escapeHtml(c.transmisi)} · ${escapeHtml(c.kursi)} ${escapeHtml(t(lang, 'fleet.seatsUnit'))}
              </small>
            </td>
            <td>
              ${escapeHtml(c.wilayah)}<br />
              <small style="color:var(--text-muted);">${escapeHtml(c.kategori)}</small>
            </td>
            <td class="tabular-nums">${escapeHtml(formatRupiah(c.hargaLepasKunci))}</td>
            <td style="white-space:nowrap;">
              <button type="button" class="btn btn-sm btn-outline" data-action="edit-crud" data-id="${safeId}">
                ${escapeHtml(t(lang, 'admin.btnEdit'))}
              </button>
              <button type="button" class="btn btn-sm btn-danger" data-action="delete-crud" data-id="${safeId}">
                ${escapeHtml(t(lang, 'admin.btnDelete'))}
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  return /** @type {import('../data/seed.js').TransferPackage[]} */ (list)
    .map((pkg) => {
      const img = sanitizeUrl(pkg.imageUrl, FALLBACK_CAR_SVG);
      const safeId = escapeHtml(pkg.id);
      return `
        <tr>
          <td><img src="${escapeHtml(img)}" class="table-thumb" data-fallback-img="true" alt="${escapeHtml(pkg.nama)}" /></td>
          <td><strong>${escapeHtml(pkg.nama)}</strong></td>
          <td>${escapeHtml(pkg.armada)} (${escapeHtml(pkg.durasi)})</td>
          <td class="tabular-nums">${escapeHtml(formatRupiah(pkg.harga))}</td>
          <td style="white-space:nowrap;">
            <button type="button" class="btn btn-sm btn-outline" data-action="edit-crud" data-id="${safeId}">
              ${escapeHtml(t(lang, 'admin.btnEdit'))}
            </button>
            <button type="button" class="btn btn-sm btn-danger" data-action="delete-crud" data-id="${safeId}">
              ${escapeHtml(t(lang, 'admin.btnDelete'))}
            </button>
          </td>
        </tr>
      `;
    })
    .join('');
}
